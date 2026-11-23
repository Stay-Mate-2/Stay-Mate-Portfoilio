# Early-Access Registration Testing & Verification Strategy

## 1. Automated Verification (`vitest run`)

Automated tests live in [`src/app/api/early-access/early-access.test.ts`](../src/app/api/early-access/early-access.test.ts) and execute both:
1. Real Next.js `NextRequest` route handlers (`POST /api/early-access`, `POST /api/early-access/unsubscribe`, `GET`/`DELETE` `405` checks).
2. The real [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) source file executed directly inside a Node `vm` sandbox backed by Node's `crypto.createHmac("sha256")` (matching Apps Script UTF-8 byte array output) and in-memory Google Workspace service doubles (`SpreadsheetApp`, `LockService`, `CacheService`, `PropertiesService`, `MailApp`).

> **Scope Honesty:** Because Google's hosted Apps Script / Gmail servers are external to local CI, automated Vitest runs validate the exact `Code.gs` JavaScript execution against in-memory Google API doubles and real cryptographic HMAC signatures. Live Google Sheets / `MailApp` quota / Upstash Redis connectivity must additionally pass manual smoke testing (see Section 3) prior to toggling `EARLY_ACCESS_ENABLED=true`.

---

## 2. All 25 Security & Functional Scenarios Tested

| # | Scenario | Verified Mechanism | Expected Result |
| --- | --- | --- | --- |
| 1 | **Valid registration** | `POST /api/early-access` -> signed envelope -> `Code.gs` | HTTP `201`, row stored (`SM-XXXXXXXXXX`), both emails marked `SENT`, zero PII logged |
| 2 | **Invalid email** | Zod email schema + independent `Code.gs` check | HTTP `400 VALIDATION_ERROR` |
| 3 | **Missing name** | Zod min-length `2` + `Code.gs` length guard | HTTP `400 VALIDATION_ERROR` |
| 4 | **Invalid user category** | Strict allowlist `Student \| Working Professional \| Property Owner` | HTTP `400 VALIDATION_ERROR` |
| 5 | **Missing consent** | Strict `z.literal(true)` check on `consent` | HTTP `400 VALIDATION_ERROR` |
| 6 | **Invalid consent type** | Rejects strings/numbers (`"true"`, `1`) | HTTP `400 VALIDATION_ERROR` |
| 7 | **Optional city** | Omitted or blank `city` | HTTP `201`, stored as empty string |
| 8 | **Duplicate registration** | Case-insensitive sheet check inside `LockService` | HTTP `200`, `"This email is already registered with StayMate."`, 0 extra rows/emails |
| 9 | **Invalid HMAC** | Tampered `signature` rejected via constant-time compare | `Code.gs` returns `INVALID_SIGNATURE` |
| 10 | **Expired timestamp / skew** | Past `> 5m` or future `> 30s` timestamps rejected | `Code.gs` returns `REQUEST_EXPIRED` / `INVALID_FUTURE_TIMESTAMP` |
| 11 | **Replayed nonce** | Same envelope submitted twice within cache TTL | `Code.gs` returns `REPLAYED_NONCE` |
| 12 | **Invalid origin** | Missing, mismatched `Origin`, or `Sec-Fetch-Site: cross-site` | HTTP `403 FORBIDDEN` |
| 13 | **Honeypot submission** | Non-empty `honeypot` field | Silent HTTP `200`, zero calls to Upstash email limiter or Apps Script |
| 14 | **Rate-limit violation** | IP & email sliding windows triggered | HTTP `429 RATE_LIMITED` + `Retry-After` header |
| 15 | **Missing secrets** | Unset/short `STAYMATE_HMAC_SECRET` / `STAYMATE_APPS_SCRIPT_URL` | Fails closed HTTP `503 NOT_CONFIGURED` |
| 16 | **Missing / failing Redis** | Unset Upstash env, thrown error, or `reason === "timeout"` | Fails closed HTTP `503` (never silently allows unthrottled requests) |
| 17 | **Apps Script timeout** | `AbortSignal` `TimeoutError` simulated | HTTP `504 UPSTREAM_TIMEOUT` |
| 18 | **Apps Script failure** | Network exception or non-JSON upstream output | HTTP `502 UPSTREAM_UNAVAILABLE` |
| 19 | **User email delivery failure** | `MailApp` throws on user email | Row still saved (`FAILED` / `SENT`); `retryFailedEmails()` sends missing mail cleanly |
| 20 | **Admin email delivery failure** | `MailApp` throws on admin alert | Row still saved (`SENT` / `FAILED`) without losing registrant |
| 21 | **Concurrent submissions** | Contended `LockService.tryLock` failure | `Code.gs` returns `SERVICE_BUSY`; no partial/corrupt row |
| 22 | **Registration disabled** | `EARLY_ACCESS_ENABLED=false` | HTTP `503 EARLY_ACCESS_DISABLED`, UI locked, zero external calls |
| 23 | **Malicious HTML input** | `<script>` / `<img onerror=...>` | Blocked HTTP `400` at Vercel API + HTML-escaped (`&lt;img...&gt;`) inside `Code.gs` |
| 24 | **Formula injection** | `=CMD(...)`, `=HYPERLINK(...)` | Blocked HTTP `400` at Vercel API + `'` prefixed (`'=HYPERLINK...`) inside `Code.gs` |
| 25 | **Oversized request** | Payload exceeding `4096` bytes | Rejected streaming reader HTTP `413 PAYLOAD_TOO_LARGE` |

Additionally, automated tests verify `GET` / `DELETE` returning `405`, separated transactional vs. optional `marketingConsent`, and non-enumerating `POST /api/early-access/unsubscribe`.

---

## 3. Running Checks Locally

```bash
npm run check               # Runs eslint, tsc --noEmit, vitest run, and next build
npm audit --omit=dev        # Checks runtime dependencies
```

---

## 4. Manual Pre-Launch Staging Checklist

Before toggling `EARLY_ACCESS_ENABLED=true` in Production Vercel:

1. Verify `Code.gs` `initializeDatabase()` and `checkSetupStatus()` execute cleanly in Apps Script.
2. Confirm Google Sheet permissions remain **Restricted**.
3. Run 1 dummy registration (`test+verify@...`) against Preview/Production with all 6 env vars configured: confirm row lands in `Registrations`, confirmation & admin emails arrive in Gmail, duplicate resubmit returns duplicate UX without duplicate email, and `/unsubscribe` flips `Marketing_Consent` to `FALSE`.
4. Delete the dummy test row and verify `mail` quotas remain healthy before opening traffic.
