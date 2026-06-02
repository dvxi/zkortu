import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  "Tenis": [
    { href: "/wyniki-live", label: "Wyniki live" },
    { href: "/ranking", label: "Ranking ATP/WTA" },
    { href: "/kalendarz", label: "Kalendarz turniejów" },
    { href: "/tenis-juniorski", label: "Tenis juniorski" },
  ],
  "Serwis": [
    { href: "/aktualnosci", label: "Aktualności" },
    { href: "/wideo", label: "Wideo" },
    { href: "/kontakt", label: "Kontakt" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--brand)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="font-black text-xl text-white">zkortu</span>
              <span className="text-white/35 text-sm font-normal">.pl</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Twój portal tenisowy — wyniki na żywo, rankingi ATP i WTA,
              aktualności, kalendarz turniejów i wideo ze świata tenisa.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {[
                { href: "https://twitter.com", label: "Twitter / X" },
                { href: "https://facebook.com", label: "Facebook" },
                { href: "https://instagram.com", label: "Instagram" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--gold)" }}
              >
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-white/10 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-white/40 text-xs">
          <span>© 2026 zkortu.pl — Wszelkie prawa zastrzeżone</span>
          <span>Dane mają charakter poglądowy i służą wyłącznie celom demonstracyjnym</span>
        </div>
      </div>
    </footer>
  );
}
