"use client";

import { useRef, useState, type FormEvent } from "react";

interface CommentFormProps {
  postId: string;
  onCancel?: () => void;
}

type State = "idle" | "sending" | "sent" | "error";

export function CommentForm({ postId, onCancel }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [chars, setChars] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Guarda a referência agora. Depois do await, currentTarget é null.
    const form = event.currentTarget;
    const data = new FormData(form);

    // Campo isca. Robo preenche, pessoa não vê.
    if (String(data.get("website") ?? "").length > 0) {
      setState("sent");
      return;
    }

    setState("sending");
    setMessage(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          name: data.get("name"),
          email: data.get("email"),
          content: data.get("content"),
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.error ?? "Não foi possível enviar.");
      }

      form.reset();
      setChars(0);
      setState("sent");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Não foi possível enviar."
      );
    }
  }

  if (state === "sent") {
    return (
      <div
        className="card p-[var(--s-5)]"
        style={{ borderColor: "var(--ok)", background: "var(--ok-wash)" }}
      >
        <p className="text-[length:var(--t-ui)] font-medium" style={{ color: "var(--ok)" }}>
          Comentário recebido.
        </p>
        <p className="mt-[var(--s-2)] text-[length:var(--t-meta)] text-ink-2">
          Ele aparece aqui depois da revisão.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {state === "error" && message ? (
        <p
          role="alert"
          className="mb-[var(--s-4)] px-[var(--s-4)] py-[var(--s-3)] text-[length:var(--t-meta)]"
          style={{
            borderRadius: "var(--r-sm)",
            background: "var(--danger-wash)",
            color: "var(--danger)",
          }}
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-[var(--s-3)] sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label mb-[var(--s-2)] block">
            Nome
          </label>
          <input
            id="c-name"
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Como quer ser chamado"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="c-email" className="label mb-[var(--s-2)] block">
            E-mail
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            maxLength={160}
            autoComplete="email"
            placeholder="não aparece no site"
            className="field"
          />
        </div>
      </div>

      {/* Campo isca contra robô. Fora da tela, não escondido do DOM. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label htmlFor="c-website">Site</label>
        <input id="c-website" name="website" type="text" tabIndex={-1} />
      </div>

      <div className="mt-[var(--s-4)]">
        <label htmlFor="c-content" className="label mb-[var(--s-2)] block">
          Comentário
        </label>
        <textarea
          id="c-content"
          name="content"
          required
          rows={5}
          minLength={10}
          maxLength={5000}
          onChange={(e) => setChars(e.target.value.length)}
          placeholder="O que você achou?"
          className="field resize-y"
          style={{ lineHeight: 1.6 }}
        />
        <div className="mt-[var(--s-2)] flex items-center justify-between gap-[var(--s-3)]">
          <p className="text-[length:var(--t-micro)] text-ink-3">
            O e-mail não aparece no site. Serve para avisar da resposta.
          </p>
          <span
            className="mono tnum text-[length:var(--t-micro)]"
            style={{ color: chars > 4800 ? "var(--danger)" : "var(--ink-3)" }}
          >
            {chars}/5000
          </span>
        </div>
      </div>

      <div className="mt-[var(--s-5)] flex flex-wrap gap-[var(--s-3)]">
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn btn-accent"
        >
          {state === "sending" ? "Enviando" : "Enviar comentário"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
