import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { ArrowLeft, Calendar, Clock, RefreshCw, Tag, User } from "lucide-react";
import { getAllArticleSlugs, getArticleBySlug, getRelatedArticles, getSiteSettings } from "@/lib/sanity";
import { imageUrl } from "@/lib/sanity-image";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatDate, slugify } from "@/lib/format";
import { ArticleCard } from "@/components/site/ArticleCard";
import { CoverImage } from "@/components/site/CoverImage";
import ReadingProgress from "./ReadingProgress";
import SocialShare from "./SocialShare";
import Comments from "./Comments";
import { articleComponents } from "./PortableTextComponents";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleBySlug(id);
  if (!article) return { title: "Nie znaleziono artykułu" };
  const description = article.seoDescription || article.excerpt;
  const og = imageUrl(article.mainImage, 1200, 630);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/aktualnosci/${article.id}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${SITE_URL}/aktualnosci/${article.id}`,
      siteName: SITE_NAME,
      locale: "pl_PL",
      publishedTime: article.date,
      modifiedTime: article.updatedAt ?? undefined,
      authors: [article.author],
      tags: article.tags ?? undefined,
      images: og ? [{ url: og, width: 1200, height: 630, alt: article.mainImage?.alt || article.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: article.title, description, images: og ? [og] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleBySlug(id);
  if (!article) notFound();

  const tags = article.tags ?? [];
  const [related, settings] = await Promise.all([getRelatedArticles(id, tags, article.category), getSiteSettings()]);
  const commentsEnabled = settings?.commentsEnabled !== false;
  const heroUrl = imageUrl(article.mainImage, 1600, 900);
  const caption = article.mainImage?.caption;
  const credit = article.mainImage?.credit;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updatedAt ?? article.date,
    author: [{ "@type": "Person", name: article.author }],
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    image: heroUrl ? [heroUrl] : undefined,
    keywords: tags.join(", ") || undefined,
    mainEntityOfPage: `${SITE_URL}/aktualnosci/${article.id}`,
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Okruszki">
          <Link href="/aktualnosci" className="inline-flex items-center gap-1.5 font-semibold text-brand-strong hover:opacity-70">
            <ArrowLeft className="h-3.5 w-3.5" /> Aktualności
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate">{article.category}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <header>
              <span className="mb-4 inline-block rounded-md bg-brand px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-brand-foreground">{article.category}</span>
              <h1 className="text-balance text-3xl font-black leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">{article.title}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                  <User className="h-3.5 w-3.5" />
                  {article.author}
                  {article.authorRole && <span className="font-normal text-muted-foreground">· {article.authorRole}</span>}
                </span>
                {article.articleSource && (
                  <span>
                    Źródło: <span className="font-medium text-ink">{article.articleSource}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={article.date} className="capitalize">{formatDate(article.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time>
                </span>
                {article.updatedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Aktualizacja: {formatDate(article.updatedAt)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime} min czytania
                </span>
              </div>
            </header>

            {/* Lead */}
            <p className="mt-6 max-w-[70ch] text-pretty text-lg font-medium leading-relaxed text-ink sm:text-xl">{article.excerpt}</p>

            {/* Hero image with caption overlay */}
            <figure className="mt-7">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                <CoverImage image={article.mainImage} alt={article.mainImage?.alt || article.title} width={1600} priority sizes="(max-width: 1024px) 100vw, 860px" placeholderLabel={article.category} />
                {(caption || credit) && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-14 text-xs leading-snug text-white/90">
                    {caption}
                    {caption && credit ? ", " : ""}
                    {credit && <span className="text-white/65">{credit}</span>}
                  </figcaption>
                )}
              </div>
            </figure>

            {/* Body */}
            <div className="prose-article mt-8 max-w-[70ch]">
              <PortableText value={article.content} components={articleComponents} />
            </div>

            {/* Share + tags */}
            <div className="mt-10 border-t border-border pt-8">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Udostępnij:</p>
              <SocialShare title={article.title} />
            </div>
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {tags.map((tag) => (
                  <Link key={tag} href={`/tag/${slugify(tag)}`} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand hover:text-ink">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <Comments articleSlug={article.id} enabled={commentsEnabled} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Autor</p>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-black text-ink-foreground">
                  {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{article.author}</p>
                  {article.authorRole && <p className="text-xs text-muted-foreground">{article.authorRole}</p>}
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <div>
                <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{tags.length > 0 ? "Podobne artykuły" : "Przeczytaj również"}</h2>
                <div className="space-y-1">
                  {related.map((rel) => (
                    <ArticleCard key={rel._id} article={rel} variant="row" />
                  ))}
                </div>
              </div>
            )}

            <Link href="/aktualnosci" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold transition-colors hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
              Wszystkie aktualności
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
