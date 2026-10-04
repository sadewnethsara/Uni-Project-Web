# Automated Supabase Database Sync for Agricultural Prices

This guide outlines how to set up an automated CI/CD pipeline to continuously fetch data from the [Sri Lanka Agricultural Commodity Prices Dataset](https://github.com/DasunEdirisinghe/sri-lanka-agricultural-commodity-prices-dataset) repository and insert/update it in your Supabase project.

This setup ensures that whenever new data is generated in the repository, it will be smoothly and automatically synchronized to your database without duplicates.

---

## Prerequisites

1. A **Supabase** project.
2. The **Project URL** and **Service Role Key** (found in Supabase Dashboard > Project Settings > API).
3. A **GitHub Repository** to host your sync script and GitHub Action. (You can host this inside a fork of the original dataset repo, or a completely separate tracking repository).

---

## Step 1: Set Up the Supabase Database Schema

Run the following SQL in your Supabase SQL Editor to create the necessary table. This schema uses a `UNIQUE` constraint on the `(date, item, market)` columns, allowing us to safely *upsert* data without creating duplicates.

```sql
-- Create a table for market prices
CREATE TABLE IF NOT EXISTS agricultural_prices (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    item VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    market VARCHAR(255),
    unit VARCHAR(100),
    min_price NUMERIC(10, 2),
    max_price NUMERIC(10, 2),
    average_price NUMERIC(10, 2),
    average_computed BOOLEAN,
    price_range VARCHAR(255),
    UNIQUE(date, item, market) -- Unique constraint to prevent duplicates on upsert
);

-- Create an index to speed up date-based queries
CREATE INDEX idx_agricultural_prices_date ON agricultural_prices(date);
CREATE INDEX idx_agricultural_prices_item ON agricultural_prices(item);
```

---

## Step 2: Add the Python ETL Script

Create a folder named `scripts/` in your repository and save the following Python script as `scripts/sync_to_supabase.py`.

This script uses the Supabase Python client to parse the JSON files and perform batched upserts.

```python
import os
import json
import glob
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def process_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r') as f:
        data = json.load(f)

    # We batch inserts to reduce API calls
    batch_size = 500
    records = []

    for entry in data:
        record = {
            "date": entry.get("date"),
            "item": entry.get("item"),
            "category": entry.get("category"),
            "market": entry.get("market"),
            "unit": entry.get("unit"),
            "min_price": entry.get("min_price"),
            "max_price": entry.get("max_price"),
            "average_price": entry.get("average_price", entry.get("average_computed") if type(entry.get("average_computed")) != bool else None),
            "average_computed": entry.get("average_computed") if type(entry.get("average_computed")) == bool else True,
            "price_range": entry.get("range")
        }

        # some cleaning
        if "average_price" not in record or record["average_price"] is None:
             if record.get("min_price") is not None and record.get("max_price") is not None:
                  record["average_price"] = (record["min_price"] + record["max_price"]) / 2

        records.append(record)

        if len(records) >= batch_size:
            upsert_batch(records)
            records = []

    if records:
        upsert_batch(records)

def upsert_batch(records):
    # Upsert with on_conflict on date, item, market
    try:
        response = supabase.table("agricultural_prices").upsert(
            records,
            on_conflict="date,item,market"
        ).execute()
    except Exception as e:
        print(f"Error upserting batch: {e}")

if __name__ == "__main__":
    # Adjust this path depending on where your JSON files are stored in the runner
    json_files = glob.glob("price_data/*.json")
    print(f"Found {len(json_files)} files to process.")

    for file in json_files:
        process_file(file)
    print("Sync complete.")
```

---

## Step 3: Configure GitHub Secrets

For the GitHub Action to connect to Supabase, you must set up your Repository Secrets securely:

1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**
2. Add a New repository secret named `SUPABASE_URL` and paste your project URL.
3. Add a New repository secret named `SUPABASE_SERVICE_ROLE_KEY` and paste your service role key (Never use this key on the client side!).

---

## Step 4: Set Up the GitHub Actions Workflow

Create a new file in your repository at `.github/workflows/daily_sync.yml`. Paste the following configuration:

```yaml
name: Daily Supabase Database Sync

on:
  schedule:
    - cron: '0 2 * * *' # Runs daily at 02:00 UTC
  workflow_dispatch: # Allows manual trigger from GitHub UI

jobs:
  sync_database:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Data Repository
        uses: actions/checkout@v3
        with:
          repository: 'DasunEdirisinghe/sri-lanka-agricultural-commodity-prices-dataset'
          path: 'dataset'

      - name: Checkout This Repository (for script)
        uses: actions/checkout@v3
        with:
          path: 'my-scripts'

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install supabase

      - name: Run Supabase Sync Script
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          cd dataset
          python ../my-scripts/scripts/sync_to_supabase.py
```

### How It Works:
1. The GitHub Action pulls the latest data directly from `DasunEdirisinghe/sri-lanka-agricultural-commodity-prices-dataset` daily at 02:00 UTC.
2. It then runs your Python ETL script to parse the `price_data` folder.
3. The script batches 500 records at a time and sends them to your Supabase project.
4. Because of our `UNIQUE(date, item, market)` constraint, it will automatically skip duplicates and only insert the new data for the day.

---
**Done!** Approve and commit these changes. Once committed, you can test the pipeline immediately by going to the "Actions" tab in your GitHub repo and manually triggering the "Daily Supabase Database Sync" workflow.
