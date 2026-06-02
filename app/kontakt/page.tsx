"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  Send,
  Newspaper,
  Bug,
  HelpCircle,
  Handshake,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── Subject cards ─────────────────────────────────────────────────────────────
const subjects = [
  { value: "general", label: "Ogólne zapytanie", icon: HelpCircle, desc: "Pytania i sugestie" },
  { value: "news", label: "Redakcja", icon: Newspaper, desc: "Aktualności i treści" },
  { value: "bug", label: "Błąd / usterka", icon: Bug, desc: "Zgłoś problem" },
  { value: "partnership", label: "Współpraca", icon: Handshake, desc: "Reklama / partnerstwo" },
];

// ── Social icon SVGs ──────────────────────────────────────────────────────────
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.632 5.906-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// ── FAQ data ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Jak szybko odpisujecie?",
    a: "Odpowiadamy na wszystkie wiadomości w ciągu 1–2 dni roboczych. Pilne sprawy (błędy, awarie) staramy się obsłużyć w dniu zgłoszenia.",
  },
  {
    q: "Jak zgłosić błąd w wynikach lub rankingach?",
    a: "Wybierz temat \u201eBłąd / usterka\u201d i podaj jak najwięcej szczegółów \u2014 nazwę meczu, zawodnika lub stronę. Potwierdzamy każde zgłoszenie.",
  },
  {
    q: "Czy można zamieścić artykuł lub materiał zewnętrzny?",
    a: "Tak, akceptujemy propozycje artyku\u0142\u00f3w go\u015bcinnych i wywiady. Napisz do nas przez formularz z tematem Redakcja, opisuj\u0105c sw\u00f3j pomys\u0142.",
  },
  {
    q: "Jak nawi\u0105za\u0107 wsp\u00f3\u0142prac\u0119 reklamow\u0105?",
    a: "Mamy dedykowan\u0105 ofert\u0119 dla partner\u00f3w \u2014 banery, artyku\u0142y sponsorowane, patronaty turniej\u00f3w. Wybierz temat Wsp\u00f3\u0142praca \u2014 odezwiemy si\u0119 z mediakit.",
  },
];

// ── Character counter helper ──────────────────────────────────────────────────
const MAX_MESSAGE = 1200;

// ── Component ─────────────────────────────────────────────────────────────────
export default function KontaktPage() {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  }

  const msgLen = form.message.length;

  return (
    <>
      {/* ── Hero strip ──────────────────────────────────────────────────────── */}
      <section
        className="relative py-14 px-4 sm:px-6 overflow-hidden"
        style={{ backgroundColor: "var(--brand)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to right, black 20%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto">
          <p className="anim-fade-up text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
            Napisz do nas
          </p>
          <h1 className="anim-fade-up anim-delay-1 text-4xl sm:text-5xl font-black text-white mb-3">
            Kontakt
          </h1>
          <p className="anim-fade-up anim-delay-2 text-white/65 text-lg max-w-lg">
            Masz pytanie, sugestię lub chcesz nawiązać współpracę? Odpiszemy w ciągu 1–2 dni roboczych.
          </p>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: form ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
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

                {/* Name + Email */}
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

                {/* Subject — visual cards */}
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
                            active
                              ? "border-transparent text-white"
                              : "border-border hover:border-border/80 hover:bg-muted/30"
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

                {/* Message */}
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

                {/* Submit */}
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

            {/* ── FAQ ───────────────────────────────────────────────────── */}
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
                        <span className="font-semibold text-sm">{faq.q}</span>
                        {open ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                      </button>
                      {open && (
                        <div className="anim-switch px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Contact details */}
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="px-5 py-4 border-b border-border" style={{ backgroundColor: "var(--brand)" }}>
                <h2 className="font-bold text-white text-sm">Dane kontaktowe</h2>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { icon: Mail, label: "E-mail", value: "kontakt@zkortu.pl", href: "mailto:kontakt@zkortu.pl" },
                  { icon: Phone, label: "Telefon", value: "+48 123 456 789", href: "tel:+48123456789" },
                  { icon: MapPin, label: "Adres", value: "ul. Kortowa 1\n00-001 Warszawa", href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "oklch(0.92 0.04 155)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--brand)" }}>
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium whitespace-pre-line">{value}</p>
                      )}
                    </div>
                  </div>
                ))}

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-3">Śledź nas</p>
                  <div className="flex items-center gap-2">
                    {[
                      { Icon: IconX, href: "https://twitter.com", label: "X / Twitter" },
                      { Icon: IconFacebook, href: "https://facebook.com", label: "Facebook" },
                      { Icon: IconInstagram, href: "https://instagram.com", label: "Instagram" },
                    ].map(({ Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Icon />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Office hours */}
            <div className="rounded-2xl border border-border bg-card">
              <div className="px-5 py-4 border-b border-border" style={{ backgroundColor: "var(--brand)" }}>
                <h3 className="font-bold text-white text-sm">Godziny pracy redakcji</h3>
              </div>
              <div className="p-5 space-y-2.5 text-sm">
                {[
                  { day: "Poniedziałek – piątek", hours: "9:00 – 18:00", open: true },
                  { day: "Sobota", hours: "10:00 – 15:00", open: true },
                  { day: "Niedziela", hours: "Zamknięte", open: false },
                ].map(({ day, hours, open }) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{day}</span>
                    <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${open ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time SLA */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <p className="font-black text-2xl mb-1 text-white">1–2 dni</p>
              <p className="text-sm font-semibold text-white/80">Czas odpowiedzi</p>
              <p className="text-xs mt-1.5 text-white/50">
                Na każdą wiadomość odpowiadamy indywidualnie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
