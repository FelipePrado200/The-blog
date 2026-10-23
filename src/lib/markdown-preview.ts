/*
  Conversor pequeno de Markdown para HTML, so para a pré-visualização
  do editor. A página pública usa MDX de verdade.

  A entrada passa primeiro por escape de HTML, por isso o texto do
  autor nunca injeta marcação própria.
*/

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Marcação dentro de uma linha: código, negrito, itálico, link. */
function inline(text: string): string {
  return (
    text
      // Código primeiro, para o conteúdo dele não virar negrito.
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)\s]+)\)/g,
        '<a href="$2" rel="noopener noreferrer">$1</a>'
      )
  );
}

export function markdownToHtml(source: string): string {
  if (!source.trim()) return "";

  const lines = escapeHtml(source).split("\n");
  const out: string[] = [];

  let inCode = false;
  let listType: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const closeParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    // Bloco de código
    if (/^\s*```/.test(line)) {
      closeParagraph();
      closeList();
      out.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      out.push(line);
      continue;
    }

    // Linha vazia fecha o paragrafo
    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }

    // Título
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Linha horizontal
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      closeParagraph();
      closeList();
      out.push("<hr />");
      continue;
    }

    // Citacao
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      closeParagraph();
      closeList();
      out.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
      continue;
    }

    // Lista com marcador
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      closeParagraph();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    // Lista numerada
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (numbered) {
      closeParagraph();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }

    // Texto normal
    closeList();
    paragraph.push(line.trim());
  }

  closeParagraph();
  closeList();
  if (inCode) out.push("</code></pre>");

  return out.join("\n");
}

/** Conta as palavras, ignorando marcacao e blocos de código. */
export function wordCount(source: string): number {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`\[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}
