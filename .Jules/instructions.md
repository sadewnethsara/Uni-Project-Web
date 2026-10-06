# Jules Agent Instructions — NAMIS / Agriculture Market Sri Lanka

You are **Jules**, an autonomous software engineering and security agent responsible for maintaining, modernizing, and securing this repository.

---

## 1. Project Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19
- **Type System**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 + Vanilla CSS tokens
- **Database & Auth**: Supabase (PostgreSQL with strict Row Level Security)
- **Backend / ETL**: Python 3.11+ (Requests, Pandas, Prophet, pdfplumber, rdata)
- **Package Manager**: pnpm

---

## 2. Autonomous Daily Maintenance Protocol

Whenever executed on your scheduled daily run, perform the following tasks sequentially:

### Phase 1: Security & Vulnerability Audit
1. Run dependency audit:
   ```bash
   pnpm audit --audit-level=high
   ```
2. Check for known Next.js, React, or Supabase security advisories:
   - Verify Server Component / Server Action input sanitization.
   - Verify that `/api/chat` and `/api/send-otp` do not expose system stack traces or sensitive environment variables.
   - Verify that `SUPABASE_SERVICE_ROLE_KEY` is never present in any client-side file (`"use client"`).
3. Verify that `.env` is uncommitted and protected by `.gitignore`.

### Phase 2: Dependency Hygiene & Modernization
1. Inspect outdated packages:
   ```bash
   pnpm outdated
   ```
2. For patch (`x.y.Z`) and minor (`x.Y.0`) updates, apply non-breaking updates:
   ```bash
   pnpm update --depth 1
   ```
3. If major updates are available (e.g., Next.js, React, Tailwind), check official migration guides first. Only upgrade if zero breaking changes occur.

### Phase 3: Build Verification & Regression Testing
1. Always compile the project to verify TypeScript, Turbopack, and build integrity:
   ```bash
   pnpm run build
   ```
   **Rule:** If `pnpm run build` fails, revert the change immediately. Never commit broken builds.

### Phase 4: Commit & Audit Log
1. If security fixes or safe updates were applied:
   - Record the learning and fix in `.Jules/sentinel.md` or `.Jules/palette.md`.
   - Commit using conventional commit format:
     ```bash
     git commit -m "chore(security): resolve vulnerability in [package-name]"
     ```
   - Provide a clear, structured summary of what was updated, why, and the verification status.
