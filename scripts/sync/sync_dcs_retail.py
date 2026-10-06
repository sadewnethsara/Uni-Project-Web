#!/usr/bin/env python3
"""
Sync Weekly Consumer Retail Prices from Department of Census and Statistics (DCS):
Source URL: https://www.statistics.gov.lk/DashBoard/Prices/Prices_Data.php

Features:
- Ingests weekly retail prices across 14 Colombo district market centres
- Covers 116 consumer commodities (vegetables, fish, rice, coconut, spices, meat)
- Ingests time-series data into 'retail_price_entries' table
- Enables retail vs. wholesale margin tracking in NAMIS
"""

import sys
import os
import re
import json
import urllib.request
import ssl
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "july": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10,
    "nov": 11, "dec": 12
}

def parse_week_date(date_label: str) -> str:
    """
    Convert labels like 'W1.Aug.2024' or 'W4.July.2024' to approximate ISO dates YYYY-MM-DD.
    """
    m = re.match(r"W(\d)\.([a-zA-Z]+)\.(\d{4})", date_label.strip(), re.I)
    if not m:
        return None
    week_num, month_name, year_str = m.groups()
    month_val = MONTH_MAP.get(month_name.lower()[:3]) or MONTH_MAP.get(month_name.lower())
    if not month_val:
        return None
    
    # Approximate day of week based on W1..W4
    day_val = min(28, (int(week_num) - 1) * 7 + 7)
    return f"{year_str}-{month_val:02d}-{day_val:02d}"

def fetch_dcs_prices():
    url = "https://www.statistics.gov.lk/DashBoard/Prices/Prices_Data.php"
    headers = {"User-Agent": "Mozilla/5.0"}
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    print(f"--> Fetching DCS Price Data from {url} (3.9 MB)...", flush=True)
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45, context=ctx) as resp:
            content = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[ERROR] Failed to download DCS Price Data: {e}", flush=True)
        return [], []
    
    print(f"    Downloaded {len(content) / 1024 / 1024:.2f} MB. Parsing JavaScript datasets...", flush=True)
    # Extract var pip = [...]
    pip_match = re.search(r"var\s+pip\s*=\s*(\[.*?\]);", content, re.DOTALL)
    # Extract var prices = [...]
    prices_match = re.search(r"var\s+prices\s*=\s*(\[.*?\]);", content, re.DOTALL)
    
    if not pip_match or not prices_match:
        print("[ERROR] Failed to locate 'pip' or 'prices' JS arrays in DCS page.", flush=True)
        return [], []
    
    # Clean possible JS syntax issues (trailing commas)
    pip_str = re.sub(r",\s*\]", "]", pip_match.group(1))
    pip_data = json.loads(pip_str)
    
    # Clean prices data: replace empty strings/invalid JS
    raw_prices_str = prices_match.group(1)
    # Some numbers or quotes may have unquoted empty strings
    raw_prices_str = re.sub(r",\s*\]", "]", raw_prices_str)
    # In JS, '' is used instead of null/empty: replace '' with ""
    raw_prices_str = re.sub(r":\s*''", ': ""', raw_prices_str)
    
    try:
        prices_data = json.loads(raw_prices_str)
    except Exception as e:
        # Fallback line-by-line parser if JSON is slightly irregular
        print(f"Direct JSON parse failed ({e}), falling back to regex row parser...")
        prices_data = []
        for row_str in re.findall(r"\{[^{}]+\}", raw_prices_str):
            clean_row = re.sub(r":\s*''", ': ""', row_str)
            try:
                prices_data.append(json.loads(clean_row))
            except Exception:
                pass
                
    return pip_data, prices_data

def sync_dcs(supabase_url: str = None, supabase_key: str = None, limit_weeks: int = 52):
    pip_data, prices_data = fetch_dcs_prices()
    if not pip_data or not prices_data:
        print("[ERROR] No DCS price data available to sync.", flush=True)
        return
        
    print(f"    Loaded {len(pip_data)} commodity metadata definitions.", flush=True)
    print(f"    Loaded {len(prices_data)} total weekly historical reports.", flush=True)
    
    # Build commodity metadata lookup
    meta_lookup = {item["product"]: item for item in pip_data}
    
    # Take latest N weeks if specified
    target_weeks = prices_data[-limit_weeks:] if limit_weeks else prices_data
    
    records_to_insert = []
    for week_entry in target_weeks:
        date_label = week_entry.get("Date", "")
        if not date_label:
            continue
        parsed_d = parse_week_date(date_label)
        
        for k, v in week_entry.items():
            if k == "Date" or not v:
                continue
            try:
                price_val = float(v)
            except (ValueError, TypeError):
                continue
            
            meta = meta_lookup.get(k, {})
            records_to_insert.append({
                "commodity_code": k,
                "commodity_name": meta.get("name", k),
                "category": meta.get("category", "General"),
                "price": price_val,
                "date_label": date_label,
                "parsed_date": parsed_d
            })
            
    print(f"    Prepared {len(records_to_insert)} individual retail price records across {len(target_weeks)} weeks.", flush=True)
    
    if supabase_url and supabase_key:
        print(f"    Upserting into Supabase 'retail_price_entries' in batches of 500...", flush=True)
        endpoint = f"{supabase_url.rstrip('/')}/rest/v1/retail_price_entries?on_conflict=commodity_code,date_label"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        ctx = ssl._create_unverified_context()
        
        batch_size = 500
        total_upserted = 0
        for i in range(0, len(records_to_insert), batch_size):
            batch = records_to_insert[i:i + batch_size]
            req = urllib.request.Request(endpoint, data=json.dumps(batch).encode("utf-8"), headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=30, context=ctx):
                    total_upserted += len(batch)
            except Exception as e:
                print(f"    Batch error at {i}: {e}", flush=True)
        print(f"[DONE] Successfully synced {total_upserted} retail price records.", flush=True)
    else:
        print("    (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - showing top 3 samples):", flush=True)
        for sample in records_to_insert[:3]:
            print(f"     * {sample['commodity_name']} ({sample['category']}): Rs. {sample['price']} for {sample['date_label']}", flush=True)

if __name__ == "__main__":
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    sync_dcs(url, key, limit_weeks=12)
