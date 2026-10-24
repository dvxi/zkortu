"use client";

import { useState } from "react";
import { Bug, CheckCircle2, ChevronDown, Handshake, HelpCircle, Newspaper, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const subjects = [
  { value: "general", label: "Ogólne zapytanie", icon: HelpCircle, desc: "Pytania i sugestie" },
  { value: "news", label: "Redakcja", icon: Newspaper, desc: "Aktualności i treści" },
  { value: "bug", label: "Błąd / usterka", icon: Bug, desc: "Zgłoś problem" },
  { value: "partnership", label: "Współpraca", icon: Handshake, desc: "Reklama i partnerstwo" },
];

const MAX_MESSAGE = 1200;

interface Props {
  faqs: Array<{ question: string; answer: string }>;
  responseTime: string;
}

export default function KontaktForm({ faqs, responseTime }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [startedAt] = useState(() => Date.now());

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Podaj imię i nazwisko";
    if (!form.email.trim()) e.email = "Podaj adres e-mail";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Nieprawidłowy adres e-mail";
    if (!form.subject) e.subject = "Wybierz temat wiadomości";
    if (!form.message.trim()) e.message = "Wpisz treść wiadomości";
    else if (form.message.trim().length < 10) e.message = "Wiadomość jest za krótka";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, startedAt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ message: data.error || "Nie udało się wysłać wiadomości. Spróbuj ponownie." });
        return;
      }
      setSubmitted(true);
    } catch {
      setErrors({ message: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie." });
    } finally {
      setLoading(false);
    }
  }

  const msgLen = form.message.length;
  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  return (
    <>
      {submitted ? (
        <div className="anim-fade-up flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><CheckCircle2 className="h-8 w-8" /></div>
          <h2 className="text-2xl font-black text-ink">Wiadomość wysłana!</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Dziękujemy za kontakt. Odpiszemy na Twój adres e-mail w ciągu {responseTime}.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", subject: "", message: "", website: "" });
            }}
            className="mt-6 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Wyślij kolejną wiadomość
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div>
            <h2 className="text-lg font-black text-ink">Formularz kontaktowy</h2>
            <p className="text-sm text-muted-foreground">Wypełnij pola i wyślij wiadomość.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">Imię i nazwisko <span className="text-live">*</span></label>
              <Input id="name" placeholder="Jan Kowalski" value={form.name} onChange={field("name")} autoComplete="name" className={cn("h-10", errors.name && "border-red-400")} aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">Adres e-mail <span className="text-live">*</span></label>
              <Input id="email" type="email" placeholder="jan@example.com" value={form.email} onChange={field("email")} autoComplete="email" className={cn("h-10", errors.email && "border-red-400")} aria-invalid={Boolean(errors.email)} />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* honeypot */}
          <div className="hidden" aria-hidden="true">
            <label>Strona WWW<input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={field("website")} /></label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Temat <span className="text-live">*</span></legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {subjects.map(({ value, label, icon: Icon, desc }) => {
                const active = form.subject === value;
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={active}
                    onClick={() => {
                      setForm({ ...form, subject: value });
                      if (errors.subject) setErrors({ ...errors, subject: undefined });
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                      active ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-ink/30 hover:bg-muted/40",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-brand" : "text-muted-foreground")} />
                    <span className="text-xs font-bold">{label}</span>
                    <span className={cn("text-[11px]", active ? "text-white/60" : "text-muted-foreground")}>{desc}</span>
                  </button>
                );
              })}
            </div>
            {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
          </fieldset>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="message">Wiadomość <span className="text-live">*</span></label>
              <span className={cn("tabular text-xs", msgLen > MAX_MESSAGE ? "font-semibold text-red-600" : "text-muted-foreground")}>{msgLen} / {MAX_MESSAGE}</span>
            </div>
            <Textarea id="message" placeholder="Opisz swoje zapytanie lub sugestię…" className={cn("min-h-40 resize-y", errors.message && "border-red-400")} value={form.message} maxLength={MAX_MESSAGE} onChange={field("message")} aria-invalid={Boolean(errors.message)} />
            {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={loading || msgLen > MAX_MESSAGE}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-ink-foreground transition-all hover:bg-ink-muted active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-4 w-4" />}
              {loading ? "Wysyłanie…" : "Wyślij wiadomość"}
            </button>
            <p className="text-xs text-muted-foreground">Odpowiadamy w ciągu {responseTime}.</p>
          </div>
        </form>
      )}

      {faqs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-black text-ink">Często zadawane pytania</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                  <button type="button" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40">
                    <span className="text-sm font-semibold text-ink">{faq.question}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                  </button>
                  {open && <div className="anim-switch border-t border-border px-5 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
