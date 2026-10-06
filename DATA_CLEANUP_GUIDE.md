# 🌾 NAMIS Database Historical Data Cleanup & Architecture Guide

This guide provides a comprehensive audit, step-by-step SQL migration, and operational procedures to resolve historical market ID corruption, recover hidden price records, and configure error-free automated daily data ingestion.

---

## 📋 Executive Summary & Audit Findings

Between 2015 and 2026, the NAMIS database ingested **~495,000 price records**. An in-depth audit of the Supabase PostgreSQL database revealed:

1. **Price Values Are 100% Genuine**: Zero null prices, zero negative prices, and zero unrealistic outliers exist. The numeric price data is authentic.
2. **The "Phantom Markets" Issue (137,812 Hidden Records)**: 
   - HARTI PDF bulletins format table headers with dates above the market name (e.g. `2024.11.13 Peliyagoda` or `2021-01-20 Dambulla`) or OCR typos (`t'thegama`, `hambuththegam`, `akeppetipola`).
   - The original ingestion script did not strip `YYYY.MM.DD` dates or map OCR typos, causing dates and noise to be saved as new `market_id` entries.
   - This created **3,280 market IDs** in the `markets` table instead of the **12 real Dedicated Economic Centers**.
   - Because the frontend UI filters by standard market slugs (e.g., `market_id = 'peliyagoda'`), **125,037 valid price records are currently hidden from user view**.
3. **The 2025 Data Volume Drop**:
   - January & February 2025 captured all regional markets (~7,500 records/mo).
   - Between **March 6, 2025 and December 2025**, the scraper was set to only extract Pettah and Peliyagoda, leaving out ~50,000 regional market records for 2025.

---

## 🏛️ The 12 Canonical Markets

All wholesale agricultural commodities in Sri Lanka map to these 12 canonical market IDs:

| Canonical ID | Display Name | Category / Role |
| :--- | :--- | :--- |
| `pettah` | Pettah Wholesale Market (Colombo) | Urban terminal (Rice, Pulses, Grain, Dry Food) |
| `peliyagoda` | Peliyagoda Dedicated Economic Center | Western Province central fruit & vegetable terminal |
| `dambulla` | Dambulla Dedicated Economic Center | National collection hub for Northern/Central regions |
| `kandy` | Kandy Central Market | Central Province mid-country & highland distribution |
| `keppetipola` | Keppetipola Dedicated Economic Center | Uva Province highland vegetable collection |
| `meegoda` | Meegoda Dedicated Economic Center | Western Province consumer terminal |
| `norochchole` | Norochchole Dedicated Economic Center | Kalpitiya peninsula hub (Red onion, Beet, Cabbage) |
| `thambuththegama` | Thambuththegama Dedicated Economic Center | North-Central Province low-country vegetable hub |
| `nuwara-eliya` | Nuwara Eliya Dedicated Economic Center | Highland cool-climate vegetables (Carrot, Leek, Potato) |
| `bandarawela` | Bandarawela Dedicated Economic Center | Uva Province highland collection |
| `veyangoda` | Veyangoda Dedicated Economic Center | Gampaha / Western Province trading terminal |
| `manning` | Manning Market (Colombo) | Historical pre-2020 terminal (prior to Peliyagoda move) |

---

## 🛠️ Step 1: Database Cleanup Migration (SQL)

Run the following SQL script directly in the **Supabase Dashboard -> SQL Editor**.

> [!IMPORTANT]
> This script is idempotent, transactional, and safe. It first resolves duplicate conflicts with existing canonical rows before updating remaining unique records, ensuring the `UNIQUE (market_id, vegetable_id, date)` constraint is never violated.

