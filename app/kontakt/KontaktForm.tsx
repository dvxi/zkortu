"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Send, CheckCircle2, Newspaper, Bug, HelpCircle, Handshake,
  ChevronDown, ChevronUp,
} from "lucide-react";

const subjects = [
  { value: "general", label: "Ogólne zapytanie", icon: HelpCircle, desc: "Pytania i sugestie" },
  { value: "news", label: "Redakcja", icon: Newspaper, desc: "Aktualności i treści" },
  { value: "bug", label: "Błąd / usterka", icon: Bug, desc: "Zgłoś problem" },
  { value: "partnership", label: "Współpraca", icon: Handshake, desc: "Reklama / partnerstwo" },
];

const MAX_MESSAGE = 1200;

interface Props {
  faqs: Array<{ question: string; answer: string }>;
}

export default function KontaktForm({ faqs }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Podaj imię i nazwisko";
    if (!form.email.trim()) e.email = "Podaj adres e-mail";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Nieprawidłowy adres e-mail";
    if (!form.subject) e.subject = "Wybierz temat wiadomości";
    if (!form.message.trim()) e.message = "Wpisz treść wiadomości";
    else if (form.message.trim().length < 10) e.message = "Wiadomość jest za krótka";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  return (
    <>
      {/* Form */}
      {submitted ? (
        <div className="anim-fade-up flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: "oklch(0.92 0.05 155)" }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: "var(--brand)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--brand)" }}>
            Wiadomość wysłana!
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Dziękujemy za kontakt. Odpiszemy na Twój adres e-mail w ciągu 1–2 dni roboczych.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            className="mt-6 text-sm font-semibold px-5 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Wyślij kolejną wiadomość
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6"
        >
          <div>
            <h2 className="text-lg font-bold mb-0.5" style={{ color: "var(--brand)" }}>
              Formularz kontaktowy
            </h2>
            <p className="text-sm text-muted-foreground">Wypełnij pola i wyślij wiadomość.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">
                Imię i nazwisko <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="Jan Kowalski"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                Adres e-mail <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jan@example.com"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Temat <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {subjects.map(({ value, label, icon: Icon, desc }) => {
                const active = form.subject === value;
                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => { setForm({ ...form, subject: value }); if (errors.subject) setErrors({ ...errors, subject: undefined }); }}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                      active ? "border-transparent text-white" : "border-border hover:border-border/80 hover:bg-muted/30"
                    }`}
                    style={active ? { backgroundColor: "var(--brand)" } : {}}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white/80" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-bold ${active ? "text-white" : "text-foreground"}`}>{label}</span>
                    <span className={`text-[11px] ${active ? "text-white/60" : "text-muted-foreground"}`}>{desc}</span>
                  </button>
                );
              })}
            </div>
            {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="message">
                Wiadomość <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs tabular-nums ${msgLen > MAX_MESSAGE ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                {msgLen} / {MAX_MESSAGE}
              </span>
            </div>
            <Textarea
              id="message"
              placeholder="Opisz swoje zapytanie lub sugestię..."
              className={`min-h-40 resize-y ${errors.message ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              value={form.message}
              maxLength={MAX_MESSAGE}
              onChange={(e) => { setForm({ ...form, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: undefined }); }}
            />
            {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <Button
              type="submit"
              disabled={loading || msgLen > MAX_MESSAGE}
              className="px-7 py-2.5 font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "var(--brand)", color: "white" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Wysyłanie…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Wyślij wiadomość
                </span>
              )}
            </Button>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Odpowiadamy w ciągu 1–2 dni roboczych
            </p>
          </div>
        </form>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-5" style={{ color: "var(--brand)" }}>
            Często zadawane pytania
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-semibold text-sm">{faq.question}</span>
                    {open
                      ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    }
                  </button>
                  {open && (
                    <div className="anim-switch px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
