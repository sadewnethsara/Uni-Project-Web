# Claude Code Guidelines — NAMIS Agriculture Market

See [AGENTS.md](./AGENTS.md) and [.agents/rules/security.md](./.agents/rules/security.md) for complete guidelines.

## Quick Commands
- Dev Server: `pnpm run dev`
- Build & Typecheck: `pnpm run build`
- Python Scripts:
  - CRAN 10-Yr Sync: `py -3 scripts/sync/sync_cran_historical.py`
  - CBSL Daily Sync: `py -3 scripts/sync/sync_cbsl_reports.py`
  - DCS Retail Sync: `py -3 scripts/sync/sync_dcs_retail.py`
  - Dambulla API Sync: `py -3 scripts/sync/sync_dambulla_api.py`
  - CBSL Historical: `py -3 scripts/sync/sync_cbsl_historical.py --year 2025`
  - Data Quality Audit: `py -3 scripts/maintenance/audit_data_quality.py`
  - Historical Migration: `py -3 scripts/maintenance/migrate_to_new_project.py --year 2024`

## Core Invariants
1. **Never commit secrets**. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
2. Put database migrations in `supabase/migrations/`.
3. Put scripts in `scripts/sync/`, `scripts/scraper/`, or `scripts/maintenance/`.
4. Put docs in `docs/` (refer to `docs/DATA_ENGINEERING.md`).
5. **Data Engineering 5-Layer Defense**: All pipelines must drop `<= 0` prices, repair OCR spacing, enforce ISO dates, and route conflicts to `price_discrepancies`. Verify with `audit_data_quality.py` (100% pass score required).
