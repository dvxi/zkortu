import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/sanity";
import { PageHeader } from "@/components/site/PageHeader";
import { SOCIAL_LABELS, SocialIcon, type SocialKind } from "@/components/site/SocialIcons";
import KontaktForm from "./KontaktForm";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Kontakt z redakcją",
  description: "Napisz do redakcji zkortu.pl: pytania, zgłoszenia błędów, propozycje artykułów i współpraca reklamowa.",
  alternates: { canonical: "/kontakt" },
};

const DEFAULT_FAQS = [
  { question: "Jak szybko odpisujecie?", answer: "Na wszystkie wiadomości odpowiadamy w ciągu 1–2 dni roboczych. Zgłoszenia błędów staramy się obsłużyć tego samego dnia." },
  { question: "Jak zgłosić błąd w wynikach lub rankingach?", answer: "Wybierz temat „Błąd / usterka” i podaj jak najwięcej szczegółów: nazwę meczu, zawodnika lub stronę." },
  { question: "Czy można zamieścić artykuł lub materiał zewnętrzny?", answer: "Tak. Napisz do nas przez formularz z tematem „Redakcja” i opisz swój pomysł." },
  { question: "Jak nawiązać współpracę reklamową?", answer: "Wybierz temat „Współpraca”. Odezwiemy się z ofertą dla partnerów." },
];

export default async function KontaktPage() {
  const s = (await getSiteSettings()) ?? {};
  const email = s.email || "kontakt@zkortu.pl";
  const responseTime = s.responseTime || "1–2 dni";
  const faqs = s.faqs && s.faqs.length > 0 ? s.faqs : DEFAULT_FAQS;

  const contactItems = [
    { icon: Mail, label: "E-mail", value: email, href: `mailto:${email}` },
    s.phone ? { icon: Phone, label: "Telefon", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` } : null,
    s.address ? { icon: MapPin, label: "Adres", value: s.address, href: null } : null,
  ].filter((i): i is { icon: typeof Mail; label: string; value: string; href: string | null } => Boolean(i));

  const socials = (
    [
      ["x", s.twitter],
      ["facebook", s.facebook],
      ["instagram", s.instagram],
      ["youtube", s.youtube],
    ] as Array<[SocialKind, string | null | undefined]>
  ).filter(([, href]) => Boolean(href)) as Array<[SocialKind, string]>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Napisz do nas" title="Kontakt" description={`Masz pytanie, sugestię lub chcesz nawiązać współpracę? Odpisujemy w ciągu ${responseTime}.`} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <KontaktForm faqs={faqs} responseTime={responseTime} />
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Dane kontaktowe</h2>
            </div>
            <div className="space-y-4 p-5">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong"><Icon className="h-4 w-4" /></div>
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold text-ink hover:text-brand-strong">{value}</a>
                    ) : (
                      <p className="whitespace-pre-line text-sm font-semibold text-ink">{value}</p>
                    )}
                  </div>
                </div>
              ))}
              {socials.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-xs text-muted-foreground">Śledź nas</p>
                  <div className="flex items-center gap-2">
                    {socials.map(([kind, href]) => (
                      <a key={kind} href={href} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[kind]} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-ink hover:text-ink-foreground">
                        <SocialIcon kind={kind} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {s.officeHours && s.officeHours.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink"><Clock className="h-4 w-4 text-brand" /> Godziny pracy redakcji</h3>
              </div>
              <div className="space-y-2.5 p-5 text-sm">
                {s.officeHours.map(({ day, hours, isOpen }) => (
                  <div key={day} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{day}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isOpen ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-ink p-5 text-ink-foreground">
            <p className="text-3xl font-black text-brand">{responseTime}</p>
            <p className="mt-1 text-sm font-semibold">Czas odpowiedzi</p>
            <p className="mt-1 text-xs text-white/60">Na każdą wiadomość odpowiadamy indywidualnie.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
