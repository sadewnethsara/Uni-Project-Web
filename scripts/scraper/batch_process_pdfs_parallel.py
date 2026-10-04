"""
Faster, parallel version of batch_process_pdfs.py for large one-off backfills
(e.g. reprocessing the whole PDFs/ tree after a parser fix). Uses a process
pool to parse PDFs concurrently (the slow, CPU-bound part), then writes all
resulting records to the per-item JSON files sequentially in the main process
to avoid concurrent read-modify-write corruption on the same file.

Uses the exact same processing_log.csv format and skip-if-already-processed
(path + mtime) logic as batch_process_pdfs.py, so it's safe to interrupt and
resume, and the two scripts' logs are interchangeable.

Usage:
    python batch_process_pdfs_parallel.py ../PDFs --output-dir ../price_data --workers 4
"""

import argparse
import csv
import sys
from datetime import datetime
from multiprocessing import Pool
from pathlib import Path

import pdfplumber

from extract_pdf_prices import (
    classify_page,
    find_date,
    parse_pettah_page,
    parse_peliyagoda_page,
    write_item_json,
)

LOG_FIELDS = ["timestamp", "pdf_path", "mtime", "status", "date", "total_items",
              "with_data", "warnings", "detail"]


def find_pdfs_in_order(root: Path):
    pdfs = []
    for year_dir in sorted(p for p in root.iterdir() if p.is_dir() and p.name.isdigit()):
        for month_dir in sorted(p for p in year_dir.iterdir() if p.is_dir() and p.name.isdigit()):
            for pdf_file in sorted(month_dir.glob("*.pdf")):
                pdfs.append(pdf_file)
    return pdfs


def load_processing_log(log_path: Path) -> dict:
    if not log_path.exists():
        return {}
    entries = {}
    with open(log_path, "r", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            entries[row["pdf_path"]] = (row["status"], row["mtime"])
    return entries


def extract_only(pdf_path_str: str) -> dict:
    """Runs in a worker process: parse the PDF, return records (no file I/O
    to the shared JSON files - that happens back in the main process)."""
    pdf_path = Path(pdf_path_str)
    try:
        pettah_records, peliyagoda_records = [], []
        pettah_found, peliyagoda_found = False, False
        with pdfplumber.open(pdf_path) as pdf:
            date_str = find_date(pdf_path, pdf)
            for page in pdf.pages:
                if pettah_found and peliyagoda_found:
                    break
                kind, table = classify_page(page)
                if kind == "pettah" and not pettah_found:
                    pettah_found = True
                    pettah_records = parse_pettah_page(page.extract_text() or "", date_str)
                elif kind == "peliyagoda" and not peliyagoda_found:
                    peliyagoda_found = True
                    peliyagoda_records = parse_peliyagoda_page(table, date_str)

        records = pettah_records + peliyagoda_records
        warnings = []
        if not pettah_found:
            warnings.append("no Pettah (Rice & Subsidiary Food Crops) table found")
        if not peliyagoda_found:
            warnings.append("no Peliyagoda (vegetable) table found")

        return {"pdf_path": pdf_path_str, "ok": True, "date": date_str,
                 "records": records, "warnings": warnings}
    except Exception as e:
        return {"pdf_path": pdf_path_str, "ok": False, "error": str(e)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdfs_root")
    parser.add_argument("--output-dir", default="price_data")
    parser.add_argument("--log-file", default=None)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--limit", type=int, default=None,
                         help="Stop after processing this many NEW pdfs (for chunked runs)")
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

    all_pdfs = find_pdfs_in_order(root)

    todo = []
    skipped = 0
    for pdf_path in all_pdfs:
        # Keyed relative to root (not resolve()) so the log stays valid
        # across different mounts/machines pointing at the same PDFs folder.
        path_key = str(pdf_path.relative_to(root)).replace("\\", "/")
        mtime = str(pdf_path.stat().st_mtime)
        prior_status, prior_mtime = previous.get(path_key, (None, None))
        if prior_status == "processed" and prior_mtime == mtime and not args.force:
            skipped += 1
            continue
        todo.append(pdf_path)

    print(f"Found {len(all_pdfs)} PDFs total, {skipped} already processed, {len(todo)} to do")

    if args.limit:
        todo = todo[:args.limit]
        print(f"Limiting this run to {len(todo)} PDFs")

    processed, failed = 0, 0
    with Pool(args.workers) as pool:
        for i, result in enumerate(pool.imap(extract_only, [str(p) for p in todo], chunksize=4)):
            pdf_path = Path(result["pdf_path"])
            mtime = str(pdf_path.stat().st_mtime)
            row = {
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "pdf_path": str(pdf_path.relative_to(root)).replace("\\", "/"),
                "mtime": mtime,
            }

            if result["ok"]:
                for rec in result["records"]:
                    write_item_json(rec, output_dir)
                with_data = sum(1 for r in result["records"] if r["min_price"] is not None)
                row.update({
                    "status": "processed", "date": result["date"],
                    "total_items": len(result["records"]), "with_data": with_data,
                    "warnings": "; ".join(result["warnings"]), "detail": "",
                })
                processed += 1
            else:
                row.update({
                    "status": "failed", "date": "", "total_items": "",
                    "with_data": "", "warnings": "", "detail": result["error"],
                })
                failed += 1

            writer.writerow(row)
            log_file.flush()

            if (i + 1) % 50 == 0 or (i + 1) == len(todo):
                print(f"  {i + 1}/{len(todo)} done ({processed} ok, {failed} failed)")

    log_file.close()
    remaining = len(all_pdfs) - skipped - processed - failed
    print(f"\nRun complete. Processed {processed}, failed {failed}, "
          f"skipped {skipped} already-done, {max(remaining, 0)} still remaining overall.")


if __name__ == "__main__":
    main()
