import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  live?: boolean;
}

/** Compact, light page intro used by every section page. */
export function PageHeader({ eyebrow, title, description, actions, className, live }: Props) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-strong">
            {live && <span className="live-dot" aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-3xl font-black tracking-[-0.02em] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-pretty text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
