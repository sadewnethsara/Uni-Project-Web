"""
Batch-process daily price PDFs stored in a year/month folder structure:

    PDFs/
      2026/
        07/
          2026-07-13.pdf
          2026-07-14.pdf
        08/
          2026-08-01.pdf
      2027/
        01/
          2027-01-01.pdf
        ...

Walks years in order, then months in order within each year, then PDFs in
date order within each month, calling extract_pdf_prices.process_pdf() on
each one. Each item's JSON file is updated (newest date stays at index 0)
regardless of the order PDFs are processed in, but processing chronologically
keeps progress output easy to follow and makes it simple to resume.

A CSV log (default: <output-dir>/processing_log.csv) tracks which PDFs have
already been processed, keyed by the PDF's path RELATIVE to pdfs_root (e.g.
"2024/01/2024-01-10.pdf") + modification time - not the fully resolved
absolute path, since that changes depending on where/how the project folder
is mounted (e.g. a sandbox path vs. your Mac's real path for the exact same
file), which would make the log fail to recognize already-processed files.
On re-runs:
  - A PDF already logged as "processed" with an unchanged mtime is skipped
    entirely (no re-parsing, no re-writing its item JSON files).
  - If the PDF file itself changed since it was logged (different mtime -
    e.g. you re-downloaded/replaced it), it's processed again.
  - A PDF previously logged as "failed" IS retried automatically.
  - --force reprocesses everything regardless of the log.

Usage:
    python batch_process_pdfs.py ../PDFs --output-dir ../price_data
    python batch_process_pdfs.py ../PDFs --output-dir ../price_data --force
"""

import argparse
import csv
import sys
from datetime import datetime
from pathlib import Path

from extract_pdf_prices import process_pdf

LOG_FIELDS = ["timestamp", "pdf_path", "mtime", "status", "date", "total_items",
              "with_data", "warnings", "detail"]


def find_pdfs_in_order(root: Path):
    """Yield PDF paths ordered by year -> month -> filename (date)."""
    pdfs = []
    for year_dir in sorted(p for p in root.iterdir() if p.is_dir() and p.name.isdigit()):
        for month_dir in sorted(p for p in year_dir.iterdir() if p.is_dir() and p.name.isdigit()):
            for pdf_file in sorted(month_dir.glob("*.pdf")):
                pdfs.append(pdf_file)
    return pdfs


def load_processing_log(log_path: Path) -> dict:
    """Return {pdf_path_str: (status, mtime_str)} using the last row per path."""
    if not log_path.exists():
        return {}
    entries = {}
    with open(log_path, "r", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            entries[row["pdf_path"]] = (row["status"], row["mtime"])
    return entries


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("pdfs_root", help="Root folder containing YYYY/MM/*.pdf files")
    parser.add_argument(
        "--output-dir",
        default="price_data",
        help="Directory to store per-item JSON files (default: ./price_data)",
    )
    parser.add_argument(
        "--log-file", default=None,
        help="CSV log path (default: <output-dir>/processing_log.csv)",
    )
    parser.add_argument(
        "--force", action="store_true",
        help="Reprocess every PDF even if already logged as processed",
    )
    args = parser.parse_args()

    root = Path(args.pdfs_root)
    if not root.is_dir():
        print(f"Error: {root} is not a folder", file=sys.stderr)
        sys.exit(1)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    log_path = Path(args.log_file) if args.log_file else output_dir / "processing_log.csv"

    previous = load_processing_log(log_path)
    log_is_new = not log_path.exists()
    log_file = open(log_path, "a", newline="", encoding="utf-8")
    writer = csv.DictWriter(log_file, fieldnames=LOG_FIELDS)
    if log_is_new:
        writer.writeheader()

    pdfs = find_pdfs_in_order(root)
    print(f"Found {len(pdfs)} PDFs under {root}")
    print(f"Log file: {log_path.resolve()}\n")

    processed, skipped, failed = 0, 0, []
    current_month = None

    for pdf_path in pdfs:
        month_label = f"{pdf_path.parent.parent.name}-{pdf_path.parent.name}"
        if month_label != current_month:
            print(f"\n=== {month_label} ===")
            current_month = month_label

        path_key = str(pdf_path.relative_to(root)).replace("\\", "/")
        mtime = str(pdf_path.stat().st_mtime)

        prior_status, prior_mtime = previous.get(path_key, (None, None))
        if prior_status == "processed" and prior_mtime == mtime and not args.force:
            print(f"  [{pdf_path.name}] already processed, skipping")
            skipped += 1
            continue

        row = {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "pdf_path": path_key,
            "mtime": mtime,
        }

        try:
            stats = process_pdf(pdf_path, args.output_dir)
            print(f"  [{stats['date']}] {pdf_path.name}: "
                  f"{stats['total']} items ({stats['with_data']} with price data)")
            for w in stats["warnings"]:
                print(f"      Warning: {w}")

            row.update({
                "status": "processed",
                "date": stats["date"],
                "total_items": stats["total"],
                "with_data": stats["with_data"],
                "warnings": "; ".join(stats["warnings"]),
                "detail": "",
            })
            processed += 1
        except Exception as e:
            print(f"  FAILED: {pdf_path.name}: {e}")
            row.update({
                "status": "failed",
                "date": "", "total_items": "", "with_data": "", "warnings": "",
                "detail": str(e),
            })
            failed.append(str(pdf_path))

        writer.writerow(row)
        log_file.flush()

    log_file.close()

    print(f"\nDone. {processed} processed, {skipped} skipped (already done), {len(failed)} failed.")
    if failed:
        print("Failed files (will be retried automatically next run):")
        for f in failed:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
