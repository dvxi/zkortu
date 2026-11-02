"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Radio, Home, Trophy, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

interface Props {
  logoUrl?: string | null;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ logoUrl }: Props) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 bg-brand text-brand-foreground shadow-[0_1px_0_0_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-ink" aria-label="zkortu.pl, strona główna">
          <Logo logoUrl={logoUrl} tone="ink" />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Główna nawigacja">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            const live = "live" in link && link.live;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[0.9rem] font-semibold transition-colors",
                  active ? "bg-ink/10 text-ink" : "text-ink/75 hover:bg-ink/[0.06] hover:text-ink",
                )}
              >
                {link.label}
                {live && (
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-black uppercase leading-none tracking-wide text-ink-foreground">
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-ink hover:bg-ink/10 hover:text-ink lg:hidden"
                aria-label="Otwórz menu"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="w-80 border-l-0 bg-brand p-0 text-brand-foreground">
            <div className="flex items-center justify-between border-b border-ink/15 px-5 py-4">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Link href="/" onClick={() => setOpen(false)} aria-label="zkortu.pl, strona główna">
                <Logo logoUrl={logoUrl} tone="ink" size="sm" />
              </Link>
              <Button variant="ghost" size="icon" className="text-ink hover:bg-ink/10 hover:text-ink" onClick={() => setOpen(false)} aria-label="Zamknij menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 p-3" aria-label="Nawigacja mobilna">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                const live = "live" in link && link.live;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition-colors",
                      active ? "bg-ink text-ink-foreground" : "text-ink/85 hover:bg-ink/10",
                    )}
                  >
                    {link.label}
                    {live && (
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide", active ? "bg-brand text-ink" : "bg-ink text-ink-foreground")}>
                        Live
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
    <nav aria-label="Dolna nawigacja" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-lg lg:hidden">
      {[
        { href: "/kalendarz", label: "Kalendarz", Icon: CalendarDays },
        { href: "/wyniki-live", label: "Wyniki live", Icon: Radio },
        { href: "/", label: "Home", Icon: Home },
        { href: "/ranking", label: "Rankingi", Icon: Trophy },
      ].map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold", isActive(pathname, href) ? "text-brand-strong" : "text-muted-foreground")}>
          <Icon className="h-5 w-5" />{label}
        </Link>
      ))}
      <button onClick={() => setOpen(true)} aria-expanded={open} aria-label="Otwórz pełne menu" className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground"><Menu className="h-5 w-5" />Menu</button>
    </nav>
    </>
  );
}
