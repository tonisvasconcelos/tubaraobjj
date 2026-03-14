# Tubarão BJJ – API

API Node/Express com PostgreSQL para o site Tubarão BJJ: conteúdo público (equipe, unidades, loja, galeria, destaques, contatos) e painel admin (JWT).

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `PORT` – porta (default 4000)
- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – segredo para tokens JWT
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – login do admin (usado no seed)
- `CORS_ORIGIN` – origem(s) do frontend (ex.: `https://seu-app.vercel.app`)
- `API_PUBLIC_URL` – URL pública da API (para URLs de imagens)
- `UPLOAD_DIR` – pasta de uploads (default `./uploads`)

## Comandos

```bash
npm install
npm run db:migrate   # cria tabelas
npm run db:seed      # cria usuário admin
npm run dev          # servidor com watch
npm start            # servidor produção
```

## Endpoints públicos (GET)

- `/api/team-members` – equipe publicada
- `/api/branches` – unidades publicadas
- `/api/products` – produtos com variantes
- `/api/gallery` – galeria publicada
- `/api/highlights` – destaques publicados

## Endpoints públicos (POST)

- `/api/auth/login` – body: `{ email, password }` → `{ token, user }`
- `/api/contacts` – body: `{ name, email, phone?, message }`

## Admin (Header: `Authorization: Bearer <token>`)

- `GET/POST/PUT/DELETE` em `/api/admin/team-members`, `branches`, `products`, `gallery`, `highlights`
- `GET` e `PATCH .../read` em `/api/admin/contacts`
- `POST /api/admin/upload` – multipart file → `{ url }`
