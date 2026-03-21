# Performance review — Tubarão BJJ website

Prioritized findings and recommendations for **www.tubaraobjj.com** (Vite + React SPA + Express API). Impact: **H** high, **M** medium, **L** low. Effort: **S** small, **M** medium, **L** large.

## Summary

| Priority | Area | Impact | Effort | Where |
|----------|------|--------|--------|--------|
| 1 | Route-level code splitting (public + admin) | H | M | [`src/App.jsx`](src/App.jsx), [`src/pages/admin/AdminSection.jsx`](src/pages/admin/AdminSection.jsx) |
| 2 | Background video only where needed | H | S | [`src/layouts/MainLayout.jsx`](src/layouts/MainLayout.jsx), [`src/components/BackgroundVideo.jsx`](src/components/BackgroundVideo.jsx) |
| 3 | Hero / LCP image strategy | H | M | [`src/components/HeroGrid.jsx`](src/components/HeroGrid.jsx) |
| 4 | Swiper / carousel cost on home | H | S | [`src/components/HighlightsCarousel.jsx`](src/components/HighlightsCarousel.jsx) |
| 5 | API + static caching / compression | M | M | [`backend/src/index.js`](backend/src/index.js), [`backend/src/routes/public.js`](backend/src/routes/public.js) |
| 6 | Products API: variant over-fetch | M | S | [`backend/src/routes/public.js`](backend/src/routes/public.js) (`GET /products`) |
| 7 | Dead dependencies / legacy client | L | S | [`package.json`](package.json), [`src/services/api.js`](src/services/api.js), [`src/hooks/useStrapiData.js`](src/hooks/useStrapiData.js) |
| 8 | Remote images without responsive sizes | M | M | Team, store pages + CDN transforms |
| 9 | Third-party placeholders (e.g. via.placeholder.com) | L | S | [`src/components/HighlightsCarousel.jsx`](src/components/HighlightsCarousel.jsx), [`src/components/AboutSection.jsx`](src/components/AboutSection.jsx) |

## 1. Bundle and code splitting

**Finding:** All pages and the full admin UI are eagerly imported. Visiting any route still pulls a large initial JS payload.

**Recommendation:** Use `React.lazy` + `Suspense` per route in `App.jsx`. Lazy-load `AdminSection` and individual admin screens. Add a lightweight fallback UI for suspense boundaries.

## 2. Background video

**Finding:** Video may mount on every public layout route, increasing bandwidth and main-thread work on pages where it adds little value.

**Recommendation:** Render background video only on the home route (or behind `prefers-reduced-motion`, `saveData`, and a mobile breakpoint). Use `preload="none"` when not critical and a static `poster`.

## 3. Hero / LCP

**Finding:** Hero tiles use CSS `background-image`, which complicates `fetchpriority`, `srcset`, and lazy-loading for non-visible tiles.

**Recommendation:** Prefer `<img>` or `<picture>` for the primary hero with `fetchpriority="high"` and explicit dimensions or `aspect-ratio`. Use responsive formats (WebP/AVIF) where assets are controlled.

## 4. Highlights carousel (Swiper)

**Finding:** Swiper JS and CSS load on the home route.

**Recommendation:** Lazy-load the carousel when near the viewport, or dynamically import Swiper only inside `HighlightsCarousel`. Trim unused Swiper modules/CSS.

## 5. API and static assets

**Finding:** Express serves `/uploads` without strong cache headers; JSON responses may not use CDN-friendly caching.

**Recommendation:** Add `compression` (or rely on Railway/Vercel edge gzip). For immutable filenames, use long `Cache-Control`. For public GET JSON, consider short `s-maxage` + `stale-while-revalidate` or ETags.

## 6. Products + variants

**Finding:** Public products endpoint may load all variants in one query without scoping to published products only.

**Recommendation:** Filter variants with a `JOIN` or `WHERE product_id IN (...)` for published products only.

## 7. Dead code / dependencies

**Finding:** `@tanstack/react-query` and `axios` appear unused in active paths; legacy Strapi helpers may be orphaned.

**Recommendation:** Remove unused packages and files, or adopt React Query for caching/deduping fetches (aligns with performance goals).

## 8. Client fetch patterns

**Finding:** Per-page `useEffect` + `fetch` refetches on every navigation.

**Recommendation:** Introduce TanStack Query (already listed in dependencies) with `staleTime` and shared keys, or SWR.

## 9. Static images in `public/images`

**Finding:** Many large files under `public/`; only a subset may be referenced.

**Recommendation:** Audit references, remove unused originals from deploy artifacts, and keep optimized derivatives only.

---

*This document is the deliverable for the “compile performance review” task. Implementation of the items above can be scheduled in follow-up work.*
