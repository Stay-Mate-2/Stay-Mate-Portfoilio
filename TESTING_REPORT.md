# StayMate Website — Testing & Verification Report

**Date:** 2026-11-23
**Scope:** Standalone `StayMate-Website/` pre-launch website, Vercel `/api/early-access` & `/api/early-access/unsubscribe` routes, Upstash Redis fail-closed rate limiting, and `google-apps-script/Code.gs` HMAC-SHA256 / Google Sheets / `MailApp` integration.

## 1. Automated Checks & Security Tests

Executed via `npm run check` in `StayMate-Website/` (`eslint`, `tsc --noEmit`, `vitest run`, `next build`):

| Check | Command | Result | Details |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | **Passed** | 0 errors, 0 warnings |
| TypeScript | `npm run typecheck` | **Passed** | Strict mode + `noUncheckedIndexedAccess`, 0 errors |
| Unit, Security & Protocol Tests | `npm test` (`vitest run`) | **Passed (31/31)** | 3 suites: `calculator.test.ts` (7), `compat-and-limit.test.ts` (3), `early-access.test.ts` (21 tests covering all 25 required security, validation, HMAC, replay, failure recovery, formula/HTML injection, rate-limit fail-closed, and consent-withdrawal scenarios executing real `google-apps-script/Code.gs` in a Node VM sandbox backed by real `crypto` HMACs and mocked Google Workspace services) |
| Production Build | `npm run build` | **Passed** | `next build` (`Next.js 16.4.6` Turbopack): dynamic `/`, `/api/early-access`, `/api/early-access/unsubscribe`; static `/privacy`, `/terms`, `/unsubscribe`, `/_not-found`, `/apple-icon.png`, `/icon.png`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml` |
| Production Dependency Audit | `npm audit --omit=dev` | **Passed** | `0` runtime vulnerabilities (`devDependency` `vitest@3.2.x` carries a `tinypool`/`@vitest/mocker` test-tooling advisory, excluded from Vercel runtime bundles) |
| Client Bundle Secret Scan | `grep -rnE` over `.next/static` & `public` | **Passed** | `0` occurrences of `STAYMATE_HMAC_SECRET`, `UPSTASH_REDIS_REST_TOKEN`, `STAYMATE_APPS_SCRIPT_URL`, `EARLY_ACCESS_ENABLED`, or `SHARED_SECRET` |

## 2. Live Production Build Browser Verification

Verified against `npx next start -p 3104` (default `EARLY_ACCESS_ENABLED` unset/`false`) using headless Google Chrome:

- **Responsive & Runtime Integrity:**
  - `390×844` mobile: `innerWidth: 390`, `scrollWidth: 390`, `overflowX: false`.
  - `1440×900` desktop: `innerWidth: 1440`, `scrollWidth: 1425`, `overflowX: false`.
  - `0` console errors, `0` failed requests on page routes.
- **Disabled State & Form Preservation:**
  - `#early-access` rendered the amber *"Registration isn't open yet"* banner, disabled submit button (`"Registration opens soon"`), canonical category radio buttons (`Student`, `Working Professional`, `Property Owner`), and separated transactional vs. optional `marketingConsent` checkbox.
  - Direct HTTP `GET /api/early-access` returned `405 Method Not Allowed`.
  - Direct same-origin `POST /api/early-access` with `EARLY_ACCESS_ENABLED` unset returned `503 { "ok": false, "code": "EARLY_ACCESS_DISABLED" }`.
- **Legal & Withdrawal Pages:**
  - `/privacy` verified documenting `StayMate_Early_Access_Database`, Upstash Redis hashed abuse limits, transactional vs. marketing consent separation, retention, and deletion/withdrawal rights.
  - `/unsubscribe` verified rendering *"Withdraw marketing consent"* workflow.

## 3. Prior 3D Motion & UI Verification (Retained)

Verified in the `2026-11-22` Chrome headless pass across `360px`–`1920px`:
- `CLS: 0`, `4/4` loaded brand images, active `Cube3D` / `SpatialHeroStage` / `ProductPreview` Coverflow / `ScrollMotion3D`, and clean `prefers-reduced-motion: reduce` freezes.

## 4. Remaining Manual Steps (Founder / Deployment Action)

Automated Vitest execution exercised `Code.gs` inside Node's VM against Google Workspace API doubles; live Google Workspace, Gmail, and Upstash Redis execution requires manual setup per [`docs/EARLY_ACCESS_SETUP.md`](./docs/EARLY_ACCESS_SETUP.md):

1. Create `StayMate_Early_Access_Database` in Google Sheets (Restricted access), paste `google-apps-script/Code.gs`, run `initializeDatabase()`, set Script Properties (`SPREADSHEET_ID`, `ADMIN_EMAIL`, `SHARED_SECRET`), and deploy as Web App (`Execute as: Me`, `Who has access: Anyone`).
2. Provision Upstash Redis database and configure Vercel server environment variables (`STAYMATE_APPS_SCRIPT_URL`, `STAYMATE_HMAC_SECRET`, `STAYMATE_ALLOWED_ORIGIN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, keeping `EARLY_ACCESS_ENABLED=false` initially).
3. Perform one manual smoke registration on a Staging/Preview environment (`EARLY_ACCESS_ENABLED=true`) to verify real Sheets append, Gmail `MailApp` delivery, duplicate detection, and `/unsubscribe` row update, delete test data, and revert to `EARLY_ACCESS_ENABLED=false` until launch approval.
