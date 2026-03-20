# Custom domain: `www.tubaraobjj.com` (Vercel + GoDaddy)

Production frontend is **Vercel**. Follow these steps to point the GoDaddy domain to Vercel.

## 1. Add the domain in Vercel

1. Open the project **tubaraobjj-website** (or your linked project) in [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings → Domains**.
3. Add **`www.tubaraobjj.com`**.
4. Vercel will show the DNS records you must create (and may offer to verify).

## 2. DNS in GoDaddy

1. Log in to [GoDaddy](https://www.godaddy.com/) → **My Products** → your domain **tubaraobjj.com** → **DNS** / **Manage DNS**.
2. For the **www** hostname:
   - **Type:** CNAME  
   - **Name:** `www`  
   - **Value / Points to:** `cname.vercel-dns.com` (use the exact target Vercel shows if different)  
   - **TTL:** 1 hour (or default)

3. **Apex (`tubaraobjj.com` without www):**  
   - Recommended: in Vercel, add **`tubaraobjj.com`** as a second domain and use Vercel’s instructions (often A records to Vercel’s IPs or a redirect rule from apex → `www`).  
   - Alternatively: GoDaddy **Forwarding** from `https://tubaraobjj.com` → `https://www.tubaraobjj.com` (301).

4. Wait for propagation (often minutes, sometimes up to 48h). Vercel shows **Valid Configuration** when ready.

## 3. SSL

Vercel provisions HTTPS automatically once DNS validates. No extra certificate purchase is required on GoDaddy for the site hosted on Vercel.

## 4. Keep the old Vercel URL during cutover (optional)

You may leave **`*.vercel.app`** assigned to the project for previews or rollback. After cutover, update **Railway `CORS_ORIGIN`** only if you still need to allow that origin (see [ENV_AND_DOMAIN_REFERENCE.md](./ENV_AND_DOMAIN_REFERENCE.md)).

## 5. After DNS is green

Continue with [ENV_AND_DOMAIN_REFERENCE.md](./ENV_AND_DOMAIN_REFERENCE.md) for **Vercel** and **Railway** environment variables and redeploy order.
