#!/usr/bin/env python3
"""
Sync Daily Wholesale & Retail Price Reports from Central Bank of Sri Lanka (CBSL):
Source URL: https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report

Features:
- Scrapes the latest Daily Price Report PDFs published by CBSL
- Covers 25+ commodities: Vegetables, Local/Imported Potatoes, Onions, Rice, Pulses, Fruits, Eggs
- Extracts wholesale and retail prices for Pettah and Dambulla markets
- Upserts structured price records into Supabase 'price_entries' (source: 'cbsl')
- Enforces composite unique constraint (vegetable_id, market_id, date, price_type)
"""

import sys
import os
import re
import io
import json
import urllib.request
import ssl
from datetime import datetime
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

CBSL_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

CBSL_COMMODITY_MAP = [
    # (pattern in lower, canonical_id, display_name)
    ("beans", "beans", "Beans"),
    ("carrot", "carrot", "Carrot"),
    ("cabbage", "cabbage--kandy-", "Cabbage"),
    ("tomato", "tomato", "Tomato"),
    ("brinjal", "brinjals", "Brinjal"),
    ("pumpkin", "pumpkin", "Pumpkin"),
    ("snake gourd", "snake-gourd", "Snake Gourd"),
    ("green chilli", "green-chillies", "Green Chilli"),
    ("lime", "lime", "Lime"),
    
    # Potatoes & Onions (Distinct Local vs Imported)
    ("potato (local)", "potato--welimada-", "Potato (Local)"),
    ("potato (imp)", "potato--imported-", "Potato (Imp)"),
    ("big onion (local)", "sinnan", "Big Onion (Local)"),
    ("big onion (imp)", "imported", "Big Onion (Imp)"),
    ("red onion (local)", "vedalan", "Red Onion (Local)"),
    
    # Consumption items & eggs
    ("red dhal", "red-dhal", "Red Dhal"),
    ("sugar (white)", "sugar-white-", "Sugar (White)"),
    ("egg (white)", "white", "Egg (White)"),
    
    # Fruits
    ("banana (sour)", "ambul", "Banana (Sour)"),
    ("papaw", "papaya", "Papaw"),
    ("pineapple", "pineapple---large", "Pineapple"),
    
    # Rice
    ("kekulu (red)", "raw-red", "Raw Red Rice"),
    ("kekulu (white)", "raw-white", "Raw White Rice"),
    ("ponni samba (imp)", "ponne-samba", "Ponni Samba"),
    ("samba", "samba-1", "Samba"),
    ("nadu", "nadu", "Nadu"),
]

def clean_num(val_str: str) -> float:
    if not val_str or val_str.lower() == 'n.a.':
        return 0.0
    cleaned = re.sub(r"[^\d.]", "", val_str)
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def parse_cbsl_pdf(pdf_bytes: bytes, report_date: str) -> list:
    """Parses Page 2 table of CBSL daily price report for wholesale & retail prices."""
    records = []
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            if len(pdf.pages) < 2:
                return []
            page2 = pdf.pages[1]
            text = page2.extract_text()
            if not text:
                return []
                
            lines = text.split("\n")
            for line in lines:
                lower = line.lower().strip()
                if not lower:
                    continue

                matched_entry = None
                for pattern, veg_id, disp_name in CBSL_COMMODITY_MAP:
                    if pattern in lower:
                        matched_entry = (pattern, veg_id, disp_name)
                        break
                        
                if not matched_entry:
                    continue
                    
                pattern, veg_id, disp_name = matched_entry
                
                # Find unit marker (Rs./kg, Rs./Each, Rs./Nut, etc.)
                split_match = re.search(r'rs\./\w+', lower)
                if not split_match:
                    continue
                    
                data_part = line[split_match.end():].strip()
                tokens = data_part.split()
                
                nums = []
                buffer = ""
                for t in tokens:
                    if t.lower() == 'n.a.':
                        nums.append(0.0)
                        buffer = ""
                        continue
                    buffer += t
                    if "." in buffer and len(buffer.split(".")[-1]) == 2:
                        val = clean_num(buffer)
                        nums.append(val)
                        buffer = ""
                        
                # CBSL table columns:
                # Wholesale: Pettah [Yesterday, Today], Dambulla [Yesterday, Today]
                # Retail:    Pettah [Yesterday, Today], Dambulla [Yesterday, Today], Narahenpita [Yesterday, Today]
                if len(nums) >= 4:
                    pettah_ws = nums[1] if len(nums) > 1 else nums[0]
                    dambulla_ws = nums[3] if len(nums) > 3 else (nums[2] if len(nums) > 2 else 0)
                    
                    if pettah_ws > 0 and pettah_ws <= 25000:
                        records.append({
                            "vegetable_id": veg_id,
                            "market_id": "pettah",
                            "price": pettah_ws,
                            "price_type": "wholesale",
                            "source": "cbsl",
                            "date": report_date,
                            "note": f"CBSL Daily Bulletin ({disp_name})"
                        })
                    if dambulla_ws > 0 and dambulla_ws <= 25000:
                        records.append({
                            "vegetable_id": veg_id,
                            "market_id": "dambulla",
                            "price": dambulla_ws,
                            "price_type": "wholesale",
                            "source": "cbsl",
                            "date": report_date,
                            "note": f"CBSL Daily Bulletin ({disp_name})"
                        })
                        
                if len(nums) >= 6:
                    pettah_retail = nums[5] if len(nums) > 5 else nums[4]
                    if pettah_retail > 0 and pettah_retail <= 25000:
                        records.append({
                            "vegetable_id": veg_id,
                            "market_id": "pettah",
                            "price": pettah_retail,
                            "price_type": "retail",
                            "source": "cbsl",
                            "date": report_date,
                            "note": f"CBSL Daily Bulletin ({disp_name})"
                        })

                if len(nums) >= 8:
                    dambulla_retail = nums[7] if len(nums) > 7 else nums[6]
                    if dambulla_retail > 0 and dambulla_retail <= 25000:
                        records.append({
                            "vegetable_id": veg_id,
                            "market_id": "dambulla",
                            "price": dambulla_retail,
                            "price_type": "retail",
                            "source": "cbsl",
                            "date": report_date,
                            "note": f"CBSL Daily Bulletin ({disp_name})"
                        })
    except Exception as e:
        print(f"    Error parsing PDF: {e}", flush=True)
        
    return records

