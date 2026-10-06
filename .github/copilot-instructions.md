# GitHub Copilot Instructions — NAMIS Agriculture Market

When assisting with this repository, always follow these rules:

1. **Security**: Never output, suggest, or hardcode private API keys or database secrets. Server-role secrets (`SUPABASE_SERVICE_ROLE_KEY`) must never appear in frontend/client code.
2. **Directory Conventions**:
   - Next.js frontend code belongs in `src/`.
   - Backend automation belongs in `scripts/sync/`, `scripts/scraper/`, or `scripts/maintenance/`.
   - Database migrations belong in `supabase/migrations/<timestamp>_<name>.sql`.
   - Documentation belongs in `docs/`.
3. **Database Integrity**: Canonical tables are `markets` (12 economic centres) and `vegetables` (54 commodities). Ingestion must map legacy slugs into canonical foreign keys.
4. **Discrepancy Logging**: Conflicting prices from multi-source imports must be recorded in `price_discrepancies` rather than overwriting existing records.
5. **Data Engineering Hygiene**: Adhere to the 5-Layer Defense (`docs/DATA_ENGINEERING.md`). Clean OCR split numerals, drop `<= 0` prices and formula errors (`#DIV/0!`), batch upsert in $\le 500$ rows, and ensure `py -3 scripts/maintenance/audit_data_quality.py` passes with 100%.
