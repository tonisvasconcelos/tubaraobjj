# GFTeam Tubarão - Website React

Website responsivo para a academia de Jiu-Jitsu GFTeam Tubarão (Vila Isabel e Tijuca, Rio de Janeiro), com portal admin para gestão de conteúdo.

## Tecnologias

- **React 18** + Vite + React Router
- **Tailwind CSS** para estilização
- **Backend Node/Express** (pasta `backend/`) com PostgreSQL, JWT e upload de imagens
- **Swiper** para carrossel de destaques
- **Lucide React** para ícones

## Estrutura

```
TubaraoBJJWebsiteREACT/
├── public/
├── src/
│   ├── components/     # Header, Footer, HeroGrid, etc.
│   ├── contexts/      # AuthContext (admin)
│   ├── layouts/       # MainLayout
│   ├── pages/         # HomePage, TeamPage, AddressesPage, StorePage, Admin
│   ├── services/      # publicApi.js, adminApi.js
│   └── App.jsx
├── backend/
│   ├── src/
│   │   ├── db/        # pool, migrate, seed
│   │   ├── middleware/
│   │   └── routes/    # auth, public, admin
│   └── package.json
├── vercel.json        # SPA rewrite para deploy no Vercel
└── package.json
```

## Instalação

### Frontend

```bash
npm install
cp .env.example .env
```

Edite `.env`:

- `VITE_API_URL` – URL do backend (ex.: `http://localhost:4000` em dev; em produção use a URL do Render/Railway).
- `VITE_BASE_URL` – (opcional) Base do site. Para Vercel use `/` (padrão).

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite `backend/.env`:

- `DATABASE_URL` – PostgreSQL connection string (Neon or any Postgres; Neon URLs include `?sslmode=require`)
- `JWT_SECRET` – string longa e aleatória
- `ADMIN_EMAIL` e `ADMIN_PASSWORD` – credenciais do único usuário admin
- `CORS_ORIGIN` – origem(ns) permitida(s), separadas por vírgula (produção: `https://www.tubaraobjj.com`, mais `http://localhost:5173` para dev)
- `API_PUBLIC_URL` – URL pública do backend (ex.: `https://tubarao-api.up.railway.app`) para fallback de uploads locais
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – recomendado em produção (Railway) para persistência de imagens

Crie o banco e as tabelas:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

## Desenvolvimento

Terminal 1 – backend:

```bash
cd backend && npm run dev
```

Terminal 2 – frontend:

```bash
npm run dev
```

- Site: `http://localhost:5173`
- Admin: `http://localhost:5173/admin` (use o email/senha do seed)
- API: `http://localhost:4000`

## Build

```bash
npm run build
```

Saída em `dist/`. Para Vercel, o padrão já é `VITE_BASE_URL=/`.

## Deploy

### Frontend (Vercel)

1. Conecte o repositório ao Vercel.
2. Defina as variáveis de ambiente (Production):
   - `VITE_API_URL` = URL pública do backend no Railway (ex.: `https://api-production-a236.up.railway.app`)
   - `VITE_BASE_URL` = `/` (domínio customizado na raiz, ex.: **https://www.tubaraobjj.com**)
   - `VITE_SITE_URL` = `https://www.tubaraobjj.com`
   - (opcional) `VITE_GA_MEASUREMENT_ID`, `VITE_GTM_ID` para tracking de eventos
3. No Vercel: **Settings → Domains** — adicione `www.tubaraobjj.com` e configure o DNS na GoDaddy (veja [docs/CUSTOM_DOMAIN_VERCEL_GODADDY.md](docs/CUSTOM_DOMAIN_VERCEL_GODADDY.md)).
4. Build command: `npm run build`; output: `dist`.

O `vercel.json` já configura o rewrite para SPA (todas as rotas → `index.html`).

Referência de variáveis e ordem de redeploy: [docs/ENV_AND_DOMAIN_REFERENCE.md](docs/ENV_AND_DOMAIN_REFERENCE.md).

### Backend (Railway + Neon)

1. **Database (Neon)**  
   - Em [neon.tech](https://neon.tech), crie um novo projeto (ou use um existente) e um banco para este app.  
   - Copie a **connection string** (Connection string) do dashboard — use a que inclui `?sslmode=require` (ou a pooled URL se preferir).

2. **Railway**  
   - Crie um projeto no Railway com um serviço Node apontando para a pasta `backend` (sem precisar de Postgres no Railway).  
   - O arquivo `backend/railway.json` já define start e healthcheck.

3. **Variáveis de ambiente no Railway (serviço api)**  
   - `DATABASE_URL` = connection string do Neon (cola a URL copiada do Neon).  
   - `JWT_SECRET` = string longa e aleatória.  
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD` = credenciais do admin.  
   - `CORS_ORIGIN` = origem do site (ex.: `https://www.tubaraobjj.com,http://localhost:5173`).  
   - `API_PUBLIC_URL` = URL do backend no Railway (ex.: `https://api-production-xxxx.up.railway.app`).  
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (recomendado para imagens).

4. Build: `npm install`; start: `npm start` (o start já roda `db:setup` na primeira vez para criar tabelas e usuário admin no Neon).

## Rotas do site

- `/` – Home
- `/team` – Equipe
- `/addresses` – Unidades
- `/store` – Loja (catálogo + CTA WhatsApp)
- `/aula-experimental` – Landing de conversão para lead de aula experimental
- `/horarios` – Horários
- `/admin` – Login admin
- `/admin/team`, `/admin/branches`, `/admin/products`, `/admin/contacts`, `/admin/highlights`, `/admin/schedules` – Gestão de conteúdo (após login)

## Licença

Todos os direitos reservados GFTeam Tubarão.

## Gate de staging antes de produção

Antes de publicar em `https://www.tubaraobjj.com`, valide em URL temporária:

1. frontend em Vercel Preview;
2. backend em endpoint de staging;
3. fluxos críticos: formulário de contato, aula experimental, checkout sandbox e webhook;
4. SEO técnico: canonical, metadata por rota, `robots.txt` e `sitemap.xml`.

Checklist completo: [`docs/BASELINE_AND_RELEASE_CHECKLIST.md`](docs/BASELINE_AND_RELEASE_CHECKLIST.md).
