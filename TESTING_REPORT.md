# StayMate Website — Testing & Verification Report

**Date:** 2026-11-24
**Scope:** Standalone `StayMate-Website/` pre-launch static site with inline embedded Google Form integration (`#early-access`), strict CSP `frame-src https://docs.google.com`, Google Form URL normalizer (`src/lib/google-form.ts`), `/unsubscribe` `mailto:staymate2@gmail.com` helper, and updated `/privacy` policy.

## 1. Automated Checks & Security Tests

Executed via `npm run check` in `StayMate-Website/` (`eslint .`, `tsc --noEmit`, `vitest run`, `next build`):

| Check | Command | Result | Details |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | **Passed** | 0 errors, 0 warnings |
| TypeScript | `npm run typecheck` | **Passed** | Strict mode + `noUncheckedIndexedAccess`, 0 errors |
| Unit & URL Security Tests | `npm test` (`vitest run`) | **Passed (16/16)** | 3 suites: `calculator.test.ts` (7), `compat-and-limit.test.ts` (3), `google-form-url.test.ts` (6 tests verifying valid URL normalization with `?embedded=true`, `/u/N` stripping, rejection of `http:`, `javascript:`, `data:`, external domains, `forms.gle` shorteners, `/edit`, `/formResponse`, embedded HTML tags, credentials, and excessive lengths) |
| Production Build | `npm run build` | **Passed** | `next build` (`Next.js 16.4.6` Turbopack): all `11/11` routes prerendered as Static (`/`, `/_not-found`, `/apple-icon.png`, `/icon.png`, `/opengraph-image`, `/privacy`, `/robots.txt`, `/sitemap.xml`, `/terms`, `/unsubscribe`) |
| Production Dependency Audit | `npm audit --omit=dev` | **Passed** | `0 vulnerabilities` |
| Static Asset Secret Scan | `grep -rnE` over `.next/static` & `public` | **Passed** | `0` occurrences of legacy `STAYMATE_HMAC_SECRET`, `UPSTASH_REDIS_REST_TOKEN`, `STAYMATE_APPS_SCRIPT_URL`, `EARLY_ACCESS_ENABLED`, or `SHARED_SECRET` |

## 2. Live Production Build Browser Verification (Headless Chrome CDP)

Verified via headless Chrome DevTools Protocol against `npx next start -p 3108 -H 127.0.0.1` in both modes:

- **Security Headers & Removed Routes:**
  - `Content-Security-Policy` served `frame-src https://docs.google.com` alongside `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `upgrade-insecure-requests`.
  - `/`, `/privacy`, and `/unsubscribe` returned HTTP `200`; removed `/api/early-access` returned `404`.
- **Embedded Iframe Mode (`NEXT_PUBLIC_GOOGLE_FORM_URL` configured):**
  - `#early-access` rendered `<iframe src="https://docs.google.com/forms/d/e/.../viewform?embedded=true">` inside the desktop card (`lg:grid-cols-[0.78fr_1.22fr]`) without right-edge clipping or horizontal overflow (`overflowX: false`) and with `0` console/CSP errors.
- **Unconfigured Fallback Mode (`NEXT_PUBLIC_GOOGLE_FORM_URL` unset):**
  - `#early-access` rendered an honest *"Registration form isn't linked yet"* notice with contact fallback `staymate2@gmail.com` (`overflowX: false`, `0` console errors).
- **Legal & Withdrawal Pages:**
  - `/privacy` accurately documents Google Forms intake, private `StayMate_Early_Access_Database` Google Sheets storage, automatic responder receipts, and 7-day data deletion/withdrawal via `staymate2@gmail.com`.
  - `/unsubscribe` provides the interactive update/deletion selector, email pre-fill helper, single-line `"Email StayMate"` `mailto:staymate2@gmail.com` CTA, and clipboard copy button cleanly without horizontal overflow.

## 3. Live Google Form Connected

Connected the official **StayMate Early Access** Google Form (`https://docs.google.com/forms/d/e/1FAIpQLSfkgrHcY8p0UXaCohq47dpoEJJLA11xA_pbJpG1hqItoDZryw/viewform?embedded=true`, resolved from `https://forms.gle/krB2LSLjMAirQa4i6`) via `DEFAULT_GOOGLE_FORM_URL` in [`src/lib/site.ts`](./src/lib/site.ts) so Vercel deploys with zero manual environment variable configuration.
