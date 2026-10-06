"""
populate_market_calendar.py

Creates and populates the `market_calendar` table in Supabase.
This records every date from 2015 to 2026, marking:
  - Whether trading data was recorded
  - Specific reasons for missing days:
      * 'poya_day' (Full Moon Poya Day)
      * 'public_holiday' (Sinhala/Tamil New Year, May Day, Christmas, etc.)
      * 'weekend_sunday' (Sunday closures)
      * 'covid_lockdown' (Islandwide curfew March 20 - May 26, 2020)
      * 'fuel_crisis_hartal' (Major strikes in 2022)
      * 'pre_dataset_era' (Prior to June 22, 2015)
      * 'no_bulletin_published' (HARTI did not publish)

Crucial for Machine Learning & Data Science (Prophet / LSTM time-series forecasting).
"""

import os
import sys
from datetime import date, datetime, timedelta
from typing import Dict, Optional, Tuple

import requests

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

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Known fixed Sri Lankan annual holidays
FIXED_HOLIDAYS = {
    (1, 1): "New Year's Day",
    (2, 4): "National Day (Independence Day)",
    (4, 13): "Sinhala & Tamil New Year Eve",
    (4, 14): "Sinhala & Tamil New Year Day",
    (5, 1): "May Day (Worker's Day)",
    (12, 25): "Christmas Day",
}