import requests

def get_latest_cbsl_pdf_links(limit: int = None, max_pages: int = 1, session: requests.Session = None) -> list:
    if session is None:
        session = requests.Session()
    base_url = "https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report"
    headers = CBSL_HEADERS
    
    results = []
    seen = set()
    
    for page in range(max_pages):
        url = base_url if page == 0 else f"{base_url}?page={page}"
        print(f"--> Scraping CBSL portal page {page} at {url}...", flush=True)
        try:
            resp = session.get(url, headers=headers, timeout=30)
            if resp.status_code != 200:
                print(f"[ERROR] Failed to fetch CBSL page {page}: HTTP {resp.status_code}", flush=True)
                break
            html = resp.text
        except Exception as e:
            print(f"[ERROR] Failed to fetch CBSL page {page}: {e}", flush=True)
            break
        
        pdf_matches = re.findall(r'href="([^"]*price_report_\d{8}[^"]*\.pdf)"', html, re.I)
        page_added = 0
        for link in pdf_matches:
            full_url = link if link.startswith("http") else f"https://www.cbsl.gov.lk{link}"
            if full_url not in seen:
                seen.add(full_url)
                date_match = re.search(r'(\d{4})(\d{2})(\d{2})', full_url)
                iso_date = f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}" if date_match else None
                results.append({"url": full_url, "date": iso_date})
                page_added += 1
                if limit and len(results) >= limit:
                    return results
                    
        if page_added == 0:
            break
            
    return results

def upsert_to_supabase(records: list, supabase_url: str, supabase_key: str, session: requests.Session = None) -> int:
    if not records or not supabase_url or not supabase_key:
        return 0
    if session is None:
        session = requests.Session()
        
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/price_entries?on_conflict=vegetable_id,market_id,date,price_type"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    # Free-tier batch guardrail: 500 records per batch
    batch_size = 500
    total_saved = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            resp = session.post(endpoint, json=batch, headers=headers, timeout=30)
            if resp.status_code in (200, 201):
                total_saved += len(batch)
            else:
                print(f"    Supabase upsert error [HTTP {resp.status_code}]: {resp.text[:200]}", flush=True)
        except Exception as e:
            print(f"    Supabase upsert error: {e}", flush=True)
            
    return total_saved

def sync_cbsl(supabase_url: str = None, supabase_key: str = None, limit: int = None, max_pages: int = 1):
    print("=" * 65)
    print("  CBSL DAILY WHOLESALE & RETAIL MARKET PRICE SYNC")
    print("=" * 65)
    session = requests.Session()
    reports = get_latest_cbsl_pdf_links(limit=limit, max_pages=max_pages, session=session)
    print(f"    Found {len(reports)} recent CBSL Daily Price Report PDFs.", flush=True)
    
    headers = CBSL_HEADERS
    total_synced = 0
    
    for rep in reports:
        print(f"--> Processing [{rep['date']}]: {rep['url']}", flush=True)
        try:
            resp = session.get(rep["url"], headers=headers, timeout=25)
            if resp.status_code != 200:
                print(f"    Failed to download PDF [HTTP {resp.status_code}]: {rep['url']}", flush=True)
                continue
            pdf_bytes = resp.content
                
            entries = parse_cbsl_pdf(pdf_bytes, rep["date"])
            print(f"    Extracted {len(entries)} commodity prices (Pettah & Dambulla).", flush=True)
            
            if supabase_url and supabase_key and entries:
                saved = upsert_to_supabase(entries, supabase_url, supabase_key, session=session)
                total_synced += saved
                print(f"    Upserted {saved} rows into Supabase.", flush=True)
            elif entries:
                for s in entries[:3]:
                    print(f"     * {s['vegetable_id']} ({s['market_id']} {s['price_type']}): Rs. {s['price']}", flush=True)
        except Exception as e:
            print(f"    Error processing report: {e}", flush=True)
            
    print(f"\n[DONE] Successfully synced {total_synced} CBSL price records into Supabase.", flush=True)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Sync CBSL Daily Price Reports into Supabase")
    parser.add_argument("--pages", type=int, default=1, help="Number of CBSL portal archive pages to scrape (default: 1)")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of PDF reports to process")
    args = parser.parse_args()
    
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    sync_cbsl(url, key, limit=args.limit, max_pages=args.pages)