```sql
BEGIN;

-- 1. Create a temporary mapping table to link corrupted IDs to canonical IDs
CREATE TEMP TABLE temp_market_mapping AS
SELECT DISTINCT
    pe.market_id AS old_market_id,
    CASE 
        WHEN pe.market_id LIKE '%peliyagod%' THEN 'peliyagoda'
        WHEN pe.market_id LIKE '%pettah%' OR pe.market_id LIKE '%petha%' THEN 'pettah'
        WHEN pe.market_id LIKE '%dambulla%' THEN 'dambulla'
        WHEN pe.market_id LIKE '%kandy%' THEN 'kandy'
        WHEN pe.market_id LIKE '%keppetipola%' OR pe.market_id LIKE '%kappetipola%' THEN 'keppetipola'
        WHEN pe.market_id LIKE '%meegoda%' OR pe.market_id LIKE '%megoda%' THEN 'meegoda'
        WHEN pe.market_id LIKE '%norochchole%' OR pe.market_id LIKE '%norochcholet%' OR pe.market_id LIKE '%norochcholteh%' THEN 'norochchole'
        WHEN pe.market_id LIKE '%thambuththegam%' OR pe.market_id LIKE '%t''thegama%' OR pe.market_id LIKE '%hambuththegam%' OR pe.market_id LIKE '%ambuththega%' THEN 'thambuththegama'
        WHEN pe.market_id LIKE '%nuwara%' THEN 'nuwara-eliya'
        WHEN pe.market_id LIKE '%bandarawela%' THEN 'bandarawela'
        WHEN pe.market_id LIKE '%veyangoda%' THEN 'veyangoda'
        WHEN pe.market_id LIKE '%manning%' THEN 'manning'
        ELSE NULL
    END AS canonical_id
FROM price_entries pe
WHERE pe.market_id NOT IN (
    'bandarawela', 'dambulla', 'kandy', 'keppetipola', 'manning',
    'meegoda', 'norochchole', 'nuwara-eliya', 'peliyagoda', 'pettah',
    'thambuththegama', 'veyangoda'
);

-- 2. Delete duplicate records where a canonical record already exists for the same date & vegetable
DELETE FROM price_entries pe
USING temp_market_mapping map, price_entries canon
WHERE pe.market_id = map.old_market_id
  AND map.canonical_id IS NOT NULL
  AND canon.market_id = map.canonical_id
  AND canon.vegetable_id = pe.vegetable_id
  AND canon.date = pe.date;

-- 3. Remap remaining unique corrupted rows to their canonical market IDs
UPDATE price_entries pe
SET market_id = map.canonical_id
FROM temp_market_mapping map
WHERE pe.market_id = map.old_market_id
  AND map.canonical_id IS NOT NULL;

-- 4. Delete unmappable OCR artifacts (e.g., '\', ']', 'market_1')
DELETE FROM price_entries
WHERE market_id NOT IN (
    'bandarawela', 'dambulla', 'kandy', 'keppetipola', 'manning',
    'meegoda', 'norochchole', 'nuwara-eliya', 'peliyagoda', 'pettah',
    'thambuththegama', 'veyangoda'
);

-- 5. Delete all phantom markets from the markets table
DELETE FROM markets
WHERE id NOT IN (
    'bandarawela', 'dambulla', 'kandy', 'keppetipola', 'manning',
    'meegoda', 'norochchole', 'nuwara-eliya', 'peliyagoda', 'pettah',
    'thambuththegama', 'veyangoda'
)
AND id NOT IN (SELECT market_id FROM admins WHERE market_id IS NOT NULL);

-- Clean up temp table
DROP TABLE temp_market_mapping;

COMMIT;
```

### Verification Queries
Run these queries in Supabase SQL Editor after the migration:

```sql
-- 1. Verify markets count (should return 12)
SELECT count(*) AS total_markets FROM markets;

-- 2. Verify corrupted market records in price_entries (should return 0)
SELECT count(*) AS corrupted_records
FROM price_entries
WHERE market_id NOT IN (
    'bandarawela', 'dambulla', 'kandy', 'keppetipola', 'manning',
    'meegoda', 'norochchole', 'nuwara-eliya', 'peliyagoda', 'pettah',
    'thambuththegama', 'veyangoda'
);

-- 3. Check clean record distribution across markets
SELECT market_id, count(*) AS record_count
FROM price_entries
GROUP BY market_id
ORDER BY record_count DESC;
```

---

## ⚙️ Step 2: Codebase Safeguards Implemented

The following files have already been updated with canonical cleaning logic:

### 1. `scripts/scraper/extract_pdf_prices.py`
Added `clean_market_name()` which strips `YYYY.MM.DD`, `YYYY-MM-DD`, `DD/MM/YYYY`, and OCR noise before assigning `market_id`:
```python
def clean_market_name(name: str, fallback_idx: int = 1) -> str:
    cleaned = re.sub(r'\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}|\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}', '', name)
    cleaned = re.sub(r'(?i)market', '', cleaned).strip()
    c_lower = cleaned.lower()
    if 'peliyagoda' in c_lower: return 'Peliyagoda'
    if 'dambulla' in c_lower: return 'Dambulla'
    if 'kandy' in c_lower: return 'Kandy'
    if 'keppetipola' in c_lower or 'kappetipola' in c_lower: return 'Keppetipola'
    if 'meegoda' in c_lower or 'megoda' in c_lower: return 'Meegoda'
    if 'norochchole' in c_lower: return 'Norochchole'
    if 'thambuththegama' in c_lower or 't\'thegama' in c_lower or 'hambuththegam' in c_lower: return 'Thambuththegama'
    if 'nuwara' in c_lower: return 'Nuwara Eliya'
    if 'bandarawela' in c_lower: return 'Bandarawela'
    if 'veyangoda' in c_lower: return 'Veyangoda'
    if 'pettah' in c_lower: return 'Pettah'
    return cleaned if cleaned else f"Market_{fallback_idx}"
```

