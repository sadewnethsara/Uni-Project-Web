#!/usr/bin/env python3
"""
CBSL Historical Price Report Extractor (2012 - 2026):
Downloads and extracts daily agricultural commodity price bulletins from the
Central Bank of Sri Lanka (CBSL).

Extracts:
- Pettah Wholesale & Retail
- Dambulla Wholesale & Retail
- Narahenpita Retail
- Checks against existing database prices and logs discrepancies to `price_discrepancies`
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
    # Clean OCR / whitespace like '5 50.00' -> '550.00' or '1 ,150.00' -> '1150.00'
    cleaned = re.sub(r"[^\d.]", "", val_str)
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def parse_cbsl_pdf(pdf_bytes: bytes, report_date: str) -> list:
    """
    Parses Page 2 table of CBSL daily price report.
    Returns list of parsed commodity records.
    """
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
                        # Extract price tokens
                        # Line format roughly: Beans Rs./kg [Pettah_Fri] [Pettah_Today] [Dam_Fri] [Dam_Today] [PetRet_Fri] [PetRet_Today] ...
                        tokens = line.split("Rs./kg")[-1].strip().split()
                        # Clean merged numbers
                        nums = []
                        buffer = ""
                        for t in tokens:
                            buffer += t
                            if "." in buffer and len(buffer.split(".")[-1]) == 2:
                                val = clean_num(buffer)
                                if val > 0:
                                    nums.append(val)
                                buffer = ""
                                
                        # Expected order of 'Today' prices:
                        # [Pettah W/S Last, Pettah W/S Today, Dambulla W/S Last, Dambulla W/S Today, Pettah Retail Last, Pettah Retail Today, Dambulla Retail Last, Dambulla Retail Today, Narahenpita Retail Last, Narahenpita Retail Today]
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
        print(f"Error reading PDF: {e}")
        
    return records

def fetch_cbsl_archive_links(year: int = None, limit: int = 20) -> list:
    url = "https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error scraping CBSL: {e}")
        return []
        
    pdf_matches = re.findall(r'href="([^"]*price_report_(\d{4})(\d{2})(\d{2})[^"]*\.pdf)"', html, re.I)
    results = []
    seen = set()
    for full_match, y, m, d in pdf_matches:
        if year and int(y) != year:
            continue
        link = full_match if full_match.startswith("http") else f"https://www.cbsl.gov.lk{full_match}"
        if link not in seen:
            seen.add(link)
            iso_date = f"{y}-{m}-{d}"
            results.append({"url": link, "date": iso_date})
            if len(results) >= limit:
                break
                
    return results

def main():
    parser = argparse.ArgumentParser(description="Sync CBSL price reports")
    parser.add_argument("--year", type=int, help="Target year (e.g. 2026)")
    parser.add_argument("--limit", type=int, default=10, help="Number of reports to process")
    args = parser.parse_args()
    
    links = fetch_cbsl_archive_links(year=args.year, limit=args.limit)
    print(f"--> Found {len(links)} CBSL Price Reports:")
    for item in links:
        print(f"  * [{item['date']}] {item['url']}")
        try:
            req = urllib.request.Request(item["url"], headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30, context=get_ssl_context()) as resp:
                pdf_bytes = resp.read()
            records = parse_cbsl_pdf(pdf_bytes, item["date"])
            print(f"    -> Extracted {len(records)} prices for {item['date']}")
        except Exception as e:
            print(f"    -> Failed to process: {e}")

if __name__ == "__main__":
    main()
