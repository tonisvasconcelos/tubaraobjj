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
│   ├── pages/         # HomePage, TeamPage, AddressesPage, StorePage, GalleryPage, Admin
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

- `DATABASE_URL` – connection string PostgreSQL
- `JWT_SECRET` – string longa e aleatória
- `ADMIN_EMAIL` e `ADMIN_PASSWORD` – credenciais do único usuário admin
- `CORS_ORIGIN` – origem permitida (ex.: `https://seu-site.vercel.app`)
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
2. Defina as variáveis de ambiente:
   - `VITE_API_URL` = URL do backend em produção (ex.: `https://tubarao-bjj-api.up.railway.app`)
   - `VITE_BASE_URL` = `/` (para deploy na raiz)
3. Build command: `npm run build`; output: `dist`.

O `vercel.json` já configura o rewrite para SPA (todas as rotas → `index.html`).

### Backend (Railway)

1. Crie um projeto no Railway com:
   - Serviço Node apontando para a pasta `backend`
   - Banco PostgreSQL do próprio Railway
2. O arquivo `backend/railway.json` já define start e healthcheck.
3. Variáveis de ambiente:
   - `DATABASE_URL` (fornecido pelo banco)
   - `JWT_SECRET` (gerar um valor seguro)
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD`
   - `CORS_ORIGIN` = URL do frontend no Vercel (ex.: `https://tubaraobjj.vercel.app`)
   - `API_PUBLIC_URL` = URL do próprio backend no Railway (ex.: `https://tubarao-bjj-api.up.railway.app`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (fortemente recomendado para imagens)
4. Build command: `npm install` e start `npm start`.
5. Após o primeiro deploy, abra o shell do serviço Railway e rode `npm run db:setup` para criar tabelas e usuário admin.

## Rotas do site

- `/` – Home
- `/team` – Equipe
- `/addresses` – Unidades
- `/store` – Loja (catálogo + CTA WhatsApp)
- `/gallery` – Galeria
- `/admin` – Login admin
- `/admin/team`, `/admin/branches`, `/admin/products`, `/admin/gallery`, `/admin/contacts`, `/admin/highlights` – Gestão de conteúdo (após login)

## Licença

Todos os direitos reservados GFTeam Tubarão.
