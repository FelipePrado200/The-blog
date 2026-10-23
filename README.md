# The Blog

Um blog moderno construído com Next.js 15, React 19, Prisma, Auth.js e MDX. Design editorial com painel administrativo completo.

## Features

- ✍️ **Editor de Posts em MDX** - Crie artigos com Markdown e JSX
- 💬 **Sistema de Comentários** - Comentários moderados com banco de dados
- 🔐 **Autenticação** - Login com GitHub via Auth.js
- 📊 **Dashboard Admin** - Gerencie posts, comentários e estatísticas
- 🎨 **Design Editorial** - Interface limpa e tipografia cuidada (Newsreader, Inter Tight)
- ⚡ **Performance** - Next.js App Router, Tailwind CSS v4, Turbopack
- 🗄️ **Banco de Dados** - PostgreSQL com Prisma ORM

## Tech Stack

- **Framework**: Next.js 15.5.4 com App Router
- **Linguagem**: React 19 + TypeScript
- **Estilo**: Tailwind CSS v4
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Auth.js v5 (NextAuth)
- **Conteúdo**: MDX via next-mdx-remote
- **Build**: Turbopack (beta em Next.js 15)

## Setup Local

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/FelipePrado200/The-blog.git
cd The-blog
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` baseado em `.env.local.example`:

```env
# Database (use Neon PostgreSQL ou local)
DATABASE_URL="postgresql://user:password@localhost:5432/theblog"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32"  # Gere uma nova secret

# GitHub OAuth
# 1. Vá para https://github.com/settings/apps/new
# 2. Crie uma nova OAuth App
# 3. Use as credenciais abaixo
GITHUB_ID="seu-github-app-id"
GITHUB_SECRET="seu-github-app-secret"

# Lista de usuários GitHub autorizados (separados por vírgula)
AUTHORIZED_GITHUB_USERS="seu-username-github"
```

### 3. Setup do banco de dados

```bash
# Executar migrations do Prisma
pnpm exec prisma migrate dev --name init

# (Opcional) Popular com dados de exemplo
pnpm exec prisma db seed
```

### 4. Rodar em desenvolvimento

```bash
pnpm dev
```

Visite:
- Blog: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Deploy na Vercel

### 1. Push para GitHub

```bash
git push origin main
```

### 2. Conectar no Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Importe o repositório
3. Selecione "Next.js" como framework (detecta automaticamente)

### 3. Variáveis de Ambiente

No painel da Vercel, adicione as variáveis de `.env.local`:

```
DATABASE_URL
NEXTAUTH_URL         (use https://seu-dominio.vercel.app)
NEXTAUTH_SECRET      (gere uma nova com `openssl rand -base64 32`)
GITHUB_ID
GITHUB_SECRET
AUTHORIZED_GITHUB_USERS
```

### 4. Build Settings

- **Build Command**: `next build` (remova `--turbopack` se falhar)
- **Output Directory**: `.next`

### 5. Deploy

Clique "Deploy". Vercel configurará PostgreSQL, SSL e CI/CD automaticamente.

## Arquitetura

```
src/
├── app/
│   ├── (site)/              # Rotas públicas do blog
│   │   ├── page.tsx         # Home
│   │   └── posts/[slug]/    # Post individual
│   ├── admin/               # Rotas protegidas (requer Auth)
│   │   ├── layout.tsx       # Sidebar do painel
│   │   ├── login/           # Login com GitHub
│   │   ├── posts/           # Lista de posts
│   │   ├── comments/        # Moderação
│   │   └── editor/          # Editor de posts
│   └── api/
│       ├── comments/        # POST comentário
│       ├── posts/           # GET posts públicos
│       └── admin/           # Routes protegidas (posts, comments)
├── components/
│   ├── PostCard.tsx         # Card de post na home
│   ├── Post.tsx             # Post completo com typography
│   ├── Comments.tsx         # Lista de comentários
│   └── CommentForm.tsx      # Formulário de comentário
├── lib/
│   ├── auth.ts              # Configuração Auth.js
│   ├── prisma.ts            # Cliente Prisma
│   ├── posts.ts             # Queries de posts
│   └── comments.ts          # Queries de comentários
└── prisma/
    └── schema.prisma        # Modelos de banco de dados
```

## Modelos de Dados

### User
- Autores e admins
- Integração GitHub via OAuth

### Post
- Slug único
- Status: DRAFT / SCHEDULED / PUBLISHED
- Conteúdo em MDX
- Relação com Author, Tags, Comments

### Comment
- Status: PENDING / APPROVED / REJECTED / SPAM
- Moderação manual pelo admin
- Email e nome do comentarista

### Tag
- Categorização de posts
- Relação M2M com posts

## Fluxo de Uso

### Para Leitores
1. Acessam `blog.com`
2. Veem posts publicados
3. Clicam em um post
4. Leem o artigo completo
5. Deixam comentários (vão para moderação)

### Para Admins
1. Acessam `/admin/login`
2. Fazem login com GitHub
3. Vão para `/admin/posts`
4. Criam/editam posts no editor
5. Publicam ou salvar como rascunho
6. Moderarão comentários em `/admin/comments`

## Customização

### Design System
- **Cores**: Edite as paletas em componentes
- **Tipografia**: Newsreader (posts), Inter Tight (UI)
- **Spacing**: Tailwind (múltiplos de 4px)
- **Radius**: 10px (botões/cards), 14px (modals)

### Conteúdo
- Posts estão no banco de dados (não no repo)
- Suporta Markdown completo + JSX (MDX)
- Imagens podem ser hospedadas no Cloudinary ou similar

## Problemas Comuns

### Build falha no Turbopack
Remova `--turbopack` do `package.json`:
```json
"build": "next build"
```

### Auth.js não funciona localmente
Certifique-se que `NEXTAUTH_SECRET` está definido.

### Comentários aparecem como "Pendente"
Vá para `/admin/comments` e aprove os comentários.

## Próximas Etapas

- [ ] Adicionar RSS feed
- [ ] Implementar busca
- [ ] Analytics (Vercel Analytics)
- [ ] Otimizar imagens com Image Optimization
- [ ] Adicionar Newsletter
- [ ] Dark mode

## Licença

MIT
