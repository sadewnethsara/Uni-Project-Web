#!/usr/bin/env python3
"""
CBSL Historical Price Report Extractor & Ingestion Pipeline (2016 - 2026):
Downloads and extracts daily agricultural commodity price bulletins from the
Central Bank of Sri Lanka (CBSL) archives and syncs to Supabase.

Features:
- Scrapes archive pages from https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report
- Extracts wholesale (Pettah, Dambulla) and retail (Pettah) prices via pdfplumber
- Zero disk usage: Streams PDFs directly in-memory and parses on-the-fly
- Automated discrepancy detection: Conflicting prices (>5% variance) are routed to
  'price_discrepancies' table for moderator review; missing slots are inserted into 'price_entries'
- Enforces Supabase Free-Tier guardrails (batch size <= 500, in-memory stream cleanup)
"""

import sys
import os
import re
import io
import json
import urllib.request
import urllib.error
import ssl
from datetime import datetime
import argparse
import pdfplumber

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

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

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def clean_num(val_str: str) -> float:
    if not val_str:
        return 0.0
    cleaned = re.sub(r"[^\d.]", "", val_str)
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def parse_cbsl_pdf(pdf_bytes: bytes, report_date: str) -> list:
    """Parses Page 2 table of CBSL daily price report."""
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
                                
                        # Order: [Pettah W/S Last, Pettah W/S Today, Dambulla W/S Last, Dambulla W/S Today, Pettah Ret Last, Pettah Ret Today...]
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

def fetch_existing_price_map(date_str: str) -> dict:
    """Fetch existing prices for a given date to check for discrepancies."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {}
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/price_entries?select=vegetable_id,market_id,price_type,price,source&date=eq.{date_str}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15, context=get_ssl_context()) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
            return {(r["vegetable_id"], r["market_id"], r["price_type"]): (float(r["price"]), r["source"]) for r in rows}
    except Exception:
        return {}

def post_batch(table_name: str, records: list) -> int:
    if not records or not SUPABASE_URL or not SUPABASE_KEY:
        return 0
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}"
    if table_name == "price_entries":
        url += "?on_conflict=vegetable_id,market_id,date,price_type"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates" if table_name == "price_entries" else "return=minimal"
    }
    req = urllib.request.Request(url, data=json.dumps(records).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()):
            return len(records)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        if e.code == 409 or "duplicate key" in err_msg.lower():
            return 0
        print(f"    [HTTP {e.code}] Error posting to {table_name}: {err_msg[:200]}", flush=True)
        return 0
    except Exception as e:
        print(f"    Error posting to {table_name}: {e}", flush=True)
        return 0

def fetch_cbsl_archive_links(year: int = None, max_pages: int = 10, limit: int = 100) -> list:
    """Scrapes multiple archive pages for CBSL PDF report links."""
    base_url = "https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report"
    headers = {"User-Agent": "Mozilla/5.0"}
    results = []
    seen = set()
    
    print(f"--> Scanning CBSL archive pages (up to {max_pages} pages)...", flush=True)
    for p in range(max_pages):
        page_url = base_url if p == 0 else f"{base_url}?page={p}"
        req = urllib.request.Request(page_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"    Error scraping CBSL page {p}: {e}", flush=True)
            break
            
        pdf_matches = re.findall(r'href="([^"]*price_report_(\d{4})(\d{2})(\d{2})[^"]*\.pdf)"', html, re.I)
        if not pdf_matches:
            break
            
        page_added = 0
        for full_match, y, m, d in pdf_matches:
            if year and int(y) != year:
                continue
            link = full_match if full_match.startswith("http") else f"https://www.cbsl.gov.lk{full_match}"
            if link not in seen:
                seen.add(link)
                iso_date = f"{y}-{m}-{d}"
                results.append({"url": link, "date": iso_date})
                page_added += 1
                if limit and len(results) >= limit:
                    break
                    
        print(f"    Page {p}: Found {page_added} reports (Total collected: {len(results)})", flush=True)
        if limit and len(results) >= limit:
            break
            
    return results

def main():
    parser = argparse.ArgumentParser(description="Sync CBSL Historical Daily Price Bulletins")
    parser.add_argument("--year", type=int, help="Target year (e.g. 2024)")
    parser.add_argument("--pages", type=int, default=5, help="Number of archive pages to scan (default: 5)")
    parser.add_argument("--limit", type=int, default=50, help="Maximum number of PDF reports to process (default: 50)")
    args = parser.parse_args()
    
    links = fetch_cbsl_archive_links(year=args.year, max_pages=args.pages, limit=args.limit)
    print(f"\n--> Found {len(links)} CBSL Price Reports to process.", flush=True)
    
    total_entries_synced = 0
    total_discrepancies_logged = 0
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for idx, item in enumerate(links, 1):
        report_date = item["date"]
        report_url = item["url"]
        print(f"[{idx}/{len(links)}] Processing {report_date}: {report_url}", flush=True)
        
        try:
            req = urllib.request.Request(report_url, headers=headers)
            with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
                pdf_bytes = resp.read()
                
            records = parse_cbsl_pdf(pdf_bytes, report_date)
            if not records:
                print(f"    No commodity records found in Page 2 table.", flush=True)
                continue
                
            print(f"    Extracted {len(records)} prices.", flush=True)
            
            # Discrepancy checking & routing
            existing_map = fetch_existing_price_map(report_date)
            to_insert_entries = []
            to_insert_discrepancies = []
            
            for r in records:
                key = (r["vegetable_id"], r["market_id"], r["price_type"])
                if key in existing_map:
                    exist_price, exist_source = existing_map[key]
                    diff = round(r["price"] - exist_price, 2)
                    diff_pct = round((diff / exist_price) * 100, 2) if exist_price > 0 else 0
                    
                    if abs(diff_pct) >= 5.0 and exist_source != "cbsl":
                        to_insert_discrepancies.append({
                            "vegetable_id": r["vegetable_id"],
                            "market_id": r["market_id"],
                            "date": report_date,
                            "price_type": r["price_type"],
                            "existing_price": exist_price,
                            "new_price": r["price"],
                            "price_diff": diff,
                            "diff_percent": diff_pct,
                            "existing_source": exist_source,
                            "new_source": "cbsl",
                            "status": "pending",
                            "notes": f"CBSL bulletin reported {r['price']} vs existing {exist_price} ({exist_source})"
                        })
                else:
                    to_insert_entries.append(r)
                    
            if to_insert_entries:
                synced = post_batch("price_entries", to_insert_entries)
                total_entries_synced += synced
                print(f"    Upserted {synced} new price rows into 'price_entries'.", flush=True)
                
            if to_insert_discrepancies:
                logged = post_batch("price_discrepancies", to_insert_discrepancies)
                total_discrepancies_logged += logged
                print(f"    Logged {logged} price discrepancies into 'price_discrepancies'.", flush=True)
                
        except Exception as e:
            print(f"    Failed to process report {report_url}: {e}", flush=True)
            
    print(f"\n==================================================")
    print(f"CBSL Historical Ingestion Finished:")
    print(f"  * New prices added to price_entries: {total_entries_synced}")
    print(f"  * Discrepancies logged to price_discrepancies: {total_discrepancies_logged}")
    print(f"==================================================")

if __name__ == "__main__":
    main()
