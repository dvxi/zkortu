"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const BARE_PREFIXES = ["/studio"];

/** Hides the site header/footer on routes that bring their own UI (Sanity Studio). */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}
