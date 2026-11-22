# StayMate Website — Testing & Verification Report

**Date:** 2026-11-22
**Scope:** Standalone `StayMate-Website/` (Next.js App Router pre-launch site with kinetic 3D motion system) and its integration with `StayMate/backend/` (`waitlist` module).

## 1. Automated Checks & Tests

### Website (`StayMate-Website/`)

Executed via `npm run check` in `StayMate-Website/` (`eslint`, `tsc`, `vitest`, `next build`):

| Check | Command | Result | Details |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | **Passed** | 0 errors, 0 warnings |
| TypeScript | `npm run typecheck` | **Passed** | Strict mode + `noUncheckedIndexedAccess`, 0 errors |
| Unit & API Route Tests | `npm test` (`vitest run`) | **Passed (33/33)** | 4 files: `calculator.test.ts` (7), `waitlist-schema.test.ts` (11), `route.test.ts` (11), `compat-and-limit.test.ts` (4) |
| Production Build | `npm run build` | **Passed** | Static prerendering for `/`, `/privacy`, `/terms`, `/unsubscribe`, `/_not-found`, `/apple-icon.png`, `/icon.png`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`; dynamic Route Handlers for `/api/waitlist` and `/api/waitlist/unsubscribe` |

### StayMate App & Backend Repo (`StayMate/`)

| Check | Command | Result | Details |
| --- | --- | --- | --- |
| Root Typecheck | `npm run typecheck` | **Passed** | `shared`, `backend`, and `mobile` all passed |
| Root ESLint | `npm run lint` | **Passed** | `shared/src`, `backend/src`, `mobile/src`, `mobile/App.tsx`, `admin/app.js` |
| Shared Tests | `npm run test:shared` | **Passed (14/14)** | 2 suites |
| Backend Tests | `npm run test:backend` | **Passed (26/26)** | 3 suites (`waitlist.test.ts`, `api-marketplace.test.ts`, `security.test.ts`) |
| Mobile Tests | `npm run test:mobile` | **Passed (14/14)** | 2 suites (`6.302s` standalone; note: hit a 5s cold-transform timeout on 1 test during back-to-back sequential `npm test` under load before passing cleanly on direct run) |
| Backend Build | `npm run build:backend` | **Passed** | Compiled `shared` and `backend` (`dist/`) |

## 2. Live Website-to-Backend E2E Verification

Executed against compiled `backend/dist/server.js` (with `mongodb-memory-server` and `WAITLIST_INGEST_KEY`) and production `next start` (`WAITLIST_API_URL` + matching `WAITLIST_INGEST_KEY`):

- `POST /api/waitlist` valid registration → HTTP `200 { "ok": true }`; stored with `consentTextVersion: "2026-11-v1"`, `source: "website"`, hashed IP only.
- `POST /api/waitlist` duplicate case-insensitive email → HTTP `200 { "ok": true }`, total stored records remained `1` (no enumeration, no duplicate rows).
- `GET /v1/admin/waitlist` (authenticated admin JWT) → HTTP `200`, returned item without `ipHash`.
- `GET /v1/admin/waitlist/export.csv` (authenticated admin JWT) → HTTP `200`, properly quoted CSV output.
- `POST /api/waitlist/unsubscribe` → HTTP `200 { "ok": true }`, active count dropped to `0`, `?includeWithdrawn=true` showed `status: "withdrawn"`.

## 3. Browser, Responsive & 3D Motion Verification

Verified against production `npx next start` using headless Google Chrome (`158.0.8127.36` prior baseline; verified again after kinetic 3D motion upgrade on port `3102`):

- **Viewports checked (all `overflowX: false`, zero non-carousel page overflow culprits):**
  - `360×800` (`innerWidth: 360`, `scrollWidth: 360`)
  - `390×844` (`innerWidth: 390`, `scrollWidth: 390`)
  - `768×1024` (`innerWidth: 768`, `scrollWidth: 753`)
  - `1024×768` (`innerWidth: 1024`, `scrollWidth: 1009`)
  - `1440×900` (`innerWidth: 1440`, `scrollWidth: 1425`)
  - `1920×1080` (`innerWidth: 1920`, `scrollWidth: 1905`)
- **3D Overflow & Depth Layering Caught & Fixed During Visual Inspection:**
  - Initially, `.reveal-init` 3D `rotateX(11deg)` projection caused `scrollWidth` expansion on `768px`/`1024px` and mobile viewport scale-out; fixed by pushing initial `translateZ` to `-110px` with `scale(0.95)` and adding `overflow-x: clip` on `html` and `#problem`.
  - Visual screenshot review caught the rotating center phone corner clipping through `"Phone number hidden"` HUD pill at `translateZ(88px)`; resolved by raising foreground HUD badge `translateZ` planes to `134px–142px` (`z-50`).
