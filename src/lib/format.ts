/*
  Datas e números em português do Brasil.
  Usa Intl, que já vem no runtime. Não precisa de date-fns.
*/

const TZ = "America/Sao_Paulo";

const dayMonth = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: TZ,
});

const fullDate = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const clock = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 23 out */
export function formatDayMonth(value: Date | string | null | undefined): string {
  const d = asDate(value);
  if (!d) return "";
  return dayMonth.format(d).replace(".", "");
}

/** 23 de outubro de 2026 */
export function formatFullDate(value: Date | string | null | undefined): string {
  const d = asDate(value);
  if (!d) return "";
  return fullDate.format(d);
}

/** 23/10/2026 */
export function formatShortDate(value: Date | string | null | undefined): string {
  const d = asDate(value);
  if (!d) return "";
  return shortDate.format(d);
}

/** 23 out, 19:40 */
export function formatDateTime(value: Date | string | null | undefined): string {
  const d = asDate(value);
  if (!d) return "";
  return dateTime.format(d).replace(".", "");
}

/** 19:40 */
export function formatClock(value: Date | string | null | undefined): string {
  const d = asDate(value);
  if (!d) return "";
  return clock.format(d);
}

/** Formato ISO para o atributo dateTime do <time>. */
export function isoDate(value: Date | string | null | undefined): string {
  const d = asDate(value);
  return d ? d.toISOString() : "";
}

/**
 * Tempo de leitura em minutos.
 * Usa 220 palavras por minuto e ignora os blocos de código,
 * porque ninguém lê código na mesma velocidade que texto.
 */
export function readingTime(content: string): number {
  if (!content) return 1;

  const codeBlocks = content.match(/```[\s\S]*?```/g) ?? [];
  const codeLines = codeBlocks.join("\n").split("\n").length;
  const prose = content.replace(/```[\s\S]*?```/g, " ");

  const words = prose
    .replace(/[#*_>`\[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  // 220 palavras por minuto de texto, mais 4 segundos por linha de código.
  const minutes = words / 220 + (codeLines * 4) / 60;
  return Math.max(1, Math.round(minutes));
}

/** 1.248 */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}
