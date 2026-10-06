#!/usr/bin/env python3
"""
Sync CRAN Historical Dataset (vegetablesSriLanka by Dr. Thiyanga S. Talagala)
Ingests 110,000+ verified daily wholesale and retail vegetable prices (2016-2026).

Features:
- Enriches Supabase with 10 years of paired wholesale & retail prices for Pettah and Dambulla
- Strictly validates against canonical vegetable IDs
- Automatically detects price discrepancies against existing HARTI prices:
  * If a price already exists and differs, logs to `price_discrepancies` for Admin Panel review.
  * If no price exists (e.g. Retail prices or missing dates), inserts cleanly into `price_entries`.
"""

import sys
import os
import json
import urllib.request
import urllib.error
import ssl
from datetime import date, timedelta
import argparse

def load_dotenv():
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'").strip('"')
                    if k not in os.environ:
                        os.environ[k] = v

load_dotenv()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

CRAN_RDA_URL = "https://raw.githubusercontent.com/thiyangt/vegetablesSriLanka/main/data/vegetables.srilanka.rda"

# Mapping dataset commodity names to Supabase canonical vegetable IDs
CRAN_VEGETABLE_MAP = {
    "Beans": "beans",
    "Big Onion (Imp)": "imported",
    "Big Onion (Local)": "sinnan",
    "Brinjal": "brinjals",
    "Cabbage": "cabbage--kandy-",
    "Carrot": "carrot",
    "Green Chilli": "green-chillies",
    "Lime": "lime",
    "Potato (Imp)": "potato--imported-",
    "Potato (Local)": "potato--welimada-",
    "Pumpkin": "pumpkin",
    "Red Onion (Imp)": "imported",
    "Red Onion (Local)": "vedalan",
    "Snake gourd": "snake-gourd",
    "Tomato": "tomato"
}

MARKET_MAP = {
    "Dambulla": "dambulla",
    "Pettah": "pettah"
}

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def post_batch(table_name: str, records: list) -> int:
    if not records:
        return 0
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    req = urllib.request.Request(url, data=json.dumps(records).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=45, context=get_ssl_context()):
            return len(records)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        # If it was a duplicate key error, we silently ignore
        if e.code == 409 or "duplicate key" in err_msg.lower():
            return 0
        print(f"\n[HTTP {e.code}] Error posting to {table_name}: {err_msg[:200]}")
        return 0
    except Exception as e:
        print(f"\nError posting to {table_name}: {e}")
        return 0

def fetch_existing_price_map(date_str: str) -> dict:
    """Fetch existing prices for a given date to check for discrepancies."""
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/price_entries?select=vegetable_id,market_id,price_type,price,source&date=eq.{date_str}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
            return {(r["vegetable_id"], r["market_id"], r["price_type"]): (float(r["price"]), r["source"]) for r in rows}
    except Exception:
        return {}

def download_and_parse_cran_dataset():
    import rdata
    print("--> Downloading vegetablesSriLanka RDA package...")
    req = urllib.request.Request(CRAN_RDA_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60, context=get_ssl_context()) as resp:
        content = resp.read()
        
    print(f"--> Parsing dataset ({len(content) / 1024:.1f} KB)...")
    parsed = rdata.parser.parse_data(content)
    converted = rdata.conversion.convert(parsed)
    df = converted["vegetables.srilanka"]
    return df

