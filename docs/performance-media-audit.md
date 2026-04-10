# Production Media Performance Audit

Date: 2026-04-10  
Site: `https://www.tubaraobjj.com`

## Baseline findings

### Lighthouse (mobile, production)
- Performance: **70**
- FCP: **1.4s**
- LCP: **99.8s**
- TTI: **99.8s**
- Total transfer size: **69,318 KiB**

Raw report: `docs/lighthouse-baseline-mobile.json`

### Lighthouse (desktop, production)
- Performance: **96**
- FCP: **0.3s**
- LCP: **0.5s**
- Total transfer size: **68,623 KiB**

Raw report: `docs/lighthouse-baseline-desktop.json`

### Response headers (production)
Checked with `curl -I`.

- `/videos/background.mp4`
  - `Content-Length: 81,749,079` bytes (~77.96 MiB)
  - `Cache-Control: public, max-age=0, must-revalidate`
  - `Content-Type: video/mp4`
- `/images/TubaraoTeam2.PNG`
  - `Content-Length: 16,149,414` bytes (~15.40 MiB)
  - `Cache-Control: public, max-age=0, must-revalidate`
- `/images/casal.PNG`
  - `Content-Length: 14,103,337` bytes (~13.44 MiB)
  - `Cache-Control: public, max-age=0, must-revalidate`
- `/images/Site_ImageBackGround_001.PNG`
  - `Content-Length: 3,476,931` bytes (~3.31 MiB)
  - `Cache-Control: public, max-age=0, must-revalidate`

## Asset priority map

### Critical above-the-fold
- `src/components/HeroGrid.jsx`
  - Hero cards currently render with CSS `background-image`.
  - Assets loaded:
    - `images/TubaraoTeam2.PNG` (~15.40 MiB)
    - `images/Site_ImageBackGround_001.PNG` (~3.31 MiB)
    - `images/ChatGPT Image 16 de jan. de 2026, 13_52_44.png` (~2.17 MiB)
- `src/components/BackgroundVideo.jsx`
  - `videos/background.mp4` (~77.96 MiB)
  - Global component in `src/layouts/MainLayout.jsx`.

### Near-fold
- `src/components/AboutSection.jsx`
  - `images/TubaDesertPB.JPG` (~70.8 KiB)

### Mid/below-fold
- `src/components/Programmes.jsx`
  - Includes `images/casal.PNG` (~13.44 MiB) and other media.
- `src/components/HighlightsCarousel.jsx`
  - Uses API-driven image URLs, rendered as plain `<img>` without loading hints.

### Non-home route media
- `src/pages/TeamPage.jsx`, `src/pages/StorePage.jsx`, `src/pages/AddressesPage.jsx`
  - Mostly lazy images already enabled, but source asset weight may still be high.

## Root causes
1. Very large original PNG/MP4 assets are served directly in production.
2. Hero cards use CSS backgrounds, preventing `srcset/sizes` optimization.
3. Background video is globally mounted and can compete with image loading.
4. Static media from `/public` uses revalidation cache policy (`max-age=0`) rather than immutable hashed caching.

## Implemented changes
- Added responsive media generation pipeline with `sharp`:
  - `scripts/generate-responsive-media.mjs`
  - generated variants under `public/images/optimized/*` (WebP + JPEG sizes).
- Integrated responsive `<picture>` usage in:
  - `src/components/HeroGrid.jsx`
  - `src/components/AboutSection.jsx`
  - `src/components/Programmes.jsx`
- Added lazy/decode hints for carousel images in:
  - `src/components/HighlightsCarousel.jsx`
- Hardened background video strategy in:
  - `src/components/BackgroundVideo.jsx`
  - Desktop-only + network-aware + memory-aware gating.
  - Delayed start to avoid competing with first-paint/LCP assets.
  - `preload="none"` with static poster.
- Added Vercel cache tuning in `vercel.json`:
  - `/images/optimized/*`: long immutable cache.
  - `/videos/*`: bounded cache + stale-while-revalidate.

## Post-change validation

### Lighthouse (mobile)
- Baseline (production): `docs/lighthouse-baseline-mobile.json`
  - Score: **70**
  - LCP: **99.8s**
  - Transfer: **69,318 KiB**
- After (local preview build): `docs/lighthouse-after-mobile.json`
  - Score: **85**
  - LCP: **4.1s**
  - Transfer: **722 KiB**

### Estimated critical asset reduction
- Hero image candidates moved from multi-megabyte PNG files to responsive variants generally in the **~25–300 KiB** range.
- Background video is no longer auto-requested for constrained connections/devices.

## Regression prevention checklist
- Always add new homepage images through `npm run media:generate`.
- Prefer `<picture>` with `srcset` for above-the-fold imagery.
- Avoid CSS `background-image` for critical content images.
- Keep `loading=\"eager\"` + `fetchpriority=\"high\"` for only one true LCP candidate.
- Keep video backgrounds gated by device/network capability.
- Keep large static media under `public/images/optimized/` with cacheable names and verify Vercel headers.
