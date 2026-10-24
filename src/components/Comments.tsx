"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { formatFullDate, isoDate } from "@/lib/format";

interface CommentData {
  id: string;
  name: string;
  content: string;
  createdAt: Date | string;
  author?: { name: string | null; image: string | null } | null;
}

interface CommentsProps {
  postId: string;
  comments: CommentData[];
}

export function Comments({ postId, comments }: CommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const count = comments.length;

  return (
    <section
      id="comentarios"
      className="mx-auto border-t border-line px-[var(--gutter)] py-[var(--s-8)]"
      style={{ maxWidth: "var(--page)" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--measure)" }}
      >
        <div className="flex items-baseline justify-between gap-[var(--s-4)]">
          <h2 className="label">
            {count === 1 ? "1 comentário" : `${count} comentários`}
          </h2>
          {!isOpen ? (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-[length:var(--t-ui)] font-medium text-accent link-grow"
            >
              Escrever
            </button>
          ) : null}
        </div>

        {/* Formulario */}
        {isOpen ? (
          <div className="mt-[var(--s-6)]">
            <CommentForm postId={postId} onCancel={() => setIsOpen(false)} />
          </div>
        ) : null}

        {/* Lista */}
        {count > 0 ? (
          <ul className="mt-[var(--s-7)] space-y-[var(--s-6)]">
            {comments.map((comment) => {
              const name = comment.author?.name ?? comment.name;
              return (
                <li key={comment.id} className="flex gap-[var(--s-4)]">
                  {comment.author?.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={comment.author.image}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full border border-line"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-[length:var(--t-meta)] font-medium text-ink-3"
                      style={{ background: "var(--panel)" }}
                    >
                      {name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-[var(--s-3)]">
                      <span className="text-[length:var(--t-ui)] font-medium text-ink">
                        {name}
                      </span>
                      <time
                        dateTime={isoDate(comment.createdAt)}
                        className="text-[length:var(--t-meta)] text-ink-3"
                      >
                        {formatFullDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-[var(--s-2)] whitespace-pre-wrap text-[length:var(--t-ui)] leading-[1.65] text-ink-2">
                      {comment.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          !isOpen && (
            <p className="mt-[var(--s-5)] text-[length:var(--t-ui)] text-ink-3">
              Nenhum comentário ainda. Seja a primeira pessoa a escrever.
            </p>
          )
        )}
      </div>
    </section>
  );
}
