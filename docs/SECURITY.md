# StayMate Website Security Controls & Limitations

StayMate follows defense-in-depth engineering principles with minimal client/server complexity and zero server secrets required on Vercel.

---

## 1. Security Control Matrix

| Area | Implemented Control | Layer / File |
| --- | --- | --- |
| **Iframe Source Allowlist** | Strict `normalizeGoogleFormEmbedUrl()` accepts only `https://docs.google.com/forms/(u/\d+/)?d/(e/)?<id>/viewform`, rejecting `http:`, `javascript:`, `data:`, shorteners (`forms.gle`), `/edit` links, embedded HTML, credentials, and excessive length. | `src/lib/google-form.ts` |
| **Content Security Policy** | Strict CSP header (`default-src 'self'`, `frame-src https://docs.google.com`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`). | `next.config.ts` |
| **Transport & Framing Hardening** | `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, `poweredByHeader: false`. | `next.config.ts` |
| **Abuse & Bot Defense** | Handled natively inside Google Forms (`docs.google.com`) over HTTPS, avoiding unauthenticated API endpoints or fake `no-cors` form hacks. | Google Forms |
| **Zero Secret Footprint** | All pages pre-render statically without any Vercel API keys, HMAC secrets, or Redis tokens stored in server/browser runtime config. | `.env.example`, `src/app/page.tsx` |
| **HTML Email Safety (Optional)** | If [`google-apps-script/FormEmailer.gs`](../google-apps-script/FormEmailer.gs) is attached in Sheets, user inputs (`name`, `city`, `category`) pass through strict `escapeHtml_()` and control-char stripping before `MailApp.sendEmail()`. | `google-apps-script/FormEmailer.gs` |
| **Data Access Control** | Responses stay inside the owner's private `StayMate_Early_Access_Database` Google Sheet (`General access: Restricted`), never exposed on public endpoints. | Google Workspace |

---

## 2. Explicit Scope & Residual Considerations

1. **Google Form Privacy & Cookies:** Inside the embedded `https://docs.google.com` iframe, Google's infrastructure and Privacy Policy govern submission validation, anti-spam checks, and cookies; StayMate itself sets no advertising or analytics cookies.
2. **Third-Party Frame Blockers:** Strict privacy browsers or extensions that block cross-site iframes may prevent inline iframe loading; an accessible *"Open form in a new tab"* link to the same verified `docs.google.com` form sits cleanly beneath the frame as a reliable fallback.
3. **Manual Deletion Verification (`/unsubscribe`):** Because Google Sheets is not exposed publicly via a write endpoint, unsubscribe and deletion requests route cleanly via `mailto:staymate2@gmail.com` from the visitor's registered email address so administrators can verify address ownership before updating or removing rows.
