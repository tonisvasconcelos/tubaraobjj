# GFTeam Tubarão - Website React

Website responsivo para a academia de Jiu-Jitsu GFTeam Tubarão, localizada em Vila Isabel, Rio de Janeiro.

## Tecnologias

- **React 18** com Vite
- **Tailwind CSS** para estilização
- **Strapi CMS** para gerenciamento de conteúdo
- **Swiper** para carrossel de destaques
- **Lucide React** para ícones
- **Axios** para chamadas à API

## Estrutura do Projeto

```
TubaraoBJJWebsiteREACT/
├── public/
│   └── images/          # Imagens estáticas (logos, placeholders)
├── src/
│   ├── components/      # Componentes React
│   ├── services/        # API client para Strapi
│   ├── hooks/          # Custom hooks
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Entry point
│   └── index.css       # Estilos globais
└── package.json
```

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
```
VITE_STRAPI_API_URL=http://localhost:1337/api
VITE_STRAPI_API_TOKEN=seu_token_aqui
```

## Desenvolvimento

Execute o servidor de desenvolvimento:
```bash
npm run dev
```

O site estará disponível em `http://localhost:5173`

## Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## Configuração do Strapi CMS

### 1. Inicializar Strapi

Em um diretório separado, crie o projeto Strapi:

```bash
npx create-strapi-app@latest strapi-backend --quickstart
```

### 2. Criar Content Types

No painel admin do Strapi (`http://localhost:1337/admin`), crie os seguintes Content Types:

#### Company Info (Single Type)
- `address` (Text)
- `phone` (Text)
- `email` (Email)
- `instagramUrl` (Text)
- `facebookUrl` (Text)
- `logo` (Media - single image)

#### Hero Cards (Collection Type)
- `title` (Text)
- `description` (Text)
- `backgroundImage` (Media - single image)
- `link` (Text)
- `order` (Number)
- `isActive` (Boolean)

#### About Section (Single Type)
- `quote` (Text)
- `quoteAuthor` (Text)
- `description` (Rich Text)
- `professorImage` (Media - single image)
- `gfteamAffiliation` (Rich Text)

#### Programmes (Collection Type)
- `title` (Text)
- `slug` (UID)
- `description` (Rich Text)
- `icon` (Text)
- `image` (Media - single image, optional)
- `order` (Number)
- `isActive` (Boolean)

#### Class Schedules (Collection Type)
- `programme` (Relation - Programme)
- `dayOfWeek` (Enumeration)
- `startTime` (Time)
- `endTime` (Time)
- `instructor` (Text)
- `level` (Enumeration)
- `isActive` (Boolean)

#### Team Members (Collection Type)
- `name` (Text)
- `role` (Text)
- `bio` (Rich Text)
- `photo` (Media - single image)
- `order` (Number)
- `isActive` (Boolean)

#### Testimonials (Collection Type)
- `type` (Enumeration)
- `title` (Text)
- `content` (Rich Text)
- `image` (Media - single image)
- `author` (Text)
- `date` (Date)
- `order` (Number)
- `isActive` (Boolean)

#### News (Collection Type)
- `title` (Text)
- `slug` (UID)
- `content` (Rich Text)
- `excerpt` (Text)
- `featuredImage` (Media - single image)
- `publishedAt` (DateTime)
- `isPublished` (Boolean)

#### Store Items (Collection Type)
- `name` (Text)
- `description` (Rich Text)
- `price` (Decimal)
- `image` (Media - single image)
- `externalLink` (Text)
- `isActive` (Boolean)

#### Newsletter Subscriptions (Collection Type)
- `name` (Text)
- `email` (Email)
- `phone` (Text, optional)
- `subscribedAt` (DateTime)
- `isActive` (Boolean)

### 3. Configurar Permissões

No Strapi Admin:
1. Vá em Settings > Users & Permissions Plugin > Roles
2. Selecione "Public"
3. Marque "find" e "findOne" para todos os Content Types (exceto Newsletter Subscriptions)
4. Para Newsletter Subscriptions, marque apenas "create"

### 4. Configurar CORS

No arquivo `config/middlewares.js` do Strapi:

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
      origin: ['http://localhost:5173', 'https://tubarao.com'], // Adicione seus domínios
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

### 5. Configurar OAuth (Opcional)

Para autenticação OAuth no admin panel:

1. Instale o plugin de OAuth desejado
2. Configure as credenciais no arquivo `.env` do Strapi
3. Configure o subdomain `admin.tubarao.com` no servidor

## Componentes

### Header
Navegação fixa com menu hambúrguer para mobile e navegação horizontal para desktop.

### HeroGrid
Três cards de call-to-action com imagens de fundo e overlay escuro.

### AboutSection
Seção sobre a academia com citação do professor e foto.

### Programmes
Grid de 4 cards mostrando as modalidades oferecidas.

### JoinFamily
Dois cards escuros para "Quero treinar" e "Quero competir".

### HighlightsCarousel
Carrossel Swiper para depoimentos, conquistas e eventos.

### StoreNewsletter
Card da loja e formulário de newsletter lado a lado.

### Footer
Rodapé com links, informações de contato, redes sociais e newsletter.

## Design Responsivo

O site é totalmente responsivo com breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: ≥ 1024px

## Imagens

Adicione as imagens necessárias na pasta `public/images/`:
- `hero-aulas.jpg`
- `hero-horarios.jpg`
- `hero-equipe.jpg`
- `professor-marcio.jpg`
- `logo-tubarao.png`
- `logo-gfteam.png`

## Licença

Todos os direitos reservados GFTeam Tubarão
