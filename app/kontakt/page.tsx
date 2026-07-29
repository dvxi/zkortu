import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getSiteSettings, type SiteSettings } from "@/lib/sanity";
import KontaktForm from "./KontaktForm";

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

// ── Defaults (used when Sanity document doesn't exist yet) ────────────────────
const DEFAULT: Required<SiteSettings> = {
  email: "kontakt@zkortu.pl",
  phone: "+48 123 456 789",
  address: "ul. Kortowa 1\n00-001 Warszawa",
  twitter: "https://twitter.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  officeHours: [
    { day: "Poniedziałek – piątek", hours: "9:00 – 18:00", isOpen: true },
    { day: "Sobota", hours: "10:00 – 15:00", isOpen: true },
    { day: "Niedziela", hours: "Zamknięte", isOpen: false },
  ],
  responseTime: "1–2 dni",
  footerDescription: "Twój portal tenisowy — wyniki na żywo, rankingi ATP i WTA, aktualności, kalendarz turniejów i wideo ze świata tenisa.",
  faqs: [
    { question: "Jak szybko odpisujecie?", answer: "Odpowiadamy na wszystkie wiadomości w ciągu 1–2 dni roboczych. Pilne sprawy (błędy, awarie) staramy się obsłużyć w dniu zgłoszenia." },
    { question: "Jak zgłosić błąd w wynikach lub rankingach?", answer: "Wybierz temat 'Błąd / usterka' i podaj jak najwięcej szczegółów — nazwę meczu, zawodnika lub stronę. Potwierdzamy każde zgłoszenie." },
    { question: "Czy można zamieścić artykuł lub materiał zewnętrzny?", answer: "Tak, akceptujemy propozycje artykułów gościnnych i wywiady. Napisz do nas przez formularz z tematem Redakcja, opisując swój pomysł." },
    { question: "Jak nawiązać współpracę reklamową?", answer: "Mamy dedykowaną ofertę dla partnerów — banery, artykuły sponsorowane, patronaty turniejów. Wybierz temat Współpraca — odezwiemy się z mediakit." },
  ],
};

export default async function KontaktPage() {
  const raw = await getSiteSettings();
  const s: Required<SiteSettings> = { ...DEFAULT, ...raw };

  const contactItems = [
    { icon: Mail, label: "E-mail", value: s.email, href: `mailto:${s.email}` },
    { icon: Phone, label: "Telefon", value: s.phone, href: s.phone ? `tel:${s.phone.replace(/\s/g, "")}` : null },
    { icon: MapPin, label: "Adres", value: s.address, href: null },
  ].filter(item => item.value);

  const socialLinks = [
    { Icon: IconX, href: s.twitter, label: "X / Twitter" },
    { Icon: IconFacebook, href: s.facebook, label: "Facebook" },
    { Icon: IconInstagram, href: s.instagram, label: "Instagram" },
  ].filter(item => item.href);

  return (
    <>
      {/* Hero */}
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
            Masz pytanie, sugestię lub chcesz nawiązać współpracę? Odpiszemy w ciągu {s.responseTime}.
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: form + FAQ */}
          <div className="lg:col-span-2">
            <KontaktForm faqs={s.faqs ?? []} />
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">

            {/* Contact details */}
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="px-5 py-4 border-b border-border" style={{ backgroundColor: "var(--brand)" }}>
                <h2 className="font-bold text-white text-sm">Dane kontaktowe</h2>
              </div>
              <div className="p-5 space-y-4">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
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

                {socialLinks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">Śledź nas</p>
                      <div className="flex items-center gap-2">
                        {socialLinks.map(({ Icon, href, label }) => (
                          <a
                            key={label}
                            href={href!}
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
                  </>
                )}
              </div>
            </div>

            {/* Office hours */}
            {s.officeHours && s.officeHours.length > 0 && (
              <div className="rounded-2xl border border-border bg-card">
                <div className="px-5 py-4 border-b border-border" style={{ backgroundColor: "var(--brand)" }}>
                  <h3 className="font-bold text-white text-sm">Godziny pracy redakcji</h3>
                </div>
                <div className="p-5 space-y-2.5 text-sm">
                  {s.officeHours.map(({ day, hours, isOpen }) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{day}</span>
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${isOpen ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response time */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--brand)" }}>
              <p className="font-black text-2xl mb-1 text-white">{s.responseTime}</p>
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
