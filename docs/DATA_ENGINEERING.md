# 🌾 NAMIS Enterprise Data Engineering & Quality Manual

Welcome to the **National Agricultural Market Information System (NAMIS)** Data Engineering & Architecture Manual. This document provides end-to-end guidance for data engineers, AI agents, open-source contributors, and researchers working with Sri Lankan agricultural market datasets.

---

## 🏛️ 1. Agricultural Data Ecosystem Overview

NAMIS aggregates multi-tiered price discovery feeds across wholesale hubs, farmgate auctions, and consumer retail centers in Sri Lanka.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MULTI-SOURCE INGESTION TIER                       │
├─────────────────┬─────────────────┬──────────────────┬──────────────────────┤
│  HARTI Daily    │  CRAN 10-Year   │  Dambulla DEC    │  CBSL Central Bank   │
│  Bulletins      │  Historical     │  Live API        │  Daily Reports       │
│  (12 Markets)   │  (Wholesale &   │  (Grade A+       │  (Macro Validation)  │
│                 │   Retail)       │   Auctions)      │                      │
└────────┬────────┴────────┬────────┴────────┬─────────┴──────────┬───────────┘
         │                 │                 │                    │
         └─────────────────┼─────────────────┴────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   5-LAYER AUTOMATED CLEANING & AUDIT ENGINE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Regex & OCR Spacing Repair ("5 50.00" -> 550.00, "1 ,150.00" -> 1150.00) │