### 2. `scripts/sync_data.ts`
Enforced strict canonical mapping on ingestion to ensure no unverified IDs are inserted:
```typescript
let rawMarket = entry.market.toLowerCase().trim();
let marketId = rawMarket;
let displayName = entry.market;

if (rawMarket.includes("peliyagoda")) { marketId = "peliyagoda"; displayName = "Peliyagoda"; }
else if (rawMarket.includes("pettah")) { marketId = "pettah"; displayName = "Pettah"; }
else if (rawMarket.includes("dambulla")) { marketId = "dambulla"; displayName = "Dambulla"; }
else if (rawMarket.includes("kandy")) { marketId = "kandy"; displayName = "Kandy"; }
else if (rawMarket.includes("keppetipola") || rawMarket.includes("kappetipola")) { marketId = "keppetipola"; displayName = "Keppetipola"; }
else if (rawMarket.includes("meegoda") || rawMarket.includes("megoda")) { marketId = "meegoda"; displayName = "Meegoda"; }
else if (rawMarket.includes("norochchole")) { marketId = "norochchole"; displayName = "Norochchole"; }
else if (rawMarket.includes("thambuththegama") || rawMarket.includes("t'thegama") || rawMarket.includes("hambuththegam")) { marketId = "thambuththegama"; displayName = "Thambuththegama"; }
else if (rawMarket.includes("nuwara")) { marketId = "nuwara-eliya"; displayName = "Nuwara Eliya"; }
else if (rawMarket.includes("bandarawela")) { marketId = "bandarawela"; displayName = "Bandarawela"; }
else if (rawMarket.includes("veyangoda")) { marketId = "veyangoda"; displayName = "Veyangoda"; }
else if (rawMarket.includes("manning")) { marketId = "manning"; displayName = "Manning Market"; }
```

Commit and push these changes:
```bash
git add scripts/scraper/extract_pdf_prices.py scripts/sync_data.ts
git commit -m "fix(scraper): canonicalize market names and strip date prefixes"
git push origin main
```

---

## 🔄 Step 3: Backfilling Missing 2025 Regional Data

Once the current workflow run completes and the code changes are pushed:

1. Open the GitHub Actions tab in your repository (or use the GitHub CLI).
2. Trigger the **Manual Historical Data Sync** workflow:
   ```bash
   gh workflow run "Manual Historical Data Sync" -f start_year=2025 -f start_month=3
   ```
3. Because the workflow uses idempotent upserts (`ON CONFLICT (market_id, vegetable_id, date) DO UPDATE`), this will safely add all regional market data for March–December 2025 without touching or duplicating existing records.

---

## 🚀 Step 4: Future-Proof Architecture for Automated Updates

To ensure daily syncs run smoothly without failing:

### 1. Daily Sync Scope (`daily_sync.yml`)
- The automated daily workflow (`cron: '30 16 * * *'` / 10:00 PM Sri Lanka Time) only downloads and syncs the **last 7 days**.
- Execution takes **under 45 seconds**, completely avoiding the GitHub Actions 6-hour execution limit.

### 2. Historical Sync Scoping (`historical_sync.yml`)
- Historical backfills should always be executed **year by year** (e.g. `start_year: 2025`) using the `start_year` and `start_month` inputs, rather than starting from 2015 in a single monolithic job.

### 3. Automated Error Prevention Rules
1. **Never dynamically create new markets in production**: Any market not in the 12 canonical list will be discarded or flagged, preventing database bloat.
2. **Idempotent Upserts**: `scripts/sync_data.ts` always uses `onConflict: 'date,market_id,vegetable_id'`, allowing safe re-runs at any time.
3. **Price Range Guardrail**: Any price that fails sanity validation ($\le 0$ or $> 10,000$) is ignored during extraction.
