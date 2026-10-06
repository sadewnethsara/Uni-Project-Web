## 2026-10-06 - [Supabase Key Tier Isolation & Zero-Secrets Enforcement]
**Vulnerability:** Accidental exposure of `SUPABASE_SERVICE_ROLE_KEY` in frontend client bundles or hardcoded fallback defaults in backend scripts (`os.getenv("KEY") or "eyJ..."`).
**Learning:** The Supabase `service_role` secret has superuser administrative privileges that completely bypass Row Level Security (RLS). If leaked into a browser bundle or committed to Git, any malicious user can read, overwrite, or truncate the entire database.
**Prevention:**
1. Maintain strict key tier isolation:
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Allowed in browser client components (`"use client"`), strictly governed by RLS.
   - `SUPABASE_SERVICE_ROLE_KEY`: **STRICTLY FORBIDDEN** in any client component. Permitted ONLY in server-side Route Handlers (`src/app/api/...`) and backend ETL scripts (`scripts/`).
2. Never provide hardcoded fallback strings. All credentials must be read exclusively from `.env` via `scripts/env_loader.py` or `process.env`.
3. In CI/CD (GitHub Actions), always use `${{ secrets.VARIABLE_NAME }}` and never echo secrets into workflow run steps.

---

## 2026-10-06 - [Next.js 16 Server Component Boundaries & RLS Enforcement]
**Vulnerability:** Fetching sensitive data directly in client components without RLS or exposing administrative mutation capabilities.
**Learning:** Next.js 16 App Router uses Server Components by default. Server Components should be preferred for data fetching using React Server Components cache or Next.js `revalidate` tags. Client components (`"use client"`) must only be used for interactivity.
**Prevention:**
1. Ensure every table in `supabase/migrations/` has `ENABLE ROW LEVEL SECURITY`.
2. Public `SELECT` is restricted to public commodity prices; all `INSERT`/`UPDATE`/`DELETE` mutations require authenticated admin or service role authorization.
3. Validate and sanitize all incoming payloads on API routes using structured schema validation (e.g., Zod) before database operations.

---

## 2024-05-18 - [Fix information disclosure in production]
**Vulnerability:** The application was leaking potentially sensitive error information to the client in the `/api/chat` and `/api/send-otp` endpoints. Additionally, the OTP generation function was logging the code to the console client-side in the `signup` page.
**Learning:** Returning standard system error messages back directly to the client can lead to unintentional information exposure (e.g. details about environment or unexpected api behaviour). Client-side generated OTPs should never be logged. Note that client side generated OTPs are a structural anti-pattern.
**Prevention:** Implement secure error handling by returning generic error messages in API routes. Avoid `console.log` statements in client-side code, especially those that generate sensitive information.
