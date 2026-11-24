# StayMate Early-Access — Embedded Google Form Setup ($0 / Zero Secrets)

StayMate embeds an official Google Form directly inside the `#early-access` card on the homepage (`?embedded=true`) so visitors submit right on the website, receive an automatic email copy from Google Forms, and store entries in a restricted Google Sheet under `staymate2@gmail.com` with zero Vercel server secrets or paid services.

## 1. Create the Google Form (Under `staymate2@gmail.com`)

1. Open [forms.new](https://forms.new) signed into `staymate2@gmail.com` and title the form **StayMate Early Access**.
2. Open the **Settings** tab:
   - **Collect email addresses** -> **Responder input**
   - **Send responders a copy of their response** -> **Always** *(sends instant confirmation email automatically without any script)*
   - **Limit to 1 response** -> keep **OFF** *(critical: enabling this forces visitors to sign into a Google account inside the iframe)*
   - Under **Presentation -> Confirmation message**: set `You're on the list! Your StayMate early-access registration has been received.`
3. Open **Questions** and add these 4 fields (Email is added automatically by step 2):
   - **Full Name** (Short answer, Required)
   - **I am a…** (Multiple choice: `Student`, `Working Professional`, `Property Owner`, Required)
   - **Preferred City** (Short answer, Optional)
   - **Email Updates Permission** (Checkboxes: `Yes, send me optional StayMate product updates and launch announcements by email`, Optional)
4. Open **Responses -> Link to Sheets** -> create/select `StayMate_Early_Access_Database` (keep spreadsheet sharing **Restricted**). Optionally enable **⋮ -> Get email notifications for new responses** for instant alerts to `staymate2@gmail.com`.
5. Click **Send** -> **Link (`🔗`)** -> copy the `https://docs.google.com/forms/d/e/.../viewform` URL.

## 2. Connect the Form URL to the Website

Either:
- Set `DEFAULT_GOOGLE_FORM_URL` in [`src/lib/site.ts`](../src/lib/site.ts) and push to `main` (zero Vercel Environment Variables needed), **or**
- Set `NEXT_PUBLIC_GOOGLE_FORM_URL` in Vercel **Project Settings -> Environment Variables** and trigger a rebuild.

[`normalizeGoogleFormEmbedUrl`](../src/lib/google-form.ts) automatically strips tracking parameters and forces `?embedded=true` over `https://docs.google.com/forms/...`.

## 3. Optional Custom Branded Emails (`FormEmailer.gs`)

Google Forms' built-in responder copy already delivers automatic confirmation receipts with zero code. If you ever want custom StayMate-branded HTML confirmation emails sent from `staymate2@gmail.com`, attach [`google-apps-script/FormEmailer.gs`](../google-apps-script/FormEmailer.gs) as an `On form submit` trigger inside your Google Sheet (`Extensions -> Apps Script -> Triggers`).
