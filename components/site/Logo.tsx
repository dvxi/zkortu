import { cn } from "@/lib/utils";

interface LogoProps {
  logoUrl?: string | null;
  className?: string;
  /** text colour context: "ink" on orange surfaces, "light" on dark surfaces */
  tone?: "ink" | "light";
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "text-lg", md: "text-[1.45rem]", lg: "text-3xl" };
const imgSizes = { sm: "h-6", md: "h-8", lg: "h-10" };

export function Logo({ logoUrl, className, tone = "ink", size = "md" }: LogoProps) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="zkortu.pl" className={cn("w-auto", imgSizes[size], className)} />;
  }
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-black tracking-[-0.03em] leading-none select-none",
        sizes[size],
        tone === "ink" ? "text-ink" : "text-ink-foreground",
        className,
      )}
    >
      zkortu
      <span className={cn("font-semibold tracking-normal", tone === "ink" ? "text-ink/55" : "text-ink-foreground/55")}>.pl</span>
    </span>
  );
}
