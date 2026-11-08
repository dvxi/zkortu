import Image from "next/image";
import { imageUrl, type SanityImage } from "@/lib/sanity-image";
import { cn } from "@/lib/utils";

export function initials(name: string): string {
  const parts = name.split(/[\s-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Round player photo (Sanity, hotspot-aware crop) or initials on brand orange. */
export function PlayerAvatar({ name, photo, size = 56, className }: { name: string; photo?: SanityImage | null; size?: number; className?: string }) {
  const src = imageUrl(photo, size * 2, size * 2);
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-black text-brand-foreground", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {src ? <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}
