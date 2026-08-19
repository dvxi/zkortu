"use client";

import { useState, useEffect, useId } from "react";
import { ThumbsUp, MessageSquare, Send } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  text: string;
  date: string;
  likes: number;
  liked?: boolean;
}

const PLACEHOLDER_COMMENTS: Comment[] = [
  {
    id: "p1",
    name: "Krzysztof Nowak",
    text: "Świetny artykuł, czekam na więcej takich materiałów! Redakcja zkortu.pl robi naprawdę dobrą robotę.",
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    likes: 11,
  },
  {
    id: "p2",
    name: "Marta W.",
    text: "Bardzo szczegółowa analiza. Wreszcie portal, który traktuje polskiego kibica tenisowego poważnie.",
    date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    likes: 4,
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "przed chwilą";
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  return `${Math.floor(h / 24)} dni temu`;
}

const AVATAR_COLORS = [
  "oklch(0.17 0.05 155)",
  "oklch(0.42 0.16 200)",
  "oklch(0.48 0.19 280)",
  "oklch(0.52 0.20 30)",
  "oklch(0.44 0.13 140)",
  "oklch(0.46 0.17 330)",
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 select-none"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default function Comments({ articleId }: { articleId: string }) {
  const storageKey = `zkortu-comments-${articleId}`;
  const nameId = useId();
  const textId = useId();

  const [comments, setComments] = useState<Comment[]>(PLACEHOLDER_COMMENTS);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Comment[];
        setComments([...PLACEHOLDER_COMMENTS, ...saved]);
      }
    } catch {
      /* localStorage blocked */
    }
  }, [storageKey]);

  function handleLike(id: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked }
          : c,
      ),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Podaj swoje imię."); return; }
    if (!text.trim()) { setError("Napisz treść komentarza."); return; }
    setError(null);

    const newComment: Comment = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      text: text.trim(),
      date: new Date().toISOString(),
      likes: 0,
    };

    try {
      const raw = localStorage.getItem(storageKey);
      const existing: Comment[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(storageKey, JSON.stringify([...existing, newComment]));
    } catch { /* ignore */ }

    setComments((prev) => [...prev, newComment]);
    setName("");
    setText("");
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 3000);
  }

  return (
    <section className="mt-12 pt-10 border-t border-border" aria-label="Komentarze">
      <h2 className="flex items-center gap-2 text-xl font-black mb-8">
        <MessageSquare className="h-5 w-5 flex-shrink-0" style={{ color: "var(--brand)" }} />
        Komentarze
        <span className="text-base font-normal text-muted-foreground">({comments.length})</span>
      </h2>

      {/* Add comment form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded-2xl border border-border bg-card p-5 space-y-3"
      >
        <p className="text-sm font-semibold mb-1">Dodaj komentarz</p>

        <div>
          <label htmlFor={nameId} className="sr-only">Twoje imię</label>
          <input
            id={nameId}
            type="text"
            placeholder="Twoje imię"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-shadow"
            style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor={textId} className="sr-only">Treść komentarza</label>
          <textarea
            id={textId}
            placeholder="Napisz komentarz..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1200}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none transition-shadow"
            style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
          />
          <p className="text-[11px] text-muted-foreground text-right mt-0.5">{text.length}/1200</p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {justPosted && (
          <p className="text-xs font-medium" style={{ color: "var(--brand)" }}>
            Komentarz opublikowany!
          </p>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "var(--brand)" }}
        >
          <Send className="h-3.5 w-3.5" />
          Opublikuj
        </button>
      </form>

      {/* Comment list */}
      <div className="space-y-7">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar name={comment.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
                <span className="text-sm font-bold">{comment.name}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(comment.date)}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {comment.text}
              </p>
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1.5 mt-2.5 text-xs transition-colors rounded px-1.5 py-0.5 -ml-1.5 hover:bg-muted"
                style={comment.liked ? { color: "var(--brand)", fontWeight: 600 } : {}}
                aria-label={comment.liked ? "Cofnij polubienie" : "Lubię to"}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {comment.likes > 0 && <span>{comment.likes}</span>}
                <span>Lubię to</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
