import Image from "next/image";
import { imageUrl, type SanityImage } from "@/lib/sanity-image";
import type { Surface } from "@/lib/types";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface Props {
  image?: SanityImage | null;
  /** direct URL alternative (e.g. YouTube thumbnail) */
  src?: string | null;
  alt: string;
  /** requested width in CSS px; height derived from `ratio` */
  width?: number;
  ratio?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  placeholderLabel?: string;
  surface?: Surface;
}

/**
 * Fills its (relative) parent with a Sanity image cropped to `ratio`,
 * or with the branded placeholder when no asset exists.
 */
export function CoverImage({
  image,
  src,
  alt,
  width = 1200,
  ratio = 16 / 9,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority,
  className = "object-cover",
  placeholderLabel,
  surface,
}: Props) {
  const url = src ?? imageUrl(image, width, Math.round(width / ratio));
  if (!url) return <ImagePlaceholder label={placeholderLabel} surface={surface} />;
  return <Image src={url} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}
