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
├── docs/WAITLIST_API.md   # Server-to-server waitlist contract with StayMate backend
├── public/brand/          # Optimized transparent PNG/WebP marks
├── scripts/               # Asset generation script (make-brand-assets.py)
├── src/app/               # Pages, SEO metadata, OG image, sitemap, /api/waitlist routes
├── src/components/        # UI primitives, phone mockups, landing sections
├── src/lib/               # Calculator, compat demo, Zod schemas, rate limiter, site config
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
| `npm test` | Run Vitest unit & route handler tests |
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
| `NEXT_PUBLIC_SITE_URL` | Public | Production URL (e.g. `https://staymate.in`, no trailing slash). Leave empty until domain is known; canonical URLs and `/sitemap.xml` activate only when set. |
| `NEXT_PUBLIC_WAITLIST_ENABLED` | Public | Must be `"true"` to enable submitting the waitlist form. Otherwise the form displays *"Registration isn't open yet"*. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Optional footer/privacy contact email. Omitted when empty. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_LINKEDIN_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_X_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_YOUTUBE_URL` | Public | Optional footer social link. Omitted when empty. |
| `WAITLIST_API_URL` | **Server-only** | Origin of the deployed StayMate backend (HTTPS required in production; `http://localhost` / `http://127.0.0.1` allowed locally). |
| `WAITLIST_INGEST_KEY` | **Server-only** | Shared 32+ char secret matching `WAITLIST_INGEST_KEY` on the StayMate backend (`openssl rand -hex 32`). Never prefix with `NEXT_PUBLIC_`. |

## Backend Waitlist Integration

The browser never talks directly to the StayMate backend or database.

1. Form submissions go to same-origin `POST /api/waitlist` ([`src/app/api/waitlist/route.ts`](./src/app/api/waitlist/route.ts)).
2. The Route Handler checks same-origin, enforces an in-memory burst rate limit, validates strictly with Zod, checks the honeypot and minimum fill time, and returns `503 NOT_CONFIGURED` if `WAITLIST_API_URL` / `WAITLIST_INGEST_KEY` are missing.
3. When configured, it forwards `{ name, email, category, city, consent }` server-to-server to `POST ${WAITLIST_API_URL}/v1/waitlist` with `X-Waitlist-Key` and `X-Client-IP`.
4. Consent withdrawal (`POST /api/waitlist/unsubscribe`) works the same way via `/unsubscribe`.

Full backend contract & MongoDB schema: [`docs/WAITLIST_API.md`](./docs/WAITLIST_API.md) (the Express waitlist API implementation lives in the separate `StayMate/backend/` repository).

### Testing Website + Backend Locally Together

```bash
# Terminal 1 (StayMate backend repository): start backend with in-memory MongoDB
WAITLIST_INGEST_KEY=$(openssl rand -hex 32)
export WAITLIST_INGEST_KEY
npm run dev:backend

# Terminal 2 (StayMate-Website): point website to local backend
NEXT_PUBLIC_WAITLIST_ENABLED=true \
WAITLIST_API_URL=http://127.0.0.1:4000 \
WAITLIST_INGEST_KEY=$WAITLIST_INGEST_KEY \
npm run dev
```

## Deploying to Vercel

> **Vercel Plan Note:** Vercel's free **Hobby** plan only permits personal, non-commercial projects; startup/commercial marketing sites (even pre-revenue) require Vercel **Pro** under Vercel's Fair Use Guidelines. Because this website uses standard Next.js static rendering + two standard Route Handlers, it can also be deployed to other hosts (e.g., Cloudflare Pages / Netlify / self-hosted Node) if desired.

### Connecting a Standalone GitHub Repository to Vercel

1. Push `StayMate-Website/` to its own GitHub repository.
2. In the Vercel dashboard, click **Add New → Project** and import that website repository.
3. Keep **Root Directory** at the repository root (`.`) and Framework Preset as **Next.js** (Install: `npm install`, Build: `npm run build`, Output: `.next`).
4. Add environment variables in **Project Settings → Environment Variables**:
   - Initially (before backend deployment): set `NEXT_PUBLIC_WAITLIST_ENABLED=false` (or leave unset). The site deploys cleanly and honestly tells visitors registration isn't open yet.
   - Once the StayMate backend + MongoDB Atlas are deployed over HTTPS: set `WAITLIST_API_URL`, `WAITLIST_INGEST_KEY` (server-only — never `NEXT_PUBLIC_`), `NEXT_PUBLIC_WAITLIST_ENABLED=true`, and redeploy.
5. **Custom Domain:** Add your domain in **Project Settings → Domains**, configure the DNS `A` / `CNAME` records shown by Vercel, wait for automatic TLS certificate issuance, then set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` and redeploy so canonical tags, Open Graph URLs, `robots.txt`, and `sitemap.xml` activate.
