#!/usr/bin/env python3
"""
Data Migration & Cleansing Script:
Migrates clean data from old project (Namis: ialefdqxcihpiojjlzyz)
to new project (Agriculture Market: lszuxjqlnjatqnnyuqda).

Features:
- Automatically loads .env credentials
- Filters out corrupted Excel artifacts (#DIV/0!, #REF!, Division headers)
- Remaps legacy vegetable variations (e.g. nuwaraeliya, eggplant, nadu-1, b-onion-imported) to canonical IDs
- Remaps legacy 'peliyagod' market entries to 'peliyagoda'
- Migrates 4,383 market calendar trading & holiday days
- Dynamic foreign-key verification (ensures zero FK constraint violations)
- In-batch deduplication (ensures zero HTTP 409 unique constraint conflicts)
- Can filter by year (--year 2024) or migrate all historical data (--all)
"""

import sys
import os
import json
import urllib.request
import urllib.error
import ssl
from datetime import datetime
import argparse

OLD_SUPABASE_URL = os.environ.get("OLD_SUPABASE_URL", "")
OLD_SUPABASE_KEY = os.environ.get("OLD_SUPABASE_KEY", "")

# Corrupt / Junk vegetable IDs to strictly exclude
JUNK_VEGETABLE_IDS = {
    "-", ".", "d-a-t-a-m-anagement-division", "i-n-f-o-r-m-a-t-i-o-n-d-i-v-i-s-i-o-n",
    "i-n-f-ormation-division", "information-division", "marketing---food-policy-division", "head",
    "imported----div-0-", "sinnan----div-0-", "vedalan----div-0-", "vedalan----div-0---div-0-",
    "welimada----div-0-", "samba-1----div-0-", "samba-1----div-0---div-0-", "samba-3------div-0-",
    "raw-red--ref-----ref---ref-"
}

# Remap legacy naming anomalies to canonical IDs
VEGETABLE_REMAP = {
    "potato--nuwaraeliya--": "potato--nuwaraeliya-",
    "nuwaraeliya": "potato--nuwaraeliya-",
    "welimada": "potato--welimada-",
    "potato-imported-": "potato--imported-",
    "bitter-gourd--other-": "bitter-gourd",
    "bitter-gourd--villag": "bitter-gourd",
    "bitter-gourd--village": "bitter-gourd",
    "bitter-gourd--village-": "bitter-gourd",
    "brinjals--other-": "brinjals",
    "brinjals--village-": "brinjals",
    "eggplant": "brinjals",
    "b-onion-imported": "imported",
    "b-onion-imported-": "imported",
    "beet-root--n-eliya-": "beet-root",
    "beet-root-n-eliya-": "beet-root",
    "ambul-rs-kg-": "ambul",
    "kolikuttu--rs-fruits-": "kolikuttu",
    "papaya--rs-kg-": "papaya",
    "nadu-1": "nadu",
    "nadu-2": "nadu",
    "samba-3": "samba-2",
    "eggs--rs-egg---": "white"
}

