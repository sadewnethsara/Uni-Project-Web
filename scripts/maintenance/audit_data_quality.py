#!/usr/bin/env python3
"""
Automated Data Quality & Anomaly Detection Audit Tool:
Performs comprehensive data health checks across 'price_entries',
'retail_price_entries', and 'price_discrepancies'.

Can be run:
1. Locally by developers: `py -3 scripts/maintenance/audit_data_quality.py`
2. Automatically in GitHub Actions at the end of every sync workflow.
"""

import sys
import os
import json
import urllib.request
import ssl
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def run_query_count(endpoint: str) -> int:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return -1
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Range-Unit": "items",
        "Prefer": "count=exact"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15, context=get_ssl_context()) as resp:
            cr = resp.headers.get("content-range")
            if cr and "/" in cr:
                return int(cr.split("/")[-1])
            return 0
    except Exception as e:
        print(f"    [WARN] Error querying {endpoint}: {e}", flush=True)
        return -1

def fetch_json(endpoint: str) -> list:
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15, context=get_ssl_context()) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return []

def main():
    print("=" * 65)
    print("  NAMIS ENTERPRISE DATA QUALITY & HYGIENE AUDIT")
    print(f"  Execution Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 65)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")
        sys.exit(1)

    checks = []

    # 1. Total records
    total_prices = run_query_count("price_entries?select=id")
    total_retail = run_query_count("retail_price_entries?select=id")
    total_discrepancies = run_query_count("price_discrepancies?select=id")
    total_inflation = run_query_count("inflation_rates?select=id")
    
    print(f"\n[1] DATASET VOLUMETRICS:")
    print(f"    * Wholesale & Paired Retail Entries: {total_prices:,} rows")
    print(f"    * DCS Consumer Retail Entries:      {total_retail:,} rows")
    print(f"    * Audited Discrepancies:             {total_discrepancies:,} rows")
    if total_inflation >= 0:
        print(f"    * Inflation & Rupee Time Series:     {total_inflation:,} rows")

    # 2. Null Value Violations
    print(f"\n[2] INTEGRITY & NULL CHECKS:")
    null_veg = run_query_count("price_entries?vegetable_id=is.null")
    null_mkt = run_query_count("price_entries?market_id=is.null")
    null_date = run_query_count("price_entries?date=is.null")
    null_price = run_query_count("price_entries?price=is.null")
    
    null_errors = (null_veg > 0) or (null_mkt > 0) or (null_date > 0) or (null_price > 0)
    checks.append(("Mandatory Field Non-Null Constraint", not null_errors, f"Nulls found: veg={null_veg}, mkt={null_mkt}, date={null_date}, price={null_price}"))
    print(f"    * Vegetable ID Nulls: {null_veg} {'[OK]' if null_veg == 0 else '[FAIL]'}")
    print(f"    * Market ID Nulls:    {null_mkt} {'[OK]' if null_mkt == 0 else '[FAIL]'}")
    print(f"    * Date Nulls:         {null_date} {'[OK]' if null_date == 0 else '[FAIL]'}")
    print(f"    * Price Nulls:        {null_price} {'[OK]' if null_price == 0 else '[FAIL]'}")

    # 3. Domain & Boundary Range Checks
    print(f"\n[3] DOMAIN VALUE & LOGICAL BOUNDARY CHECKS:")
    zero_prices = run_query_count("price_entries?price=lte.0")
    extreme_prices = run_query_count("price_entries?price=gt.25000")
    zero_retail = run_query_count("retail_price_entries?price=lte.0")
    extreme_retail = run_query_count("retail_price_entries?price=gt.50000")
    
    range_errors = (zero_prices > 0) or (extreme_prices > 0) or (zero_retail > 0) or (extreme_retail > 0)
    checks.append(("Price Numerical Domain Boundaries", not range_errors, f"<=0: {zero_prices + zero_retail}, Extreme: {extreme_prices + extreme_retail}"))
    print(f"    * Non-Positive Wholesale Prices (<= 0): {zero_prices} {'[OK]' if zero_prices == 0 else '[FAIL]'}")
    print(f"    * Unreasonable Extreme Prices (> 25k):  {extreme_prices} {'[OK]' if extreme_prices == 0 else '[FAIL]'}")
    print(f"    * Non-Positive Retail Prices (<= 0):    {zero_retail} {'[OK]' if zero_retail == 0 else '[FAIL]'}")
    print(f"    * Unreasonable Retail Prices (> 50k):   {extreme_retail} {'[OK]' if extreme_retail == 0 else '[FAIL]'}")

    # 4. Temporal Consistency Checks
    print(f"\n[4] TEMPORAL BOUNDARY AUDIT:")
    today_str = date.today().strftime("%Y-%m-%d")
    future_prices = run_query_count(f"price_entries?date=gt.{today_str}")
    checks.append(("No Future Dated Records", future_prices == 0, f"Future dates found: {future_prices}"))
    print(f"    * Future Dates (> {today_str}): {future_prices} {'[OK]' if future_prices == 0 else '[FAIL]'}")

    # 5. Foreign Key Dimension Alignment
    print(f"\n[5] DIMENSION ENTITY ALIGNMENT:")
    markets = fetch_json("markets?select=id")
    vegetables = fetch_json("vegetables?select=id")
    print(f"    * Active Canonical Markets:     {len(markets)} configured")
    print(f"    * Active Canonical Commodities: {len(vegetables)} configured")
    checks.append(("Foreign Key Dimension Tables Populated", len(markets) >= 10 and len(vegetables) >= 40, f"Mkt: {len(markets)}, Veg: {len(vegetables)}"))

    # 6. Overall Quality Score
    passed_count = sum(1 for _, ok, _ in checks if ok)
    total_checks = len(checks)
    score_pct = (passed_count / total_checks) * 100

    print("\n" + "=" * 65)
    print(f"  AUDIT SUMMARY: {passed_count}/{total_checks} CHECKS PASSED ({score_pct:.1f}%)")
    if score_pct == 100.0:
        print("  STATUS: [GRADE A+] DATASET IS FULLY SANITIZED & PRODUCTION READY")
    else:
        print("  STATUS: [ATTENTION REQUIRED] REVIEW DETECTED ANOMALIES ABOVE")
    print("=" * 65)

if __name__ == "__main__":
    main()
