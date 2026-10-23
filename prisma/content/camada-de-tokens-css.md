Tailwind resolve o problema de escrever CSS. Ele não resolve o problema de ter um sistema. São coisas diferentes, e confundir as duas é o motivo pelo qual tanta interface feita com Tailwind parece genérica.

O sintoma é sempre o mesmo. Você abre o projeto e encontra `text-[#55555C]` em um arquivo, `text-gray-600` em outro, `text-neutral-500` em um terceiro. Os três querem dizer "texto secundário". Nenhum diz isso.

## O problema não é o utilitário, é o valor solto

Quando eu escrevo `bg-[#F7F7F5]`, eu tomei uma decisão de design dentro de um componente. Essa decisão agora mora ali. Se eu precisar de tema escuro, preciso achar as 40 ocorrências dela. Se o cliente mudar a marca, idem.

O utilitário não é o problema. `bg-panel` é tão curto quanto `bg-[#F7F7F5]` e carrega a intenção. O problema é o valor literal.

## A camada que eu coloco embaixo

Antes de escrever o primeiro componente, eu defino os tokens em CSS puro. Não em um objeto de configuração: em variáveis, no `:root`, onde o navegador as resolve em tempo de execução.

```css
:root {
  --paper: #fcfcfb;
  --panel: #f7f7f5;
  --ink: #16161a;
  --ink-2: #55555c;
  --ink-3: #8a8a90;
  --accent: #4b3fbe;
  --line: #e6e5e1;
}
```

Os nomes importam mais do que parece. `--ink-2` não é "cinza 600". É o segundo nível de texto. O nome descreve o papel, não a aparência, e por isso ele continua certo quando o tema inverte:

```css
[data-theme="dark"] {
  --paper: #0d0d10;
  --ink: #ededf0;
  --ink-2: #c9c9d2;
  --accent: #b9a8ff;
}
```

Repare que o acento clareia no escuro em vez de escurecer. Se o token fosse `--roxo-600`, essa troca seria uma contradição. Como ele é `--accent`, é apenas o mesmo papel com o valor certo para o fundo.

## Ligando nos utilitários

No Tailwind 4, a ponte é o bloco `@theme`:

```css
@theme inline {
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-accent: var(--accent);
  --color-line: var(--line);
}
```

A partir daí, `bg-paper`, `text-ink-2` e `border-line` existem como qualquer outro utilitário. A diferença é que eles apontam para uma variável, e a variável troca com o tema sem nenhum `dark:` espalhado pelos componentes.

Essa última parte é o ganho maior. Um projeto que usa `dark:` em cada elemento tem o tema escuro espalhado em centenas de lugares. Um projeto com tokens tem o tema escuro em um bloco.

## Escala tipográfica, não tamanhos avulsos

A mesma lógica vale para texto. O erro comum é escolher cada tamanho na hora, e terminar com onze tamanhos que não conversam.

Eu defino uma escala e só uso o que está nela:

```css
:root {
  --t-display: clamp(2.75rem, 1.6rem + 5.2vw, 5rem);
  --t-h1: clamp(2.125rem, 1.35rem + 3.4vw, 3.5rem);
  --t-h2: 2rem;
  --t-h3: 1.375rem;
  --t-lead: 1.3125rem;
  --t-body: 1.1875rem;
  --t-ui: 0.9375rem;
  --t-meta: 0.8125rem;
}
```

O `clamp` nos dois primeiros merece explicação. O termo do meio, `1.6rem + 5.2vw`, cresce com a largura da tela, e os extremos travam o resultado. O título acompanha o espaço disponível sem nunca ficar pequeno demais no celular nem absurdo no monitor grande, e sem uma única media query.

Corpo de texto em 19 pixels com entrelinha 1,78 não é chute: é a faixa onde texto longo em serifa fica confortável. Interface em 15 pixels com entrelinha 1,45 também não. Texto para ler e texto para operar têm exigências diferentes.

## Movimento também é token

A parte que quase todo projeto esquece. Se cada transição escolhe sua própria curva e duração, a interface parece feita por cinco pessoas:

```css
:root {
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-io: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-1: 160ms;
  --dur-2: 280ms;
  --dur-3: 560ms;
}
```

Duas curvas bastam para quase tudo. A primeira sai rápido e chega devagar, boa para algo que entra na tela. A segunda é simétrica, boa para troca de estado, como um hover.

E a regra que não se negocia:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

Quem pediu menos movimento tem um motivo. Costuma ser enjoo ou vertigem, não preferência estética.

## O teste que eu uso

Depois de montar a camada, eu faço uma pergunta: dá para trocar a marca inteira mexendo em um arquivo?

Se der, o sistema existe. Se eu precisar abrir componentes, não existe sistema, existe CSS organizado, que é outra coisa.

O segundo teste é mais cruel. Eu procuro `#` nos arquivos de componente. Cada cor literal que aparece ali é uma decisão de design que escapou da camada e virou dívida.
