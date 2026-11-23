# StayMate Early-Access Setup & Manual Deployment Guide ($0 Free-Tier Stack)

This entire stack runs on **$0/month free tiers** (no credit card or paid plans needed):
- **Website & Serverless API:** Vercel Hobby Free Tier (`https://stay-mate-portfoilio.vercel.app`)
- **Rate Limiting:** Upstash Redis Free Tier (10,000 commands/day, sliding-window quota shielding enabled)
- **Database & Backend:** Google Sheets + Google Apps Script (`staymate2@gmail.com` free account)
- **Email Delivery:** Google `MailApp` via `staymate2@gmail.com` (~100 recipients/day free)
- **Version Control:** GitHub Free (`Stay-Mate-2/Stay-Mate-Portfoilio`)

Follow these steps **in order**. Leave `EARLY_ACCESS_ENABLED=false` until final end-to-end smoke testing passes.

---

## Step 1: Create the Private Google Sheet

1. Sign in to Google Drive using **`staymate2@gmail.com`** (ensure **2-Step Verification / 2FA** is turned on in Google Account Security).
2. Click **+ New -> Google Sheets -> Blank spreadsheet**.
3. Rename the spreadsheet at the top left to:
   `StayMate_Early_Access_Database`
4. Verify **Share** permissions (top-right): ensure **General access** is **Restricted** ("Only people with access can open with the link"). **Never publish this sheet to the web or share it publicly.**
5. Copy the Spreadsheet ID from the URL bar:
   `https://docs.google.com/spreadsheets/d/<YOUR_SPREADSHEET_ID>/edit`

---

## Step 2: Install `Code.gs` in Google Apps Script

1. Inside `StayMate_Early_Access_Database` (logged in as **`staymate2@gmail.com`**), open **Extensions -> Apps Script**.
2. Rename the Apps Script project (e.g., `StayMate Early Access Backend`).
3. Open `Code.gs` in the left editor sidebar, select all default boilerplate (`function myFunction() {}`), and delete it.
4. Copy the entire contents of [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) from this repository and paste it into `Code.gs`.
5. Click **Save** (`Ctrl + S` / floppy disk icon).

---

## Step 3: Generate & Configure Cryptographic Secrets

Generate a strong 256-bit (64-hex-character) shared secret in your terminal (never commit or share it):

```bash
openssl rand -hex 32
```

Save this exact value temporarily for both **Apps Script Properties** (`SHARED_SECRET`) and **Vercel Environment Variables** (`STAYMATE_HMAC_SECRET`).

---

## Step 4: Configure Apps Script Properties

1. In the Apps Script editor, click **Project Settings** (gear icon on the left sidebar).
2. Scroll down to **Script Properties** and click **Add script property**.
3. Add these exact three properties:
   - `SPREADSHEET_ID`: `<YOUR_SPREADSHEET_ID>` from Step 1
   - `ADMIN_EMAIL`: `staymate2@gmail.com`
   - `SHARED_SECRET`: the exact 64-character hex secret generated in Step 3
4. Click **Save script properties**.

---

## Step 5: Initialize the Database & Authorize Required Permissions

1. Return to the **Editor** view (`<>` icon).
2. In the function dropdown at the top toolbar (beside Debug), select `initializeDatabase`.
3. Click **Run**.
4. Google prompts **"Authorization required"** -> click **Review permissions** -> choose **`staymate2@gmail.com`** -> (if unverified personal app warning appears, click **Advanced -> Go to StayMate Early Access Backend (unsafe)** -> click **Allow**).
5. **Why each Google OAuth scope/permission is required:**
   - **See, edit, create, and delete your Google Sheets spreadsheets (`spreadsheets`):** Required for `SpreadsheetApp.openById(SPREADSHEET_ID)` to initialize the `Registrations` worksheet, read the `Email` column for duplicate checks, append new rows, and update email status cells (`Confirmation_Email_Status`, `Admin_Notification_Status`).
   - **Send email as you (`script.send_mail` / `MailApp`):** Required for `MailApp.sendEmail()` to send confirmation emails from **`StayMate <staymate2@gmail.com>`** and admin alerts to `ADMIN_EMAIL`.
   - **Connect to UI / dialogs (`script.container.ui`, via `onOpen` menu):** Adds the restricted **StayMate Admin** menu inside Google Sheets for `Initialize Database` and `Retry Failed Emails`.
6. Check the Execution Log: you should see `DATABASE_INITIALIZED`, and your spreadsheet will now have the `Registrations` tab with 12 formatted, frozen header columns.
7. Optionally select `checkSetupStatus` and click **Run** to confirm `hasSpreadsheet: true`, `hasRegistrationsSheet: true`, and valid `remainingDailyEmailQuota`.

