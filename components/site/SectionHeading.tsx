import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  href?: string;
  linkLabel?: string;
  icon?: ReactNode;
  size?: "md" | "lg";
  className?: string;
  live?: boolean;
}

export function SectionHeading({ title, href, linkLabel = "Wszystkie", icon, size = "lg", className, live }: Props) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <h2
        className={cn(
          "flex items-center gap-2 font-black tracking-[-0.02em] text-ink",
          size === "lg" ? "text-xl sm:text-2xl" : "text-base",
        )}
      >
        <span className="inline-block h-5 w-1 rounded-full bg-brand" aria-hidden="true" />
        {icon}
        {title}
        {live && <span className="live-dot ml-1" aria-hidden="true" />}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-strong transition-opacity hover:opacity-70"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
