"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  status: Status;
  post: { title: string; slug: string };
}

interface Counts {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  SPAM: number;
}

const STATUS_META: Record<Status, { label: string; fg: string; bg: string }> = {
  PENDING: { label: "A revisar", fg: "var(--warn)", bg: "var(--warn-wash)" },
  APPROVED: { label: "Publicado", fg: "var(--ok)", bg: "var(--ok-wash)" },
  REJECTED: { label: "Recusado", fg: "var(--danger)", bg: "var(--danger-wash)" },
  SPAM: { label: "Spam", fg: "var(--danger)", bg: "var(--danger-wash)" },
};

const FILTERS: Array<{ value: Status | "ALL"; label: string }> = [
  { value: "PENDING", label: "A revisar" },
  { value: "APPROVED", label: "Publicados" },
  { value: "SPAM", label: "Spam" },
  { value: "ALL", label: "Todos" },
];

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [filter, setFilter] = useState<Status | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = filter === "ALL" ? "" : `?status=${filter}`;
      const response = await fetch(`/api/admin/comments${query}`);
      if (!response.ok) throw new Error("Falha ao carregar.");
      const data = await response.json();
      setComments(data.comments ?? []);
      setCounts(data.counts ?? null);
    } catch (error) {
      console.error(error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Status) {
    setBusy(id);
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Falha ao atualizar.");

      // Sai da lista quando deixa de pertencer ao filtro atual.
      if (filter !== "ALL" && status !== filter) {
        setComments((list) => list.filter((c) => c.id !== id));
      } else {
        setComments((list) =>
          list.map((c) => (c.id === id ? { ...c, status } : c))
        );
      }

      setCounts((prev) => {
        if (!prev) return prev;
        const target = comments.find((c) => c.id === id);
        if (!target) return prev;
        return {
          ...prev,
          [target.status]: Math.max(0, prev[target.status] - 1),
          [status]: prev[status] + 1,
        };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--panel)" }}>
      {/* ===== Cabecalho ===== */}
      <header
        className="border-b border-line px-[var(--s-6)] py-[var(--s-6)]"
        style={{ background: "var(--paper)" }}
      >
        <div className="mx-auto max-w-[900px]">
          <p className="label">Painel</p>
          <h1 className="font-display mt-[var(--s-2)] text-[2rem] font-semibold leading-none text-ink">
            Comentários
          </h1>

          {/* Filtros */}
          <div className="mt-[var(--s-5)] flex flex-wrap gap-[var(--s-2)]">
            {FILTERS.map((item) => {
              const active = filter === item.value;
              const n =
                item.value === "ALL"
                  ? counts
                    ? Object.values(counts).reduce((a, b) => a + b, 0)
                    : null
                  : counts
                    ? counts[item.value]
                    : null;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className="inline-flex items-center gap-[var(--s-2)] border px-[var(--s-4)] py-[var(--s-2)] text-[length:var(--t-ui)] transition-[color,border-color,background-color] duration-200 ease-[var(--ease-io)]"
                  style={{
                    borderRadius: "var(--r-full)",
                    borderColor: active ? "var(--accent)" : "var(--line)",
                    background: active ? "var(--accent-wash)" : "transparent",
                    color: active ? "var(--accent)" : "var(--ink-2)",
                  }}
                >
                  {item.label}
                  {n !== null ? (
                    <span className="mono tnum text-[length:var(--t-micro)] opacity-70">
                      {n}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===== Lista ===== */}
      <div className="mx-auto max-w-[900px] px-[var(--s-6)] py-[var(--s-6)]">
        {loading ? (
          <ul className="space-y-[var(--s-3)]">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="card fade-in h-[132px]"
                style={
                  {
                    "--i": i,
                    background: "var(--paper)",
                    opacity: 0.6,
                  } as React.CSSProperties
                }
              />
            ))}
          </ul>
        ) : comments.length === 0 ? (
          <div
            className="card dotted grid place-items-center px-[var(--s-6)] py-[var(--s-9)] text-center"
            style={{ background: "var(--paper)" }}
          >
            <p className="font-display text-[1.375rem] font-semibold text-ink">
              {filter === "PENDING"
                ? "Nada a revisar."
                : "Nenhum comentário aqui."}
            </p>
            <p className="mt-[var(--s-2)] max-w-[40ch] text-[length:var(--t-ui)] text-ink-2">
              {filter === "PENDING"
                ? "Todo comentário recebido já passou pela revisão."
                : "Troque o filtro para ver outros comentários."}
            </p>
          </div>
        ) : (
          <ul className="space-y-[var(--s-3)]">
            {comments.map((comment, i) => {
              const meta = STATUS_META[comment.status];
              const isBusy = busy === comment.id;

              return (
                <li
                  key={comment.id}
                  className="card rise p-[var(--s-5)]"
                  style={
                    {
                      "--i": i,
                      background: "var(--paper)",
                      opacity: isBusy ? 0.55 : 1,
                      transition: "opacity var(--dur-1) var(--ease-io)",
                    } as React.CSSProperties
                  }
                >
                  {/* Quem e onde */}
                  <div className="flex flex-wrap items-start justify-between gap-[var(--s-3)]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-[var(--s-3)]">
                        <span className="text-[length:var(--t-ui)] font-medium text-ink">
                          {comment.name}
                        </span>
                        <span className="mono text-[length:var(--t-micro)] text-ink-3">
                          {comment.email}
                        </span>
                      </div>
                      <p className="mt-[var(--s-1)] text-[length:var(--t-meta)] text-ink-2">
                        em{" "}
                        <a
                          href={`/posts/${comment.post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-grow text-ink"
                        >
                          {comment.post.title}
                        </a>
                        <span aria-hidden className="mx-[6px] text-ink-3">
                          ·
                        </span>
                        <span className="mono tnum text-ink-3">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </p>
                    </div>

                    <span
                      className="pill"
                      style={{ color: meta.fg, background: meta.bg }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Texto */}
                  <blockquote
                    className="mt-[var(--s-4)] whitespace-pre-wrap px-[var(--s-4)] py-[var(--s-3)] text-[length:var(--t-ui)] leading-[1.6] text-ink"
                    style={{
                      borderLeft: "2px solid var(--line)",
                      background: "var(--panel)",
                      borderRadius: "0 var(--r-sm) var(--r-sm) 0",
                    }}
                  >
                    {comment.content}
                  </blockquote>

                  {/* Acoes */}
                  <div className="mt-[var(--s-4)] flex flex-wrap gap-[var(--s-2)]">
                    {comment.status !== "APPROVED" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setStatus(comment.id, "APPROVED")}
                        className="btn btn-primary"
                        style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
                      >
                        Publicar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setStatus(comment.id, "PENDING")}
                        className="btn btn-ghost"
                        style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
                      >
                        Tirar do ar
                      </button>
                    )}

                    {comment.status !== "REJECTED" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setStatus(comment.id, "REJECTED")}
                        className="btn btn-ghost"
                        style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
                      >
                        Recusar
                      </button>
                    ) : null}

                    {comment.status !== "SPAM" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setStatus(comment.id, "SPAM")}
                        className="btn btn-ghost"
                        style={{
                          minHeight: 36,
                          fontSize: "var(--t-meta)",
                          color: "var(--danger)",
                        }}
                      >
                        Marcar como spam
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
