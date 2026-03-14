# Checklist: Admin Portal + Website Online

Review of everything needed to have the **public website** and **admin portal** live. What’s done ✅ and what’s missing or optional ⚠️.

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
| CORS_ORIGIN | ✅ | Includes Vercel URLs + localhost |
| API_PUBLIC_URL | ✅ | https://api-production-a236.up.railway.app |
| Start command | ✅ | `npm run db:setup && npm start` (creates tables + admin on first run) |
| Healthcheck | ✅ | `/api/health` |
| Public domain | ✅ | https://api-production-a236.up.railway.app |

**Optional / recommended**

| Item | Status | Action if missing |
|------|--------|--------------------|
| Cloudinary (image uploads) | ⚠️ | Variables are placeholders (`your_cloud_name`, etc.). **To enable:** replace with real Cloudinary credentials in Railway → api → Variables. Without this, admin image uploads use local disk and are lost on redeploy. |

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
| Production URL | ✅ | https://tubaraobjj-website.vercel.app (and aliases) |

**Nothing critical missing.** New pushes to the connected branch trigger a new deploy.

---

## 4. CORS ✅

Backend allows:

- Vercel production URL(s)
- localhost (dev)

If you add a **custom domain** on Vercel, add that exact origin to **CORS_ORIGIN** in Railway (comma-separated).

---

## 5. Admin access ✅

| Item | Value |
|------|--------|
| URL | https://tubaraobjj-website.vercel.app/admin |
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

The repo has a workflow `.github/workflows/deploy.yml` that deploys to **GitHub Pages** on push to `main`.

| Issue | Detail |
|-------|--------|
| Wrong env vars | Workflow uses `VITE_STRAPI_API_URL` and `VITE_STRAPI_API_TOKEN` (old Strapi). The app now uses `VITE_API_URL` (and optionally `VITE_BASE_URL`). |
| Result | If GitHub Pages is enabled, the built site will call `http://localhost:4000` for the API (fallback when env is missing), so the live site won’t work correctly. |

**Options:**

- **Use only Vercel:** Disable GitHub Pages (Settings → Pages → Source: None) and keep using https://tubaraobjj-website.vercel.app as the main URL. No change to the workflow needed.
- **Keep GitHub Pages:** In repo **Settings → Secrets and variables → Actions**, add:
  - `VITE_API_URL` = `https://api-production-a236.up.railway.app`
  - `VITE_BASE_URL` = `/tubaraobjj/` (or whatever base path GitHub Pages uses)
  Then in `.github/workflows/deploy.yml`, change the Build step `env` to use these secrets instead of `VITE_STRAPI_*`.

---

## 8. Summary: what’s missing

1. **Cloudinary (optional but recommended)**  
   Replace placeholder Cloudinary variables in Railway with real values so admin image uploads are stored permanently.

2. **Railway Root Directory (if using GitHub deploy)**  
   For the **api** service, set Root Directory = `backend` so build/start run in the backend folder.

3. **GitHub Pages vs Vercel**  
   Decide: either turn off GitHub Pages and use only Vercel, or add `VITE_API_URL` (and `VITE_BASE_URL`) to GitHub Actions secrets and update the workflow so the Pages build uses the Railway API.

4. **Custom domain (optional)**  
   If you add a custom domain on Vercel, add that origin to **CORS_ORIGIN** in Railway.

---

## 9. Quick verification

- **API:** https://api-production-a236.up.railway.app/api/health → `{"ok":true}`
- **Login:** POST to https://api-production-a236.up.railway.app/api/auth/login with `{"email":"admin@tubaraobjj.com","password":"TubaraoAdmin2026"}` → `{ "token", "user" }`
- **Site:** https://tubaraobjj-website.vercel.app
- **Admin:** https://tubaraobjj-website.vercel.app/admin (login with the credentials above)
