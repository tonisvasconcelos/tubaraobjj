# Guia de Configuração do Strapi CMS

Este guia detalha como configurar o Strapi CMS para o website GFTeam Tubarão.

## Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Banco de dados (PostgreSQL recomendado para produção, SQLite para desenvolvimento)

## Passo 1: Inicializar Projeto Strapi

```bash
# Criar novo projeto Strapi
npx create-strapi-app@latest strapi-backend --quickstart

# Ou com PostgreSQL
npx create-strapi-app@latest strapi-backend
# Escolha: Custom (manual settings)
# Database: PostgreSQL
# Database name: gfteam_tubarao
# Username: seu_usuario
# Password: sua_senha
# Host: localhost
# Port: 5432
```

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto Strapi:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=seu_app_key_aqui
API_TOKEN_SALT=seu_token_salt_aqui
ADMIN_JWT_SECRET=seu_admin_jwt_secret_aqui
TRANSFER_TOKEN_SALT=seu_transfer_token_salt_aqui
JWT_SECRET=seu_jwt_secret_aqui

# Database (se usar PostgreSQL)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gfteam_tubarao
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_SSL=false

# OAuth (opcional)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret
```

## Passo 3: Criar Content Types

Após iniciar o Strapi (`npm run develop`), acesse `http://localhost:1337/admin` e crie uma conta de administrador.

### Company Info (Single Type)

1. Content-Type Builder > Create new single type
2. Nome: `company-info`
3. Campos:
   - `address` - Text (Short text)
   - `phone` - Text (Short text)
   - `email` - Email
   - `instagramUrl` - Text (Short text)
   - `facebookUrl` - Text (Short text)
   - `logo` - Media (Single media)

### Hero Cards (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `hero-card`
3. Campos:
   - `title` - Text (Short text)
   - `description` - Text (Long text)
   - `backgroundImage` - Media (Single media)
   - `link` - Text (Short text)
   - `order` - Number (Integer)
   - `isActive` - Boolean

### About Section (Single Type)

1. Content-Type Builder > Create new single type
2. Nome: `about-section`
3. Campos:
   - `quote` - Text (Long text)
   - `quoteAuthor` - Text (Short text)
   - `description` - Rich text
   - `professorImage` - Media (Single media)
   - `gfteamAffiliation` - Rich text

### Programme (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `programme`
3. Campos:
   - `title` - Text (Short text)
   - `slug` - UID (attached to `title`)
   - `description` - Rich text
   - `icon` - Text (Short text)
   - `image` - Media (Single media, optional)
   - `order` - Number (Integer)
   - `isActive` - Boolean

### Class Schedule (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `class-schedule`
3. Campos:
   - `programme` - Relation (Many-to-one with Programme)
   - `dayOfWeek` - Enumeration (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
   - `startTime` - Time
   - `endTime` - Time
   - `instructor` - Text (Short text)
   - `level` - Enumeration (Beginner, Intermediate, Advanced, Kids)
   - `isActive` - Boolean

### Team Member (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `team-member`
3. Campos:
   - `name` - Text (Short text)
   - `role` - Text (Short text)
   - `bio` - Rich text
   - `photo` - Media (Single media)
   - `order` - Number (Integer)
   - `isActive` - Boolean

### Testimonial (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `testimonial`
3. Campos:
   - `type` - Enumeration (Testimonial, Achievement, Seminar, News)
   - `title` - Text (Short text)
   - `content` - Rich text
   - `image` - Media (Single media)
   - `author` - Text (Short text, optional)
   - `date` - Date
   - `order` - Number (Integer)
   - `isActive` - Boolean

### News (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `news`
3. Campos:
   - `title` - Text (Short text)
   - `slug` - UID (attached to `title`)
   - `content` - Rich text
   - `excerpt` - Text (Long text)
   - `featuredImage` - Media (Single media)
   - `publishedAt` - DateTime
   - `isPublished` - Boolean

### Store Item (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `store-item`
3. Campos:
   - `name` - Text (Short text)
   - `description` - Rich text
   - `price` - Number (Decimal)
   - `image` - Media (Single media)
   - `externalLink` - Text (Short text)
   - `isActive` - Boolean

### Newsletter Subscription (Collection Type)

1. Content-Type Builder > Create new collection type
2. Nome: `newsletter-subscription`
3. Campos:
   - `name` - Text (Short text)
   - `email` - Email
   - `phone` - Text (Short text, optional)
   - `subscribedAt` - DateTime
   - `isActive` - Boolean

## Passo 4: Configurar Permissões da API

1. Settings > Users & Permissions Plugin > Roles
2. Clique em "Public"
3. Para cada Content Type (exceto Newsletter Subscription):
   - Marque "find" e "findOne"
4. Para Newsletter Subscription:
   - Marque apenas "create"

## Passo 5: Configurar CORS

Edite `config/middlewares.js`:

```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://tubarao.com',
        'https://www.tubarao.com',
      ],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

## Passo 6: Popular Dados Iniciais

Após criar os Content Types, acesse o Content Manager e adicione dados de exemplo:

1. **Company Info**: Adicione informações da academia
2. **Hero Cards**: Crie 3 cards (Aulas, Horários, Equipe)
3. **About Section**: Adicione citação e descrição
4. **Programmes**: Crie 4 programas
5. **Testimonials**: Adicione alguns destaques

## Passo 7: Configurar Admin Subdomain (Produção)

Para acessar o admin em `admin.tubarao.com`:

1. Configure DNS para apontar `admin.tubarao.com` para o servidor
2. Configure proxy reverso (Nginx) para rotear `admin.tubarao.com` para porta 1337
3. No Strapi, configure `ADMIN_URL` no `.env`:

```env
ADMIN_URL=https://admin.tubarao.com
```

## Passo 8: Deploy

### Opções de Deploy:

1. **Railway** - Deploy automático com PostgreSQL
2. **Heroku** - Com addon PostgreSQL
3. **DigitalOcean** - App Platform ou Droplet
4. **AWS** - EC2 com RDS
5. **VPS próprio** - Com PM2 e Nginx

### Variáveis de Ambiente para Produção:

Certifique-se de configurar todas as variáveis necessárias no ambiente de produção.

## Suporte

Para dúvidas sobre Strapi, consulte a [documentação oficial](https://docs.strapi.io).
