"use client";

import { useEffect, useId, useState } from "react";
import { MessageSquare, Send, ShieldCheck } from "lucide-react";
import { COMMENT_LIMITS } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Comment {
  _id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

const AVATAR_COLORS = ["oklch(0.714 0.16 52.8)", "oklch(0.42 0.16 200)", "oklch(0.48 0.19 280)", "oklch(0.52 0.2 30)", "oklch(0.44 0.13 140)", "oklch(0.46 0.17 330)"];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[(name.charCodeAt(0) + name.length) % AVATAR_COLORS.length];
  return (
    <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }} aria-hidden="true">
      {initials}
    </div>
  );
}

interface Props {
  articleSlug: string;
  enabled: boolean;
}

export default function Comments({ articleSlug, enabled }: Props) {
  const nameId = useId();
  const bodyId = useId();
  const [comments, setComments] = useState<Comment[] | null>(enabled ? null : []);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch(`/api/comments?article=${encodeURIComponent(articleSlug)}`, { cache: "no-store" })
      .then(async (r) => {
        const data = (await r.json()) as { comments?: Comment[]; error?: string };
        if (!active) return;
        if (!r.ok) {
          setLoadError(data.error ?? "Nie udało się wczytać komentarzy.");
          setComments([]);
          return;
        }
        setComments(data.comments ?? []);
      })
      .catch(() => {
        if (!active) return;
        setLoadError("Nie udało się wczytać komentarzy.");
        setComments([]);
      });
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem("zkortu-comment-name");
        if (saved && active) setName(saved);
      } catch {
        /* ignore */
      }
    });
    return () => {
      active = false;
    };
  }, [articleSlug, enabled]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const trimmedName = name.trim();
    const trimmedBody = body.trim();
    if (trimmedName.length < COMMENT_LIMITS.nameMin) return setNotice({ tone: "error", text: "Podaj swoje imię lub pseudonim." });
    if (trimmedBody.length < COMMENT_LIMITS.bodyMin) return setNotice({ tone: "error", text: "Napisz treść komentarza." });

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: articleSlug, name: trimmedName, body: trimmedBody, website, startedAt }),
      });
      const data = (await res.json()) as { ok?: boolean; pending?: boolean; comment?: Comment | null; error?: string };
      if (!res.ok) {
        setNotice({ tone: "error", text: data.error ?? "Nie udało się dodać komentarza." });
        return;
      }
      try {
        localStorage.setItem("zkortu-comment-name", trimmedName);
      } catch {
        /* ignore */
      }
      setBody("");
      if (data.comment) {
        setComments((prev) => [...(prev ?? []), data.comment!]);
        setNotice({ tone: "ok", text: "Komentarz opublikowany." });
      } else {
        setNotice({ tone: "ok", text: "Dziękujemy! Komentarz pojawi się po zatwierdzeniu przez redakcję." });
      }
    } catch {
      setNotice({ tone: "error", text: "Błąd sieci. Spróbuj ponownie." });
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled) return null;

  const count = comments?.length ?? 0;

  return (
    <section className="mt-12 border-t border-border pt-10" aria-label="Komentarze">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-ink">
        <MessageSquare className="h-5 w-5 text-brand" />
        Komentarze
        <span className="text-base font-normal text-muted-foreground">({count})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mb-10 space-y-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-bold text-ink">Dodaj komentarz</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <div>
            <label htmlFor={nameId} className="sr-only">Imię lub pseudonim</label>
            <input
              id={nameId}
              type="text"
              placeholder="Imię lub pseudonim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={COMMENT_LIMITS.nameMax}
              autoComplete="nickname"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand/50"
            />
          </div>
          <div className="hidden" aria-hidden="true">
            <label>
              Strona WWW (zostaw puste)
              <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>
        </div>
        <div>
          <label htmlFor={bodyId} className="sr-only">Treść komentarza</label>
          <textarea
            id={bodyId}
            placeholder="Napisz komentarz…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={COMMENT_LIMITS.bodyMax}
            rows={3}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand/50"
          />
          <p className="mt-0.5 text-right text-[11px] tabular text-muted-foreground">
            {body.length}/{COMMENT_LIMITS.bodyMax}
          </p>
        </div>
        {notice && (
          <p className={cn("text-sm font-medium", notice.tone === "ok" ? "text-emerald-700" : "text-red-600")} role="status">
            {notice.text}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-ink-foreground transition-all hover:bg-ink-muted active:scale-[0.98] disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Wysyłanie…" : "Opublikuj"}
          </button>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Komentarze są moderowane. Bądź kulturalny.
          </p>
        </div>
      </form>

      {comments === null ? (
        <div className="space-y-5" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="h-9 w-9 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <p className="text-sm text-muted-foreground">{loadError}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak komentarzy. Bądź pierwszy!</p>
      ) : (
        <ol className="space-y-6">
          {comments.map((c) => (
            <li key={c._id} className="flex gap-3">
              <Avatar name={c.authorName} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold text-ink">{c.authorName}</span>
                  <time dateTime={c.createdAt} className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</time>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
