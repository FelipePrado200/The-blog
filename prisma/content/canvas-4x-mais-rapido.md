Um site de portfólio meu rodava a 6 quadros por segundo em um notebook comum. Não em um aparelho antigo: em um notebook de trabalho, com o Chrome aberto e nada de especial acontecendo. O site tinha um campo de ruído animado em canvas atrás do conteúdo, e esse campo comia a máquina inteira.

A saída óbvia era tirar a animação. Eu não queria. A animação era o site. Então a pergunta virou outra: dá para manter exatamente o mesmo visual e pagar quatro vezes menos por ele?

Dá. No fim ficou em 29,9 quadros por segundo, com a qualidade visual máxima intacta. Este artigo mostra as três mudanças que fizeram isso, e como eu medi cada uma.

## Primeiro: medir, nunca adivinhar

Antes de tocar em uma linha, eu precisava de um número. Otimização sem medida é superstição.

O ponto de partida foi contar quadros de verdade, com `requestAnimationFrame`, em vez de confiar na impressão de que "parece travado":

```js
let frames = 0;
let start = performance.now();

function tick() {
  frames++;
  const elapsed = performance.now() - start;
  if (elapsed >= 1000) {
    console.log("fps:", (frames * 1000) / elapsed);
    frames = 0;
    start = performance.now();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

Com isso na mão, o diagnóstico ficou claro. O peso não estava no download. Os arquivos somavam pouco. O peso estava no custo de cada quadro: trigonometria dentro de um laço aninhado, e um `filter: blur()` enorme em cima de tudo.

## Mudança 1: tirar o seno de dentro do laço

O campo de ruído calculava, para cada célula da grade, algo assim:

```js
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const n =
      Math.sin(x * 0.3 + t * 0.32) *
      Math.cos(y * 0.2 - t * 0.24) +
      Math.sin((x - y) * 0.1 + t * 0.16) * 0.8;
    // desenha a célula
  }
}
```

Em uma grade de 80 por 45 células, isso dá 3600 células. Cada uma chamava `Math.sin` e `Math.cos` várias vezes. Por quadro. Sessenta vezes por segundo.

O detalhe importante: o termo do tempo é o mesmo para todas as células dentro de um quadro. Só a parte que depende de `x` e de `y` muda. E seno de uma soma se separa:

> sen(A + B) = sen A · cos B + cos A · sen B

Ou seja, `Math.sin(x * 0.3 + t * 0.32)` pode virar `sin[x] * cos(T) + cos[x] * sin(T)`, onde `sin[x]` e `cos[x]` são tabelas montadas uma vez (a grade não muda de tamanho a cada quadro) e `cos(T)`, `sin(T)` são dois valores calculados uma vez por quadro.

O laço interno passou a ter apenas multiplicação e soma:

```js
// Uma vez por quadro, não por célula:
const P = t * 0.32;
const cP = Math.cos(P), sP = Math.sin(P);