│ 2. Canonical Entity Resolution (Fuzzy Levenshtein & Gemini AI Fallback)     │
│ 3. Spreadsheet Artifact Purging (#DIV/0!, #REF!, division headers)          │
│ 4. Composite Key Deduplication (vegetable_id, market_id, date, price_type)  │
│ 5. Automated Discrepancy Auditing (>5% variance routed to quarantine)       │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE POSTGRESQL (SILVER/GOLD)                   │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│  price_entries           │  retail_price_entries    │  price_discrepancies  │
│  (247,000+ clean rows)   │  (51,000+ clean rows)    │  (6,300+ audited rows)│
├──────────────────────────┴──────────────────────────┴───────────────────────┤
│  inflation_rates (Macro & Rupee Time Series: Daily, Weekly, Monthly, Yearly)│
│  inflation_forecasts (Rolling 365-Day Forward Prediction Horizon)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 2. The 7 Active Data Feeds

| Feed Slug | Provider | Markets Monitored | Frequency | Primary Pipeline Script |
| :--- | :--- | :--- | :--- | :--- |
| `harti` | Hector Kobbekaduwa Agrarian Research & Training Institute | **All 12 Economic Centres** *(Pettah, Dambulla, Kandy, Keppetipola, Nuwara Eliya, etc.)* | Daily | [`scripts/scraper/batch_process_pdfs.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/scraper/batch_process_pdfs.py) |
| `cran_vegetables_lk` | CRAN R Package (`vegetablesSriLanka` by Dr. Thiyanga S. Talagala) | **Pettah**, **Dambulla** | 10-Year historical (2016–2026) | [`scripts/sync/sync_cran_historical.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/sync/sync_cran_historical.py) |
| `dambulla_dec` | Dambulla Dedicated Economic Centre Digital Portal | **Dambulla** (Electronic Wholesale Auctions) | Real-time daily API | [`scripts/sync/sync_dambulla_api.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/sync/sync_dambulla_api.py) |
| `cbsl` | Central Bank of Sri Lanka | **Pettah**, **Dambulla**, **Narahenpita** | Daily Bulletins (2016–Present) | [`scripts/sync/sync_cbsl_historical.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/sync/sync_cbsl_historical.py) |
| `dcs_retail` | Department of Census & Statistics | **Colombo District** (14 Retail Centres) | Weekly Consumer Time-Series | [`scripts/sync/sync_dcs_retail.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/sync/sync_dcs_retail.py) |
| `cbsl_inflation` | CBSL & DCS National Statistics | **National / Colombo (CCPI & NCPI)** | Daily, Weekly, Monthly, Yearly | [`scripts/sync/sync_inflation_rates.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/sync/sync_inflation_rates.py) |
| `macro_forecast` | NAMIS Econometric ML Engine | **National Rolling 365-Day Window** | Daily Auto-Rolling Forecast | [`scripts/sync/forecast_rolling_inflation.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/sync/forecast_rolling_inflation.py) |

---

## 🛡️ 3. The 5-Layer Automated Cleaning Architecture

### Layer 1: Ingestion Pre-Processing (Python)
* **OCR Whitespace Cleansing**: OCR scanners frequently inject spaces or commas into numerals. The pipeline passes all numeric tokens through `clean_num()`:
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
* **Date Normalization**: Formats like `06/10/2026`, `2026.10.06`, and `W1.Aug.2024` are parsed into strict **ISO 8601** (`YYYY-MM-DD`).
* **Market Fuzzy Normalizer**: [`scripts/scraper/market_normalizer.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/scraper/market_normalizer.py) provides a 2-tier resolution engine (Tier 1: Levenshtein distance alias lookup; Tier 2: Google Gemini AI fallback for extreme corruptions).

### Layer 2: Pipeline Validation Rules
Before any payload is submitted over HTTP to Supabase:
* If $price \le 0$, the row is **silently dropped**.
* If `vegetable_id` does not match an active slug in `get_valid_vegetable_ids()`, the row is skipped.
* Corrupted spreadsheet headers and formula errors (`#DIV/0!`, `#REF!`, `data-management-division`) are pruned.

### Layer 3: Database Schema & Integrity Constraints
* **Composite Uniqueness**: Uniqueness is strictly enforced on `(vegetable_id, market_id, date, price_type)`.
* **Idempotent Upserts**: Every insertion specifies:
  ```http
  POST /rest/v1/price_entries?on_conflict=vegetable_id,market_id,date,price_type
  Prefer: resolution=merge-duplicates
  ```
* **Foreign Key Constraints**: `vegetable_id` references `vegetables(id)` and `market_id` references `markets(id)`.

### Layer 4: Multi-Source Discrepancy Quarantine Engine
When secondary sources (CRAN, CBSL, Dambulla) ingest data for a slot where an existing price is already present:
1. Calculates percentage variance:
   $$\Delta\% = \frac{|\text{New Price} - \text{Existing Price}|}{\text{Existing Price}} \times 100$$
2. If $\Delta\% \ge 5\%$, the new price is **not overwritten**. Instead, it is routed into `price_discrepancies` with `status = 'pending'`.
3. If no price existed for that slot (e.g., missing retail prices or unrecorded days), it is inserted cleanly into `price_entries`.

### Layer 5: Automated CI/CD Data Quality Gate
Every automated GitHub Actions workflow (`daily_sync.yml`, `weekly_market_sync.yml`) runs [`scripts/maintenance/audit_data_quality.py`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/maintenance/audit_data_quality.py) as its final step.

If any null value, negative price, or extreme outlier is detected, the workflow fails immediately with an actionable report.

---

## 🛠️ 4. Running Data Quality Audits

### Manual Audit Command
Developers and AI agents can execute the health audit at any time from the project root:
```bash
py -3 scripts/maintenance/audit_data_quality.py
```

### Expected Output
```text
=================================================================
  NAMIS ENTERPRISE DATA QUALITY & HYGIENE AUDIT
=================================================================
[1] DATASET VOLUMETRICS:
    * Wholesale & Paired Retail Entries: 247,494 rows
    * DCS Consumer Retail Entries:      51,506 rows
    * Audited Discrepancies:             6,320 rows

[2] INTEGRITY & NULL CHECKS:
    * Vegetable ID Nulls: 0 [OK]
    * Market ID Nulls:    0 [OK]
    * Date Nulls:         0 [OK]
    * Price Nulls:        0 [OK]

[3] DOMAIN VALUE & LOGICAL BOUNDARY CHECKS:
    * Non-Positive Wholesale Prices (<= 0): 0 [OK]
    * Unreasonable Extreme Prices (> 25k):  0 [OK]
    * Non-Positive Retail Prices (<= 0):    0 [OK]
    * Unreasonable Retail Prices (> 50k):   0 [OK]

[4] TEMPORAL BOUNDARY AUDIT:
    * Future Dates (> 2026-10-06): 0 [OK]

[5] DIMENSION ENTITY ALIGNMENT:
    * Active Canonical Markets:     12 configured
    * Active Canonical Commodities: 72 configured

=================================================================
  AUDIT SUMMARY: 4/4 CHECKS PASSED (100.0%)
  STATUS: [GRADE A+] DATASET IS FULLY SANITIZED & PRODUCTION READY
=================================================================
```

---

## 📋 5. Contributor Checklist: Adding a New Data Source

When contributing a new data scraper or ETL feed:

1. **Place Script in Correct Directory**:
   * All external sync scripts belong in `scripts/sync/sync_<source_name>.py`.
2. **Import Environment Helper**:
   ```python
   import sys, os
   sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
   import env_loader
   ```
3. **Validate Against Canonical Slugs**:
   * Use `get_valid_vegetable_ids()` and `MARKET_MAP`. Never insert unmapped strings.
4. **Enforce Micro Batch Sizing**:
   * Batch size must be **$\le 500$ records** per POST request.
5. **Implement Discrepancy Auditing**:
   * Cross-check existing records; post conflicts to `price_discrepancies` using columns `conflicting_price` and `conflicting_source`.
6. **Register in GitHub Actions**:
   * Add a choice and job step to [`.github/workflows/weekly_market_sync.yml`](file:///C:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/.github/workflows/weekly_market_sync.yml).
7. **Verify Hygiene**:
   * Run `py -3 scripts/maintenance/audit_data_quality.py` to ensure 100% pass score.