# Major Sri Lankan Full Moon Poya Days (2015-2026 key dates)
# Poya days occur once a month on the Full Moon
POYA_DAYS = {
    # 2015
    "2015-01-04": "Duruthu Poya", "2015-02-03": "Navam Poya", "2015-03-05": "Medin Poya",
    "2015-04-03": "Bak Poya", "2015-05-03": "Vesak Poya", "2015-06-01": "Poson Poya",
    "2015-07-01": "Esala Poya", "2015-07-31": "Adhi Esala Poya", "2015-08-29": "Nikini Poya",
    "2015-09-27": "Binara Poya", "2015-10-27": "Vap Poya", "2015-11-25": "Il Poya", "2015-12-25": "Unduvap Poya",
    # 2016
    "2016-01-23": "Duruthu Poya", "2016-02-22": "Navam Poya", "2016-03-22": "Medin Poya",
    "2016-04-21": "Bak Poya", "2016-05-21": "Vesak Poya", "2016-06-19": "Poson Poya",
    "2016-07-19": "Esala Poya", "2016-08-17": "Nikini Poya", "2016-09-16": "Binara Poya",
    "2016-10-15": "Vap Poya", "2016-11-14": "Il Poya", "2016-12-13": "Unduvap Poya",
    # 2017
    "2017-01-12": "Duruthu Poya", "2017-02-10": "Navam Poya", "2017-03-12": "Medin Poya",
    "2017-04-10": "Bak Poya", "2017-05-10": "Vesak Poya", "2017-06-08": "Poson Poya",
    "2017-07-08": "Esala Poya", "2017-08-07": "Nikini Poya", "2017-09-05": "Binara Poya",
    "2017-10-05": "Vap Poya", "2017-11-03": "Il Poya", "2017-12-03": "Unduvap Poya",
    # 2018
    "2018-01-01": "Duruthu Poya", "2018-01-31": "Navam Poya", "2018-03-01": "Medin Poya",
    "2018-03-31": "Bak Poya", "2018-04-29": "Vesak Poya", "2018-05-29": "Poson Poya",
    "2018-06-27": "Esala Poya", "2018-07-27": "Nikini Poya", "2018-08-25": "Binara Poya",
    "2018-09-24": "Vap Poya", "2018-10-24": "Il Poya", "2018-11-22": "Unduvap Poya",
    # 2019
    "2019-01-20": "Duruthu Poya", "2019-02-19": "Navam Poya", "2019-03-20": "Medin Poya",
    "2019-04-19": "Bak Poya", "2019-05-18": "Vesak Poya", "2019-06-16": "Poson Poya",
    "2019-07-16": "Esala Poya", "2019-08-14": "Nikini Poya", "2019-09-13": "Binara Poya",
    "2019-10-13": "Vap Poya", "2019-11-12": "Il Poya", "2019-12-11": "Unduvap Poya",
    # 2020
    "2020-01-10": "Duruthu Poya", "2020-02-08": "Navam Poya", "2020-03-09": "Medin Poya",
    "2020-04-07": "Bak Poya", "2020-05-07": "Vesak Poya", "2020-06-05": "Poson Poya",
    "2020-07-04": "Esala Poya", "2020-08-03": "Nikini Poya", "2020-09-01": "Binara Poya",
    "2020-10-01": "Vap Poya", "2020-10-30": "Il Poya", "2020-11-29": "Unduvap Poya", "2020-12-29": "Duruthu Poya",
    # 2021
    "2021-01-28": "Duruthu Poya", "2021-02-26": "Navam Poya", "2021-03-28": "Medin Poya",
    "2021-04-26": "Bak Poya", "2021-05-26": "Vesak Poya", "2021-06-24": "Poson Poya",
    "2021-07-23": "Esala Poya", "2021-08-22": "Nikini Poya", "2021-09-20": "Binara Poya",
    "2021-10-20": "Vap Poya", "2021-11-18": "Il Poya", "2021-12-18": "Unduvap Poya",
    # 2022
    "2022-01-17": "Duruthu Poya", "2022-02-16": "Navam Poya", "2022-03-17": "Medin Poya",
    "2022-04-16": "Bak Poya", "2022-05-15": "Vesak Poya", "2022-06-14": "Poson Poya",
    "2022-07-13": "Esala Poya", "2022-08-11": "Nikini Poya", "2022-09-10": "Binara Poya",
    "2022-10-09": "Vap Poya", "2022-11-07": "Il Poya", "2022-12-07": "Unduvap Poya",
    # 2023
    "2023-01-06": "Duruthu Poya", "2023-02-05": "Navam Poya", "2023-03-06": "Medin Poya",
    "2023-04-05": "Bak Poya", "2023-05-05": "Vesak Poya", "2023-06-03": "Poson Poya",
    "2023-07-03": "Esala Poya", "2023-08-01": "Nikini Poya", "2023-08-30": "Adhi Binara Poya",
    "2023-09-29": "Binara Poya", "2023-10-28": "Vap Poya", "2023-11-26": "Il Poya", "2023-12-26": "Unduvap Poya",
    # 2024
    "2024-01-25": "Duruthu Poya", "2024-02-23": "Navam Poya", "2024-03-24": "Medin Poya",
    "2024-04-23": "Bak Poya", "2024-05-23": "Vesak Poya", "2024-06-21": "Poson Poya",
    "2024-07-20": "Esala Poya", "2024-08-19": "Nikini Poya", "2024-09-17": "Binara Poya",
    "2024-10-17": "Vap Poya", "2024-11-15": "Il Poya", "2024-12-14": "Unduvap Poya",
    # 2025
    "2025-01-13": "Duruthu Poya", "2025-02-12": "Navam Poya", "2025-03-13": "Medin Poya",
    "2025-04-12": "Bak Poya", "2025-05-12": "Vesak Poya", "2025-06-10": "Poson Poya",
    "2025-07-10": "Esala Poya", "2025-08-08": "Nikini Poya", "2025-09-07": "Binara Poya",
    "2025-10-06": "Vap Poya", "2025-11-05": "Il Poya", "2025-12-04": "Unduvap Poya",
    # 2026
    "2026-01-03": "Duruthu Poya", "2026-02-01": "Navam Poya", "2026-03-03": "Medin Poya",
    "2026-04-02": "Bak Poya", "2026-05-01": "Vesak Poya", "2026-05-31": "Poson Poya",
    "2026-06-29": "Esala Poya", "2026-07-29": "Nikini Poya", "2026-08-27": "Binara Poya",
    "2026-09-26": "Vap Poya", "2026-10-25": "Il Poya", "2026-11-24": "Unduvap Poya", "2026-12-23": "Duruthu Poya",
}