for (let x = 0; x < cols; x++) {
  SA[x] = sinA[x] * cP + cosA[x] * sP;
}
```

Duas coisas valem o registro aqui.

A primeira: eu não confiei na álgebra. Antes de trocar, rodei as duas versões lado a lado sobre os mesmos valores e comparei a saída. A diferença máxima foi de 6,9 × 10⁻¹⁵, que é ruído de ponto flutuante, não mudança de comportamento. A imagem é idêntica porque a matemática é idêntica.

A segunda: a conta ficou 15,3 vezes mais rápida isolada. No quadro inteiro o ganho foi menor, porque desenhar também custa. Ganho isolado nunca é ganho total, e dizer o contrário é enganar o leitor.

## Mudança 2: trocar o blur por uma máscara

Em cima do campo havia três manchas de luz com `filter: blur(90px)`. Visualmente, ótimo. Para a GPU, caro: um blur desse tamanho obriga o navegador a pintar a camada e reprocessá-la inteira, e o custo cresce com a área.

A substituição foi um gradiente cônico com `mask-image` radial. O gradiente dá a cor, e a máscara faz a borda sumir sem nenhum blur:

```css
.aurora i {
  background:
    radial-gradient(closest-side circle at 50% 50%,
      rgba(170, 205, 240, .8), transparent 45%),
    conic-gradient(from 210deg, #8be9ff, #b7a4ff 90deg, #8affd8 240deg, #8be9ff);
  mask-image: radial-gradient(closest-side circle,
    #000 0%, rgba(0, 0, 0, .65) 40%, transparent 95%);
}
```

Esta parte deu mais trabalho do que a trigonometria, por um motivo que vale contar.

A minha primeira tentativa foi trocar o blur por quatro manchas radiais separadas. Numericamente, parecia razoável. Visualmente, estava errado: o original era um banho de luz contínuo, e o meu resultado eram quatro bolhas distintas.

Pior: a minha segunda tentativa deu um erro médio *menor* que a primeira, e continuava obviamente errada ao olho. O número que eu tinha escolhido para medir (erro médio por pixel) não capturava o que importava, que era a continuidade da mancha. Métrica ruim dá confiança falsa.

O que resolveu foi o gradiente cônico com máscara, que derrubou o erro para 1,12 em 255, mais uma névoa no centro para esconder o ponto onde as cores do cônico se encontram.

A lição fica: quando a métrica discorda do olho, desconfie da métrica.

## Mudança 3: qualidade que se ajusta à máquina

As duas mudanças acima deixam o site mais rápido em qualquer aparelho. Mesmo assim, "qualquer aparelho" é uma faixa larga: existe máquina que aguenta tudo e máquina que não aguenta.

Em vez de escolher um meio termo que fica ruim nos dois lados, o site mede o tempo de quadro nos primeiros segundos e escolhe uma faixa de qualidade:

```js
const TIERS = {
  3: { cell: 22, dpr: 1.5,  fieldMs: 33, aa: true  },
  2: { cell: 26, dpr: 1.25, fieldMs: 40, aa: true  },
  1: { cell: 32, dpr: 1,    fieldMs: 50, aa: false },
};
```

Em uma máquina folgada, a grade fica fina, o canvas desenha em 1,5x a resolução e o campo atualiza a 30 por segundo. Em uma máquina apertada, a grade engrossa, a resolução cai para 1x e o campo atualiza a 20 por segundo. O desenho continua o mesmo; muda quanto detalhe ele carrega.

Duas regras que eu sigo aqui:

- A faixa alta nunca é melhor do que o design pedia. Ela é o design. As faixas abaixo é que cedem.
- A animação para quando sai da tela, com `IntersectionObserver` e `animation-play-state`. Não faz sentido pagar por um quadro que ninguém vê.

## O resultado

| Cenário | Antes | Depois |
| --- | --- | --- |
| Notebook comum | 6,4 fps | 29,9 fps |
| Mesmo notebook, CPU 4x mais lenta | 6,3 fps | 27,0 fps |

O número de que eu mais gosto é o segundo. Com a CPU estrangulada de propósito, o site depois da mudança roda mais rápido do que rodava antes sem nenhum estrangulamento. E a qualidade visual máxima não mudou: as duas versões desenham a mesma imagem.

## O que eu levo disso

Três coisas, e nenhuma é sobre canvas.

Primeiro, o gargalo quase nunca está onde a intuição aponta. Eu tinha certeza de que o problema era o tamanho dos arquivos. Era o custo por quadro.

Segundo, identidade matemática é a otimização mais barata que existe, porque ela não troca nada. Não é menos qualidade por mais velocidade; é a mesma conta, escrita melhor.

Terceiro, e o mais importante: valide a métrica antes de confiar nela. Eu quase mandei para produção uma versão com erro numérico menor e aparência pior. Quem olha o site não vê o seu número. Vê a tela.
