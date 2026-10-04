"""
Convert per-item price JSON files (produced by extract_pdf_prices.py /
batch_process_pdfs.py) into Facebook Prophet's required input format: one CSV
per item with "ds" (date) and "y" (price) as the first two columns, sorted
chronologically ascending (the source JSONs are newest-first; Prophet wants
oldest-first).

Alongside ds/y, each row also carries descriptive metadata columns (item,
category, market, unit, min_price, max_price, average_computed). Prophet's
Prophet.fit() only reads columns named "ds" and "y" and silently ignores any
others, so these extra columns are safe to keep in the same file - they don't
affect the model, they just make each CSV self-describing (useful when you
have 65+ separate files) and keep the historical min/max range available
alongside the forecast target.

Only dates with an actual reported price are included - rows where
average_price is null are simply left out, since Prophet does not require a
gap-free, fixed-frequency series (it fits trend/seasonality through whatever
dates you give it).

This is the 3rd step in the pipeline:
    1. download_pdfs.py        -> PDFs/<year>/<month>/<date>.pdf
    2. batch_process_pdfs.py   -> price_data/<item>.json
    3. prepare_prophet_data.py -> prophet_data/<item>.csv   (this script)

Idempotent like the other two: a CSV log (default:
<output-dir>/conversion_log.csv) tracks each source JSON's path + modification
time. On re-runs:
  - An item whose JSON hasn't changed since it was last converted is skipped
    entirely (no file rewritten).
  - An item whose JSON has new dates (or was edited/regenerated, e.g. after a
    parser fix) gets its CSV fully regenerated from the current JSON, so the
    CSV can never drift out of sync with the source.
  - An item that no longer has a JSON file in price_data/ (e.g. you added it
    to IGNORED_ITEMS and deleted its file) has its leftover CSV automatically
    removed, so excluded items don't linger here.
  - --force reprocesses every item regardless of the log.

Usage:
    python prepare_prophet_data.py ../price_data --output-dir ../prophet_data
"""

import argparse
import csv
import sys
from datetime import datetime
from pathlib import Path

LOG_FIELDS = ["timestamp", "item_file", "mtime", "status", "rows_written"]


def load_conversion_log(log_path: Path) -> dict:
    """Return {item_file_name: mtime_str} using the last row per file."""
    if not log_path.exists():
        return {}
    entries = {}
    with open(log_path, "r", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            entries[row["item_file"]] = row["mtime"]
    return entries


CSV_COLUMNS = [
    "ds", "y", "item", "category", "market", "unit",
    "min_price", "max_price", "average_computed",
]


def convert_one(json_path: Path, csv_path: Path) -> int:
    """Read one item JSON, write its Prophet-format CSV, return rows written.

    ds/y are the only columns Prophet.fit() reads; the rest (item, category,
    market, unit, min_price, max_price, average_computed) are metadata carried
    along for reference and are ignored by Prophet.
    """
    import json

    with open(json_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    rows = [
        {
            "ds": r["date"],
            "y": r["average_price"],
            "item": r.get("item"),
            "category": r.get("category"),
            "market": r.get("market"),
            "unit": r.get("unit"),
            "min_price": r.get("min_price"),
            "max_price": r.get("max_price"),
            "average_computed": r.get("average_computed"),
        }
        for r in records
        if r.get("average_price") is not None
    ]
    rows.sort(key=lambda r: r["ds"])  # chronological ascending for Prophet

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    return len(rows)


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("price_data_dir", help="Folder containing the per-item JSON files")
    parser.add_argument(
        "--output-dir", default="prophet_data",
        help="Folder to write Prophet-ready CSVs into (default: ./prophet_data)",
    )
    parser.add_argument(
        "--log-file", default=None,
        help="CSV log path (default: <output-dir>/conversion_log.csv)",
    )
    parser.add_argument(
        "--force", action="store_true",
        help="Reconvert every item even if its JSON hasn't changed",
    )
    args = parser.parse_args()

    price_data_dir = Path(args.price_data_dir)
    if not price_data_dir.is_dir():
        print(f"Error: {price_data_dir} is not a folder", file=sys.stderr)
        sys.exit(1)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    log_path = Path(args.log_file) if args.log_file else output_dir / "conversion_log.csv"

    previous = load_conversion_log(log_path)
    log_is_new = not log_path.exists()
    log_file = open(log_path, "a", newline="", encoding="utf-8")
    writer = csv.DictWriter(log_file, fieldnames=LOG_FIELDS)
    if log_is_new:
        writer.writeheader()

    json_files = sorted(
        p for p in price_data_dir.glob("*.json") if p.name != "processing_log.csv"
    )
    current_names = {p.stem for p in json_files}

    converted, skipped, removed = 0, 0, 0

    for json_path in json_files:
        mtime = str(json_path.stat().st_mtime)
        csv_path = output_dir / f"{json_path.stem}.csv"

        if (
            previous.get(json_path.name) == mtime
            and csv_path.exists()
            and not args.force
        ):
            skipped += 1
            continue

        rows_written = convert_one(json_path, csv_path)
        writer.writerow({
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "item_file": json_path.name,
            "mtime": mtime,
            "status": "converted",
            "rows_written": rows_written,
        })
        log_file.flush()
        print(f"  {json_path.stem}: {rows_written} rows -> {csv_path.name}")
        converted += 1

    # Clean up CSVs whose source JSON no longer exists (e.g. item was excluded).
    # Explicitly skip the log file itself - it also lives in output_dir and
    # would otherwise look like an "orphan" the moment it's written.
    for csv_path in output_dir.glob("*.csv"):
        if csv_path.resolve() == log_path.resolve():
            continue
        if csv_path.stem not in current_names:
            try:
                csv_path.unlink()
            except OSError as e:
                print(f"  WARNING: could not remove orphaned {csv_path.name}: {e}")
                continue
            writer.writerow({
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "item_file": csv_path.stem + ".json",
                "mtime": "",
                "status": "removed_orphan",
                "rows_written": "",
            })
            log_file.flush()
            print(f"  removed orphaned {csv_path.name} (source JSON no longer exists)")
            removed += 1

    log_file.close()

    print(f"\nDone. {converted} converted, {skipped} unchanged (skipped), "
          f"{removed} orphaned CSVs removed.")
    print(f"Output dir: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
