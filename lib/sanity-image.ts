import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

export interface SanityImage {
  _type?: "image";
  asset?: { _ref?: string; _type?: string; url?: string } | null;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
  caption?: string;
  credit?: string;
}

export function hasImage(img: SanityImage | null | undefined): img is SanityImage {
  return Boolean(img?.asset?._ref || img?.asset?.url);
}

/**
 * Build a CDN URL for a Sanity image. Width/height crop respects the
 * editor's hotspot. Returns null when no asset is attached.
 */
export function imageUrl(img: SanityImage | null | undefined, width: number, height?: number): string | null {
  if (!hasImage(img) || !builder) return null;
  let b = builder.image(img as SanityImageSource).width(width).auto("format").quality(80);
  if (height) b = b.height(height).fit("crop");
  return b.url();
}

/** 16:9 helper used by cards and OpenGraph. */
export function imageUrl16x9(img: SanityImage | null | undefined, width: number): string | null {
  return imageUrl(img, width, Math.round((width * 9) / 16));
}
