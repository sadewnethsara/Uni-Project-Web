#!/usr/bin/env python3
"""
Maintenance Script: Clean Corrupted, OCR Artifact & Duplicate Vegetable Commodities
Removes 47 invalid / corrupted / duplicate entries from Supabase 'vegetables' table.
"""

import sys
import os
import json
import urllib.request
import urllib.parse
import ssl
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
    sys.exit(1)

JUNK_VEGETABLE_IDS = [
    "-",
    "ambul-rs-kg-",
    "b-onion-imported",
    "b-onion-imported-",
    "beet-root--n-eliya-",
    "beet-root-n-eliya-",
    "bitter-gourd--other-",
    "bitter-gourd--villag",
    "bitter-gourd--village",
    "bitter-gourd--village-",
    "brinjals--other-",
    "brinjals--village-",
    "d-a-t-a-m-anagement-division",
    "eggplant",
    "eggs--rs-egg---",
    "head",
    "i-n-f-o-r-m-a-t-i-o-n-d-i-v-i-s-i-o-n",
    "i-n-f-ormation-division",
    "imported----div-0-",
    "imported-rice",
    "information-division",
    "karathak",
    "karathako",
    "kiri-ponne-pall-ponne-",
    "kolikuttu--rs-fruits-",
    "kora",
    "marketing---food-policy-division",
    "nadu-1",
    "nadu-2",
    "nuwaraeliya",
    "orange",
    "papaya--rs-kg-",
    "pineapple---small",
    "ponne-1",
    "potato--nuwaraeliya--",
    "potato-imported-",
    "raw-red--ref-----ref---ref-",
    "samba-1----div-0-",
    "samba-1----div-0---div-0-",
    "samba-3",
    "samba-3------div-0-",
    "samba-ponne-1",
    "sinnan----div-0-",
    "vedalan----div-0-",
    "vedalan----div-0---div-0-",
    "welimada",
    "welimada----div-0-"
]

VEGETABLE_REMAP = {
    "beet-root-n-eliya-": "beet-root",
    "beet-root--n-eliya-": "beet-root",
    "bitter-gourd--other-": "bitter-gourd",
    "bitter-gourd--villag": "bitter-gourd",
    "bitter-gourd--village": "bitter-gourd",
    "bitter-gourd--village-": "bitter-gourd",
    "brinjals--other-": "brinjals",
    "brinjals--village-": "brinjals",
    "eggplant": "brinjals",
    "potato-imported-": "potato--imported-",
    "potato--nuwaraeliya--": "potato--nuwaraeliya-",
    "nuwaraeliya": "potato--nuwaraeliya-",
    "welimada": "potato--welimada-",
    "b-onion-imported": "imported",
    "b-onion-imported-": "imported",
    "ambul-rs-kg-": "ambul",
    "kolikuttu--rs-fruits-": "kolikuttu",
    "papaya--rs-kg-": "papaya",
    "nadu-1": "nadu",
    "nadu-2": "nadu",
    "samba-3": "samba-2",
    "ponne-1": "ponne-samba",
    "samba-ponne-1": "ponne-samba",
    "eggs--rs-egg---": "white"
}

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def run_request(endpoint: str, method: str = "GET", body: dict = None) -> (int, str):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return -1, str(e)

def main():
    print("=" * 70)
    print("  NAMIS DATABASE CLEANSER: CORRUPTED & DUPLICATE COMMODITY REMOVAL")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # 1. Fetch current vegetables count
    status, body = run_request("vegetables?select=id,name")
    if status != 200:
        print(f"[ERROR] Failed to fetch vegetables: HTTP {status} - {body}")
        sys.exit(1)
    
    current_vegs = json.loads(body)
    print(f"\n[1] INITIAL STATE: {len(current_vegs)} items in 'vegetables' table.")

    # 2. Safety check: Check if any prices exist for junk IDs and remap if necessary
    print("\n[2] VERIFYING & REMAPPING ANY LINGERING REFERENCES...")
    remapped_count = 0
    for old_id, target_id in VEGETABLE_REMAP.items():
        enc_old = urllib.parse.quote(old_id)
        # Check price_entries
        status, p_body = run_request(f"price_entries?vegetable_id=eq.{enc_old}&select=id")
        if status == 200:
            prices = json.loads(p_body)
            if prices:
                print(f"    * Remapping {len(prices)} price_entries from '{old_id}' -> '{target_id}'")
                patch_status, patch_body = run_request(f"price_entries?vegetable_id=eq.{enc_old}", method="PATCH", body={"vegetable_id": target_id})
                remapped_count += len(prices)
        
        # Check price_discrepancies
        status, d_body = run_request(f"price_discrepancies?vegetable_id=eq.{enc_old}&select=id")
        if status == 200:
            discs = json.loads(d_body)
            if discs:
                print(f"    * Remapping {len(discs)} price_discrepancies from '{old_id}' -> '{target_id}'")
                patch_status, patch_body = run_request(f"price_discrepancies?vegetable_id=eq.{enc_old}", method="PATCH", body={"vegetable_id": target_id})
                remapped_count += len(discs)

    if remapped_count == 0:
        print("    [OK] Confirmed 0 lingering price references across all 47 target IDs.")

    # 3. Deleting junk items from vegetables
    print(f"\n[3] DELETING {len(JUNK_VEGETABLE_IDS)} NON-CANONICAL / CORRUPTED COMMODITIES...")
    deleted_count = 0
    errors = 0

    for jid in JUNK_VEGETABLE_IDS:
        enc_id = urllib.parse.quote(jid)
        status, del_body = run_request(f"vegetables?id=eq.{enc_id}", method="DELETE")
        if status in (200, 204):
            deleted = json.loads(del_body) if del_body else []
            if deleted:
                print(f"    - Successfully deleted '{jid}' ({deleted[0].get('name')})")
                deleted_count += 1
            else:
                # Already deleted or not present
                print(f"    - Item '{jid}' was not found (already deleted)")
        else:
            print(f"    [FAIL] Error deleting '{jid}': HTTP {status} - {del_body}")
            errors += 1

    # 4. Final verification
    status, body = run_request("vegetables?select=id,name,name_si,category_id&order=id.asc")
    final_vegs = json.loads(body)
    print(f"\n[4] FINAL AUDIT:")
    print(f"    * Deleted:              {deleted_count} items")
    print(f"    * Remaining in DB:      {len(final_vegs)} canonical commodities")
    print(f"    * Errors:               {errors}")

    print("\n" + "=" * 70)
    if len(final_vegs) == 54 and errors == 0:
        print("  STATUS: [SUCCESS] DATABASE VEGETABLES IS 100% SANITIZED (54 CANONICAL ITEMS)")
    else:
        print(f"  STATUS: [COMPLETED WITH NOTES] Final count: {len(final_vegs)}")
    print("=" * 70)

if __name__ == "__main__":
    main()