- **Console / Network / Assets:** `0` console errors, `0` failed requests, `4/4` `<img>` elements loaded cleanly (`brokenImgs: []`).
- **3D Motion & Interactive UI checks:**
  - Hero 3D stage initialized auto-orbiting (`aria-pressed="true"`), running `spin-cube-3d` on `Cube3D` prisms and continuous orbital ring loops; clicking `Real Cost` rotated `Real Cost` cleanly to center foreground (`aria-pressed="true"`).
  - Product Preview 3D Coverflow applied angled side perspective (`rotateY(±15deg) scale(0.9)`) relative to center phone (`translateZ(24px) scale(1.04)`), and `Play 3D tour` toggled cleanly (`aria-pressed` `"false"` → `"true"`).
  - `ScrollMotion3D` updated live `--sp` viewport progress (`-1.000`, `0.772`, `0.452`, `0.089`, `-0.339`) on scroll.
  - Emulating `prefers-reduced-motion: reduce` froze `iso-floor-dark` animation (`"none"`), `Cube3D` spin (`"none"`), and `.scroll-3d` transform (`"none"`).
  - Interactive checks verified in baseline build: Problem section 3D waterline stack toggle, Compatibility radio buttons (`66%` → `100%`), Affordability calculator (`₹10,367` → `₹15,367`), Discovery `PG` filter (`6` → `1` demo card), FAQ `<details>` accordion, mobile drawer (`390px`), and routes `/`, `/privacy`, `/terms`, `/unsubscribe`, plus 404.

## 4. Accessibility, Security & Performance Measurements

- **DOM Accessibility Checks (baseline audit):** `lang="en-IN"`, `h1Count: 1`, landmarks (`header: 1`, `nav: 2`, `main: 1`, `footer: 1`), `inputsWithoutLabels: 0`, `buttonsWithoutText: 0`, `headingOrderSkipped: []`, skip link `#main`.
- **Security Headers (`curl -sI` baseline check):** Confirmed `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, and no `X-Powered-By`.
- **Secret Scan (`StayMate-Website/.next/static` & `StayMate-Website/public`, baseline check):** `0` matches for `WAITLIST_INGEST_KEY`, `WAITLIST_API_URL`, `MONGODB_URI`, or backend secrets.
- **Chrome PerformanceObserver Probe (post-3D-motion localhost verification):**
  - `CLS`: `0` (`PerformanceObserver` across scroll & viewport pass; `TTFB: 25ms`, `FCP/LCP: 1616ms`, `642 KB` transfer in prior baseline build).
  - *Limitation:* Lighthouse CLI was not installed locally, so formal Lighthouse scores are not claimed here and should be captured via Chrome DevTools / PageSpeed Insights after deployment.

## 5. Remaining Pre-Launch Tasks (Requires Founder / Ops Input)

1. **Hosting & Plan Choice:** Confirm whether StayMate qualifies as a personal/non-commercial project for Vercel Hobby, or select Vercel Pro / another free static+serverless host (Cloudflare Pages, Netlify).
2. **Backend & Database Deployment:** Provision managed MongoDB Atlas (`MONGODB_URI`) and host `backend/` over HTTPS with production SMS/media providers and secrets.
3. **Wire Production Waitlist Env Vars:** Generate a shared 32+ char `WAITLIST_INGEST_KEY` (`openssl rand -hex 32`), configure it on both the backend and website server env (`WAITLIST_API_URL` + `WAITLIST_INGEST_KEY`), then set `NEXT_PUBLIC_WAITLIST_ENABLED=true` and redeploy.
4. **Domain, SEO & Legal Review:** Connect custom domain, set `NEXT_PUBLIC_SITE_URL`, supply `NEXT_PUBLIC_CONTACT_EMAIL` and social URLs if desired, replace CSS phone mockups with real app screenshots when ready, have a lawyer review `/privacy` & `/terms` for DPDP Act (2023) compliance (including waitlist retention period), and run Lighthouse / PageSpeed Insights on the live HTTPS deployment.
