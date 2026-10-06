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
  - Historical Migration: `py -3 scripts/maintenance/migrate_to_new_project.py --year 2024`

## Core Invariants
1. **Never commit secrets**. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
2. Put database migrations in `supabase/migrations/`.
3. Put scripts in `scripts/sync/`, `scripts/scraper/`, or `scripts/maintenance/`.
4. Put docs in `docs/`.
