# Resource Limits & Free-Tier Optimization Rules

This project operates strictly on **Supabase Free Tier** and **GitHub Actions Free Tier (2,000 monthly minutes)**.
All AI agents and developers must adhere to these resource budgeting, memory management, and rate-limiting rules.

---

## 1. Supabase Free Tier Guardrails

| Resource | Free Tier Limit | Architecture Mandate |
| :--- | :--- | :--- |
| **Database Storage** | **500 MB** | Store **only structured scalar data** in PostgreSQL. Never store raw PDFs, OCR image slices, or binary blobs in the database. |
| **Shared RAM** | **~1 GB (Micro Instance)** | **NEVER** run unbounded queries like `SELECT * FROM price_entries` without a `date` range or `limit`. |
| **Max Payload Size** | **10 MB per request** | Batch writes must **never exceed 1,000 records** per HTTP request. |
| **Direct Connections** | **20 connections** | Never spawn uncontrolled parallel workers hitting Supabase simultaneously. Use sequential batching or max 2 concurrent workers. |
| **Bandwidth (Egress)**| **5 GB / month** | Always select explicit columns (`select=id,price,date`) instead of `select=*`. |
| **Project Inactivity**| **Pauses after 7 days** | Weekly automated sync ensures database remains active without manual pings. |

---

## 2. Ingestion Batching & Pagination Standards

### A. Write Operations (Upserts / Inserts)
* **Standard Batch Size**: **500 to 1,000 rows** per POST request.
  ```python
  BATCH_SIZE = 500  # Optimal for low latency and zero payload rejection
  for i in range(0, len(records), BATCH_SIZE):
      batch = records[i:i + BATCH_SIZE]
      post_batch(batch)
  ```
* **Deduplication in Memory**: Always deduplicate within the batch before sending to Supabase (`seen_keys = set()`) to prevent HTTP 409 conflicts.
* **Transient Error Backoff**: Wrap network calls with exponential backoff or retry logic (3 retries with 1s, 2s, 4s delay).

### B. Read Operations (Queries & ETL Extraction)
* **Never load all records at once**:
  * Bad: `fetch("price_entries?select=*")` (crashes both Supabase RAM and client Python process with 500k rows).
  * Good: Paged pagination with `limit=1000&offset=N` or filtering by specific year/date:
    `price_entries?select=id,price,date&date=gte.2024-01-01&date=lte.2024-12-31&limit=1000&offset=0`
* **Column Pruning**: Never request columns you don't use. Every omitted column saves network bandwidth and database memory.

---

## 3. Memory (RAM) & Streaming Hygiene (Python & Node.js)

1. **Garbage Collection & In-Memory Cleanup**:
   - In Python ETL pipelines, clear processed batches immediately:
     ```python
     records_batch.clear()
     ```
   - Avoid holding giant DataFrames in memory. Group and process by date or month, then release references.
2. **Disk Cleanup During Long Scrapes**:
   - In GitHub Actions and local scraper runs, delete intermediate PDFs and JSON files after each month is processed:
     ```bash
     rm -rf ./PDFs/* ./price_data/*
     ```
   - Never let disk usage exceed 2 GB on the GitHub runner.

---

## 4. GitHub Actions Minute Budgeting (2,000 min/month)

1. **Targeted Schedules**:
   - Weekly sync runs **once a week on Monday** (~3–5 minutes).
   - Daily sync processes **only the last 7 days** (`--start-date $(date -d "7 days ago" +%Y-%m-%d)`), never rescanning all 10 years.
   - Monthly total consumption: ~25 minutes/month (less than 2% of your 2,000-minute free quota).
2. **Strict Job Timeouts**:
   - Always set `timeout-minutes` on every job in `.github/workflows/*.yml` (e.g. `timeout-minutes: 15` or `30`).
   - Prevents a hung network request from running for 6 hours and burning 360 runner minutes in a single run.
3. **Dependency Caching**:
   - Always enable caching in GitHub Actions:
     ```yaml
     - uses: actions/setup-python@v5
       with:
         python-version: '3.11'
         cache: 'pip'
     ```

---

## 5. Summary Invariant Checklist for AI Agents

Before writing or modifying any sync script or database query, verify:
- [ ] Is write batch size between **500 and 1,000**?
- [ ] Is query bounded by `limit` or `date` filter?
- [ ] Are explicit columns selected instead of `*`?
- [ ] Is raw file/PDF cleanup performed after processing?
- [ ] Does GitHub workflow include `timeout-minutes`?
- [ ] Is concurrency throttled to protect connection pool limits?
