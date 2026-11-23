# Data Retention, Consent & Backup Policy — StayMate Early Access

## 1. Data Minimization & Collected Columns

The `StayMate_Early_Access_Database -> Registrations` sheet collects strictly minimal pre-launch registration fields:

- `Registration_ID`, `Full_Name`, `Email`, `User_Type`, `Preferred_City` (optional), `Marketing_Consent`, `Consent_Timestamp`, `Registered_At`, `Registration_Status`, `Confirmation_Email_Status`, `Admin_Notification_Status`, `Source`.
- **Prohibited Fields:** Passwords, government IDs (Aadhaar/PAN), financial/bank details, phone numbers, and precise street addresses are **never collected**.

Upstash Redis retains keyed HMAC hashes (`32`-char truncated digest of IP / normalized email) strictly inside short sliding windows (`10 minutes` for IP limits, `1 hour` for email limits) before keys automatically expire. Raw IPs are never saved to Google Sheets.

---

## 2. Consent Separation Rules

1. **Transactional Registration Consent (`consent: true`):** Required to record the early-access request and dispatch the single confirmation email referencing the user's `Registration_ID`.
2. **Optional Marketing Consent (`marketingConsent` -> Column `Marketing_Consent`):** Unchecked by default (`false`). Promotional/launch update campaigns **must filter strictly on `Marketing_Consent === TRUE`**. Never email rows where `Marketing_Consent` is `FALSE` or `Consent_Timestamp` begins with `Withdrawn`.

---

## 3. Access Control

- The Google Sheet must stay **Restricted** (`General access: Restricted`) inside the dedicated StayMate admin Google account.
- Enable **2-Step Verification (2FA / Hardware passkey)** on the Google, Vercel, GitHub, and Upstash accounts managing these credentials.
- Never share `.csv` exports on public drives or unencrypted messaging tools.

---

## 4. Retention Schedule & User Rights

- **Retention Window:** Records are kept for pre-launch cohort onboarding and retained no longer than **12 months** following initial product rollout (unless the user converts to an authenticated app user under the app's privacy policy, or withdraws/requests erasure earlier).
- **Marketing Consent Withdrawal (`/unsubscribe`):** Automated operational flow updates `Marketing_Consent` to `FALSE` and records `Withdrawn <ISO timestamp>` in `Consent_Timestamp`.
- **Access & Deletion Requests:** Once the official contact email is published (`NEXT_PUBLIC_CONTACT_EMAIL`), requests sent from the registered email address are fulfilled within **15 days** by locating and permanently deleting the corresponding row from `Registrations` (and any local admin exports).

---

## 5. Backups & Restoration

1. Weekly or pre-launch export: **File -> Download -> Microsoft Excel (.xlsx)** or encrypted archive stored in a restricted admin vault (avoid keeping plaintext CSVs unattended on shared computers).
2. Leverage Google Sheets **Version history** (**File -> Version history**) to recover from accidental admin edits without re-importing externally.
3. Because `SPREADSHEET_ID` is decoupled via Apps Script Properties, restoring a backup sheet requires only updating `SPREADSHEET_ID` in Project Settings if a clean sheet copy is promoted.
