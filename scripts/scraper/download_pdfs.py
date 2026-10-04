"""
Download HARTI daily wholesale price PDFs from harti.gov.lk and store them in
the year/month folder structure that extract_pdf_prices.py / batch_process_pdfs.py
already expect:

    PDFs/
      2024/
        01/
          2024-01-01.pdf
          2024-01-02.pdf
          ...
      2025/
      2026/

Source URL pattern (confirmed working link):

    https://www.harti.gov.lk/assets/pdf/food_price/daily/eng/<YYYY>/<Month>/<filename>.pdf

The site is NOT consistent about two things, confirmed by hand-checking
several months:

  1. The <Month> folder a PDF sits under does not always match the month of
     the data. Most dates use their own month's folder (e.g. 2024-01-06 is
     under "January"), but some historical batches were dumped under whatever
     folder was "current" at upload time - e.g. every day from 2025-07 to
     2025-12 lives under "December", and every day from 2026-01 to 2026-02
     lives under "February". 2026-03 onward matches its own month again.
  2. The filename template itself changed starting 2026-04: dates before
     that use "daily_<DD-MM-YYYY>.pdf", dates from 2026-04 onward use
     "Vegetable%20Pricenew%20ex1(<YYYY.MM.DD>).pdf" instead.

Rather than hardcoding exact date-range rules (which breaks the moment the
site does this again somewhere we haven't checked), for every date this
script builds a short list of candidate URLs - the date's own month folder
plus the known anomalous folder names ("December", "February"), crossed with
both filename templates - and tries them in the order most likely to hit
first. The first one that returns a real PDF wins; a date is only logged as
"not_found" once every candidate has been tried. If the site introduces yet
another oddly-named folder, add it to FALLBACK_FOLDER_NAMES below.

Every date that's attempted is written to a CSV log (default:
<output-dir>/download_log.csv) with its outcome. On re-runs:
  - Dates whose PDF file already exists on disk are skipped (no request made).
  - Dates already logged as "not_found" (the site simply has no PDF for that
    day - weekends/holidays/gaps) are skipped too, unless --force is passed.
  - Dates that previously "failed" (network/timeout errors) ARE retried,
    since those are worth another attempt.

Usage:
    python download_pdfs.py --years 2024 2025 2026 --output-dir ../PDFs
    python download_pdfs.py --start-date 2024-01-01 --end-date 2024-12-31 --output-dir ../PDFs
    python download_pdfs.py --years 2026 --output-dir ../PDFs --force   # re-check everything

    # Preview only - no files written, no log written, just reports what a
    # real run would do (would_download / not_found / skip / error):
    python download_pdfs.py --years 2024 --output-dir ../PDFs --dry-run
"""

import argparse
import csv
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path

import requests

BASE = "https://www.harti.gov.lk/assets/pdf/food_price/daily/eng/{year}/{folder}/{filename}"

MONTH_NAMES = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December",
}

# Folder names known to hold PDFs whose actual date is NOT in that month
# (retroactive/batched uploads). Tried as a fallback after the date's own
# month folder. Add more names here if another gap is discovered.
FALLBACK_FOLDER_NAMES = ["December", "February"]

# The filename template changed starting this date (inclusive).
NEW_FORMAT_START = date(2026, 4, 1)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; harti-price-collector/1.0; research use)"
}

LOG_FIELDS = ["timestamp", "date", "status", "http_status", "url", "detail"]


def candidate_filenames(d: date) -> list:
    old = f"daily_{d.day:02d}-{d.month:02d}-{d.year}.pdf"
    new = f"Vegetable%20Pricenew%20ex1({d.year}.{d.month:02d}.{d.day:02d}).pdf"
    return [new, old] if d >= NEW_FORMAT_START else [old, new]


def candidate_folders(d: date) -> list:
    primary = MONTH_NAMES[d.month]
    fallbacks = [f for f in FALLBACK_FOLDER_NAMES if f != primary]
    return [primary] + fallbacks


