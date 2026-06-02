"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Radio } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Strona główna" },
  { href: "/aktualnosci", label: "Aktualności" },
  { href: "/wyniki-live", label: "Wyniki live" },
  { href: "/wideo", label: "Wideo" },
  { href: "/ranking", label: "Ranking" },
  { href: "/kalendarz", label: "Kalendarz" },
  { href: "/tenis-juniorski", label: "Juniorzy" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: "var(--brand)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <span className="font-black text-xl tracking-tight text-white">zkortu</span>
          <span className="text-white/35 text-sm font-normal">.pl</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isLive = link.href === "/wyniki-live";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-3 py-2 text-sm font-medium rounded transition-colors
                  ${isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--gold)" }}
                  />
                )}
                <span className="flex items-center gap-1.5">
                  {isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--live)" }} />
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--live)" }} />
                    </span>
                  )}
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10 hover:text-white"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0" style={{ backgroundColor: "var(--brand)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                <span className="font-black text-lg text-white">zkortu</span>
                <span className="text-white/35 text-sm font-normal">.pl</span>
              </Link>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isLive = link.href === "/wyniki-live";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors
                      ${isActive
                        ? "text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                      }
                    `}
                    style={isActive ? { backgroundColor: "var(--brand-muted)" } : {}}
                  >
                    {isLive ? (
                      <Radio className="h-4 w-4" style={{ color: "var(--live)" }} />
                    ) : (
                      <span className="w-4" />
                    )}
                    {link.label}
                    {isLive && (
                      <span
                        className="ml-auto text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: "var(--live)", color: "white" }}
                      >
                        LIVE
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
