# The Blog

Blog editorial com painel de administração próprio. Next.js 15, React 19, Prisma e PostgreSQL.

O projeto tem duas metades. A metade pública é um blog rápido, com páginas estáticas e revalidação. A metade privada é um painel onde você escreve em Markdown, publica e modera comentários.

## O que ele faz

- Editor de artigos em Markdown e MDX, com prévia ao vivo e salvamento automático
- Comentários próprios, com moderação e defesa básica contra robô
- Login por GitHub, restrito a uma lista de contas autorizadas
- Tema claro e escuro, com a escolha guardada no navegador
- Feed RSS, metadados Open Graph e páginas de tag
- Tempo de leitura e contagem de visitas por artigo

## Ferramentas

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 15.5 (App Router) |
| Interface | React 19 e TypeScript |
| Estilo | Tailwind CSS v4 sobre uma camada de tokens em CSS |
| Banco | PostgreSQL com Prisma |
| Login | Auth.js v5 |
| Conteúdo | MDX via next-mdx-remote |
| Tipografia | Newsreader, Inter Tight e JetBrains Mono |

## Rodar na sua máquina

### 1. Instalar

```bash
git clone https://github.com/FelipePrado200/The-blog.git
cd The-blog
pnpm install
```

### 2. Configurar o ambiente

```bash
cp .env.local.example .env.local
```

Abra o `.env.local` e preencha. Os campos obrigatórios:

- `DATABASE_URL`: uma base PostgreSQL. Para começar sem instalar nada, crie uma gratuita no [Neon](https://neon.tech).
- `AUTH_SECRET`: gere com `openssl rand -base64 32`.
- `GITHUB_ID` e `GITHUB_SECRET`: crie um OAuth App em <https://github.com/settings/developers>. A URL de retorno em desenvolvimento é `http://localhost:3000/api/auth/callback/github`.
- `AUTHORIZED_GITHUB_USERS`: o seu nome de usuário do GitHub. Só quem está nesta lista consegue entrar no painel.

### 3. Criar as tabelas e popular

```bash
pnpm db:migrate     # cria as tabelas
pnpm db:seed        # cria o autor e quatro artigos de exemplo
```

Antes de rodar o seed, vale definir `SEED_AUTHOR_EMAIL` com o e-mail da sua conta do GitHub. Assim o seu primeiro login se liga aos artigos criados, em vez de abrir um segundo usuário.

### 4. Subir

```bash
pnpm dev
```

- Blog: <http://localhost:3000>
- Painel: <http://localhost:3000/admin/login>

## Publicar na Vercel

1. Envie o repositório para o GitHub.
2. Importe o projeto em <https://vercel.com>. O Next.js é detectado sozinho.
3. Copie as variáveis do `.env.local` para as configurações do projeto na Vercel. Troque `NEXT_PUBLIC_BLOG_URL` pelo endereço final e apague `AUTH_URL`, que a Vercel preenche sozinha.
4. Volte ao OAuth App do GitHub e acrescente a URL de retorno de produção: `https://seu-dominio.vercel.app/api/auth/callback/github`.
5. Publique.

O `pnpm build` roda `prisma generate` antes do `next build`, então o cliente do Prisma é gerado no servidor da Vercel sem passo extra.

## Como o acesso funciona

Há três tipos de pessoa no sistema, e vale entender a diferença.

**Visitante.** Lê tudo sem conta. É quase todo o tráfego. O blog nunca pede cadastro para ler.

**Quem comenta.** Preenche nome, e-mail e texto. O e-mail serve apenas para avisar de resposta e nunca aparece no site: a consulta pública lista os campos um a um e deixa o e-mail de fora. Todo comentário entra como `PENDING` e só aparece depois que você aprova.

**Quem escreve.** Entra pelo painel com GitHub. A porta é a lista `AUTHORIZED_GITHUB_USERS`: quem não está nela nunca chega a ter uma conta no banco. Por isso o papel padrão no schema é `ADMIN`. Se um dia você quiser abrir o blog a outros autores sem dar o painel inteiro a eles, troque o padrão para `AUTHOR` em `prisma/schema.prisma` e promova cada pessoa a mão.

## Estrutura

```
prisma/
  schema.prisma        modelos do banco
  seed.ts              autor, tags e artigos de exemplo
  content/             o texto dos artigos de exemplo, em Markdown
src/
  app/
    page.tsx           home
    posts/[slug]/      artigo
    tags/              índice de temas
    sobre/             sobre o autor
    feed.xml/          RSS
    admin/
      login/           entrada (fora do layout do painel, de propósito)
      (painel)/        posts, editor, comentários, tags
    api/               rotas públicas e protegidas
  components/          peças de interface
  lib/
    auth.ts            Auth.js e a lista de acesso
    posts.ts           consultas de artigo
    comments.ts        consultas de comentário
    format.ts          datas e tempo de leitura, via Intl
    markdown-preview.ts conversor pequeno usado só na prévia do editor
```

## Design

O visual não é escolhido componente a componente. Tudo sai de uma camada de tokens no topo do `globals.css`: cores com nome de papel (`--ink-2` é o segundo nível de texto, não "cinza 600"), uma escala tipográfica modular com `clamp()`, espaços em múltiplos de 4 e duas curvas de movimento.

O tema escuro é um bloco que redefine os mesmos tokens. Nenhum componente carrega cor literal, e por isso trocar a marca inteira é mexer em um arquivo.

O corpo do artigo foi escrito à mão em vez de usar as classes `prose`, para ter controle de capitular, citação, bloco de código e medida de leitura de 68 caracteres.

## Comandos

```bash
pnpm dev           # desenvolvimento
pnpm build         # prisma generate + next build
pnpm typecheck     # confere os tipos sem gerar nada
pnpm db:migrate    # aplica as migrações
pnpm db:seed       # popula o banco
pnpm db:studio     # abre o Prisma Studio
```

## Se algo der errado

**O build quebra na Vercel.** Confira se `DATABASE_URL` está definida nas variáveis do projeto. O `prisma generate` precisa dela.

**Não consigo entrar no painel.** Verifique `AUTHORIZED_GITHUB_USERS`. O nome é o do GitHub, não o e-mail, e a lista separa por vírgula. Com a lista vazia ninguém entra, o que é proposital.

**A home aparece com um aviso de banco não conectado.** Falta `DATABASE_URL`. O site foi feito para continuar de pé nesse caso, em vez de mostrar erro.

**O comentário não aparece.** Ele entrou como pendente. Abra `/admin/comments` e aprove.

## Próximos passos

- Sitemap
- Busca por texto
- Aviso por e-mail quando chega comentário
- Imagem de compartilhamento gerada por artigo
