import { cn } from "@/lib/utils";
import { surfaceDotColors, type Surface } from "@/lib/types";

interface Props {
  label?: string;
  surface?: Surface;
  className?: string;
}

/**
 * Branded fallback for missing photos: dark ink base, orange (or surface
 * coloured) glow and a faint tennis-court line drawing. Always absolutely
 * positioned, so wrap it in a `relative` container with a fixed aspect ratio.
 */
export function ImagePlaceholder({ label, surface, className }: Props) {
  const accent = surface ? surfaceDotColors[surface] : "#ee8232";
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-ink", className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(130% 90% at 0% 100%, ${accent} 0%, transparent 62%)`, opacity: 0.9 }}
      />
      <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-[0.22]" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#fff" strokeWidth="1.5">
          <rect x="40" y="30" width="320" height="140" />
          <line x1="40" y1="45" x2="360" y2="45" />
          <line x1="40" y1="155" x2="360" y2="155" />
          <line x1="200" y1="30" x2="200" y2="170" strokeWidth="2.5" />
          <rect x="110" y="45" width="180" height="110" />
          <line x1="110" y1="100" x2="290" y2="100" />
        </g>
      </svg>
      <span className="absolute left-4 top-3.5 text-base font-black tracking-[-0.03em] text-ink-foreground/85">
        zkortu<span className="font-semibold opacity-60">.pl</span>
      </span>
      {label && (
        <span className="absolute bottom-3 right-4 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-foreground/80">
          {label}
        </span>
      )}
    </div>
  );
}
