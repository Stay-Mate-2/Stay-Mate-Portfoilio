# StayMate Early-Access Security Controls & Limitations

StayMate follows defense-in-depth engineering principles. **No system can claim absolute security**; every layer is designed to fail closed on missing configuration and isolate personal data from public exposure.

---

## 1. Security Control Matrix

| Requirement | Implemented Control | Code / Layer |
| --- | --- | --- |
| **A. Injection Attacks** | Strict Zod regex allowlists reject control chars and markup; Apps Script re-validates independently. | `schema.ts`, `Code.gs` |
| **B. XSS / Output Safety** | CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`) in Next.js config; no HTML rendered from user fields; HTML escaping in emails. | `next.config.ts`, `Code.gs` |
| **C. CSRF / Origin Abuse** | Explicit `Content-Type: application/json`, mandatory `Origin` header verified against `STAYMATE_ALLOWED_ORIGIN`, and `Sec-Fetch-Site: cross-site` rejection. | `api-guard.ts`, `handlers.ts` |
| **D. Replay Attacks** | Envelope includes millisecond `timestamp` (`<= 5 min` past, `<= 30 s` future skew) and 192-bit random hex `nonce` reserved inside `LockService` + `CacheService`. | `hmac.ts`, `Code.gs` |
| **E. Brute Force & Spam** | Fail-closed Upstash sliding-window rate limits per HMAC-hashed IP (`5 / 10m`) and email (`3 / 1h`), honeypot field absorption, and min-fill-time check. | `upstash-limit.ts`, `EarlyAccess.tsx` |
| **F. Email Enumeration** | `/api/early-access/unsubscribe` always returns generic success; registration duplicate UX withholds `Registration_ID` and any stored details while protected by Upstash limits. | `handlers.ts`, `Code.gs` |
| **G. Unauthorized Requests** | Non-POST HTTP methods return `405`; Apps Script `doGet` rejects reads; all `doPost` calls require HMAC-SHA256 signature. | `route.ts`, `Code.gs` |
| **H. Duplicate Submissions** | Case-insensitive duplicate check under `LockService.getScriptLock()`, front-end synchronous double-submit lock (`submittingLock`), and disabled form state while submitting. | `EarlyAccess.tsx`, `Code.gs` |
| **I. Formula Injection** | Vercel API rejects `= + - @` leading characters cleanly via regex; `Code.gs` also runs `sanitizeSpreadsheetCell_()` prefixing `= + - @ \t \r` with `'` and enforces plain-text cell number format (`@`). | `schema.ts`, `Code.gs` |
| **J. Email HTML & Header Injection** | Every interpolated value in confirmation and admin HTML emails passes through `escapeHtml_()`. Subject lines contain only non-free-text validated category & generated ID through `safeSubject_()`. | `Code.gs` |
| **K. Secret Exposure** | Secrets stay strictly server-side (`STAYMATE_*`, `UPSTASH_*`, `EARLY_ACCESS_ENABLED`) with runtime `window` checks and zero `NEXT_PUBLIC_` prefixes. `Code.gs` reads only `ScriptProperties`. | `config.ts`, `Code.gs`, `.env.example` |
| **L. Information Leakage** | Errors return static user-safe codes (`UPSTREAM_UNAVAILABLE`, `NOT_CONFIGURED`) without stack traces or env names; logs contain event codes only—never names, emails, or IPs. | `handlers.ts`, `Code.gs` |
| **M. Oversized Requests** | `Content-Length` pre-check plus chunk-by-chunk streaming byte cap (`<= 4096` B) cancels reading immediately with `413 PAYLOAD_TOO_LARGE`. | `api-guard.ts` |
| **N. Rate-Limit Bypass** | Extracts IP from Vercel trusted proxy header (`x-vercel-forwarded-for`), never blindly disables Redis on errors/timeouts (checks `reason === "timeout"` -> fail closed `503`). | `api-guard.ts`, `upstash-limit.ts` |
| **O. Concurrent Writes** | Apps Script acquires `LockService.getScriptLock()` (`15s`) before nonce check, email duplicate scan, and row append. | `Code.gs` |
| **P. Misconfigured Access** | Google Sheet remains Restricted (`SPREADSHEET_ID` only accessible via `Execute as: Me`), never published; Apps Script retry functions (`retryFailedEmails`) have no HTTP endpoint. | `Code.gs`, `EARLY_ACCESS_SETUP.md` |

---

## 2. Explicit Platform Limitations & Residual Risks

1. **Google Apps Script Web App "Anyone" Access Model:** Google Apps Script Web Apps do not support custom static OAuth tokens for anonymous Vercel serverless callers without interactive user auth, so the deployment sets access to *Anyone*. Authentication relies strictly on the HMAC-SHA256 signature (`>= 256`-bit `SHARED_SECRET`). **Mitigation:** Rotate `SHARED_SECRET` quarterly or on suspected exposure; never expose the `/exec` URL or secret publicly.
2. **Non-Durable Replay Cache (`CacheService`):** Apps Script's `CacheService.getScriptCache()` is short-lived and subject to Google infrastructure eviction (not globally ACID transactional across multi-region anomalies). Keeping the request timestamp validity window tight (`5 minutes` + `360s` cache TTL) limits exposure. Upgrading later to atomic Redis nonce storage (`SET NX EX`) on Vercel/backend or Cloud Run is recommended if traffic grows dramatically.
3. **Google Daily Quotas (`MailApp` on `staymate2@gmail.com`):** Consumer `@gmail.com` accounts are capped at ~100 recipients/day (~50 new signups/day with confirmation + admin notification emails; Google Workspace accounts ~1,500/day). Protect `staymate2@gmail.com` with 2-Step Verification (2FA). Registrations are written to Google Sheets *before* `MailApp` executes, email failures are flagged `FAILED` rather than rolled back, and owners can recover queued emails safely via `retryFailedEmails()`.
4. **In-Browser Prototype Security Headers (`'unsafe-inline'` CSP):** Static Next.js hydration scripts currently necessitate `'unsafe-inline'` for `script-src` / `style-src` on static assets; however, user registration inputs are never reflected into DOM HTML.
5. **Dev Dependency Audit Note (`vitest` / `tinypool`):** Production runtime dependencies (`next`, `react`, `zod`, `@upstash/ratelimit`, `@upstash/redis`, `lucide-react`) ship cleanly, while `vitest` (`3.2.x`) pulls `devDependency` `tinypool` / `@vitest/mocker` flagged in `npm audit` (strictly test-runner tooling—excluded from production Vercel runtime bundles).
