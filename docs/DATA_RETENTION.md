# Data Retention, Consent & Backup Policy — StayMate Early Access

## 1. Data Minimization & Collected Columns

The embedded StayMate Early Access Google Form collects only minimal pre-launch registration fields into the private Google Sheet (`StayMate_Early_Access_Database`):

- `Timestamp` (recorded automatically by Google Forms)
- `Email Address` (used for confirmation receipts & cohort communication)
- `Full Name`
- `I am a…` (`Student`, `Working Professional`, or `Property Owner`)
- `Preferred City` (optional)
- `Email Updates Permission` (optional opt-in checkbox)

Passwords, Aadhaar/PAN government IDs, phone numbers, financial details, and precise street addresses are **never requested**.

---

## 2. Consent Separation Rules

1. **Confirmation Receipt:** Google Forms automatically emails responders a copy of their submission when enabled (*Send responders a copy of their response -> Always*).
2. **Optional Product Updates:** Launch updates and promotional emails must filter strictly on rows where `Email Updates Permission` indicates explicit opt-in (`Yes, send me optional StayMate product updates and launch announcements by email`).

---

## 3. Access Control & Account Security

- Keep `StayMate_Early_Access_Database` sharing set to **Restricted** under `staymate2@gmail.com`.
- Enable **2-Step Verification (2FA)** on the Google (`staymate2@gmail.com`), GitHub, and Vercel accounts.
- Avoid leaving unencrypted CSV exports on shared machines.

---

## 4. Retention Schedule & Deletion Requests

- **Retention Window:** Kept only for pre-launch cohort onboarding and no longer than **12 months** after initial launch unless deleted earlier or converted into an active in-app account with explicit in-app consent.
- **Withdrawal & Deletion (`/unsubscribe`):** Visitors can withdraw optional marketing consent or request complete row deletion by emailing `staymate2@gmail.com` from their registered address. Administrators fulfill verified requests within **7 days** directly in Google Sheets.

---

## 5. Backups

- Use Google Sheets **File -> Version history** for accidental edit recovery and periodic **File -> Download -> .xlsx** snapshots stored in a restricted admin drive.
