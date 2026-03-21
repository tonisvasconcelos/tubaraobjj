# Checklist: Admin Portal + Website Online

Review of everything needed to have the **public website** and **admin portal** live. What’s done ✅ and what’s missing or optional ⚠️.

**Custom domain (GoDaddy + Vercel):** [CUSTOM_DOMAIN_VERCEL_GODADDY.md](./CUSTOM_DOMAIN_VERCEL_GODADDY.md)  
**Env vars and redeploy order:** [ENV_AND_DOMAIN_REFERENCE.md](./ENV_AND_DOMAIN_REFERENCE.md)

---

## 1. Database (Neon) ✅

| Step | Status | Notes |
|------|--------|--------|
| Neon project created | ✅ | TubaraoBJJ, branch production, DB neondb |
| Connection string with pooler | ✅ | `ep-wild-sunset-acepaue4-pooler.sa-east-1.aws.neon.tech` |
| DATABASE_URL set in Railway | ✅ | Full connection string set on api service |

**Nothing missing.**

---

## 2. Backend (Railway) ✅ / ⚠️

| Step | Status | Notes |
|------|--------|--------|
| Railway project + api service | ✅ | tubaraobjj-api, service api |
| Root directory | ⚠️ | If deploying from **GitHub**: in Railway → api → Settings set **Root Directory** = `backend`. (CLI deploys from `backend/` are already correct.) |
| DATABASE_URL | ✅ | Neon connection string |
| JWT_SECRET | ✅ | Set |
| ADMIN_EMAIL / ADMIN_PASSWORD | ✅ | admin@tubaraobjj.com / TubaraoAdmin2026 |
| CORS_ORIGIN | ✅ | Must include `https://www.tubaraobjj.com` (+ localhost for dev; optional legacy `*.vercel.app`) |
| API_PUBLIC_URL | ✅ | https://api-production-a236.up.railway.app |
| CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET | ⚠️ | Required for production admin uploads. Without these values, upload endpoint returns error and will not save image URLs. |
| Start command | ✅ | `npm run db:setup && npm start` (creates tables + admin on first run) |
| Healthcheck | ✅ | `/api/health` |
| Public domain | ✅ | https://api-production-a236.up.railway.app |

**Optional / recommended**

| Item | Status | Action if missing |
|------|--------|--------------------|
| GitHub Pages | ⚠️ | Optional/legacy static host. Vercel is canonical production host. |

---

## 3. Frontend (Vercel) ✅ / ⚠️

| Step | Status | Notes |
|------|--------|--------|
| Vercel project linked | ✅ | tubaraobjj-website, repo connected |
| Build command | ✅ | `npm run build` (default) |
| Output directory | ✅ | `dist` |
| SPA rewrites | ✅ | `vercel.json` → all routes to `index.html` |
| VITE_BASE_URL | ✅ | `/` (for root deploy) |
| VITE_API_URL | ✅ | Set to Railway API URL |
| Production URL | ✅ | **https://www.tubaraobjj.com** (Vercel custom domain; `*.vercel.app` optional) |

**Nothing critical missing.** New pushes to the connected branch trigger a new deploy.

---

## 4. CORS ✅

Backend allows (via `CORS_ORIGIN`):

- **https://www.tubaraobjj.com** (production)
- Optional: legacy `https://tubaraobjj-website.vercel.app` or previews during migration
- `http://localhost:5173` (local dev)

Production uses **https://www.tubaraobjj.com** — that exact origin must appear in **CORS_ORIGIN** on Railway (comma-separated with other origins if needed). See [ENV_AND_DOMAIN_REFERENCE.md](./ENV_AND_DOMAIN_REFERENCE.md).

---

## 5. Admin access ✅

| Item | Value |
|------|--------|
| URL | https://www.tubaraobjj.com/admin |
| Email | admin@tubaraobjj.com |
| Password | TubaraoAdmin2026 |

Tables and admin user are created on first backend start (db:setup).

---

## 6. Public website ✅

| Page | URL | Data source |
|------|-----|-------------|
| Home | / | Static + highlights from API |
| Team | /team | GET /api/team-members |
| Addresses | /addresses | GET /api/branches |
| Store | /store | GET /api/products |
| Gallery | /gallery | GET /api/gallery |
| Contact form (footer) | #contato | POST /api/contacts |

All of these work as long as VITE_API_URL points to the Railway API (already set).

---

## 7. GitHub Pages (optional / legacy) ⚠️

The repo has a workflow `.github/workflows/deploy.yml` that can deploy to **GitHub Pages** when run manually (**Actions → Deploy to GitHub Pages → Run workflow**). It does **not** run automatically on `git push` (Vercel is canonical).

| Issue | Detail |
|-------|--------|
| Wrong env vars | Older docs mentioned Strapi vars. The app uses `VITE_API_URL` (and optionally `VITE_BASE_URL`). |
| Result | If GitHub Pages is enabled, the built site will call `http://localhost:4000` for the API (fallback when env is missing), so the live site won’t work correctly. |

