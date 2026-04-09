# Baseline and Release Checklist

This project must validate every change on a temporary URL before production deployment.

## Environments

- Staging frontend URL: Vercel Preview deployment URL.
- Staging backend URL: API staging endpoint.
- Production frontend URL: `https://www.tubaraobjj.com`.

## Baseline Before Any Release Batch

1. Confirm environment variables in staging and production:
   - Frontend: `VITE_API_URL`, `VITE_SITE_URL`, `VITE_BASE_URL`, `VITE_GA_MEASUREMENT_ID` (optional), `VITE_GTM_ID` (optional)
   - Backend: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `API_PUBLIC_URL`, `PAYMENT_PROVIDER`, `MP_ACCESS_TOKEN`
2. Run quality checks:
   - Frontend build: `npm run build`
   - Backend health: `GET /api/health`, `GET /api/health/db`
3. Generate sitemap: `npm run seo:sitemap`
4. Record Lighthouse mobile scores on staging for:
   - `/`
   - `/horarios`
   - `/store`
   - `/aula-experimental`

## Mandatory Staging Validation Gate

All changes must pass these checks on staging before production:

1. Functional validation
   - Main navigation and route access
   - Contact and trial form submissions
   - Store checkout session creation
2. SEO validation
   - Canonical URL per page
   - Title and description per page
   - `robots.txt` and `sitemap.xml` availability
   - JSON-LD structured data rendering
3. Performance validation
   - No major regressions in LCP, CLS, and INP compared with baseline
4. Commerce validation
   - Payment provider sandbox checkout works
   - Webhook updates payment/order state

## Production Promotion Rule

Deploy to `https://www.tubaraobjj.com` only after:

- Staging evidence is recorded
- Blocking issues are closed
- Rollback plan is available for the release
