# StayMate Website — Design System

This document captures the visual language, tokens, component patterns, and content integrity rules used in `website/`.

## 1. Brand Colour Palette

Defined as Tailwind CSS v4 `@theme` tokens in [`src/app/globals.css`](./src/app/globals.css):

| Token | Name | Hex | Role & Contrast Notes |
|---|---|---|---|
| `--color-royal` | Royal Blue | `#1769D2` | Primary CTAs, active chips, interactive sliders, accent gradients |
| `--color-royal-700` | Royal Blue Hover / Ink | `#1256AB` | Hover state for primary buttons; AA text contrast on Sky (`#EDF5FF`) |
| `--color-emerald` | Emerald Green | `#16A765` | Brand accent, live-pulse dot, chart fills, dark-surface highlights |
| `--color-emerald-ink` | Emerald Ink | `#0B7A47` | AA-accessible green for body/eyebrow text on `#FFFFFF` and `#E8F7EF` |
| `--color-navy` | Deep Navy | `#102C50` | Primary headings, body copy, dark Safety section canvas, phone bezels |
| `--color-white` | White | `#FFFFFF` | Primary page canvas and card backgrounds |
| `--color-mint` | Soft Mint | `#E8F7EF` | Secondary tinted bands, positive callouts, owner card highlight |
| `--color-sky` | Light Blue | `#EDF5FF` | Tinted section backgrounds, badges, subtle hover fills |
| `--color-muted` | Secondary Text | `#64748B` | Supporting copy, hints, table labels |
| `--color-line` | Hairline Border | `#E2E8F0` | Card and input borders |

## 2. Typography

Loaded via `next/font/google` in [`src/app/layout.tsx`](./src/app/layout.tsx) (self-hosted at build time, zero external network requests at runtime):

- **Display / Headings (`--font-display`):** `Plus Jakarta Sans` (weights `600`, `700`, `800`), tight tracking (`-0.025em`), `text-wrap: balance`.
- **Body / UI (`--font-sans`):** `Inter`, `text-wrap: pretty`, tabular numerals (`tabular-nums`) on currency and percentage readouts.

## 3. Elevation, Radii & Surfaces

- **Cards (`.card`):** `border-radius: 1.5rem`, `1px solid #E2E8F0`, `--shadow-card` (`0 1px 2px rgb(16 44 80 / 0.05), 0 10px 30px -12px rgb(16 44 80 / 0.14)`).
- **Interactive Lift (`.hover-lift`) & 3D Tilt (`src/components/ui/Tilt3D.tsx`):** Pointer-driven CSS 3D rotation (`--rx`, `--ry`) with specular glare (`--mx`, `--my`) and Z-popping inner layers (`.z-pop`, `.z-pop-sm`), disabled automatically on touch devices and when `prefers-reduced-motion` is set.
- **Kinetic 3D Hero Stage & Orbital Elements (`SpatialHeroStage.tsx`, `src/components/ui/Cube3D.tsx`, `globals.css`):** Multi-layer `perspective: 1600px` hero stage featuring auto-orbiting 3-phone showcase cycling (`People Match`, `Real Cost`, `Places`) with pause/resume control, tilted spinning orbital rings (`animate-orbit-ring-3d`), 6-face pure-CSS rotating 3D glass prism cubes (`Cube3D`), and gliding isometric architectural floor grids (`.iso-floor-light`, `.iso-floor-dark`).
- **3D Product Preview Coverflow & Section Motion (`ProductPreview.tsx`, `Problem.tsx`, `Solution.tsx`, `Safety.tsx`, `FinalCTA.tsx`):** Dynamic Coverflow angle transforms (`rotateY(±15deg)`), optional 3D Tour playback, animated waterline wave & floating cost slabs, shimmering segmented bars, and tactile 3D slab shadows (`.slab-3d*`).
- **3D Isometric Illustrations (`src/components/ui/ListingArt.tsx`):** Clean geometric isometric 3D vector dioramas for PG, private room, shared room, flat, and student listings (clearly labelled as illustrative demo content).
- **Buttons (`src/components/ui/Button.tsx`):** Full pill (`rounded-full`), minimum `44px` (`h-11`) or `52px` (`h-13`) touch target, `3px` Royal Blue `:focus-visible` outline with `3px` offset.
- **Phone Frames (`.phone-wrap`, `.phone`):** Hardware-bevelled metallic rim, side button accent, diagonal glass sheen, and `container-type: inline-size` frames where all internal typography and layout scale linearly with `font-size: 4.28cqw` (`1em = 12px` at `280px` width). Zero JavaScript and zero layout shift across mobile, tablet, and desktop.

## 4. Brand Assets

Derived from the approved StayMate logo ([`assets/brand-source/light-mode-logo.jpeg`](./assets/brand-source/light-mode-logo.jpeg)) via [`scripts/make-brand-assets.py`](./scripts/make-brand-assets.py):

- `public/brand/mark-192.png` & `public/brand/mark-512.png` — transparent background house + `S` ribbon + two-person mark.
- `public/brand/mark.webp` & `public/brand/logo-lockup.webp` — optimised WebP copies.
- `src/app/icon.png` & `src/app/apple-icon.png` — App Router icons.
- `src/app/opengraph-image.tsx` — dynamically built `1200×630` social share image.

## 5. Motion & Accessibility Principles

- **Progressive 3D Scroll Reveal (`src/components/ui/Reveal.tsx`):** Content renders visibly with no JS; below-the-fold sections unfold via a 3D perspective transition (`rotateX`, `translate3d`) triggered once by `IntersectionObserver`.
- **Scroll-Linked 3D Choreography (`src/components/ui/ScrollMotion3D.tsx`):** Shared passive `scroll` + `requestAnimationFrame` coordinator writes normalized viewport progress (`--sp`, `--sp-abs`) to `.scroll-3d` sections with zero React re-renders and zero CLS.
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables smooth scrolling, reveal transitions, pointer tilt, and scroll-3D transforms, stops orbital/grid-glide loops, and freezes 3D prisms (`Cube3D`) at a static isometric angle in `globals.css`.
- **Semantic Landmarks & Controls:** Skip link, single `<h1>`, logical heading hierarchy, native `<details>` FAQ accordions, `aria-live="polite"` on interactive calculators/filters, `aria-live="assertive"` error summary on the waitlist form.

## 6. Product Honesty & Labelling Rules

- **Sample / Demo Badges:** All illustrative profiles, compatibility scores, and property cards carry visible amber/navy `Demo` or `Illustrative` labels.
- **Planned Features:** Shared expense splitting, grocery lists, and bill reminders are explicitly tagged `Planned` (the Android app pilot does not yet ship these UI modules).
- **Safety Claims:** Never claims ID/KYC verification or hack-proof guarantees; explicitly notes that ID/title verification is not currently implemented.
- **Waitlist Integrity:** Never displays fake waitlist counters or fake registration confirmations. When `NEXT_PUBLIC_WAITLIST_ENABLED` is not `"true"` or backend credentials are absent, the UI clearly states that registration is not yet open.
