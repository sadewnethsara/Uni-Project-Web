# Data Engineering, Ingestion & Quality Architecture Rules

These rules govern all ETL pipelines, scraper extensions, database migrations, and data manipulation scripts in this repository. Any AI agent or developer modifying or introducing data pipelines **must strictly comply with the following standards**.

---

## 1. The 5-Layer Automated Cleaning Architecture

All data ingested into NAMIS must pass through the 5-layer quality defense:

```text
[ External Sources (PDFs, APIs, Web Feeds) ]
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ Layer 1: Ingestion Pre-Processing (Python)   │
│ - Strip currencies ("Rs./kg", "Rs.")         │
│ - Repair OCR spacing ("5 50.00" -> 550.00)   │
│ - Fuzzy market normalizer & Gemini fallback  │
│ - Standardize dates to ISO 8601 (YYYY-MM-DD) │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ Layer 2: Pipeline Validation Rules           │
│ - Drop zero or negative prices (price <= 0)  │
│ - Reject unmapped vegetable/market slugs     │
│ - Drop spreadsheet junk (#DIV/0!, #REF!)     │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ Layer 3: Database Integrity (PostgreSQL/RLS) │
│ - NOT NULL constraints on core dimensions    │
│ - Foreign Key integrity (vegetables, markets)│
│ - Composite Unique (veg, mkt, date, type)    │
│ - CHECK constraints on price_type & source   │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ Layer 4: Discrepancy Quarantine Engine       │
│ - Auto-detect conflicting prices (> 5% delta)│
│ - Preserve existing data; route conflicts to │
│   'price_discrepancies' for moderator review │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ Layer 5: Automated CI/CD Quality Gate        │
│ - Run 'audit_data_quality.py' post-sync      │
│ - Block workflows if quality score < 100%    │
└──────────────────────────────────────────────┘
```

---

## 2. Mandatory Rules for Adding or Modifying Ingestion Scripts

### Rule 2.1: Idempotency & Composite Unique Keys
Every insert into `price_entries` must specify the exact conflict target:
```python
endpoint = f"{supabase_url}/rest/v1/price_entries?on_conflict=vegetable_id,market_id,date,price_type"
headers = {
    ...,
    "Prefer": "resolution=merge-duplicates"
}
```
* Pipelines must be **idempotent**: running them multiple times on the same date window must not duplicate rows or crash with HTTP 409 errors.

### Rule 2.2: Strict Foreign Key Validation
* **Never insert arbitrary string labels** into `vegetable_id` or `market_id`.
* Every pipeline must pre-validate keys against the canonical sets:
  - `markets`: `['pettah', 'peliyagoda', 'dambulla', 'kandy', 'keppetipola', 'meegoda', 'norochchole', 'nuwara-eliya', 'bandarawela', 'veyangoda', 'thambuththegama', 'manning']`
  - `vegetables`: Use `get_valid_vegetable_ids()` or query `/rest/v1/vegetables?select=id`.
* If a new commodity is found in an external source, it must be added to `vegetables` dimension table via a proper SQL migration before ingesting price entries.

### Rule 2.3: Zero Spreadsheet or OCR Artifacts
Pipelines must explicitly filter out known corrupted tokens:
```python
JUNK_TOKENS = {
    "#DIV/0!", "#REF!", "#VALUE!", "#N/A", "n.a.", "-", ".", "div-0",
    "data-management-division", "information-division", "marketing---food-policy-division"
}
```
If any value matches `JUNK_TOKENS` or results in `price <= 0`, it must be **dropped immediately**.

### Rule 2.4: Numerical Sanitization
OCR outputs frequently introduce rogue spaces and commas into numbers:
```python
def clean_num(val_str: str) -> float:
    if not val_str:
        return 0.0
    cleaned = re.sub(r"[^\d.]", "", val_str)
    try:
        return float(cleaned)
    except ValueError:
        return 0.0
```

### Rule 2.5: Multi-Source Discrepancy Policy
When ingesting secondary sources (CRAN, CBSL, DCS, Dambulla DEC):
1. **Never blindly overwrite** existing prices.
2. Calculate percentage difference:
   $$\Delta\% = \frac{|\text{New Price} - \text{Existing Price}|}{\text{Existing Price}} \times 100$$
3. If $\Delta\% \ge 5\%$, route to `price_discrepancies`:
   ```python
   {
       "vegetable_id": veg_id,
       "market_id": market_id,
       "date": report_date,
       "price_type": price_type,
       "existing_price": existing_price,
       "existing_source": existing_source,
       "conflicting_price": new_price,
       "conflicting_source": source_name,
       "status": "pending",
       "admin_notes": f"Variance of {diff_pct}% detected"
   }
   ```
4. If no price exists for that slot, insert cleanly into `price_entries`.

---

## 3. Resource & Batch Limits (Supabase Free Tier)

* **Maximum Batch Size**: POST requests must be batched in chunks of **500 records** (max 1,000). Never attempt to send thousands of records in a single payload.
* **In-Memory Streaming**: Daily bulletin PDFs must be processed in RAM (`io.BytesIO(pdf_bytes)`) or purged from disk immediately after processing (`rm -rf ./PDFs/* ./price_data/*`).
* **Zero Binary Storage in DB**: Never store PDFs, raw images, or OCR binary trees in PostgreSQL.

---

## 4. Quality Auditing & Automated CI/CD Gates

Every automated GitHub Actions ingestion workflow must conclude with the enterprise data hygiene audit:
```yaml
- name: Run Enterprise Data Quality & Hygiene Audit
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  run: |
    python scripts/maintenance/audit_data_quality.py
```

Developers and agents can run this audit locally anytime:
```bash
py -3 scripts/maintenance/audit_data_quality.py
```
A pass score of **100% (Grade A+)** is mandatory for all production deployments.
