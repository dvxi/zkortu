import Link from "next/link";
import { Clock } from "lucide-react";
import type { SanityArticleCard } from "@/lib/sanity";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CoverImage } from "./CoverImage";

interface Props {
  article: SanityArticleCard;
  variant?: "featured" | "card" | "row";
  priority?: boolean;
  className?: string;
}

export function ArticleCard({ article, variant = "card", priority, className }: Props) {
  const href = `/aktualnosci/${article.id}`;
  const alt = article.mainImage?.alt || article.title;

  if (variant === "featured") {
    return (
      <Link href={href} className={cn("group relative block overflow-hidden rounded-2xl bg-ink", className)}>
        <div className="relative aspect-video">
          <CoverImage image={article.mainImage} alt={alt} width={1600} priority={priority} sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" placeholderLabel={article.category} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <span className="mb-3 inline-block rounded-md bg-brand px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-brand-foreground">
              {article.category}
            </span>
            <h3 className="text-balance text-2xl font-black leading-tight text-white sm:text-3xl">{article.title}</h3>
            <p className="mt-2 hidden max-w-2xl text-sm text-white/75 sm:line-clamp-2">{article.excerpt}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/65">
              <span className="font-semibold text-white/85">{article.author}</span>
              <span>{formatDate(article.date)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readTime} min
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link href={href} className={cn("group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted", className)}>
        <div className="relative w-28 shrink-0 overflow-hidden rounded-lg sm:w-32">
          <div className="relative aspect-video">
            <CoverImage image={article.mainImage} alt={alt} width={320} sizes="128px" className="object-cover transition-transform duration-500 group-hover:scale-105" placeholderLabel={article.category} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-strong">{article.category}</span>
          <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-ink transition-opacity group-hover:opacity-70">{article.title}</p>
          <span className="mt-1 block text-xs text-muted-foreground">
            {formatDate(article.date, { day: "numeric", month: "short" })} · {article.readTime} min
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(28,25,23,0.25)]",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <CoverImage image={article.mainImage} alt={alt} width={800} priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" placeholderLabel={article.category} />
        <span className="absolute left-3 top-3 rounded-md bg-brand px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-foreground">
          {article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink transition-opacity group-hover:opacity-70">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span className="truncate font-medium text-ink/80">{article.author}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}
