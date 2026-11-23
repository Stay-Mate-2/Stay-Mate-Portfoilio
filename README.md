# StayMate Marketing Website

Standalone pre-launch product website for **StayMate** (*"Find your people. Find your place. Live better."*), built with Next.js App Router, TypeScript, React, and Tailwind CSS v4.

> Separated from the StayMate Android & Backend repository (`Stay-Mate-2/Stay-Mate-Android-App`) so the website can be maintained, versioned, and deployed independently.

## Stack

- **Framework:** Next.js 16 (App Router, static prerendered pages + dynamic Route Handlers)
- **Language:** TypeScript (strict mode + `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS v4 + CSS container-query phone mockups
- **Icons & Validation:** `lucide-react`, `zod`
- **Testing:** Vitest

## Project Layout

```text
StayMate-Website/
├── assets/brand-source/   # Approved StayMate light/dark logo source JPEGs
├── docs/                  # Architecture, setup, security, threat model, testing, incident & retention docs
├── google-apps-script/    # Complete standalone Code.gs for Google Apps Script & Google Sheets
├── public/brand/          # Optimized transparent PNG/WebP marks
├── scripts/               # Asset generation script (make-brand-assets.py)
├── src/app/               # Pages, SEO metadata, OG image, sitemap, /api/early-access routes
├── src/components/        # UI primitives, phone mockups, landing sections
├── src/lib/               # Calculator, compat demo, HMAC/Upstash/early-access guards, site config
├── DESIGN_SYSTEM.md       # Palette, typography, tokens, honesty rules
├── TESTING_REPORT.md      # Verification, browser/responsive audit & remaining tasks
├── .env.example           # Environment variable template (no secrets)
└── next.config.ts         # Security headers, CSP & image configuration
```

## Local Development

Prerequisites: Node.js `>= 20.9.0` (verified on Node `22.22.1`) and npm.

```bash
cd StayMate-Website
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle (`next build`) |
| `npm start` | Serve production build (`next start`) |
| `npm run lint` | Run ESLint (`eslint .`) |
| `npm run typecheck` | Run TypeScript check (`tsc --noEmit`) |
| `npm test` | Run Vitest unit & security tests |
| `npm run check` | Run lint, typecheck, tests, and production build |

### Regenerating Brand Mark Assets (Optional)

If [`assets/brand-source/light-mode-logo.jpeg`](./assets/brand-source/light-mode-logo.jpeg) changes, regenerate the transparent web assets and favicons with Python 3 + Pillow:

```bash
python3 scripts/make-brand-assets.py
```

## Environment Variables

See [`.env.example`](./.env.example). **Never commit `.env.local` or secrets.**

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `EARLY_ACCESS_ENABLED` | **Server-only** | Master registration feature flag (`false` by default). Controls form state and API intake. Never prefix `NEXT_PUBLIC_`. |
| `STAYMATE_APPS_SCRIPT_URL` | **Server-only** | Deployed Google Apps Script Web App `/exec` URL (`https://script.google.com/macros/s/.../exec`). |
| `STAYMATE_HMAC_SECRET` | **Server-only** | Shared `>= 32`-char secret (`openssl rand -hex 32`) matching `SHARED_SECRET` in Apps Script Project Properties. |
| `STAYMATE_ALLOWED_ORIGIN` | **Server-only** | Allowed browser origin(s) for CSRF/Origin verification (e.g. `https://stay-mate-portfoilio.vercel.app`). |
| `UPSTASH_REDIS_REST_URL` | **Server-only** | Upstash Redis REST URL for fail-closed distributed rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | **Server-only** | Upstash Redis REST bearer token. |
| `NEXT_PUBLIC_SITE_URL` | Public | Production URL (e.g. `https://stay-mate-portfoilio.vercel.app`, no trailing slash). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Optional footer/privacy contact email. Omitted when empty. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_LINKEDIN_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_X_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_YOUTUBE_URL` | Public | Optional footer social link. Omitted when empty. |

## Early-Access Registration Architecture

The browser never contacts Google Sheets or Google Apps Script directly.

1. Form submissions go to same-origin `POST /api/early-access` ([`src/app/api/early-access/route.ts`](./src/app/api/early-access/route.ts)).
2. The server verifies `Content-Type`, strict `Origin` / `Sec-Fetch-Site`, `EARLY_ACCESS_ENABLED=true`, fail-closed Upstash Redis limits (per HMAC-hashed IP & email), bounded body size (`<= 4096` B), honeypot trap, and strict Zod allowlists.
3. Validated payloads are signed (`timestamp + "." + nonce + "." + dataString`) via HMAC-SHA256 and sent to [`google-apps-script/Code.gs`](./google-apps-script/Code.gs), which verifies the signature/timestamp/nonce, stores rows safely inside `StayMate_Early_Access_Database` (`Registrations`) under `LockService`, and sends branded confirmation & admin notification emails via `MailApp`.
4. Marketing consent withdrawal operates via `/unsubscribe` -> `POST /api/early-access/unsubscribe`.

See [`docs/EARLY_ACCESS_SETUP.md`](./docs/EARLY_ACCESS_SETUP.md) for full deployment steps and [`docs/SECURITY.md`](./docs/SECURITY.md) / [`docs/THREAT_MODEL.md`](./docs/THREAT_MODEL.md) for security posture details.

## Deploying to Vercel

1. Connect the GitHub repository (`https://github.com/Stay-Mate-2/Stay-Mate-Portfoilio.git`) in Vercel (**Root Directory**: `.`, **Framework**: Next.js).
2. Configure Google Sheets (`StayMate_Early_Access_Database`), Upstash Redis, and Google Apps Script (`Code.gs`) per [`docs/EARLY_ACCESS_SETUP.md`](./docs/EARLY_ACCESS_SETUP.md).
3. Add the server-only environment variables in **Project Settings -> Environment Variables**, keeping `EARLY_ACCESS_ENABLED=false` initially.
4. Run smoke tests on Preview/Staging, verify Google Sheet storage and `MailApp` emails, clean dummy rows, and enable `EARLY_ACCESS_ENABLED=true` when ready for launch.
