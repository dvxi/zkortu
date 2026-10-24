import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ title, description, icon, action, className, compact }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card text-center",
        compact ? "px-4 py-8" : "px-6 py-16",
        className,
      )}
      role="status"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="text-sm font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, action, className, compact }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/70 text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        className,
      )}
      role="alert"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold text-amber-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-amber-800/80">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 8, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 border-t border-border px-4 py-3 first:border-t-0">
          <div className="h-4 w-6 rounded bg-muted" />
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="hidden h-4 w-20 rounded bg-muted sm:block" />
          <div className="h-4 w-14 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[2/1] bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
