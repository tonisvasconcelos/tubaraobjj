# GitHub Pages setup (legacy / optional)

**Production site:** **https://www.tubaraobjj.com** (Vercel). Prefer [CUSTOM_DOMAIN_VERCEL_GODADDY.md](./CUSTOM_DOMAIN_VERCEL_GODADDY.md) and [ENV_AND_DOMAIN_REFERENCE.md](./ENV_AND_DOMAIN_REFERENCE.md).

This page is only if you still use **https://tonisvasconcelos.github.io/tubaraobjj/**. The “Deploy to GitHub Pages” workflow runs **manually** only (`workflow_dispatch`); it does not run on every push to `main`.

---

## 1. Add the repository secret (required)

The GitHub Actions build needs your API URL so the site can call the Railway backend.

1. Open: **https://github.com/tonisvasconcelos/tubaraobjj**
2. Click **Settings** (repo top menu).
3. In the left sidebar, go to **Secrets and variables** → **Actions**.
4. Click **New repository secret**.
5. Use:
   - **Name:** `VITE_API_URL`
   - **Secret:** `https://api-production-a236.up.railway.app`
6. Click **Add secret**.

After this, the next **manual** run of the “Deploy to GitHub Pages” workflow will build with this API URL.

---

## 2. Ensure the latest code is pushed

The workflow and `index.html` have been updated so that:

- The build uses base path `/tubaraobjj/` (fixes 404s for JS/CSS).
- The build uses `VITE_API_URL` from the secret above.

Commit and push these changes to `main` if they are not already there:

- `.github/workflows/deploy.yml` (VITE_BASE_URL and VITE_API_URL)
- `index.html` (favicon fix)

---

## 3. Trigger a deploy

- Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow** → **Run workflow**.

---

## 4. Check that GitHub Pages is enabled

1. Repo **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment**:
   - **Source:** GitHub Actions.

If it’s set to “Deploy from a branch”, switch it to **GitHub Actions** so the workflow deploys the site.

---

## Summary

| Step | What to do |
|------|------------|
| 1 | Add secret `VITE_API_URL` = `https://api-production-a236.up.railway.app` |
| 2 | Push latest workflow + index.html to `main` (if needed) |
| 3 | Run the workflow manually in Actions |
| 4 | Confirm Pages source is “GitHub Actions” |

After that, **https://tonisvasconcelos.github.io/tubaraobjj/** should load and call your Railway API.
