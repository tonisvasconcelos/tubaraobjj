# Environment variables and domain reference

Canonical production setup after domain cutover:

| Role | URL |
|------|-----|
| Public website | `https://www.tubaraobjj.com/` |
| Admin | `https://www.tubaraobjj.com/admin` |
| API (Railway) | `https://api-production-a236.up.railway.app` (replace if your service URL differs) |

Admin and public site are the **same Vercel deployment**; the admin UI calls the same Railway API as the public site (`VITE_API_URL`). No separate admin backend is required.

---

## Code touchpoints (no secrets in repo)

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_API_URL` | Vercel **Production** env, build time | Base URL for `src/services/publicApi.js` and `src/services/adminApi.js` |
| `VITE_BASE_URL` | Vercel **Production** env, build time | Vite `base` in `vite.config.js`; use **`/`** for root custom domain |
| `CORS_ORIGIN` | Railway **api** service | Comma-separated browser origins allowed by `backend/src/index.js` |
| `API_PUBLIC_URL` | Railway **api** service | Public API origin for absolute upload URLs in `backend/src/middleware/upload.js` |
| `DATABASE_URL` | Railway **api** service | Neon PostgreSQL connection string |

---

## Vercel (Production) — set then redeploy

```env
VITE_BASE_URL=/
VITE_API_URL=https://api-production-a236.up.railway.app
```

Use your real Railway API hostname if it is not `api-production-a236`.

---

## Railway (api service) — set then redeploy

**Minimum `CORS_ORIGIN` for custom domain:**

```env
CORS_ORIGIN=https://www.tubaraobjj.com,http://localhost:5173
```

Add more origins separated by commas if needed, for example:

- `https://tubaraobjj-website.vercel.app` (legacy Vercel URL during migration)
- Preview deployments: only if you use them against production API (not recommended without care)

**API public URL:**

```env
API_PUBLIC_URL=https://api-production-a236.up.railway.app
```

**Neon:** keep existing `DATABASE_URL` from the Neon dashboard (unchanged when only the frontend domain changes).

---

## Redeploy order

1. **Railway** — update `CORS_ORIGIN` (and confirm `API_PUBLIC_URL`), deploy.
2. **Vercel** — confirm env vars, **Redeploy** production so the new `VITE_*` values are baked into the build.

---

## Audit: strings removed from docs (historical)

These were the old public URLs; replace any remaining references in local notes:

- `https://tubaraobjj-website.vercel.app`
- Examples using `https://tubaraobjj.vercel.app` as the primary site URL

Application **source code** does not hardcode the production domain; behavior is entirely env-driven.
