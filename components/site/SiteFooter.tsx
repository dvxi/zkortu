import Link from "next/link";
import { getFooterPages, getSiteSettings } from "@/lib/sanity";
import { SITE_DESCRIPTION } from "@/lib/constants";
import { Logo } from "./Logo";
import { SOCIAL_LABELS, SocialIcon, type SocialKind } from "./SocialIcons";

const columns = [
  {
    title: "Tenis",
    links: [
      { href: "/wyniki-live", label: "Wyniki na żywo" },
      { href: "/ranking", label: "Ranking ATP" },
      { href: "/ranking?tour=wta", label: "Ranking WTA" },
      { href: "/kalendarz", label: "Kalendarz turniejów" },
    ],
  },
  {
    title: "Serwis",
    links: [
      { href: "/aktualnosci", label: "Aktualności" },
      { href: "/wideo", label: "Wideo" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
];

export async function SiteFooter() {
  const [settings, pages] = await Promise.all([getSiteSettings(), getFooterPages()]);
  const description = settings?.footerDescription || SITE_DESCRIPTION;
  const socials = (
    [
      ["x", settings?.twitter],
      ["facebook", settings?.facebook],
      ["instagram", settings?.instagram],
      ["youtube", settings?.youtube],
    ] as Array<[SocialKind, string | null | undefined]>
  ).filter(([, href]) => Boolean(href)) as Array<[SocialKind, string]>;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-brand text-brand-foreground">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo logoUrl={settings?.logoUrl} tone="ink" size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/75">{description}</p>
            {socials.length > 0 && (
              <ul className="mt-6 flex items-center gap-2" aria-label="Media społecznościowe">
                {socials.map(([kind, href]) => (
                  <li key={kind}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[kind]}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 text-ink transition-colors hover:bg-ink hover:text-ink-foreground"
                    >
                      <SocialIcon kind={kind} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-ink">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm font-medium text-ink/75 transition-colors hover:text-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-ink">Informacje</h3>
              <ul className="space-y-2.5">
                {pages.map((p) => (
                  <li key={p._id}>
                    <Link href={`/strona/${p.slug}`} className="text-sm font-medium text-ink/75 transition-colors hover:text-ink">
                      {p.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/kontakt" className="text-sm font-medium text-ink/75 transition-colors hover:text-ink">
                    Reklama i współpraca
                  </Link>
                </li>
                {pages.length === 0 && (
                  <li className="text-xs text-ink/55">Regulamin i politykę prywatności dodasz w CMS (Strony informacyjne).</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-ink/15 pt-6 text-xs text-ink/70 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} zkortu.pl. Wszelkie prawa zastrzeżone.</span>
          <span>Wyniki, rankingi i terminarze: API-Tennis. Treści: redakcja zkortu.pl.</span>
        </div>
      </div>
    </footer>
  );
}