def classify_closure_reason(d: date) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Returns (closure_reason, holiday_name, notes).
    """
    iso = d.isoformat()

    # 1. Before dataset inception
    if d < date(2015, 6, 22):
        return "pre_dataset_era", "Pre-Dataset Era", "HARTI did not publish electronic bulletins prior to 22-June-2015"

    # 2. Sri Lanka COVID-19 national curfew & lockdown
    if date(2020, 3, 20) <= d <= date(2020, 5, 26):
        return "covid_lockdown", "COVID-19 National Lockdown", "Strict islandwide quarantine curfew; wholesale DECs closed"

    # 3. 2022 Economic/Fuel crisis general hartals
    if iso in ("2022-05-09", "2022-05-10", "2022-07-09", "2022-07-10", "2022-07-11", "2022-07-12", "2022-07-13"):
        return "fuel_crisis_hartal", "2022 Political/Fuel Crisis Hartal", "Transportation shutdown; markets inaccessible"

    # 4. Poya Days
    if iso in POYA_DAYS:
        return "poya_day", POYA_DAYS[iso], "Full Moon Poya Day (Public & Bank Holiday, DECs closed)"

    # 5. Fixed Annual Holidays
    if (d.month, d.day) in FIXED_HOLIDAYS:
        return "public_holiday", FIXED_HOLIDAYS[(d.month, d.day)], "National Public Holiday (Wholesale operations closed)"

    # 6. Sundays
    if d.weekday() == 6:  # Sunday
        return "weekend_sunday", "Sunday", "Regular weekly wholesale market closure"

    # 7. February 2017 missing gap
    if date(2017, 2, 1) <= d <= date(2017, 2, 28):
        return "no_bulletin_published", "Missing Archive", "HARTI bulletin missing from archive (HTTP 404)"

    return "no_bulletin_published", "Unscheduled Closure / Gap", "HARTI bulletin not issued or missing"


def main():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    print("1. Fetching distinct price dates from Supabase...")
    # Fetch distinct dates that exist in price_entries
    query_url = f"{SUPABASE_URL}/rest/v1/price_entries?select=date"
    # To avoid huge payloads, query distinct dates via RPC or range
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/rpc/get_distinct_dates",
        headers=headers,
        timeout=10
    )
    
    dates_with_data = set()
    if res.status_code == 200:
        for r in res.json():
            dates_with_data.add(r["date"])
    else:
        # Fallback: Query month ranges or direct REST
        print("  (Querying price_entries via REST API directly...)")
        # Direct REST select with count
        r = requests.get(f"{SUPABASE_URL}/rest/v1/price_entries?select=date&limit=1000000", headers=headers, timeout=60)
        if r.status_code == 200:
            for item in r.json():
                dates_with_data.add(item["date"])
        print(f"  Found {len(dates_with_data)} unique dates with active price records.")

    print(f"2. Generating calendar from 2015-01-01 to 2026-12-31...")
    start_date = date(2015, 1, 1)
    end_date = date(2026, 12, 31)
    
    calendar_records = []
    cur = start_date
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    while cur <= end_date:
        iso = cur.isoformat()
        has_data = iso in dates_with_data
        dow = day_names[cur.weekday()]

        if has_data:
            rec = {
                "date": iso,
                "is_trading_day": True,
                "day_of_week": dow,
                "closure_reason": None,
                "holiday_name": None,
                "notes": "Official trading bulletin published",
            }
        else:
            reason, holiday, notes = classify_closure_reason(cur)
            rec = {
                "date": iso,
                "is_trading_day": False,
                "day_of_week": dow,
                "closure_reason": reason,
                "holiday_name": holiday,
                "notes": notes,
            }

        calendar_records.append(rec)
        cur += timedelta(days=1)

    print(f"Total calendar days: {len(calendar_records)}")
    trading_count = sum(1 for r in calendar_records if r["is_trading_day"])
    closed_count = len(calendar_records) - trading_count
    print(f"  Active Trading Days: {trading_count}")
    print(f"  Non-Trading / Missing Days Classified: {closed_count}")

    # Upsert into market_calendar in batches of 500
    print("3. Upserting into Supabase `market_calendar` table...")
    batch_size = 500
    upsert_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    for i in range(0, len(calendar_records), batch_size):
        batch = calendar_records[i : i + batch_size]
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/market_calendar",
            headers=upsert_headers,
            json=batch,
            timeout=30
        )
        if res.status_code not in (200, 201):
            print(f"  [Error at batch {i}]: {res.status_code} - {res.text}")
        else:
            print(f"  Upserted {min(i + batch_size, len(calendar_records))}/{len(calendar_records)} days")

    print("\n✅ Calendar population complete! Ready for ML & Data Science model training.")


if __name__ == "__main__":
    main()
