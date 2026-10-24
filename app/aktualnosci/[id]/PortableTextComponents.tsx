import Image from "next/image";
import type { PortableTextReactComponents } from "@portabletext/react";
import { imageUrl, type SanityImage } from "@/lib/sanity-image";
import EmbedBlock from "./EmbedBlock";

interface LegacyBlock {
  type?: "lead" | "paragraph" | "heading" | "quote";
  text?: string;
  quoteAuthor?: string;
}

export const articleComponents: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => <p className="text-foreground/85">{children}</p>,
    lead: ({ children }) => <p className="text-xl font-medium leading-relaxed text-ink">{children}</p>,
    h2: ({ children }) => <h2 className="text-ink">{children}</h2>,
    h3: ({ children }) => <h3 className="text-ink">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="text-ink/85">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <span className="underline underline-offset-4">{children}</span>,
    link: ({ value, children }) => {
      const href: string = value?.href ?? "#";
      const external = /^https?:\/\//.test(href) && !href.includes("zkortu.pl");
      return (
        <a href={href} target={value?.blank || external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: SanityImage }) => {
      const src = imageUrl(value, 1400);
      if (!src) return null;
      return (
        <figure>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
            <Image src={src} alt={value.alt || value.caption || ""} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
          </div>
          {(value.caption || value.credit) && (
            <figcaption>
              {value.caption}
              {value.caption && value.credit ? ", " : ""}
              {value.credit && <span className="opacity-80">{value.credit}</span>}
            </figcaption>
          )}
        </figure>
      );
    },
    embed: ({ value }: { value: { html?: string; caption?: string } }) => (value?.html ? <EmbedBlock html={value.html} caption={value.caption} /> : null),
    // legacy "contentBlock" objects from the first content model
    contentBlock: ({ value }: { value: LegacyBlock }) => {
      switch (value?.type) {
        case "lead":
          return <p className="text-xl font-medium leading-relaxed text-ink">{value.text}</p>;
        case "heading":
          return <h2 className="text-ink">{value.text}</h2>;
        case "quote":
          return (
            <blockquote>
              <p>{value.text}</p>
              {value.quoteAuthor && <cite className="mt-2 block text-sm font-semibold not-italic text-brand-strong">— {value.quoteAuthor}</cite>}
            </blockquote>
          );
        default:
          return <p className="text-foreground/85">{value?.text}</p>;
      }
    },
  },
  unknownType: () => null,
};

export const pageComponents: Partial<PortableTextReactComponents> = {
  ...articleComponents,
  types: { ...articleComponents.types },
};
