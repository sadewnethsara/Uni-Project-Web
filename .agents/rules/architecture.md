# Workspace Architecture & Software Engineering Rules

These rules apply to all code generation, refactoring, and data ingestion tasks in this repository.

## 1. Domain Separation
- **Root Directory Cleanliness**: The repository root is reserved strictly for configuration files (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `components.json`) and standard documentation (`README.md`, `LICENSE`, `AGENTS.md`).
- **Docs Directory**: Detailed guides, markdown reports, and API specs must go into `docs/`.
- **Database Directory**: All database files, migration scripts, and DDL must go into `supabase/migrations/`.
- **Scripts Directory**: Backend automation scripts must be partitioned into:
  - `scripts/sync/`: External multi-source ETL pipelines (CBSL, DCS, CRAN, Dambulla).
  - `scripts/scraper/`: HARTI daily PDF downloaders, OCR processors, and Prophet forecasting.
  - `scripts/maintenance/`: Migration utilities, seed runners, and calendar population.

## 2. Environment and Path Management
- All Python scripts MUST import `env_loader`:
  ```python
  import os, sys
  sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  import env_loader
  ```
- This ensures `.env` is discovered regardless of the caller's working directory.
- Never hardcode database URLs or API keys in code.

## 3. Database Integrity & Foreign Key Safety
- The canonical table is `vegetables` with 54 clean commodities.
- Corrupted legacy slugs (`#DIV/0!`, `#REF!`, division headers, trailing hyphens) must be sanitized or mapped before inserting into `price_entries`.
- Always use `(vegetable_id, market_id, date, price_type)` as the conflict target for upserts.

## 4. Multi-Source Conflict Resolution
- When ingesting non-HARTI sources (CRAN, CBSL, DCS):
  - If a price exists and differs by >5%, insert a record into `price_discrepancies` with `status = 'pending'`.
  - If no price exists (e.g. retail prices), insert directly into `price_entries`.
  - Maintain the `source` field accurately (`'harti'`, `'cran_vegetables_lk'`, `'cbsl'`, `'dcs_retail'`, `'dambulla_dec'`).

## 5. Frontend & UI Conventions
- Strict TypeScript (`npm run build` must compile with 0 errors).
- All commodity icon lookups must use the alias resolver in `src/lib/iconsData.ts` to prevent missing SVGs or `N/A` badges.
- Always support mobile responsive grids and clean Tailwind aesthetic styles.
