# Waitlist API

Server-to-server contract between the StayMate marketing website (Next.js server) and the backend for the pre-launch waitlist. The browser **never** calls the backend waitlist endpoints directly: the website's server (route handler / server action) validates the form, then forwards it with a shared secret.

- Backend module: `backend/src/modules/waitlist/`
- Consent text version constant: `WAITLIST_CONSENT_TEXT_VERSION = '2026-11-v1'` (exported from `backend/src/modules/waitlist/waitlist.constants.ts` and re-exported from `backend/src/app.ts`). Bump it whenever the consent wording changes; the website must show the text matching this version.

## Configuration

| Variable | Where | Notes |
| --- | --- | --- |
| `WAITLIST_INGEST_KEY` | backend env **and** website server env | Optional. Min 32 chars when set (`openssl rand -hex 32`). Never exposed to browsers (no `NEXT_PUBLIC_` prefix). If unset/empty, the public endpoints always return `503 WAITLIST_NOT_CONFIGURED`. |
| `ANALYTICS_HMAC_SECRET` | backend env | Existing secret, reused to HMAC client IPs. |

## Common headers (public endpoints)

| Header | Required | Description |
| --- | --- | --- |
| `X-Waitlist-Key` | yes | Must equal `WAITLIST_INGEST_KEY` (compared in constant time). |
| `X-Client-IP` | recommended | Real visitor IP as seen by the website server. Trusted **only** when `X-Waitlist-Key` is valid and the value is a valid IPv4/IPv6; otherwise `req.ip` is used. Used for rate limiting and (hashed) abuse tracking. |
| `Content-Type` | yes | `application/json` |

## `POST /v1/waitlist`

Request body (strict; unknown fields are rejected):

```json
{
  "name": "Asha Verma",
  "email": "asha@example.com",
  "category": "student",
  "city": "Bengaluru",
  "consent": true
}
```

| Field | Rules |
| --- | --- |
| `name` | trimmed, 2–80 chars, no control characters |
| `email` | trimmed, valid email, max 254 chars |
| `category` | `student` \| `working_professional` \| `property_owner` |
| `city` | optional, trimmed, ≤ 60 chars |
| `consent` | must be literal `true` |

Success (**identical for new, duplicate, and re-registered emails** to prevent enumeration):

```
200 OK
{ "ok": true, "message": "Thanks! If this email can be added, you will hear from us when StayMate launches." }
```

Behaviour on duplicates: an existing active entry is left untouched. If the existing entry had consent withdrawn, consent is re-registered (details updated, `consentWithdrawnAt` cleared) and the same success body is returned.

## `POST /v1/waitlist/unsubscribe`

Withdraws consent by email (the website proxies this from its unsubscribe page; no tokens are stored). Body: `{ "email": "asha@example.com" }` (strict).

```
200 OK
{ "ok": true, "message": "If this email was on the waitlist, it has been removed from future communication." }
```

The response is identical whether or not the email exists.

## Errors

All errors use the standard format:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Input validation failed", "requestId": "req_…", "details": [{ "path": "email", "message": "…" }] } }
```

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Invalid/unknown fields, bad email, `consent !== true`, `$`/`.`/`__proto__` keys |
| 401 | `WAITLIST_UNAUTHORIZED` | Missing or wrong `X-Waitlist-Key` |
| 429 | `WAITLIST_RATE_LIMITED` | Rate limit exceeded (also global `RATE_LIMITED`) |
| 503 | `WAITLIST_NOT_CONFIGURED` | `WAITLIST_INGEST_KEY` not set on the backend |

## Rate limits

- `POST /v1/waitlist`: 10 requests / 10 minutes per client IP.
- `POST /v1/waitlist/unsubscribe`: 10 requests / 10 minutes per client IP (separate bucket).
- Client IP = `X-Client-IP` when the key header is valid, otherwise `req.ip` (so spoofing the header without the key cannot dodge limits).
- The global `/v1` limiter (180 req/min per `req.ip`) also applies; the website server's egress IP therefore shares that bucket.

## Admin endpoints (JWT, role `admin` only)

Moderators are intentionally excluded because the data is personal.

- `GET /v1/admin/waitlist?page=1&limit=50&includeWithdrawn=false` → `{ items: [{ id, name, email, category, city, source, status: 'active'|'withdrawn', consentAt, consentTextVersion, consentWithdrawnAt, createdAt }], page, limit, total }`. `limit` ≤ 100. `ipHash` is never returned.
- `GET /v1/admin/waitlist/export.csv?includeWithdrawn=false` → `text/csv`, `Content-Disposition: attachment; filename="staymate-waitlist-YYYYMMDD.csv"`, `Cache-Control: no-store`. Columns: `name,email,category,city,source,consent_at,consent_text_version,created_at` (+ `status,consent_withdrawn_at` when `includeWithdrawn=true`). Withdrawn entries are excluded by default. Every cell is quoted; cells starting with `= + - @ TAB CR` are prefixed with `'` (CSV/formula-injection defence). Each export writes an `AuditLog` entry (`action: waitlist_export`, `targetType: system`, `targetId: waitlist`, metadata `{ rowCount, includeWithdrawn }`). Capped at 50,000 rows.

## Data stored (`WaitlistEntry`)

`name`, `emailNormalized` (unique), `emailDisplay`, `category`, `city?`, `consent { granted: true, at, textVersion }`, `consentWithdrawnAt?`, `ipHash` (HMAC-SHA256 of client IP with `ANALYTICS_HMAC_SECRET`; the raw IP is never stored or logged), `source` (`website`), `createdAt`, `updatedAt`. No public route reads these records.

## DPDP notes

- **Data minimization:** only name, email, category, optional city, consent evidence, and a keyed IP hash for abuse control.
- **Consent evidence:** timestamp and consent-text version are stored per entry.
- **Withdrawal:** email-based unsubscribe sets `consentWithdrawnAt`; withdrawn entries are excluded from exports by default and must not be contacted.
- **Retention:** TBD by the founder (suggested: purge withdrawn entries and all entries after launch communications are complete). Until decided, a manual deletion process is required to honour erasure requests.
