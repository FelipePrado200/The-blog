"use client";

import { useEffect } from "react";

/*
  Soma uma visita do lado do cliente.
  A página do artigo e estática, por isso a contagem não pode
  acontecer durante o render. A chave em sessionStorage evita
  contar duas vezes quando a pessoa volta para o mesmo artigo.
*/
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;

    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* Modo privado pode bloquear. Conta uma vez e segue. */
    }

    const controller = new AbortController();

    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      /* A contagem nunca deve atrapalhar a leitura. */
    });

    return () => controller.abort();
  }, [slug]);

  return null;
}