**Options:**

- **Use only Vercel (recommended):** Disable GitHub Pages (repo **Settings → Pages → Source: None**). Canonical site URL is **https://www.tubaraobjj.com**. The workflow `.github/workflows/deploy.yml` only runs on **manual** `workflow_dispatch` so pushes to `main` do not overwrite Pages by accident.
- **Keep GitHub Pages:** In repo **Settings → Secrets and variables → Actions**, add:
  - `VITE_API_URL` = `https://api-production-a236.up.railway.app`
  - `VITE_BASE_URL` = `/tubaraobjj/` (or whatever base path GitHub Pages uses)
  The build step already uses `secrets.VITE_API_URL` and `VITE_BASE_URL: /tubaraobjj/`; ensure the secret is set before running the workflow.

---

## 8. Summary: what’s missing

1. **Cloudinary (required for production uploads)**  
   Replace placeholder Cloudinary variables in Railway with real values. Production upload now rejects non-durable storage by design.

2. **Railway Root Directory (if using GitHub deploy)**  
   For the **api** service, set Root Directory = `backend` so build/start run in the backend folder.

3. **GitHub Pages vs Vercel**  
   Production is **Vercel** at **https://www.tubaraobjj.com**. Disable GitHub Pages unless you explicitly want a second static host; if you use Pages, set the `VITE_API_URL` Actions secret and run the workflow manually.

4. **Custom domain**  
   Follow [CUSTOM_DOMAIN_VERCEL_GODADDY.md](./CUSTOM_DOMAIN_VERCEL_GODADDY.md) and set **CORS_ORIGIN** / **VITE_*** per [ENV_AND_DOMAIN_REFERENCE.md](./ENV_AND_DOMAIN_REFERENCE.md).

---

## 9. Quick verification (API + Neon)

After any Railway or Neon change, confirm from a browser or `curl`:

- **API:** `https://api-production-a236.up.railway.app/api/health` → `{"ok":true}`
- **DB from API (Neon):** `https://api-production-a236.up.railway.app/api/health/db` → `{"ok":true,"db":"ok"}`  
  - If this returns **404**, redeploy the **api** service from the current `backend` code (older images may not expose this route yet).
  - If this returns **500** or `"db":"error"`, Railway cannot reach Neon — check `DATABASE_URL`, Neon project status, and allowlists.
- **Login:** `POST https://api-production-a236.up.railway.app/api/auth/login` with body `{"email":"admin@tubaraobjj.com","password":"TubaraoAdmin2026"}` → `{ "token", "user" }`
- **Image URL audit:** from `backend/`, run `npm run audit:image-urls` and verify no critical content depends on relative `/uploads/...` paths.

**Frontend (after Vercel env + redeploy):**

- **Site:** https://www.tubaraobjj.com/
- **Admin:** https://www.tubaraobjj.com/admin

---

## 10. Admin → site content regression (after domain cutover)

Same app and API as before: admin saves to Postgres via Railway; the public site reads the same API.

1. Open **https://www.tubaraobjj.com/admin** and log in.
2. Change a visible field (e.g. a highlight, team member, or branch) and save.
3. Open **https://www.tubaraobjj.com/** (or the relevant page) in a normal window or incognito and confirm the change appears.
4. Upload or replace an image where applicable; confirm the image URL loads (HTTPS, no CORS errors in the console on XHR to the API).

If the site loads but API calls fail with CORS errors, **CORS_ORIGIN** on Railway is missing `https://www.tubaraobjj.com` (exact scheme + host, no trailing slash).

---

## 11. Admin login returns 500 (“Erro no servidor”)

If the admin login shows “Erro no servidor” and the browser shows 500 on `/api/auth/login`:

1. **Check DB from Railway:** Open `https://api-production-a236.up.railway.app/api/health/db`.  
   - If it returns **500** or `{"ok":false,"db":"error"}`: the API cannot reach Neon. Check Railway → api → Variables: `DATABASE_URL` must be the full Neon connection string (with pooler host and password). In Neon dashboard, ensure the project is not paused and “Restrict connections” / IP allowlist does not block Railway.  
   - If it returns **200** and `{"ok":true,"db":"ok"}`: the DB is fine; the 500 is likely in auth logic (e.g. missing `admin_users` or bcrypt).

2. **Check Railway logs:** Railway → api → Deployments → select latest → **View logs**. On failed login you should see `[auth/login]` plus the real error (e.g. connection timeout, “relation admin_users does not exist”, etc.). Fix that (env, migrations, or Neon settings).

3. **Backend changes applied:** The pool is configured with SSL for Neon (`neon.tech` in `DATABASE_URL`) and a longer connection timeout; `/api/health/db` was added to test DB connectivity from the API.
