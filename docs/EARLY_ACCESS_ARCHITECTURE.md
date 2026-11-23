# StayMate Early-Access Registration — System Architecture

## 1. Overview

StayMate's early-access registration system connects the existing pre-launch Next.js App Router marketing website hosted on Vercel to a private Google Sheets datastore (`StayMate_Early_Access_Database`) managed by a hardened Google Apps Script Web App (`google-apps-script/Code.gs`), protected by Upstash Redis distributed rate limiting and HMAC-SHA256 request authentication.

---

## 2. End-to-End Request Architecture

```mermaid
flowchart LR
  U["Visitor Browser<br/>#early-access & /unsubscribe"] -->|"HTTPS POST JSON<br/>Origin + Sec-Fetch-Site"| V["Vercel Next.js App Router<br/>POST /api/early-access<br/>POST /api/early-access/unsubscribe"]
  V -->|"Check EARLY_ACCESS_ENABLED<br/>Schema + Origin + Size Cap"| G["API Security Guard<br/>src/lib/early-access/handlers.ts"]
  G -->|"Fail-Closed Sliding Window<br/>HMAC-Hashed IP + Email Keys"| R[("Upstash Redis<br/>@upstash/ratelimit")]
  G -->|"HMAC-SHA256 Envelope<br/>timestamp.nonce.dataString"| A["Google Apps Script Web App<br/>google-apps-script/Code.gs"]
  A -->|"Verify HMAC + Clock Skew<br/>LockService + CacheService Nonce"| S[("Private Google Sheet<br/>StayMate_Early_Access_Database<br/>Tab: Registrations")]
  A -->|"Transactional User Email &<br/>Admin Notification"| M["Google MailApp"]
```

---

## 3. Registration & Failure-Safe Write Sequence

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser Form
  participant V as Vercel Route (/api/early-access)
  participant U as Upstash Redis
  participant G as Apps Script (Code.gs)
  participant S as Google Sheets (Registrations)
  participant E as MailApp

  B->>V: POST JSON { name, email, userType, city, consent, marketingConsent, honeypot }
  V->>V: Validate Content-Type, Origin, EARLY_ACCESS_ENABLED, Env Config
  V->>U: Check IP Rate Limit (hashed IP, fail-closed on missing/error/timeout)
  U-->>V: Allowed / Rate-Limited / Unavailable
  V->>V: Stream Body <= 4096 B, Absorb Honeypot, Zod Validate, Email Rate Limit
  V->>V: Build Signing String: timestamp + "." + nonce + "." + JSON.stringify(payload)
  V->>G: POST { timestamp, nonce, data, signature } (10s AbortSignal timeout)
  G->>G: Reject oversized / stale (>5m) / future (>30s) / bad HMAC
  G->>S: Acquire LockService -> Reserve Nonce in CacheService -> Check Duplicate Email
  alt Existing Email Found
    G-->>V: { ok: true, status: "duplicate" }
    V-->>B: 200 "This email is already registered with StayMate."
  else New Registration
    G->>S: Append Row First (Email Statuses = "PENDING", Formula-Safe Escaping)
    G->>E: Send Transactional User Confirmation (HTML-Escaped)
    G->>E: Send Admin Notification (HTML-Escaped)
    G->>S: Update Cols 10-11 ("SENT" or "FAILED")
    G-->>V: { ok: true, status: "registered", registrationId }
    V-->>B: 201 "You're on the list! Your StayMate early-access registration..."
  end
```

---

## 4. Component Map

| Layer | Responsibility | Implementation Location |
| --- | --- | --- |
| **UI & Consent Separation** | Preserves visual design, renders closed-flag gate, collects registration + separate optional marketing consent, handles duplicate/success/error states while preserving input values. | [`src/components/sections/EarlyAccess.tsx`](../src/components/sections/EarlyAccess.tsx), [`src/app/page.tsx`](../src/app/page.tsx) |
| **Consent Withdrawal UI** | Allows registered users to withdraw optional marketing consent cleanly via email. | [`src/components/UnsubscribeForm.tsx`](../src/components/UnsubscribeForm.tsx), [`src/app/unsubscribe/page.tsx`](../src/app/unsubscribe/page.tsx) |
| **Server Endpoints** | Strictly `POST`-only Next.js Route Handlers with `force-dynamic`, security headers, and `no-store` responses. | [`src/app/api/early-access/route.ts`](../src/app/api/early-access/route.ts), [`src/app/api/early-access/unsubscribe/route.ts`](../src/app/api/early-access/unsubscribe/route.ts) |
| **Validation, Config & Crypto** | Zod allowlists, fail-closed server config (`EARLY_ACCESS_ENABLED`), HMAC-SHA256 envelope signing, trusted Vercel proxy IP extraction, bounded streaming body reader. | [`src/lib/early-access/schema.ts`](../src/lib/early-access/schema.ts), [`src/lib/early-access/config.ts`](../src/lib/early-access/config.ts), [`src/lib/early-access/hmac.ts`](../src/lib/early-access/hmac.ts), [`src/lib/api-guard.ts`](../src/lib/api-guard.ts) |
| **Distributed Abuse Defense** | Upstash Redis sliding-window rate limits keyed by keyed HMAC hashes (`5 / 10m` per IP, `3 / 1h` per email); strictly fails closed on missing config or timeouts. | [`src/lib/early-access/upstash-limit.ts`](../src/lib/early-access/upstash-limit.ts) |
| **Database & Mail Processing** | Independently validates inputs, verifies HMAC & nonces, serializes writes under `LockService`, neutralizes formulas, writes 12-column schema, sends responsive HTML emails, tracks status, provides owner-only `retryFailedEmails()`. | [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) |

---

## 5. Google Sheets Schema (`StayMate_Early_Access_Database` -> `Registrations`)

1. `Registration_ID` — Unique `SM-XXXXXXXXXX` identifier.
2. `Full_Name` — Formula-sanitized trimmed full name.
3. `Email` — Normalized lowercase email (`3–254` chars).
4. `User_Type` — Allowlisted category (`Student`, `Working Professional`, or `Property Owner`).
5. `Preferred_City` — Optional sanitized city string.
6. `Marketing_Consent` — Explicit boolean (`true` only if optional marketing box was checked).
7. `Consent_Timestamp` — ISO UTC timestamp of opt-in, empty if not opted in, or `"Withdrawn <ISO>"` after unsubscribe.
8. `Registered_At` — ISO UTC timestamp of row creation.
9. `Registration_Status` — `REGISTERED`.
10. `Confirmation_Email_Status` — `PENDING` -> `SENT` or `FAILED`.
11. `Admin_Notification_Status` — `PENDING` -> `SENT` or `FAILED`.
12. `Source` — Static server source marker (`staymate-website`).
