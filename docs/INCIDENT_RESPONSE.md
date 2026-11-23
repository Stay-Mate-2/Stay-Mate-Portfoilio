# Incident Response & Operational Recovery — StayMate Early Access

## 1. Emergency Registration Kill Switch (< 60 Seconds)

If bot abuse, compromised credentials, abnormal quota burn, or suspicious traffic is detected:

1. Open **Vercel Dashboard -> Project -> Settings -> Environment Variables**.
2. Set `EARLY_ACCESS_ENABLED` to `false` (for **Production** and **Preview**).
3. Click **Save** and trigger **Redeploy** (or promote rollback deployment).
4. **Effect:** Both UI submission and `POST /api/early-access` immediately block all traffic with HTTP `503 EARLY_ACCESS_DISABLED` prior to touching Upstash Redis or Google Apps Script.

If deeper isolation at the Google Apps Script layer is required:
1. Open **Extensions -> Apps Script -> Deploy -> Manage deployments**.
2. Archive the active Web App deployment (immediately invalidating the `/exec` endpoint externally).

---

## 2. Secret Rotation Procedure

### A. Rotating `STAYMATE_HMAC_SECRET` / `SHARED_SECRET`
1. Generate a fresh 256-bit key: `openssl rand -hex 32`.
2. During low traffic (or with `EARLY_ACCESS_ENABLED=false` during a brief maintenance window):
   - Update `SHARED_SECRET` in **Apps Script -> Project Settings -> Script Properties**.
   - Update `STAYMATE_HMAC_SECRET` in **Vercel Environment Variables** and redeploy.
3. Re-enable `EARLY_ACCESS_ENABLED=true` after confirming a dummy test submission succeeds.

### B. Rotating Upstash Redis Credentials
1. In Upstash Console -> Database Details -> Reset/rotate REST token (or provision a replacement database).
2. Update `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in Vercel and redeploy. Note: Vercel rate limits automatically fail closed during propagation (`503`), preventing unthrottled bypass.

---

## 3. Failed Email & Quota Failure Recovery

### Scenario A: Registration Saved, Confirmation or Admin Email Failed (`FAILED` / `PENDING`)
- `Code.gs` writes every validated row to `Registrations` **before** calling `MailApp.sendEmail()`, ensuring registrations are **never deleted** when `MailApp` throws or daily quota hits `0`.
- **Authorized Recovery Steps:**
  1. Wait for Google's daily `MailApp` quota reset (every 24h) or verify `MailApp.getRemainingDailyQuota()` via `checkSetupStatus()`.
  2. Open `StayMate_Early_Access_Database` (restricted spreadsheet) and click **StayMate Admin -> Retry Failed Emails** (or run `retryFailedEmails()` directly in Apps Script Editor).
  3. Only rows marked `FAILED` or `PENDING` are retried; rows already `SENT` are never emailed twice.
  4. Never deploy or expose `retryFailedEmails` over HTTP.

### Scenario B: Vercel Timed Out (`504 UPSTREAM_TIMEOUT`) After Apps Script Saved
- If the registrant clicks Submit again, Apps Script acquires `LockService`, detects their existing email cleanly, skips duplicate row creation, skips duplicate confirmation email, and returns `"This email is already registered with StayMate."`.

### Scenario C: Upstash Redis Unavailable
- The API rejects submissions with HTTP `503 RATE_LIMIT_UNAVAILABLE` rather than failing open. Verify Upstash status at [status.upstash.com](https://status.upstash.com) before taking action; traffic resumes automatically once Redis recovers.

---

## 4. Log & Audit Inspection

- Check **Vercel -> Logs -> Functions (`/api/early-access`)** for spikes in HTTP `403` (Origin attacks), `413` (oversized floods), `429` (rate limit), or `503`/`504`.
- Check **Apps Script -> Executions** for `AUTH_REJECTED`, `REPLAY_BLOCKED`, or `USER_EMAIL_FAILED` JSON codes. By design, neither Vercel handlers nor `Code.gs` write names, emails, or cities into logs.