def candidate_urls(d: date) -> list:
    """Ordered list of plausible URLs for a date, most likely first."""
    urls = []
    for folder in candidate_folders(d):
        for filename in candidate_filenames(d):
            urls.append(BASE.format(year=d.year, folder=folder, filename=filename))
    return urls


def local_path(d: date, output_dir: Path) -> Path:
    return output_dir / f"{d.year:04d}" / f"{d.month:02d}" / f"{d.isoformat()}.pdf"


def daterange(start: date, end: date):
    cur = start
    while cur <= end:
        yield cur
        cur += timedelta(days=1)


def load_log(log_path: Path) -> dict:
    """Return {date_str: last_status} from a previous log, if any."""
    if not log_path.exists():
        return {}
    statuses = {}
    with open(log_path, "r", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            statuses[row["date"]] = row["status"]
    return statuses


def download_one(d: date, output_dir: Path, session: requests.Session,
                  timeout: int = 30, retries: int = 2) -> dict:
    """Attempt to download one date's PDF, trying each candidate URL in turn.
    Returns a result dict for logging."""
    target = local_path(d, output_dir)
    tried = []
    last_error = ""

    for url in candidate_urls(d):
        tried.append(url)
        got_transient_error = False

        for attempt in range(1, retries + 1):
            try:
                resp = session.get(url, headers=HEADERS, timeout=timeout)
            except requests.RequestException as e:
                last_error = str(e)
                got_transient_error = True
                time.sleep(1.5 * attempt)
                continue
            got_transient_error = False
            break

        if got_transient_error:
            continue  # couldn't even get a response for this candidate, try next

        if resp.status_code == 200 and resp.content[:4] == b"%PDF":
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(resp.content)
            return {
                "date": d.isoformat(), "status": "downloaded",
                "http_status": resp.status_code, "url": url,
                "detail": f"{len(resp.content)} bytes -> {target}",
            }

        if resp.status_code != 404:
            last_error = f"HTTP {resp.status_code}"

    if last_error:
        return {
            "date": d.isoformat(), "status": "failed",
            "http_status": "", "url": tried[-1] if tried else "",
            "detail": last_error,
        }

    return {
        "date": d.isoformat(), "status": "not_found",
        "http_status": 404, "url": "; ".join(tried),
        "detail": f"no PDF found under any of {len(tried)} candidate URLs",
    }


def check_one(d: date, session: requests.Session, timeout: int = 15, retries: int = 1) -> dict:
    """Dry-run version of download_one: checks whether a PDF exists at any of
    the candidate URLs WITHOUT downloading or saving it. Uses HEAD, falling
    back to a streamed GET (closed immediately) if the server doesn't support
    HEAD."""
    tried = []
    last_error = ""

    for url in candidate_urls(d):
        tried.append(url)
        got_transient_error = False

        for attempt in range(1, retries + 1):
            try:
                resp = session.head(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
                if resp.status_code in (405, 501):  # HEAD not supported by server
                    resp = session.get(url, headers=HEADERS, timeout=timeout, stream=True)
                    resp.close()
            except requests.RequestException as e:
                last_error = str(e)
                got_transient_error = True
                time.sleep(1 * attempt)
                continue
            got_transient_error = False
            break

        if got_transient_error:
            continue

        if resp.status_code == 200:
            return {
                "date": d.isoformat(), "status": "would_download",
                "http_status": resp.status_code, "url": url, "detail": "",
            }
        if resp.status_code != 404:
            last_error = f"HTTP {resp.status_code}"

    if last_error:
        return {
            "date": d.isoformat(), "status": "error",
            "http_status": "", "url": tried[-1] if tried else "", "detail": last_error,
        }

    return {
        "date": d.isoformat(), "status": "not_found",
        "http_status": 404, "url": "; ".join(tried),
        "detail": f"no PDF found under any of {len(tried)} candidate URLs",
    }


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--years", nargs="+", type=int,
                         help="Years to download, e.g. --years 2024 2025 2026")
    parser.add_argument("--start-date", help="YYYY-MM-DD (overrides --years)")
    parser.add_argument("--end-date", help="YYYY-MM-DD (defaults to today if --start-date given)")
    parser.add_argument("--output-dir", default="../PDFs", help="Root PDFs folder (default: ../PDFs)")
    parser.add_argument("--delay", type=float, default=0.5,
                         help="Seconds to wait between requests (default 0.5)")
    parser.add_argument("--log-file", default=None,
                         help="CSV log path (default: <output-dir>/download_log.csv)")
    parser.add_argument("--force", action="store_true",
                         help="Re-attempt dates even if already logged as downloaded/not_found")
    parser.add_argument("--dry-run", action="store_true",
                         help="Check URLs only (HEAD request) - no files or log entries written")
    args = parser.parse_args()

    today = date.today()

    if args.start_date:
        start = date.fromisoformat(args.start_date)
        end = date.fromisoformat(args.end_date) if args.end_date else today
        dates = list(daterange(start, min(end, today)))
    elif args.years:
        dates = []
        for y in sorted(args.years):
            y_start = date(y, 1, 1)
            y_end = date(y, 12, 31) if y < today.year else today
            dates.extend(daterange(y_start, y_end))
    else:
        print("Error: provide --years or --start-date", file=sys.stderr)
        sys.exit(1)

    output_dir = Path(args.output_dir)
    log_path = Path(args.log_file) if args.log_file else output_dir / "download_log.csv"
    previous_status = load_log(log_path)

    writer = None
    log_file = None
    if not args.dry_run:
        output_dir.mkdir(parents=True, exist_ok=True)
        log_is_new = not log_path.exists()
        log_file = open(log_path, "a", newline="", encoding="utf-8")
        writer = csv.DictWriter(log_file, fieldnames=LOG_FIELDS)
        if log_is_new:
            writer.writeheader()

    session = requests.Session()
    counts = {}

    if args.dry_run:
        print("*** DRY RUN - no files or log entries will be written ***\n")
    print(f"Processing {len(dates)} dates: {dates[0]} .. {dates[-1]}")
    print(f"Output dir: {output_dir.resolve()}")
    print(f"Log file:   {log_path.resolve()}\n")

    current_month = None
    for d in dates:
        month_label = f"{d.year:04d}-{d.month:02d}"
        if month_label != current_month:
            print(f"\n=== {month_label} ===")
            current_month = month_label

        target = local_path(d, output_dir)

        if target.exists() and not args.force:
            counts["skipped_exists"] = counts.get("skipped_exists", 0) + 1
            print(f"  [{d}] already downloaded, would skip" if args.dry_run
                  else f"  [{d}] already downloaded, skipping")
            continue

        prior = previous_status.get(d.isoformat())
        if prior == "not_found" and not args.force:
            counts["skipped_logged"] = counts.get("skipped_logged", 0) + 1
            print(f"  [{d}] previously not found, would skip (use --force to recheck)" if args.dry_run
                  else f"  [{d}] previously not found, skipping (use --force to recheck)")
            continue

        if args.dry_run:
            result = check_one(d, session)
        else:
            result = download_one(d, output_dir, session)

        counts[result["status"]] = counts.get(result["status"], 0) + 1

        if writer is not None:
            writer.writerow({
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                **result,
            })
            log_file.flush()

        print(f"  [{d}] {result['status']}"
              + (f" ({result['detail']})" if result["status"] in ("not_found", "failed", "error") else ""))

        time.sleep(args.delay)

    if log_file is not None:
        log_file.close()

    print("\nDone." + ("  (dry run - nothing was written)" if args.dry_run else ""))
    print(f"  Downloaded:            {counts.get('downloaded', 0)}")
    print(f"  Would download:        {counts.get('would_download', 0)}")
    print(f"  Already had file:      {counts.get('skipped_exists', 0)}")
    print(f"  Skipped (logged 404):  {counts.get('skipped_logged', 0)}")
    print(f"  Not found (404):       {counts.get('not_found', 0)}")
    print(f"  Failed/error:          {counts.get('failed', 0) + counts.get('error', 0)}")
    if counts.get("failed") or counts.get("error"):
        print("\nSome dates failed due to network errors - just re-run the same "
              "command and they'll be retried automatically.")


if __name__ == "__main__":
    main()