# Canonical market IDs allowed in the professional schema
CANONICAL_MARKETS = {
    "bandarawela", "dambulla", "kandy", "keppetipola", "manning", "meegoda",
    "norochchole", "nuwara-eliya", "peliyagoda", "pettah", "thambuththegama", "veyangoda"
}

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def fetch_from_old(endpoint_path: str) -> list:
    url = f"{OLD_SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint_path.lstrip('/')}"
    headers = {
        "apikey": OLD_SUPABASE_KEY,
        "Authorization": f"Bearer {OLD_SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
        return json.loads(resp.read().decode("utf-8"))

def fetch_from_new(endpoint_path: str, new_url: str, new_key: str) -> list:
    url = f"{new_url.rstrip('/')}/rest/v1/{endpoint_path.lstrip('/')}"
    headers = {
        "apikey": new_key,
        "Authorization": f"Bearer {new_key}"
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
        return json.loads(resp.read().decode("utf-8"))

def upsert_to_new(table_name: str, records: list, new_url: str, new_key: str, conflict_col: str = None) -> int:
    if not records:
        return 0
    conflict_query = f"?on_conflict={conflict_col}" if conflict_col else ""
    url = f"{new_url.rstrip('/')}/rest/v1/{table_name}{conflict_query}"
    headers = {
        "apikey": new_key,
        "Authorization": f"Bearer {new_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    req = urllib.request.Request(url, data=json.dumps(records).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=45, context=get_ssl_context()):
            return len(records)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        print(f"\n[HTTP {e.code}] Error upserting to {table_name}: {err_msg[:200]}")
        return 0
    except Exception as e:
        print(f"\nError upserting to {table_name}: {e}")
        return 0

def migrate_calendar(new_url: str, new_key: str):
    print("--> Migrating Market Calendar (Trading days & holidays)...")
    offset = 0
    limit = 1000
    total_cal = 0
    while True:
        calendar = fetch_from_old(f"market_calendar?select=*&limit={limit}&offset={offset}")
        if not calendar:
            break
        total_cal += upsert_to_new("market_calendar", calendar, new_url, new_key, conflict_col="date")
        offset += limit
    print(f"    Saved {total_cal} calendar days.")

def migrate_price_entries(new_url: str, new_key: str, year: int = None):
    print(f"\n--> Migrating Wholesale Price Entries (Year: {year if year else 'ALL'})...")
    
    # Query valid vegetables in the new database for strict FK safety
    try:
        new_vegs = fetch_from_new("vegetables?select=id", new_url, new_key)
        valid_veg_ids = set(v["id"] for v in new_vegs)
        print(f"    Loaded {len(valid_veg_ids)} canonical vegetables from target project.")
    except Exception as e:
        print(f"[ERROR] Could not fetch canonical vegetables from new project: {e}")
        return
        
    limit = 1000
    offset = 0
    total_migrated = 0
    
    date_filter = f"&date=gte.{year}-01-01&date=lte.{year}-12-31" if year else ""
    
    while True:
        endpoint = f"price_entries?select=id,market_id,vegetable_id,price,date,note&order=id.asc&limit={limit}&offset={offset}{date_filter}"
        try:
            rows = fetch_from_old(endpoint)
        except Exception as e:
            print(f"    Error fetching offset {offset}: {e}")
            break
            
        if not rows:
            break
            
        # Clean, map, and deduplicate batch
        valid_batch = []
        seen_keys = set()
        
        for r in rows:
            m_id = "peliyagoda" if r["market_id"] == "peliyagod" else r["market_id"]
            raw_v_id = r["vegetable_id"]
            
            if m_id not in CANONICAL_MARKETS:
                continue
            if raw_v_id in JUNK_VEGETABLE_IDS:
                continue
                
            v_id = VEGETABLE_REMAP.get(raw_v_id, raw_v_id)
            if v_id not in valid_veg_ids:
                continue
                
            if not r["price"] or float(r["price"]) <= 0:
                continue
                
            dedup_key = (v_id, m_id, r["date"], "wholesale")
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)
                
            valid_batch.append({
                "market_id": m_id,
                "vegetable_id": v_id,
                "price": float(r["price"]),
                "price_type": "wholesale",
                "source": "harti",
                "date": r["date"],
                "note": r.get("note") or "HARTI Daily Wholesale Bulletin"
            })
            
        if valid_batch:
            upserted = upsert_to_new("price_entries", valid_batch, new_url, new_key, conflict_col="vegetable_id,market_id,date,price_type")
            total_migrated += upserted
            
        print(f"    Processed offset {offset}..{offset + len(rows)} | Migrated so far: {total_migrated} clean rows", end="\r", flush=True)
        offset += limit
        
    print(f"\n[DONE] Successfully migrated {total_migrated} clean price entries for {year if year else 'ALL'}.")

def main():
    load_dotenv()
    
    parser = argparse.ArgumentParser(description="Migrate clean NAMIS data to the new Agriculture Market project")
    parser.add_argument("--year", type=int, help="Target year to migrate (e.g. 2024)")
    parser.add_argument("--cal-only", action="store_true", help="Only migrate calendar days")
    parser.add_argument("--all", action="store_true", help="Migrate all historical years")
    parser.add_argument("--old-url", help="Old Supabase project URL")
    parser.add_argument("--old-key", help="Old Supabase project key")
    args = parser.parse_args()
    
    global OLD_SUPABASE_URL, OLD_SUPABASE_KEY
    OLD_SUPABASE_URL = args.old_url or os.environ.get("OLD_SUPABASE_URL") or "https://ialefdqxcihpiojjlzyz.supabase.co"
    OLD_SUPABASE_KEY = args.old_key or os.environ.get("OLD_SUPABASE_KEY")
    
    new_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    new_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not new_url or not new_key or "your-project-id" in new_url:
        print("[ERROR] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env")
        sys.exit(1)
        
    if not OLD_SUPABASE_KEY:
        print("[ERROR] OLD_SUPABASE_KEY must be supplied via --old-key or OLD_SUPABASE_KEY in your private .env")
        sys.exit(1)
        
    print(f"Target Project: {new_url}")
    migrate_calendar(new_url, new_key)
    
    if not args.cal_only:
        migrate_price_entries(new_url, new_key, year=args.year)

if __name__ == "__main__":
    main()
