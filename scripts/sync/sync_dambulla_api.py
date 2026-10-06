#!/usr/bin/env python3
"""
Sync daily wholesale prices directly from Dambulla Dedicated Economic Centre API:
Endpoint: https://api.dambulladec.com/api/prices/by-date/{YYYY-MM-DD}?page=1&pageSize=100

Features:
- Direct JSON API ingestion (Zero PDF / HTML parsing required)
- Normalizes product names into canonical vegetable_id
- Computes average wholesale price = (min_price + max_price) / 2
- Upserts directly into Supabase 'price_entries' for market_id = 'dambulla'
- Supports single date (--date YYYY-MM-DD) or date ranges (--start-date, --end-date)
"""

import sys
import os
import argparse
import json
import urllib.request
import ssl
from datetime import datetime, timedelta
import difflib

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

try:
    from scraper.market_normalizer import normalize_market_name
except ImportError:
    pass

# Product name normalization mapping for Dambulla DEC products
DAMBULLA_PRODUCT_MAP = {
    "beans": "beans",
    "beet root": "beet-root",
    "cabbage": "cabbage--kandy-",
    "carrot": "carrot",
    "knolkhol": "knolkhol",
    "leeks": "leeks",
    "radish": "raddish",
    "raddish": "raddish",
    "tomato": "tomato",
    "ladies fingers": "ladies-fingers",
    "brinjal": "brinjals",
    "brinjals": "brinjals",
    "bitter gourd": "bitter-gourd",
    "snake gourd": "snake-gourd",
    "cucumber": "cucumber",
    "luffa": "luffa",
    "pumpkin": "pumpkin",
    "drumstick": "drumstick",
    "capsicum": "capsicum",
    "green chillies": "green-chillies",
    "green chilli": "green-chillies",
    "lime": "lime",
    "ash plantain": "ash-plantains",
    "manioc": "manioc",
    "sweet potato": "sweet-potatoe",
    "potato": "potato--imported-",
    "potato local": "potato--nuwaraeliya-",
    "big onion": "imported",
    "red onion": "vedalan",
    "ambul": "ambul",
    "kolikuttu": "kolikuttu",
    "seeni": "seeni",
    "papaya": "papaya",
    "pineapple": "pineapple---large",
    "avocado": "avocado",
    "passion fruit": "passion-fruits"
}

def normalize_dambulla_product(name: str) -> str:
    cleaned = name.strip().lower()
    if cleaned in DAMBULLA_PRODUCT_MAP:
        return DAMBULLA_PRODUCT_MAP[cleaned]
    
    # Try fuzzy match against known keys
    matches = difflib.get_close_matches(cleaned, DAMBULLA_PRODUCT_MAP.keys(), n=1, cutoff=0.75)
    if matches:
        return DAMBULLA_PRODUCT_MAP[matches[0]]
    
    # Fallback slug
    return cleaned.replace(" ", "-").replace("'", "")

def fetch_dambulla_prices_for_date(date_str: str) -> list:
    url = f"https://api.dambulladec.com/api/prices/by-date/{date_str}?page=1&pageSize=150"
    headers = {"User-Agent": "NAMIS-ETL-Bot/1.0"}
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("data", [])
    except Exception as e:
        print(f"[{date_str}] Error fetching Dambulla API: {e}")
        return []

def get_valid_vegetable_ids(supabase_url: str, supabase_key: str) -> set:
    try:
        url = f"{supabase_url.rstrip('/')}/rest/v1/vegetables?select=id"
        headers = {"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20, context=ssl._create_unverified_context()) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return set(v["id"] for v in data)
    except Exception as e:
        print(f"Warning: Could not fetch canonical vegetables: {e}")
        return set()

def upsert_to_supabase(records: list, supabase_url: str, supabase_key: str):
    if not records:
        return 0
    
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/price_entries?on_conflict=vegetable_id,market_id,date,price_type"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(endpoint, data=json.dumps(records).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
            return len(records)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        print(f"Supabase upsert error [HTTP {e.code}]: {err_msg}")
        return 0
    except Exception as e:
        print(f"Supabase upsert error: {e}")
        return 0

def sync_date(date_str: str, supabase_url: str = None, supabase_key: str = None):
    print(f"--> Syncing Dambulla DEC for date: {date_str}")
    raw_items = fetch_dambulla_prices_for_date(date_str)
    if not raw_items:
        print(f"    No items found for {date_str} (Market may be closed / holiday).")
        return 0
    
    valid_veg_ids = get_valid_vegetable_ids(supabase_url, supabase_key) if (supabase_url and supabase_key) else set()
    
    parsed_entries = []
    seen_keys = set()
    
    for item in raw_items:
        prod = item.get("product", {})
        prod_name = prod.get("name", "").strip()
        min_p = float(item.get("min_price") or 0)
        max_p = float(item.get("max_price") or 0)
        
        if min_p <= 0 and max_p <= 0:
            continue
        
        avg_price = round((min_p + max_p) / 2.0, 2) if (min_p > 0 and max_p > 0) else max(min_p, max_p)
        veg_id = normalize_dambulla_product(prod_name)
        
        # Foreign key validation against canonical vegetables table
        if valid_veg_ids and veg_id not in valid_veg_ids:
            continue
            
        dedup_key = (veg_id, "dambulla", date_str, "wholesale")
        if dedup_key in seen_keys:
            continue
        seen_keys.add(dedup_key)
        
        parsed_entries.append({
            "market_id": "dambulla",
            "vegetable_id": veg_id,
            "price": avg_price,
            "min_price": min_p if min_p > 0 else None,
            "max_price": max_p if max_p > 0 else None,
            "price_type": "wholesale",
            "source": "dambulla_dec",
            "date": date_str,
            "note": f"Dambulla DEC Live API (Min: {min_p}, Max: {max_p})"
        })
    
    print(f"    Parsed {len(parsed_entries)} valid commodity prices.")
    if supabase_url and supabase_key:
        saved = upsert_to_supabase(parsed_entries, supabase_url, supabase_key)
        print(f"    Upserted {saved} rows into Supabase.")
    else:
        print("    (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - printed to stdout only)")
        for sample in parsed_entries[:3]:
            print(f"     * {sample['vegetable_id']}: Rs. {sample['price']} (Date: {sample['date']})")
            
    return len(parsed_entries)

def main():
    parser = argparse.ArgumentParser(description="Sync Dambulla DEC prices into Supabase")
    parser.add_argument("--date", help="Target date YYYY-MM-DD (defaults to today)")
    parser.add_argument("--start-date", help="Range start date YYYY-MM-DD")
    parser.add_argument("--end-date", help="Range end date YYYY-MM-DD")
    args = parser.parse_args()
    
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    
    if args.start_date and args.end_date:
        curr = datetime.strptime(args.start_date, "%Y-%m-%d")
        end = datetime.strptime(args.end_date, "%Y-%m-%d")
        total = 0
        while curr <= end:
            d_str = curr.strftime("%Y-%m-%d")
            total += sync_date(d_str, supabase_url, supabase_key)
            curr += timedelta(days=1)
        print(f"\n[DONE] Range sync complete. Total prices processed: {total}")
    else:
        target_date = args.date or datetime.now().strftime("%Y-%m-%d")
        sync_date(target_date, supabase_url, supabase_key)

if __name__ == "__main__":
    main()
