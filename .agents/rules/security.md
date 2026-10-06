# Security Protocols & Sensitive Credential Rules

These rules are **non-negotiable and strictly enforced** for all AI agents (Antigravity, Claude, Cursor, Copilot, Gemini) and human contributors working on this repository.

---

## 1. Zero-Secrets Policy (Absolute Prohibition)

1. **Never Hardcode Secrets**:
   - Never write literal API keys, JWT tokens, database passwords, service role keys, or connection strings into any code, SQL file, configuration file, or documentation.
   - Never provide a hardcoded secret as a "fallback default" (e.g. `os.getenv("KEY") or "eyJhbG..."` is **strictly forbidden**).
2. **Environment Variable Storage**:
   - All private credentials must reside exclusively in `.env` in the project root.
   - `.env` and all `.env*.local` variations must remain strictly gitignored in `.gitignore`.
   - Any template or sample file (`.env.example`) must contain **only sanitized placeholders** (e.g., `your_service_role_key_here`).
3. **Pre-Commit Secret Screening**:
   - Before staging or committing files, agents must verify that no JWT tokens (`eyJ...`), Google AI keys (`AQ...`), Supabase tokens (`sb_...`), or SMS gateway keys are present in any diff or file content.

---

## 2. Supabase Key Isolation & Least Privilege Architecture

Understand and enforce the strict boundary between Supabase key tiers:

| Key Name | Prefix / Format | Allowed Scope | Forbidden Scope |
| :--- | :--- | :--- | :--- |
| **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** | `sb_publishable_...` | Browser client components (`"use client"`), public frontend queries governed by RLS. | Do NOT rely on this for administrative ETL pipelines or bulk imports. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | `eyJ...` (role: `service_role`) | **Backend ETL scripts** (`scripts/`), server-side API endpoints (`src/app/api/...`), migration runners. | **STRICTLY FORBIDDEN** in any client component, browser bundle, or public frontend code. Exposing this key gives total bypass of RLS! |

### Rule:
If client-side components need data, they must either query via the public publishable client (governed by RLS) or fetch through a backend server Route Handler (`/api/...`).

---

## 3. CI/CD & GitHub Actions Security

1. **Use Encrypted Repository Secrets Exclusively**:
   - Workflows must inject secrets using the GitHub vault syntax:
     ```yaml
     env:
       SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
       GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
     ```
   - Never place plaintext secret values in `.github/workflows/*.yml`.
2. **Prevent Secret Leakage in Logs**:
   - Never write scripts that `echo`, `print()`, or log sensitive environment variables or authorization headers to stdout/stderr.
   - If an HTTP request fails, redact header values (especially `Authorization` and `apikey`) before outputting diagnostic logs.

---

## 4. Database Defense-in-Depth & Row Level Security (RLS)

1. **Mandatory RLS on Every Table**:
   - Every table created in `supabase/migrations/` must immediately execute:
     ```sql
     ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
     ```
2. **Strict Public vs. Protected Separation**:
   - **Public Read (`SELECT`)**: Allowed for public market commodities (`price_entries`, `markets`, `vegetables`, `categories`, `market_calendar`).
   - **Public Write (`INSERT`/`UPDATE`/`DELETE`)**: **STRICTLY FORBIDDEN** on price data. Only authenticated admins or the service role (`auth.role() = 'service_role'`) may mutate market records.
   - **Internal Tables**: Tables containing sensitive records (`admins`, `contact_messages`, `price_discrepancies`) must **never** have open, unrestricted public read policies.
3. **Safe Parameterized Queries**:
   - Always use Supabase SDK parameterization or PostgREST query builders.
   - Never perform raw SQL string concatenation with user-supplied input to prevent SQL injection.

---

## 5. Script Environment Loading Protocol

All Python scripts in `scripts/` must load environment variables through [`scripts/env_loader.py`](file:///c:/Users/sadew/OneDrive/Desktop/Elixir/Uni-Project-Web/scripts/env_loader.py):

```python
import os
import sys

# Standard relative path resolution to project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing required credentials in .env. Execution halted.")
    sys.exit(1)
```

---

## 6. Input Sanitization & Web Scraping Safeguards

1. **Never Trust External Ingested Data**:
   - All scraped strings from HARTI, CBSL, DCS, and Dambulla DEC must be sanitized before database insertion:
     * Strip non-numeric artifacts (`#DIV/0!`, `#REF!`, division headers).
     * Validate positive price numbers (`price > 0`).
     * Verify against canonical foreign keys (`valid_veg_ids`, `CANONICAL_MARKETS`).
2. **Rate Limiting & Polite Crawling**:
   - When scraping government portals (CBSL, DCS, HARTI), implement reasonable timeouts (30s) and throttling to avoid triggering IP blocks or accidental denial-of-service.

---

## 7. AI Agent Pre-Action Checklist

Before completing any task or committing changes, every AI agent must verify:
- [ ] Are there **zero secrets** in modified files or staged git changes?
- [ ] Are all database operations compliant with **RLS**?
- [ ] Is `SUPABASE_SERVICE_ROLE_KEY` kept exclusively on the **server / script backend**?
- [ ] Did any new Python script load credentials via `env_loader`?
- [ ] Has `.gitignore` maintained protection on all `.env*` files?
