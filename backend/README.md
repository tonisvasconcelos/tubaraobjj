# Tubarão BJJ – API

API Node/Express com PostgreSQL para o site Tubarão BJJ: conteúdo público (equipe, unidades, loja, destaques, contatos) e painel admin (JWT).

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `PORT` – porta (default 4000)
- `DATABASE_URL` – PostgreSQL connection string (Neon recomendado: use a URL do dashboard Neon, com `?sslmode=require`)
- `JWT_SECRET` – segredo para tokens JWT
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – login do admin (usado no seed)
- `CORS_ORIGIN` – origem(s) do frontend, separadas por vírgula (ex.: `https://www.tubaraobjj.com,http://localhost:5173`)
- `API_PUBLIC_URL` – URL pública da API (para URLs de imagens)
- `UPLOAD_DIR` – pasta de uploads (default `./uploads`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – recomendado para produção no Railway (persistência de imagens)

## Banco de dados (Neon)

O backend funciona com qualquer PostgreSQL. Para usar [Neon](https://neon.tech):

1. Crie um projeto e um banco no Neon.
2. No dashboard, copie a **connection string** (inclui `?sslmode=require`).
3. Defina `DATABASE_URL` no Railway (ou no `.env` local) com essa URL.

Não é necessário Postgres no Railway quando se usa Neon.

## Comandos

```bash
npm install
npm run db:migrate   # cria tabelas
npm run db:seed      # cria usuário admin
npm run db:setup     # migrate + seed
npm run dev          # servidor com watch
npm start            # servidor produção
```

## Endpoints públicos (GET)

- `/api/team-members` – equipe publicada
- `/api/branches` – unidades publicadas
- `/api/products` – produtos com variantes
- `/api/highlights` – destaques publicados

## Endpoints públicos (POST)

- `/api/auth/login` – body: `{ email, password }` → `{ token, user }`
- `/api/contacts` – body: `{ name, email, phone?, message }`

## Admin (Header: `Authorization: Bearer <token>`)

- `GET/POST/PUT/DELETE` em `/api/admin/team-members`, `branches`, `products`, `highlights`
- `GET` e `PATCH .../read` em `/api/admin/contacts`
- `POST /api/admin/upload` – multipart file → `{ url }`
