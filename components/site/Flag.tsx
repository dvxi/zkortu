import { cn } from "@/lib/utils";

interface Props {
  flag?: string | null;
  country?: string | null;
  className?: string;
}

/** Emoji flag with an accessible label; renders a neutral dot when unknown. */
export function Flag({ flag, country, className }: Props) {
  if (!flag || flag === "🏳️") {
    return <span className={cn("inline-block h-2 w-2 rounded-full bg-border", className)} aria-hidden="true" />;
  }
  return (
    <span className={cn("inline-block leading-none", className)} role="img" aria-label={country ?? undefined} title={country ?? undefined}>
      {flag}
    </span>
  );
}