> [!NOTE]
> **Consumer Gmail Quota (`staymate2@gmail.com`):** Standard `@gmail.com` accounts allow **100 recipients per day** via `MailApp` (about **50 new signups/day** since each signup dispatches 1 user confirmation + 1 admin notification). If a burst exceeds 100 emails in 24 hours, registrations are still preserved in Sheets (`FAILED` status) and can be sent cleanly the next day via **StayMate Admin -> Retry Failed Emails** (or switch the sender account to a custom-domain Google Workspace mailbox for ~1,500/day capacity).

---

## Step 6: Deploy Apps Script as a Web App

1. In the Apps Script editor top right, click **Deploy -> New deployment**.
2. Click the gear icon beside **Select type** and choose **Web app**.
3. Configure **strictly** as follows:
   - **Description:** `StayMate Early Access v1`
   - **Execute as:** `Me (staymate2@gmail.com)` — Allows the Web App to read/write your *private* `StayMate_Early_Access_Database` spreadsheet and send via `staymate2@gmail.com` without making the spreadsheet public.
   - **Who has access:** `Anyone` — Required because Vercel's backend invokes `/exec` server-to-server without interactive Google OAuth login. **This does NOT grant unauthenticated access:** every `doPost` request is rejected unless it carries a valid HMAC-SHA256 signature, fresh timestamp, and unused nonce signed with `SHARED_SECRET`. Direct `doGet` requests are blocked with `METHOD_NOT_ALLOWED`.
4. Click **Deploy**.
5. Copy the resulting **Web app URL** (`https://script.google.com/macros/s/.../exec`).

> [!NOTE]
> Whenever you modify `Code.gs` later, choose **Deploy -> Manage deployments -> Edit (pencil) -> Version: New version -> Deploy** so the existing `/exec` URL picks up your edits cleanly.

---

## Step 7: Set Up Upstash Redis

1. Sign in at [console.upstash.com](https://console.upstash.com) and click **Create Database**.
2. Choose a region close to your Vercel deployment region (for India users, `ap-south-1` Mumbai if deploying Vercel Serverless functions to `bom1`, or closest Vercel function region).
3. From the Upstash database **Details** page under **REST API**, copy:
   - `UPSTASH_REDIS_REST_URL` (`https://...upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Step 8: Configure Vercel Environment Variables

In your Vercel Project Dashboard (**Settings -> Environment Variables**, apply to Production / Preview as needed):

| Variable Name | Exposure | Example / Value | Notes |
| --- | --- | --- | --- |
| `EARLY_ACCESS_ENABLED` | Server-only | `false` (initial) -> `true` (at launch) | Never prefix `NEXT_PUBLIC_`. Start with `false`. |
| `STAYMATE_APPS_SCRIPT_URL` | Server-only | `https://script.google.com/macros/s/.../exec` | Copied in Step 6. |
| `STAYMATE_HMAC_SECRET` | Server-only | `<64-char hex from Step 3>` | Must match Apps Script `SHARED_SECRET` identically. |
| `STAYMATE_ALLOWED_ORIGIN` | Server-only | `https://stay-mate-portfoilio.vercel.app` | Comma-separated exact origins allowed for form `POST`s (no trailing slash). |
| `UPSTASH_REDIS_REST_URL` | Server-only | `https://...upstash.io` | Upstash REST URL from Step 7. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only | `AX...` | Upstash REST token from Step 7. |
| `NEXT_PUBLIC_SITE_URL` | Public | `https://stay-mate-portfoilio.vercel.app` | Enables canonical URLs and `/sitemap.xml`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public (optional) | `staymate2@gmail.com` | Displayed on Privacy Policy / Footer for user data-deletion requests. |

**Redeploy** in Vercel after updating environment variables so new runtime values take effect.

---

## Step 9: Safe Smoke Test Before Public Launch

1. Keep `EARLY_ACCESS_ENABLED=false` initially and verify the deployed site displays *"Registration isn't open yet"* and `POST /api/early-access` returns HTTP `503`.
2. Switch `EARLY_ACCESS_ENABLED=true` temporarily (or on a Preview environment with your admin test origin), register a dummy test email (`test+smoke@<yourdomain>`), and verify:
   - Row appears in `StayMate_Early_Access_Database -> Registrations` with all 12 columns cleanly formatted.
   - `Confirmation_Email_Status` = `SENT` and `Admin_Notification_Status` = `SENT`.
   - Re-submitting the same email returns *"This email is already registered with StayMate."* without adding a duplicate row or sending a second email.
   - Testing `/unsubscribe` updates `Marketing_Consent` to `FALSE` (`Withdrawn <timestamp>`).
3. Delete your smoke-test row in Google Sheets, and keep `EARLY_ACCESS_ENABLED=false` until founder approval to open public registration.
