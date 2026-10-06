#!/usr/bin/env python3
"""
Sync Daily Wholesale & Retail Price Reports from Central Bank of Sri Lanka (CBSL):
Source URL: https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report

Features:
- Scrapes the latest Daily Price Report PDFs published by CBSL
- Extracts wholesale prices (Pettah, Dambulla) and retail prices (Pettah, Narahenpita) using pdfplumber
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

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

VEGETABLE_MAP = {
    "beans": "beans",
    "carrot": "carrot",
    "cabbage": "cabbage--kandy-",
    "tomato": "tomato",
    "brinjal": "brinjals",
    "pumpkin": "pumpkin",
    "snake gourd": "snake-gourd",
    "green chilli": "green-chillies",
    "lime": "lime"
}

def clean_num(val_str: str) -> float:
    if not val_str:
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
                lower = line.lower()
                for veg_name, veg_id in VEGETABLE_MAP.items():
                    if lower.startswith(veg_name) and "rs./kg" in lower:
                        tokens = line.split("Rs./kg")[-1].strip().split()
                        nums = []
                        buffer = ""
                        for t in tokens:
                            buffer += t
                            if "." in buffer and len(buffer.split(".")[-1]) == 2:
                                val = clean_num(buffer)
                                if val > 0:
                                    nums.append(val)
                                buffer = ""
                                
                        # Expected order:
                        # [Pettah W/S Last, Pettah W/S Today, Dambulla W/S Last, Dambulla W/S Today, Pettah Retail Last, Pettah Retail Today...]
                        if len(nums) >= 4:
                            pettah_ws = nums[1] if len(nums) > 1 else nums[0]
                            dambulla_ws = nums[3] if len(nums) > 3 else (nums[2] if len(nums) > 2 else 0)
                            
                            if pettah_ws > 0:
                                records.append({
                                    "vegetable_id": veg_id,
                                    "market_id": "pettah",
                                    "price": pettah_ws,
                                    "price_type": "wholesale",
                                    "source": "cbsl",
                                    "date": report_date,
                                    "note": f"CBSL Daily Bulletin ({veg_name.title()})"
                                })
                            if dambulla_ws > 0:
                                records.append({
                                    "vegetable_id": veg_id,
                                    "market_id": "dambulla",
                                    "price": dambulla_ws,
                                    "price_type": "wholesale",
                                    "source": "cbsl",
                                    "date": report_date,
                                    "note": f"CBSL Daily Bulletin ({veg_name.title()})"
                                })
                                
                        if len(nums) >= 6:
                            pettah_retail = nums[5] if len(nums) > 5 else nums[4]
                            if pettah_retail > 0:
                                records.append({
                                    "vegetable_id": veg_id,
                                    "market_id": "pettah",
                                    "price": pettah_retail,
                                    "price_type": "retail",
                                    "source": "cbsl",
                                    "date": report_date,
                                    "note": f"CBSL Daily Bulletin ({veg_name.title()})"
                                })
                        break
    except Exception as e:
        print(f"    Error parsing PDF: {e}", flush=True)
        
    return records

def get_latest_cbsl_pdf_links(limit: int = 5) -> list:
    url = "https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report"
    headers = {"User-Agent": "Mozilla/5.0"}
    ctx = ssl._create_unverified_context()
    
    print(f"--> Scraping CBSL portal at {url}...", flush=True)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[ERROR] Failed to fetch CBSL page: {e}", flush=True)
        return []
    
    pdf_matches = re.findall(r'href="([^"]*price_report_\d{8}[^"]*\.pdf)"', html, re.I)
    results = []
    seen = set()
    for link in pdf_matches:
        full_url = link if link.startswith("http") else f"https://www.cbsl.gov.lk{link}"
        if full_url not in seen:
            seen.add(full_url)
            date_match = re.search(r'(\d{4})(\d{2})(\d{2})', full_url)
            iso_date = f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}" if date_match else None
            results.append({"url": full_url, "date": iso_date})
            if len(results) >= limit:
                break
                
    return results

def upsert_to_supabase(records: list, supabase_url: str, supabase_key: str) -> int:
    if not records or not supabase_url or not supabase_key:
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
        with urllib.request.urlopen(req, timeout=30, context=ctx):
            return len(records)
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        print(f"    Supabase upsert error [HTTP {e.code}]: {err[:200]}", flush=True)
        return 0
    except Exception as e:
        print(f"    Supabase upsert error: {e}", flush=True)
        return 0

def sync_cbsl(supabase_url: str = None, supabase_key: str = None, limit: int = 5):
    reports = get_latest_cbsl_pdf_links(limit=limit)
    print(f"    Found {len(reports)} recent CBSL Daily Price Report PDFs.", flush=True)
    
    ctx = ssl._create_unverified_context()
    headers = {"User-Agent": "Mozilla/5.0"}
    total_synced = 0
    
    for rep in reports:
        print(f"--> Processing [{rep['date']}]: {rep['url']}", flush=True)
        try:
            req = urllib.request.Request(rep["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=25, context=ctx) as resp:
                pdf_bytes = resp.read()
                
            entries = parse_cbsl_pdf(pdf_bytes, rep["date"])
            print(f"    Extracted {len(entries)} commodity prices (Pettah & Dambulla).", flush=True)
            
            if supabase_url and supabase_key and entries:
                saved = upsert_to_supabase(entries, supabase_url, supabase_key)
                total_synced += saved
                print(f"    Upserted {saved} rows into Supabase.", flush=True)
            elif entries:
                for s in entries[:2]:
                    print(f"     * {s['vegetable_id']} ({s['market_id']} {s['price_type']}): Rs. {s['price']}", flush=True)
        except Exception as e:
            print(f"    Error processing report: {e}", flush=True)
            
    print(f"\n[DONE] Successfully synced {total_synced} CBSL price records into Supabase.", flush=True)

if __name__ == "__main__":
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    sync_cbsl(url, key, limit=5)
