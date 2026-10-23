"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Artigos" },
  { href: "/tags", label: "Tags" },
  { href: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--paper) 82%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.4)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
        transition:
          "background-color var(--dur-2) var(--ease-io), border-color var(--dur-2) var(--ease-io)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-6 px-[var(--gutter)]"
        style={{
          maxWidth: "var(--page)",
          height: scrolled ? 58 : 72,
          transition: "height var(--dur-2) var(--ease-io)",
        }}
      >
        {/* Marca */}
        <Link href="/" className="group flex items-center gap-[10px]">
          <span
            aria-hidden
            className="block"
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "var(--accent)",
              transition: "transform var(--dur-2) var(--ease)",
            }}
          />
          <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">
            The Blog
          </span>
        </Link>

        {/* Navegação */}
        <nav className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-[var(--r-sm)] px-3 text-[var(--t-ui)] text-ink-2 transition-[color,background-color] duration-200 ease-[var(--ease-io)] hover:bg-panel hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <span
            aria-hidden
            className="mx-2 hidden h-5 w-px bg-line sm:block"
          />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
