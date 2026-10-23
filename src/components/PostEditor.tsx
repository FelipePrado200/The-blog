"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { markdownToHtml, wordCount } from "@/lib/markdown-preview";
import { formatClock, readingTime } from "@/lib/format";

type Status = "DRAFT" | "SCHEDULED" | "PUBLISHED";

interface Draft {
  id: string | null;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  status: Status;
}

const EMPTY: Draft = {
  id: null,
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  tags: "",
  status: "DRAFT",
};

const STATUS_META: Record<Status, { label: string; fg: string; bg: string }> = {
  DRAFT: { label: "Rascunho", fg: "var(--neutral)", bg: "var(--neutral-wash)" },
  SCHEDULED: { label: "Agendado", fg: "var(--warn)", bg: "var(--warn-wash)" },
  PUBLISHED: { label: "Publicado", fg: "var(--ok)", bg: "var(--ok-wash)" },
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const postId = params.get("id");

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);

  // Guarda o que foi salvo, para o autosave não gravar sem mudança.
  const lastSaved = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Carregar ---------- */
  useEffect(() => {
    if (!postId) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/admin/posts/${postId}`);
        if (!response.ok) throw new Error("Não foi possível abrir o post.");
        const data = await response.json();
        if (cancelled) return;

        const loaded: Draft = {
          id: data.id,
          title: data.title ?? "",
          slug: data.slug ?? "",
          content: data.content ?? "",
          excerpt: data.excerpt ?? "",
          coverImage: data.coverImage ?? "",
          tags: (data.tags ?? [])
            .map((t: { tag: { name: string } }) => t.tag.name)
            .join(", "),
          status: (data.status ?? "DRAFT") as Status,
        };

        setDraft(loaded);
        lastSaved.current = JSON.stringify(loaded);
        setSlugLocked(loaded.status === "PUBLISHED");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  /* ---------- Salvar ---------- */
  const save = useCallback(
    async (overrides: Partial<Draft> = {}, silent = false) => {
      const payload = { ...draft, ...overrides };

      if (!payload.title.trim()) {
        if (!silent) setError("Escreva um título antes de salvar.");
        return null;
      }
      if (!payload.slug.trim()) {
        payload.slug = slugify(payload.title);
      }

      setSaving(true);
      if (!silent) setError(null);

      try {
        const url = payload.id
          ? `/api/admin/posts/${payload.id}`
          : "/api/admin/posts";

        const response = await fetch(url, {
          method: payload.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title,
            slug: payload.slug,
            content: payload.content,
            excerpt: payload.excerpt || null,
            coverImage: payload.coverImage || null,
            status: payload.status,
            tags: payload.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.error ?? "Não foi possível salvar.");
        }

        const next: Draft = { ...payload, id: body.id, status: body.status };
        setDraft(next);
        lastSaved.current = JSON.stringify(next);
        setSavedAt(new Date());
        if (body.status === "PUBLISHED") setSlugLocked(true);

        // Primeira gravação: coloca o id na URL, sem recarregar.
        if (!payload.id && body.id) {
          router.replace(`/admin/editor?id=${body.id}`, { scroll: false });
        }

        return next;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [draft, router]
  );

  /* ---------- Autosave ---------- */
  useEffect(() => {
    // So grava sozinho depois da primeira gravação manual.
    if (!draft.id || loading) return;
    if (JSON.stringify(draft) === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save({}, true), 2000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, loading, save]);

  /* ---------- Excluir ---------- */
  async function remove() {
    if (!draft.id) return;
    const ok = window.confirm(
      "Excluir este post? Os comentários dele saem também. Não da para desfazer."
    );
    if (!ok) return;

    try {
      const response = await fetch(`/api/admin/posts/${draft.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Não foi possível excluir.");
      router.push("/admin/posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  const words = useMemo(() => wordCount(draft.content), [draft.content]);
  const minutes = useMemo(() => readingTime(draft.content), [draft.content]);
  const previewHtml = useMemo(
    () => (showPreview ? markdownToHtml(draft.content) : ""),
    [showPreview, draft.content]
  );
  const meta = STATUS_META[draft.status];

  function patch(changes: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...changes }));
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-[var(--t-ui)] text-ink-3">Abrindo o post</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      {/* ===== Barra de acoes ===== */}
      <div
        className="sticky top-0 z-30 border-b border-line px-[var(--s-5)] py-[var(--s-3)]"
        style={{
          background: "color-mix(in srgb, var(--paper) 88%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-[var(--s-3)]">
          <Link
            href="/admin/posts"
            className="group inline-flex items-center gap-[var(--s-2)] text-[var(--t-meta)] text-ink-3 transition-colors duration-200 hover:text-ink"
          >
            <svg
              viewBox="0 0 16 16"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
              className="transition-transform duration-300 ease-[var(--ease)] group-hover:-translate-x-[3px]"
            >
              <path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" />
            </svg>
            Posts
          </Link>

          <span aria-hidden className="h-4 w-px bg-line" />

          <span className="pill" style={{ color: meta.fg, background: meta.bg }}>
            {meta.label}
          </span>

          <span className="mono tnum text-[var(--t-micro)] text-ink-3">
            {saving
              ? "salvando"
              : savedAt
                ? `salvo ${formatClock(savedAt)}`
                : "não salvo"}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-[var(--s-2)]">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="btn btn-ghost"
              style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
              aria-pressed={showPreview}
            >
              {showPreview ? "Fechar prévia" : "Pré-visualizar"}
            </button>

            <button
              type="button"
              onClick={() => save({ status: "DRAFT" })}
              disabled={saving}
              className="btn btn-ghost"
              style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
            >
              Salvar rascunho
            </button>

            {draft.status === "PUBLISHED" ? (
              <a
                href={`/posts/${draft.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
              >
                Ver no site
              </a>
            ) : (
              <button
                type="button"
                onClick={() => save({ status: "PUBLISHED" })}
                disabled={saving}
                className="btn btn-accent"
                style={{ minHeight: 36, fontSize: "var(--t-meta)" }}
              >
                Publicar
              </button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-auto max-w-[1280px] px-[var(--s-5)] pt-[var(--s-4)]">
          <p
            role="alert"
            className="px-[var(--s-4)] py-[var(--s-3)] text-[var(--t-meta)]"
            style={{
              borderRadius: "var(--r-sm)",
              background: "var(--danger-wash)",
              color: "var(--danger)",
            }}
          >
            {error}
          </p>
        </div>
      ) : null}

      {/* ===== Corpo ===== */}
      <div className="mx-auto max-w-[1280px] px-[var(--s-5)] py-[var(--s-6)]">
        <div className="grid gap-[var(--s-6)] lg:grid-cols-[1fr_300px] lg:gap-[var(--s-7)]">
          {/* ----- Coluna de escrita ----- */}
          <div className="min-w-0">
            <input
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                patch(
                  slugLocked
                    ? { title }
                    : { title, slug: slugify(title) }
                );
              }}
              placeholder="Título do artigo"
              aria-label="Título"
              className="font-display w-full border-0 bg-transparent p-0 text-[2.25rem] font-semibold leading-[1.1] text-ink outline-none placeholder:text-ink-3"
            />

            {/* Slug */}
            <div className="mt-[var(--s-4)] flex items-center gap-[var(--s-2)] border-b border-line pb-[var(--s-4)]">
              <span className="mono text-[var(--t-micro)] text-ink-3">
                /posts/
              </span>
              <input
                value={draft.slug}
                onChange={(e) => patch({ slug: slugify(e.target.value) })}
                disabled={slugLocked}
                aria-label="Endereço do artigo"
                className="mono min-w-0 flex-1 border-0 bg-transparent p-0 text-[var(--t-micro)] text-ink-2 outline-none disabled:opacity-60"
              />
              {slugLocked ? (
                <button
                  type="button"
                  onClick={() => setSlugLocked(false)}
                  className="mono text-[var(--t-micro)] text-accent link-grow"
                  title="Mudar o endereço quebra os links que já existem."
                >
                  destravar
                </button>
              ) : null}
            </div>

            {/* Resumo */}
            <textarea
              value={draft.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
              rows={2}
              maxLength={240}
              placeholder="Resumo. Aparece na home e no Google."
              aria-label="Resumo"
              className="mt-[var(--s-5)] w-full resize-none border-0 bg-transparent p-0 text-[var(--t-lead)] leading-[1.5] text-ink-2 outline-none placeholder:text-ink-3"
            />

            {/* Conteúdo ou prévia */}
            {showPreview ? (
              <div
                className="article mt-[var(--s-6)] border-t border-line pt-[var(--s-6)]"
                style={{ maxWidth: "var(--measure)" }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <textarea
                value={draft.content}
                onChange={(e) => patch({ content: e.target.value })}
                rows={26}
                placeholder={"## Comece aqui\n\nMarkdown e MDX funcionam."}
                aria-label="Conteúdo"
                spellCheck
                className="mono mt-[var(--s-6)] w-full resize-y border-t border-line bg-transparent pt-[var(--s-6)] text-[0.875rem] leading-[1.75] text-ink outline-none placeholder:text-ink-3"
                style={{ fontSize: "0.875rem" }}
              />
            )}

            {/* Contagem */}
            <div className="mt-[var(--s-4)] flex flex-wrap gap-[var(--s-4)] border-t border-line pt-[var(--s-4)]">
              <span className="mono tnum text-[var(--t-micro)] text-ink-3">
                {words} palavras
              </span>
              <span className="mono tnum text-[var(--t-micro)] text-ink-3">
                {minutes} min de leitura
              </span>
              <span className="mono tnum text-[var(--t-micro)] text-ink-3">
                {draft.content.length} caracteres
              </span>
            </div>
          </div>

          {/* ----- Coluna de ajustes ----- */}
          <aside className="space-y-[var(--s-4)]">
            {/* Publicação */}
            <section className="card p-[var(--s-4)]">
              <p className="label">Publicação</p>
              <label
                htmlFor="status"
                className="mt-[var(--s-3)] block text-[var(--t-micro)] text-ink-3"
              >
                Situação
              </label>
              <select
                id="status"
                value={draft.status}
                onChange={(e) => patch({ status: e.target.value as Status })}
                className="field mt-[var(--s-2)]"
              >
                <option value="DRAFT">Rascunho</option>
                <option value="SCHEDULED">Agendado</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
              <p className="mt-[var(--s-3)] text-[var(--t-micro)] leading-[1.5] text-ink-3">
                Rascunho fica invisível no site. Publicado aparece na home na
                hora.
              </p>
            </section>

            {/* Tags */}
            <section className="card p-[var(--s-4)]">
              <p className="label">Tags</p>
              <input
                value={draft.tags}
                onChange={(e) => patch({ tags: e.target.value })}
                placeholder="Next.js, Desempenho"
                aria-label="Tags"
                className="field mt-[var(--s-3)]"
              />
              <p className="mt-[var(--s-2)] text-[var(--t-micro)] text-ink-3">
                Separe por vírgula. Tag nova é criada sozinha.
              </p>

              {draft.tags.trim() ? (
                <ul className="mt-[var(--s-3)] flex flex-wrap gap-[var(--s-2)]">
                  {draft.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <li
                        key={tag}
                        className="label px-[var(--s-2)] py-[3px]"
                        style={{
                          borderRadius: "var(--r-full)",
                          background: "var(--accent-wash)",
                          color: "var(--accent)",
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                </ul>
              ) : null}
            </section>

            {/* Capa */}
            <section className="card p-[var(--s-4)]">
              <p className="label">Imagem de capa</p>
              <input
                value={draft.coverImage}
                onChange={(e) => patch({ coverImage: e.target.value })}
                placeholder="https://..."
                aria-label="Endereço da imagem de capa"
                className="field mono mt-[var(--s-3)]"
                style={{ fontSize: "var(--t-micro)" }}
              />
              <div
                className="dotted mt-[var(--s-3)] overflow-hidden"
                style={{
                  aspectRatio: "16 / 9",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line)",
                }}
              >
                {draft.coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={draft.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <span className="text-[var(--t-micro)] text-ink-3">
                      Sem capa
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-[var(--s-2)] text-[var(--t-micro)] leading-[1.5] text-ink-3">
                Sem capa, a home desenha uma a partir do título.
              </p>
            </section>

            {/* Excluir */}
            {draft.id ? (
              <section className="card p-[var(--s-4)]">
                <p className="label" style={{ color: "var(--danger)" }}>
                  Zona de risco
                </p>
                <p className="mt-[var(--s-3)] text-[var(--t-micro)] leading-[1.5] text-ink-2">
                  Excluir apaga o artigo e os comentários dele.
                </p>
                <button
                  type="button"
                  onClick={remove}
                  className="btn btn-ghost mt-[var(--s-4)] w-full"
                  style={{
                    minHeight: 38,
                    fontSize: "var(--t-meta)",
                    color: "var(--danger)",
                    borderColor: "var(--danger-wash)",
                  }}
                >
                  Excluir post
                </button>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