def sync_cran_data(target_year: int = None, min_diff_pct: float = 5.0):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be in .env")
        sys.exit(1)
        
    df = download_and_parse_cran_dataset()
    base_date = date(1970, 1, 1)
    
    # Filter non-null prices
    df = df[df["Price"].notnull() & (df["Price"] > 0)]
    print(f"--> Found {len(df)} total non-null price records.")
    
    # Group by Date to efficiently query existing records day-by-day
    by_date = {}
    for idx, row in df.iterrows():
        try:
            entry_date = (base_date + timedelta(days=int(row["Date"]))).strftime("%Y-%m-%d")
        except Exception:
            continue
            
        if target_year and not entry_date.startswith(str(target_year)):
            continue
            
        if entry_date not in by_date:
            by_date[entry_date] = []
        by_date[entry_date].append(row)
        
    sorted_dates = sorted(by_date.keys())
    print(f"--> Processing {len(sorted_dates)} distinct dates (Year: {target_year or 'ALL'})...\n")
    
    new_price_entries = []
    discrepancies = []
    total_new_prices = 0
    total_discrepancies = 0
    
    for i, dt in enumerate(sorted_dates):
        existing_map = fetch_existing_price_map(dt)
        day_rows = by_date[dt]
        
        seen_day_keys = set()
        for r in day_rows:
            raw_item = str(r["Item"])
            veg_id = CRAN_VEGETABLE_MAP.get(raw_item)
            if not veg_id:
                continue
                
            raw_market = str(r["Market"])
            market_id = MARKET_MAP.get(raw_market)
            if not market_id:
                continue
                
            price_type = str(r["Type"]).lower()
            if price_type not in ("wholesale", "retail"):
                continue
                
            price_val = float(r["Price"])
            key = (veg_id, market_id, price_type)
            if key in seen_day_keys:
                continue
            seen_day_keys.add(key)
            
            # Check if an existing price already exists for this exact slot
            if key in existing_map:
                existing_price, existing_source = existing_map[key]
                diff = abs(price_val - existing_price)
                diff_pct = (diff / existing_price * 100) if existing_price > 0 else 0
                
                # If difference is notable (e.g. > min_diff_pct), record discrepancy for Admin Review
                if diff > 1.0 and diff_pct >= min_diff_pct:
                    discrepancies.append({
                        "vegetable_id": veg_id,
                        "market_id": market_id,
                        "date": dt,
                        "price_type": price_type,
                        "existing_price": existing_price,
                        "existing_source": existing_source,
                        "conflicting_price": price_val,
                        "conflicting_source": "cran_vegetables_lk"
                    })
            else:
                # No price existed for this slot! Clean new record to enrich database
                new_price_entries.append({
                    "market_id": market_id,
                    "vegetable_id": veg_id,
                    "price": price_val,
                    "price_type": price_type,
                    "source": "cran_vegetables_lk",
                    "date": dt,
                    "note": f"CRAN vegetablesSriLanka ({raw_item})"
                })
                
        # Batch insert every 500 records
        if len(new_price_entries) >= 500:
            inserted = post_batch("price_entries", new_price_entries)
            total_new_prices += inserted
            new_price_entries.clear()
            
        if len(discrepancies) >= 100:
            posted_disc = post_batch("price_discrepancies", discrepancies)
            total_discrepancies += posted_disc
            discrepancies.clear()
            
        if (i + 1) % 50 == 0 or (i + 1) == len(sorted_dates):
            print(f"[{i + 1}/{len(sorted_dates)} dates] Synced: {total_new_prices} new prices | Logged: {total_discrepancies} discrepancies", end="\r", flush=True)
            
    # Flush remaining
    if new_price_entries:
        total_new_prices += post_batch("price_entries", new_price_entries)
    if discrepancies:
        total_discrepancies += post_batch("price_discrepancies", discrepancies)
        
    print(f"\n\n[COMPLETED] Successfully synced:")
    print(f"  + New Clean Prices Added: {total_new_prices} (Wholesale & Retail)")
    print(f"  + Price Discrepancies Logged for Admin Review: {total_discrepancies}")

def main():
    parser = argparse.ArgumentParser(description="Sync CRAN historical dataset with discrepancy tracking")
    parser.add_argument("--year", type=int, help="Target year to sync (e.g. 2024)")
    parser.add_argument("--min-diff", type=float, default=5.0, help="Minimum percentage price difference to flag as discrepancy (default: 5.0%)")
    args = parser.parse_args()
    
    sync_cran_data(target_year=args.year, min_diff_pct=args.min_diff)

if __name__ == "__main__":
    main()
