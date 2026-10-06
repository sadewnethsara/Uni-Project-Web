# Jules Daily Scheduled Task Prompt

Copy and use this prompt for your daily scheduled Jules task:

---

```markdown
Run the daily security and technology modernization audit for NAMIS (Agriculture Market Sri Lanka) following the guidelines in `.Jules/instructions.md`, `AGENTS.md`, and `.agents/rules/security.md`.

### Execution Steps:
1. **Security Vulnerability Audit**:
   - Run `pnpm audit` to identify any CVEs or high/critical vulnerabilities in dependencies.
   - Audit `src/app/api/` routes for input sanitization, rate limiting, and safe error masking.
   - Scan working directory to ensure ZERO secrets (JWTs, `SUPABASE_SERVICE_ROLE_KEY`, API tokens) are committed or hardcoded.
   - Verify that `SUPABASE_SERVICE_ROLE_KEY` is completely isolated to server routes and backend scripts, never in client components.

2. **Technology & Dependency Health**:
   - Check `pnpm outdated` for patch and minor updates to Next.js 16, React 19, Tailwind CSS v4, and Supabase.
   - Review recent Next.js and React security advisories / release notes for deprecations or performance improvements.
   - Safely update compatible patch/minor packages.

3. **Software Engineering & Build Verification**:
   - Run `pnpm run build` to verify Turbopack compilation and strict TypeScript typechecking.
   - If any errors occur, fix them or roll back the update. Never push a failing build.

4. **Audit Logging & Commit**:
   - If security vulnerabilities were patched or dependencies updated, append an entry to `.Jules/sentinel.md` detailing the vulnerability, learning, and prevention.
   - Commit verified changes with a clean conventional commit message (e.g. `chore(deps): update [pkg] and patch vulnerability`).
   - If no updates or vulnerabilities were found, report: "Repository is fully up to date, secure, and building cleanly."
```
