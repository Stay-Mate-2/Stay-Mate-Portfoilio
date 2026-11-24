# StayMate Marketing Website

Standalone pre-launch product website for **StayMate** (*"Find your people. Find your place. Live better."*), built with Next.js App Router, TypeScript, React, and Tailwind CSS v4.

> Separated from the StayMate Android & Backend repository (`Stay-Mate-2/Stay-Mate-Android-App`) so the website can be maintained, versioned, and deployed independently.

## Stack

- **Framework:** Next.js 16 (App Router, fully static prerendered pages)
- **Language:** TypeScript (strict mode + `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS v4 + CSS container-query phone mockups
- **Icons & Testing:** `lucide-react`, Vitest

## Project Layout

```text
StayMate-Website/
├── assets/brand-source/   # Approved StayMate light/dark logo source JPEGs
├── docs/                  # Google Form setup, security posture & retention policy docs
├── google-apps-script/    # Optional zero-secret FormEmailer.gs for Sheets custom HTML mail
├── public/brand/          # Optimized transparent PNG/WebP marks
├── scripts/               # Asset generation script (make-brand-assets.py)
├── src/app/               # Static App Router pages, SEO metadata, OG image, sitemap
├── src/components/        # UI primitives, phone mockups, landing sections, mailto helper
├── src/lib/               # Calculator, compat demo, Google Form URL sanitizer, site config
├── DESIGN_SYSTEM.md       # Palette, typography, tokens, honesty rules
├── TESTING_REPORT.md      # Verification, browser/responsive & CSP audit report
├── .env.example           # Public configuration template (zero server secrets)
└── next.config.ts         # Security headers, strict CSP (frame-src docs.google.com) & images
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
| `npm test` | Run Vitest unit & URL validation tests |
| `npm run check` | Run lint, typecheck, tests, and production build |

### Regenerating Brand Mark Assets (Optional)

If [`assets/brand-source/light-mode-logo.jpeg`](./assets/brand-source/light-mode-logo.jpeg) changes, regenerate the transparent web assets and favicons with Python 3 + Pillow:

```bash
python3 scripts/make-brand-assets.py
```

## Environment Variables (All Optional Public Overrides)

See [`.env.example`](./.env.example). Zero server secrets or databases are needed.

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Production URL (e.g. `https://stay-mate-portfoilio.vercel.app`, no trailing slash). |
| `NEXT_PUBLIC_GOOGLE_FORM_URL` | Public | Google Form responder URL (`https://docs.google.com/forms/d/e/.../viewform`). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Support & privacy email (defaults to `staymate2@gmail.com`). |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_LINKEDIN_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_X_URL` | Public | Optional footer social link. Omitted when empty. |
| `NEXT_PUBLIC_YOUTUBE_URL` | Public | Optional footer social link. Omitted when empty. |

## Early-Access Registration Architecture

- The `#early-access` section embeds an official Google Form inline via `<iframe>` (`?embedded=true`) allowed cleanly under strict CSP (`frame-src https://docs.google.com`).
- URL normalization in [`src/lib/google-form.ts`](./src/lib/google-form.ts) strictly permits `https://docs.google.com/forms/.../viewform` links and falls back honestly to a non-collecting notice when unconfigured.
- Google Forms delivers automatic email confirmation receipts directly and stores rows inside the restricted `StayMate_Early_Access_Database` Google Sheet (`staymate2@gmail.com`).
- `/unsubscribe` provides a pre-filled `mailto:staymate2@gmail.com` withdrawal and record-deletion workflow.

See [`docs/GOOGLE_FORM_SETUP.md`](./docs/GOOGLE_FORM_SETUP.md), [`docs/SECURITY.md`](./docs/SECURITY.md), and [`docs/DATA_RETENTION.md`](./docs/DATA_RETENTION.md).

## Deploying to Vercel

1. Connect the GitHub repository (`https://github.com/Stay-Mate-2/Stay-Mate-Portfoilio.git`) in Vercel (**Root Directory**: `.`, **Framework**: Next.js).
2. Create your Google Form per [`docs/GOOGLE_FORM_SETUP.md`](./docs/GOOGLE_FORM_SETUP.md) and either set `DEFAULT_GOOGLE_FORM_URL` in [`src/lib/site.ts`](./src/lib/site.ts) or `NEXT_PUBLIC_GOOGLE_FORM_URL` in Vercel.
3. No Vercel secret environment variables or Redis databases are needed.
