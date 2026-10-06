# AGENTS.md — AI Agent Guidelines & Architecture Rules

This repository (**NAMIS / Agriculture Market Sri Lanka**) follows strict software engineering principles, modular architecture, and security protocols. Any AI agent (Antigravity, Claude, Cursor, Copilot, Gemini) modifying or extending this codebase **must adhere to the guidelines below**.

---

## 1. Directory Structure & File Organization

The project is structured into strict domains. **Never dump files into the project root.**

```text
├── .agents/
│   └── rules/                  # Modular AI agent rules and architectural standards
├── .github/
│   └── workflows/              # GitHub Actions automation workflows (CI/CD, scheduled sync)
├── docs/                       # Architectural documentation, ERDs, guides, manuals
├── public/                     # Static web assets (SVG icons, logos, manifests)
├── scripts/                    # Backend automation, ETL pipelines, and scripts
│   ├── env_loader.py           # Shared environment & path resolution helper
│   ├── maintenance/            # Database migrations, calendar population, icon generator
│   ├── ml/                     # ML price forecasting & Prophet training pipelines
│   ├── scraper/                # HARTI daily bulletin PDF scrapers & OCR extractors
│   └── sync/                   # Multi-source live & historical sync (CRAN, CBSL, DCS, Dambulla)
├── src/                        # Next.js 16 (App Router) Frontend
│   ├── app/                    # Next.js app routes, pages, and API endpoints (/api/...)
│   ├── components/             # Reusable UI components (charts, cards, market grids)
│   ├── hooks/                  # Custom React hooks (e.g. useMarketPrices, useDebounce)
│   ├── lib/                    # Supabase clients, shared data helpers, icon lookup aliases
│   └── types/                  # TypeScript interfaces and Supabase schema types
├── supabase/                   # Supabase configuration & database migrations
│   ├── migrations/             # Timestamped SQL migrations (DDL, constraints, RLS)
│   │   └── archive/            # Deprecated or legacy database backups
│   └── config.toml             # Local Supabase CLI configuration
├── .env                        # Local private environment variables (NEVER COMMIT)
├── .env.example                # Sanitized sample environment file
├── .gitignore                  # Git exclusion rules
├── package.json                # Node.js dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 2. Core Architectural Principles

### A. Strict Security & Key Isolation Rules
👉 **Complete rules available in [`.agents/rules/security.md`](./.agents/rules/security.md)** — All agents must read and strictly follow.

1. **Zero Secrets in Git**: Never commit API keys, service role secrets, database passwords, or JWTs.
2. **Environment Variable Storage**: All secrets must reside exclusively in `.env` (which is gitignored via `.env*`). Never hardcode fallback strings in `os.getenv()`.
3. **Key Tier Isolation**:
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Allowed in browser client components (`"use client"`).
   - `SUPABASE_SERVICE_ROLE_KEY`: **STRICTLY FORBIDDEN** in any client component or browser bundle. Allowed ONLY in backend server routes (`/api/...`) and `scripts/`.
4. **Environment Loading**: Automation scripts must load variables via `scripts/env_loader.py`.
5. **CI/CD Security**: In GitHub Actions workflows, always use `${{ secrets.VARIABLE_NAME }}`. Never print or echo secrets in logs.

### B. Database Schema & Migration Rules
1. **Single Source of Truth**: All DDL changes, new tables, and constraints belong in `supabase/migrations/<YYYYMMDDHHMMSS>_<feature_name>.sql`.
2. **Canonical Foreign Keys**:
   - `markets.id` must only contain canonical market slugs (e.g., `pettah`, `dambulla`, `peliyagoda`, `kandy`, `keppetipola`).
   - `vegetables.id` must match canonical slugs (e.g., `beans`, `carrot`, `cabbage--kandy-`, `tomato`, `potato--imported-`).
3. **Row Level Security (RLS)**: Always enable RLS on every table. Allow public `SELECT` for price entries; restrict `INSERT`/`UPDATE`/`DELETE` to authenticated admins or service role.
4. **Composite Uniqueness**: `price_entries` enforces unique `(vegetable_id, market_id, date, price_type)`.

### C. Resource Limits & Free-Tier Guardrails (Supabase & GitHub Actions)
👉 **Complete rules available in [`.agents/rules/resource_limits.md`](./.agents/rules/resource_limits.md)** — Non-negotiable for stability.

1. **Supabase Micro Instance Protection**:
   - **Batch Sizing**: Max **500 to 1,000 records** per POST request. Never send massive unbounded payloads.
   - **Pagination**: **NEVER run `SELECT *` without limits or date filters** on `price_entries` (prevents 504 Gateway Timeouts and OOM crashes).
   - **Column Selection**: Always select explicit fields (`select=id,price,date`) to conserve the 5 GB/month egress bandwidth.
   - **Zero Raw Files in DB**: Never store PDFs, raw images, or heavy binary OCR blobs in PostgreSQL (keeps DB under 500 MB).
2. **GitHub Actions Budgeting (2,000 min/mo)**:
   - Always add `timeout-minutes: 15` (or `30`) to every job in `.github/workflows/*.yml` to prevent runaway processes.
   - Target syncs to **incremental windows** (e.g. `last 7 days`), rather than rescanning all 10 years on every cron run.
   - Purge intermediate scratch directories (`rm -rf ./PDFs/* ./price_data/*`) during long loops.

---

## 3. Multi-Source Ingestion & Discrepancy Policy

When ingesting agricultural market data from multiple sources:
- **HARTI (`harti`)**: Daily Wholesale Bulletins (12 Economic Centres).
- **CRAN (`cran_vegetables_lk`)**: 10-Year historical wholesale and retail prices (Pettah & Dambulla).
- **CBSL (`cbsl`)**: Central Bank daily price reports (Pettah, Dambulla, Narahenpita).
- **DCS (`dcs_retail`)**: Department of Census & Statistics weekly retail prices.
- **Dambulla DEC (`dambulla_dec`)**: Real-time wholesale auction REST API.

### Handling Conflicting Data
* If a new source reports a **different price** for the same `(vegetable_id, market_id, date, price_type)`:
  * **DO NOT** silently overwrite the existing record.
  * **Insert into `price_discrepancies`** with `status = 'pending'`, calculating `price_diff` and `diff_percent`.
  * The Admin Panel will allow human moderators to resolve discrepancies.
* If the slot has **no existing price** (e.g., missing retail prices or unrecorded days), insert directly into `price_entries`.

---

## 4. Frontend & Next.js Guidelines

1. **Framework**: Next.js 16 (Turbopack, App Router) with React 19 and TypeScript.
2. **Styling**: Tailwind CSS + Vanilla CSS utilities. Curated color palettes with dark mode support.
3. **Icons & Assets**:
   * Do not hardcode ad-hoc SVG strings in components.
   * Use `SRI_LANKA_COMMODITY_ALIASES` in `src/lib/iconsData.ts` and `src/lib/marketPageData.ts` for commodity SVG mappings.
4. **Performance**:
   * Cache Supabase queries using Next.js `revalidate` tags or React Server Components where appropriate.
   * Client components (`"use client"`) must only be used where state, animations, or DOM events are required.

---

## 5. Script Organization Rules

1. **`scripts/sync/`**: Any script fetching data from an external API or dataset and upserting to Supabase.
2. **`scripts/scraper/`**: HARTI PDF scrapers, OCR batch runners, and Prophet training pipelines.
3. **`scripts/maintenance/`**: Database migrations, seed scripts, calendar generators, and icon builders.
4. **Execution**: All Python scripts must be executable from either the project root or their own subdirectories:
   ```bash
   py -3 scripts/sync/sync_cran_historical.py
   py -3 scripts/sync/sync_dambulla_api.py
   py -3 scripts/maintenance/migrate_to_new_project.py --year 2024
   ```
