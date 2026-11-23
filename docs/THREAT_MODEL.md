# Threat Model — StayMate Early-Access Registration

## 1. Scope & Objective

Protect personal data submitted via StayMate's pre-launch early-access registration flow (`POST /api/early-access`, `POST /api/early-access/unsubscribe`, Upstash Redis, Google Apps Script `Code.gs`, Google Sheets `StayMate_Early_Access_Database`, and Google `MailApp`) against unauthorized access, abuse, tampering, and accidental leaks.

---

## 2. Critical Assets

| Asset ID | Asset Description | Confidentiality / Integrity Impact |
| --- | --- | --- |
| **A1** | Registrant PII (`Full_Name`, `Email`, `User_Type`, `Preferred_City`, consent records) in `StayMate_Early_Access_Database` | High — unauthorized access causes spam/phishing harm and DPDP Act violations. |
| **A2** | Shared `STAYMATE_HMAC_SECRET` / `SHARED_SECRET` (>= 256-bit key) | Critical — compromise allows forging authenticated writes directly to `Code.gs`. |
| **A3** | `UPSTASH_REDIS_REST_TOKEN` & `STAYMATE_APPS_SCRIPT_URL` | High — exposure allows Redis DoS/evasion or direct endpoint flooding. |
| **A4** | Google account `MailApp` sending reputation & daily email quota | Medium/High — quota exhaustion blocks genuine confirmation emails. |
| **A5** | Spreadsheet data integrity & administrator workstation Excel/Sheets opening safety | High — formula injection can trick admins opening exported CSVs/sheets. |

---

## 3. Threat Actors

- **Automated Spambots / Scrapers:** Flooding forms with junk/disposable emails to exhaust `MailApp` quotas or pollute the database.
- **Malicious External Callers:** Attackers invoking the Vercel API from unauthorized origins, oversized bodies, or spoofing `X-Forwarded-For` headers.
- **Direct Endpoint Attackers:** Adversaries discovering the Google Apps Script `/exec` URL and replaying captured requests or tampering with parameters.
- **Script / Formula Injection Attackers:** Submitting HTML payloads (`<script>`, `<img onerror=...>`) or spreadsheet formulas (`=CMD(...)`, `=HYPERLINK(...)`, `+...`).
- **Curious/Malicious Concurrent Submitters:** Triggering race conditions to insert duplicate rows or trigger repeated confirmation emails.

---

## 4. Trust Boundaries

1. **TB-1 (Public Internet → Vercel Serverless Edge):** Zero trust. All headers, body content, and client-side timings are attacker-controlled. Only edge-normalized proxy IP (`x-vercel-forwarded-for`) and cryptographic origin validation are trusted.
2. **TB-2 (Vercel Serverless → Upstash Redis):** Authenticated HTTPS REST bearer token; only HMAC-keyed identifier hashes cross TB-2 (no plaintext IPs or emails stored).
3. **TB-3 (Vercel Serverless → Google Apps Script Web App):** Cross-cloud HTTPS (`script.google.com`). Protected by `HMAC-SHA256(secret, timestamp + "." + nonce + "." + data)` + 5-minute window + nonces.
4. **TB-4 (Apps Script → Private Google Sheet / MailApp):** Protected via Google IAM (`Execute as: Me` on a `Restricted` sheet) and internal lock serialization (`LockService`).

---

## 5. Attack Scenarios, Mitigations & Residual Risks

| Attack Scenario | Mitigation Controls | Residual Risk & Monitoring |
| --- | --- | --- |
| **S1: Bot flood / Quota exhaustion** | Fail-closed Upstash IP limit (`5 / 10m`) + email limit (`3 / 1h`), honeypot field absorption, `EARLY_ACCESS_ENABLED=false` kill switch. | Distributed residential proxy botnets spreading single attempts across distinct emails could slowly consume `MailApp` quota; monitor Sheets growth + quota via `checkSetupStatus()`. |
| **S2: Direct replay of signed envelope against `/exec`** | Envelope rejects timestamps older than `5m` or `>30s` ahead; `LockService` + `CacheService` checks and reserves nonce (`360s` TTL). | Because `CacheService` is not durable/transactional across unexpected cache eviction, an ultra-rare eviction could fail to block a second replay within the 5-minute window. |
| **S3: Cross-site request forgery (CSRF)** | Requires `Content-Type: application/json`, blocks `Sec-Fetch-Site: cross-site`, enforces `Origin` match against `STAYMATE_ALLOWED_ORIGIN`. | Compromised browser extension on the legitimate origin acts within same origin. |
| **S4: CSV / Spreadsheet Formula Injection** | Vercel regex rejects leading symbols/brackets (`= + - @ < >`); `Code.gs` runs `sanitizeSpreadsheetCell_()` prepending `'` and sets cell plain-text format `@`. | Admins manually editing sheets or opening raw exports should still avoid blindly enabling external macros. |
| **S5: Email HTML XSS / Phishing** | User confirmation and admin notification templates escape every user field (`escapeHtml_`), validate categories against fixed allowlist, and omit untrusted links. | Email client rendering differences mitigated by standard inline-CSS tables. |
| **S6: Email Enumeration** | `/unsubscribe` strictly answers identically for registered/unknown addresses. Registration displays duplicate message per UX spec without exposing `Registration_ID`, gated behind rate limits + origin checks. | Rate-limited probing on registration endpoint can still test up to 5 emails per 10m per IP (deliberate product UX trade-off documented per Section 9 duplicate notice requirement). |
| **S7: Concurrent submission race** | Client double-submit lock + server `LockService.getScriptLock()` (`15s`) serializing duplicate check & row write. | If Apps Script contention exceeds 15s, caller receives `503 SERVICE_BUSY` cleanly with zero partial writes. |
| **S8: Upstash outage causing unthrottled spam** | `upstash-limit.ts` checks missing config, catches exceptions, and explicitly treats `reason === "timeout"` as unavailable -> returns `503` (fail closed). | Legitimate users cannot register while Upstash Redis is down (intentional safety preference over unthrottled quota burn). |
