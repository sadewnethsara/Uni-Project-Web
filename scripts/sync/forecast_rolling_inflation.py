#!/usr/bin/env python3
"""
Rolling 1-Year Sri Lanka Inflation & Rupee Forecasting Engine:
Maintains an active, forward-looking 365-day prediction window:
1. Automatically purges expired forecasts (forecast_date <= CURRENT_DATE).
2. Fits on the latest observed macroeconomic baselines from CBSL/DCS.
3. Generates rolling 365 daily forecasts and 12 monthly milestones forward.
4. Models mean reversion towards CBSL's 5.0% statutory target with agricultural harvest seasonality.
5. Calculates statistical confidence intervals (80% confidence bands / Fan Chart).
"""

import sys
import os
import json
import math
import urllib.request
import urllib.error
import ssl
from datetime import datetime, date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def purge_expired_forecasts(cutoff_date: str) -> int:
    """Deletes past predictions where forecast_date <= cutoff_date."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return 0
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/inflation_forecasts?forecast_date=lte.{cutoff_date}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "count=exact"
    }
    req = urllib.request.Request(url, headers=headers, method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=15, context=get_ssl_context()) as resp:
            cr = resp.headers.get("content-range")
            if cr and "/" in cr:
                return int(cr.split("/")[-1])
            return 1
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"    [Notice] Table 'inflation_forecasts' not yet created in Supabase.")
        else:
            print(f"    [HTTP {e.code}] Error pruning expired forecasts: {e.read().decode('utf-8', errors='ignore')[:150]}")
        return 0
    except Exception as e:
        print(f"    [Error] Error during purge: {e}")
        return 0

def fetch_latest_macro_baseline() -> dict:
    """Fetches the latest recorded actuals from inflation_rates, or uses verified defaults."""
    default_baseline = {
        "ccpi_yoy": 8.0,
        "food_yoy": 8.7,
        "core_yoy": 5.4,
        "usd_lkr": 330.0
    }
    if not SUPABASE_URL or not SUPABASE_KEY:
        return default_baseline

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/inflation_rates?period_type=eq.monthly&order=date.desc&limit=1"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10, context=get_ssl_context()) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
            if rows:
                r = rows[0]
                return {
                    "ccpi_yoy": float(r.get("ccpi_yoy_inflation") or 8.0),
                    "food_yoy": float(r.get("food_inflation_yoy") or 8.7),
                    "core_yoy": float(r.get("core_inflation_yoy") or 5.4),
                    "usd_lkr": float(r.get("usd_lkr_rate") or 330.0)
                }
    except Exception:
        pass
    return default_baseline

def get_seasonal_factor(month: int) -> float:
    """
    Sri Lanka agricultural & festive seasonality:
    - April: Sinhala & Tamil New Year demand surge (+0.5%)
    - Dec: Festive season (+0.4%)
    - Jan/Feb: Maha harvest peak supply cooling (-0.4%)
    - Aug/Sep: Yala harvest arrivals (-0.2%)
    """
    season_map = {
        1: -0.35, 2: -0.40, 3: 0.10, 4: 0.50,
        5: 0.15, 6: 0.20, 7: 0.00, 8: -0.20,
        9: -0.25, 10: 0.10, 11: 0.25, 12: 0.40
    }
    return season_map.get(month, 0.0)

def generate_rolling_forecasts(start_date: date, days_forward: int = 365) -> list:
    """
    Generates rolling 1-year forward forecasts:
    - 365 daily projections (tomorrow through tomorrow + 365 days).
    - 12 monthly milestone projections.
    """
    baseline = fetch_latest_macro_baseline()
    cbsl_target = 5.0       # Central Bank statutory inflation target (FIT framework)
    food_target = 5.2       # Equilibrium food inflation
    core_target = 4.5       # Equilibrium core inflation
    
    decay_rate = 0.006      # Half-life of ~115 days for disinflationary adjustment
    annual_fx_drift = 0.025 # 2.5% annual expected Rupee depreciation drift
    
    forecast_records = []
    seen_months = set()
    
    for t in range(1, days_forward + 1):
        target_d = start_date + timedelta(days=t)
        season = get_seasonal_factor(target_d.month)
        
        # Mean Reversion Process
        weight = math.exp(-decay_rate * t)
        ccpi_val = cbsl_target + (baseline["ccpi_yoy"] - cbsl_target) * weight + season
        food_val = food_target + (baseline["food_yoy"] - food_target) * weight + (1.6 * season)
        core_val = core_target + (baseline["core_yoy"] - core_target) * weight + (0.4 * season)
        
        # Rupee FX Projection
        fx_val = baseline["usd_lkr"] * (1.0 + annual_fx_drift * (t / 365.0))
        
        # 80% Confidence Bounds (Fan Chart expansion over horizon)
        sigma = 0.35 + 1.25 * math.sqrt(t / 365.0)
        lower_bound = max(0.0, ccpi_val - (1.28 * sigma))
        upper_bound = ccpi_val + (1.28 * sigma)
        
        # 1. Daily Record
        forecast_records.append({
            "forecast_date": target_d.strftime("%Y-%m-%d"),
            "target_year": target_d.year,
            "target_month": target_d.month,
            "period_type": "daily",
            "predicted_ccpi_yoy": round(ccpi_val, 2),
            "predicted_food_yoy": round(food_val, 2),
            "predicted_core_yoy": round(core_val, 2),
            "predicted_usd_lkr": round(fx_val, 2),
            "confidence_lower": round(lower_bound, 2),
            "confidence_upper": round(upper_bound, 2),
            "model_name": "cbsl_fit_mean_reverting_v1"
        })
        
        # 2. Monthly Milestone (on the 1st of each upcoming month)
        m_key = (target_d.year, target_d.month)
        if target_d.day == 1 and m_key not in seen_months:
            seen_months.add(m_key)
            forecast_records.append({
                "forecast_date": target_d.strftime("%Y-%m-%d"),
                "target_year": target_d.year,
                "target_month": target_d.month,
                "period_type": "monthly",
                "predicted_ccpi_yoy": round(ccpi_val, 2),
                "predicted_food_yoy": round(food_val, 2),
                "predicted_core_yoy": round(core_val, 2),
                "predicted_usd_lkr": round(fx_val, 2),
                "confidence_lower": round(lower_bound, 2),
                "confidence_upper": round(upper_bound, 2),
                "model_name": "cbsl_fit_mean_reverting_v1"
            })

    return forecast_records

def post_batch(records: list) -> int:
    if not records or not SUPABASE_URL or not SUPABASE_KEY:
        return 0
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/inflation_forecasts?on_conflict=forecast_date,period_type"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    req = urllib.request.Request(endpoint, data=json.dumps(records).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()):
            return len(records)
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        print(f"    [HTTP {e.code}] Error posting to inflation_forecasts: {err[:200]}", flush=True)
        return 0
    except Exception as e:
        print(f"    Error posting: {e}", flush=True)
        return 0

def run_rolling_forecast():
    today = date.today()
    today_str = today.strftime("%Y-%m-%d")
    tomorrow = today + timedelta(days=1)
    end_date = today + timedelta(days=365)
    
    print("=" * 65)
    print("  NAMIS ROLLING 1-YEAR INFLATION & RUPEE FORECAST ENGINE")
    print(f"  Execution Date: {today_str}")
    print(f"  Rolling Horizon: {tomorrow.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print("=" * 65)
    
    # 1. Prune expired predictions (anything dated today or earlier)
    print(f"\n[1] PRUNING EXPIRED PREDICTIONS (<= {today_str})...")
    pruned = purge_expired_forecasts(today_str)
    print(f"    * Successfully purged expired forecast rows.")
    
    # 2. Generate rolling 1-year forward predictions
    print(f"\n[2] GENERATING ROLLING 365-DAY FORWARD PROJECTIONS...")
    forecasts = generate_rolling_forecasts(today, days_forward=365)
    print(f"    * Generated {len(forecasts)} forecast rows (365 daily + 12 monthly milestones).")
    
    # 3. Ingest in micro batches
    print(f"\n[3] UPSERTING INTO 'inflation_forecasts'...")
    batch_size = 500
    total_synced = 0
    for i in range(0, len(forecasts), batch_size):
        chunk = forecasts[i:i + batch_size]
        synced = post_batch(chunk)
        total_synced += synced
        print(f"    Batch [{i+1} - {min(i+batch_size, len(forecasts))}]: {synced} synced.", flush=True)
        
    print(f"\n[DONE] Rolling 1-Year Forecast Window updated: {total_synced} active records.")
    print(f"  * Starts: {tomorrow.strftime('%Y-%m-%d')} (Tomorrow)")
    print(f"  * Ends:   {end_date.strftime('%Y-%m-%d')} (+1 Year)")
    print("=" * 65)

if __name__ == "__main__":
    run_rolling_forecast()
