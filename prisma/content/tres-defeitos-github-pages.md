Eu passei dias ajustando um site em um ambiente de prévia. Tipografia certa, animações no ponto, tudo medido. Publiquei no GitHub Pages e três defeitos apareceram de uma vez, nenhum deles visível antes.

Os três tinham a mesma causa de fundo: o ambiente de prévia estava gentilmente consertando um arquivo incompleto, e eu nunca soube que ele precisava de conserto.

## Defeito 1: o modo quirks

O primeiro sinal foi o espaçamento. Caixas que estavam certas na prévia ficaram alguns pixels diferentes no ar. Não muito. O suficiente para parecer desleixo.

A causa estava em uma linha que não existia:

```html
<!doctype html>
```

Sem essa declaração, o navegador entra em modo quirks: um modo de compatibilidade que imita erros de navegadores dos anos 90. A mudança mais sentida é o modelo de caixa, que passa a medir `width` incluindo borda e preenchimento.

Para checar, basta uma linha no console:

```js
document.compatMode;
// "CSS1Compat" = padrão. "BackCompat" = modo quirks.
```

O meu respondia `BackCompat`. O ambiente de prévia injetava um doctype por conta própria, então eu nunca tinha visto o problema.

## Defeito 2: acento quebrado

O segundo defeito era mais feio e mais fácil de ver: todo acento virou símbolo errado. "Programação" com til aparecendo como dois caracteres estranhos.

Faltava isto:

```html
<meta charset="utf-8">
```

Sem a declaração, o navegador precisa adivinhar a codificação. Em um documento em português servido sem cabeçalho explícito, o chute comum é `windows-1252`, que lê cada byte do UTF-8 separado. Daí os símbolos.

A regra prática: `charset` precisa aparecer nos primeiros 1024 bytes do documento. Na prática, primeira linha dentro do `<head>`, antes de qualquer coisa.

## Defeito 3: o site inteiro com 980 pixels no celular

O terceiro foi o pior. No celular, o site aparecia inteiro, minúsculo, como se fosse uma página de computador vista de longe.

Faltava o viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Sem essa linha, o Safari e o Chrome no celular assumem uma largura virtual de 980 pixels e encolhem tudo para caber. Todas as minhas media queries eram comparadas contra 980, não contra a largura real do aparelho. Nenhuma pegava.

O `viewport-fit=cover` resolve outra coisa: deixa o conteúdo ir até a borda em telas com entalhe, e libera as variáveis `env(safe-area-inset-*)` para afastar o conteúdo do que atrapalha.

## O cabeçalho que eu agora escrevo primeiro

Os três defeitos somam seis linhas. Hoje elas são a primeira coisa que entra em qualquer arquivo HTML que eu escrevo, antes do conteúdo:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#000000">
<meta name="description" content="...">
```

O `lang` também importa, e não é detalhe de acessibilidade apenas: ele decide a hifenização, as aspas tipográficas e a voz que um leitor de tela usa. Um texto em português marcado como `en` é lido com sotaque errado.

## A lição que não é sobre HTML

O erro de verdade não foi esquecer as tags. Foi confiar em um ambiente que não era o ambiente final.

Prévias, servidores de desenvolvimento e ferramentas de montagem costumam ser generosos. Eles acrescentam o que falta, corrigem o que está torto e mostram a melhor versão possível do seu arquivo. Isso ajuda enquanto você escreve e esconde a verdade quando você publica.

Desde então eu abro o endereço publicado, no aparelho de verdade, antes de considerar qualquer coisa pronta. Leva dois minutos. Os três defeitos acima teriam aparecido em dez segundos.
