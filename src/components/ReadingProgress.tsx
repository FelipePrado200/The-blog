"use client";

import { useEffect, useRef } from "react";

/*
  Barra fina no topo que mostra o quanto falta do artigo.
  Escreve direto no style do elemento e usa requestAnimationFrame,
  para não disparar um render do React a cada pixel de rolagem.
*/
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${ratio})`;
      el.style.opacity = ratio > 0.004 ? "1" : "0";
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="progress"
      style={{
        width: "100%",
        transform: "scaleX(0)",
        opacity: 0,
        transition: "opacity var(--dur-2) var(--ease-io)",
      }}
    />
  );
}
