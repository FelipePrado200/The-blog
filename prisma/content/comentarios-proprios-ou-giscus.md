Quando eu montei este blog, a primeira decisão sobre comentários foi usar o giscus. Depois eu voltei atrás. Vale registrar o porquê, porque a troca não foi técnica.

## O que o giscus resolve

O giscus guarda cada comentário como uma discussão no GitHub Discussions do próprio repositório. Em troca de colar um script, você ganha bastante:

- Nada de banco de dados para comentário.
- Nada de moderação sua. O GitHub cuida de spam e de abuso.
- Nada de guardar e-mail de terceiros, com as obrigações que isso traz.
- Autenticação resolvida.

Para um blog técnico, parece ideal. Foi por isso que eu escolhi primeiro.

## O que ele cobra em silêncio

O custo está em uma frase: para comentar, a pessoa precisa de uma conta no GitHub.

Isso parecia aceitável quando eu imaginava só programadores lendo. Mas um blog bom tem leitor fora da bolha: o designer que achou o artigo de tipografia, a pessoa que estuda e ainda não programa, o recrutador curioso. Nenhum deles vai criar conta no GitHub para dizer que gostou.

E a segunda cobrança: os comentários não são seus. Eles vivem em um repositório. Se o repositório sair do ar, se a conta mudar de nome, se o GitHub mudar de política, a conversa vai junto. O texto do artigo está no meu banco; a resposta ao artigo estava na casa de outro.

## Por que eu troquei

O que decidiu não foi nenhum dos dois pontos acima isolado. Foi o fato de que eu já tinha um banco.

Como o blog já usa PostgreSQL para os artigos e Auth.js para o painel, comentário próprio deixou de ser infraestrutura nova e passou a ser uma tabela a mais. O que antes era "montar um sistema de comentário" virou "acrescentar um modelo":

```prisma
model Comment {
  id      String        @id @default(cuid())
  name    String
  email   String        // Nunca sai nas consultas públicas.
  content String
  status  CommentStatus @default(PENDING)

  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
  SPAM
}
```

Quando o custo de construir cai, a conta muda. Essa é a parte que eu quero deixar registrada: a decisão certa não é fixa. Ela depende do que já existe no projeto.

## O que vem com a escolha

Comentário próprio não é de graça. Ele traz três responsabilidades que o giscus carregava para mim.

**Moderação.** Todo comentário entra como `PENDING` e não aparece no site antes de eu aprovar. Isso significa que o painel precisa de uma tela de revisão, e que eu preciso olhar essa tela.

**Spam.** A primeira defesa é um campo isca: um input escondido fora da tela, que pessoa nenhuma vê e que robô de formulário preenche. Se ele vier preenchido, o comentário é descartado em silêncio:

```ts
if (String(data.get("website") ?? "").length > 0) {
  setState("sent");
  return;
}
```

O silêncio é de propósito. Um robô que recebe erro tenta de novo; um robô que recebe sucesso vai embora. Isso não para ataque dirigido, mas limpa a grande maioria do lixo automático, e custa dez linhas.

**Privacidade.** Eu peço e-mail para poder avisar da resposta, e ele nunca sai em consulta pública. A consulta da página lista campo por campo, em vez de devolver a linha inteira:

```ts
select: {
  id: true,
  name: true,
  content: true,
  createdAt: true,
  // email fica de fora, de propósito.
}
```

Essa escolha é deliberada. Um `include` descuidado em uma rota pública é como vazamento de dado pessoal acontece, e o erro não aparece em teste nenhum: a página funciona, a informação apenas viaja junto.

## Quando eu voltaria para o giscus

Se o blog fosse estático, sem banco e sem painel, eu ficaria com o giscus sem pensar duas vezes. Montar banco, autenticação e moderação só para ter comentário não se paga.

A regra que eu tiro disso: escolha a opção que aproveita o que o projeto já tem. A mesma decisão pode estar certa em um projeto e errada no outro, e quem insiste na "melhor prática" sem olhar o contexto costuma estar carregando peso que não precisava.
