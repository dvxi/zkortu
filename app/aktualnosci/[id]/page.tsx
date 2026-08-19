import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock, PortableTextReactComponents } from "@portabletext/react";
import { newsArticles, type ContentBlock, type NewsArticle } from "@/lib/mock-data";
import { getAllArticleSlugs, getArticleBySlug, getRelatedArticles, type SanityArticle } from "@/lib/sanity";
import { ArrowLeft, Clock, User, Calendar, RefreshCw, Tag } from "lucide-react";
import ReadingProgress from "./ReadingProgress";
import SocialShare from "./SocialShare";
import EmbedBlock from "./EmbedBlock";
import Comments from "./Comments";

// ── Data fetching ──────────────────────────────────────────────────────────────

type ArticleSource =
  | { source: "sanity"; article: SanityArticle }
  | { source: "mock"; article: NewsArticle };

async function getArticle(id: string): Promise<ArticleSource | null> {
  const fromSanity = await getArticleBySlug(id);
  if (fromSanity) return { source: "sanity", article: fromSanity };
  const mock = newsArticles.find((a) => a.id === id);
  if (mock) return { source: "mock", article: mock };
  return null;
}

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const sanityIds = await getAllArticleSlugs();
  const mockIds = newsArticles.map((a) => a.id);
  const all = Array.from(new Set([...sanityIds, ...mockIds]));
  return all.map((id) => ({ id }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getArticle(id);
  if (!result) return {};
  return {
    title: `${result.article.title} — zkortu.pl`,
    description: result.article.excerpt,
  };
}

// ── Image seed ────────────────────────────────────────────────────────────────
const newsImageSeeds = [
  "tennis-news-iga", "tennis-news-atp", "tennis-news-wta", "tennis-news-rg",
  "tennis-news-wb", "tennis-news-ao", "tennis-news-junior", "tennis-news-transfer",
  "tennis-news-poland", "tennis-news-clay",
];

function articleImageSeed(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return newsImageSeeds[hash % newsImageSeeds.length];
}

// ── Category color ────────────────────────────────────────────────────────────
const catColors: Record<string, string> = {
  "Roland Garros": "bg-orange-100 text-orange-800",
  Wimbledon: "bg-green-100 text-green-800",
  ATP: "bg-blue-100 text-blue-800",
  WTA: "bg-purple-100 text-purple-800",
  Polska: "bg-red-100 text-red-800",
  Juniorzy: "bg-yellow-100 text-yellow-800",
  Transfer: "bg-slate-100 text-slate-800",
};

// ── Portable Text renderer (Sanity articles) ──────────────────────────────────
const ptComponents: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-[1.85] text-foreground/80 mb-5">{children}</p>
    ),
    lead: ({ children }) => (
      <p className="text-xl leading-relaxed font-medium text-foreground/90 mb-6">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-black mt-10 mb-4" style={{ color: "var(--brand)" }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mt-8 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 pl-5 border-l-4 space-y-2" style={{ borderColor: "var(--gold)" }}>
        <p className="text-lg italic leading-relaxed text-foreground/85">{children}</p>
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="underline hover:opacity-70 transition-opacity"
        style={{ color: "var(--brand)" }}
      >
        {children}
      </a>
    ),
  },
  types: {
    embed: ({ value }: { value: { html: string } }) => <EmbedBlock html={value.html} />,
  },
};

// ── Mock block renderer ────────────────────────────────────────────────────────
function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "lead":
      return <p className="text-xl leading-relaxed font-medium text-foreground/90 mb-6">{block.text}</p>;
    case "paragraph":
      return <p className="text-base leading-[1.85] text-foreground/80 mb-5">{block.text}</p>;
    case "heading":
      return <h2 className="text-xl font-black mt-10 mb-4" style={{ color: "var(--brand)" }}>{block.text}</h2>;
    case "quote":
      return (
        <blockquote className="my-8 pl-5 border-l-4 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p className="text-lg italic leading-relaxed text-foreground/85">&ldquo;{block.text}&rdquo;</p>
          <cite className="text-sm font-semibold not-italic" style={{ color: "var(--brand)" }}>— {block.author}</cite>
        </blockquote>
      );
    case "embed":
      return <EmbedBlock html={block.html} />;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getArticle(id);
  if (!result) notFound();

  const { source, article } = result;

  const relatedSanity = source === "sanity"
    ? await getRelatedArticles(id, article.category)
    : [];
  const relatedMock = source === "mock"
    ? newsArticles
        .filter((a) => {
          if (a.id === id) return false;
          const articleTags = (article as NewsArticle).tags ?? [];
          const aTags = a.tags ?? [];
          if (articleTags.length > 0 && aTags.some((t) => articleTags.includes(t))) return true;
          return a.category === article.category;
        })
        .slice(0, 3)
    : [];
  const related = relatedSanity.length > 0 ? relatedSanity : relatedMock;

  const formattedDate = new Date(article.date).toLocaleDateString("pl-PL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const formattedUpdated = article.updatedAt
    ? new Date(article.updatedAt).toLocaleDateString("pl-PL", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const seed = articleImageSeed(article.id);

  // Extract lead from mock content to display before the hero image
  const mockContent = source === "mock" ? (article as NewsArticle).content : null;
  const leadBlock = mockContent?.[0]?.type === "lead" ? mockContent[0] : null;
  const bodyBlocks = leadBlock ? mockContent!.slice(1) : mockContent;

  // For Sanity: extract lead block if first block has style "lead"
  type PTBlock = PortableTextBlock & { children?: Array<{ text?: string }> };
  const sanityBlocks = source === "sanity" ? (article.content as PTBlock[]) : null;
  const sanityLeadBlock = sanityBlocks?.[0]?.style === "lead" ? sanityBlocks[0] : null;
  const sanityBodyBlocks = sanityLeadBlock
    ? (article.content as PortableTextBlock[]).slice(1)
    : (article.content as PortableTextBlock[]);
  const sanityLeadText = sanityLeadBlock
    ? sanityLeadBlock.children?.map((c) => c.text ?? "").join("") ?? ""
    : null;

  const tags = article.tags ?? [];

  return (
    <>
      <ReadingProgress />
      <article className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Nawigacja">
          <Link
            href="/aktualnosci"
            className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
            style={{ color: "var(--brand)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Aktualności
          </Link>
          <span>/</span>
          <span className="truncate max-w-xs">{article.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

          {/* ── Main column ──────────────────────────────────────────────── */}
          <div>

            {/* Category + Title */}
            <div className="mb-5">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${catColors[article.category] ?? "bg-muted text-muted-foreground"}`}>
                {article.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-5">
                {article.title}
              </h1>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pb-5 border-b border-border mb-6">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                {article.author}
                {article.authorRole && (
                  <span className="font-normal text-muted-foreground">· {article.authorRole}</span>
                )}
              </span>

              {article.articleSource && (
                <span className="flex items-center gap-1.5">
                  Źródło: <span className="font-medium text-foreground">{article.articleSource}</span>
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="capitalize">{formattedDate}</span>
              </span>

              {formattedUpdated && (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 flex-shrink-0" />
                  Aktualizacja: {formattedUpdated}
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                {article.readTime} min czytania
              </span>
            </div>

            {/* Lead paragraph (before the hero image) */}
            {leadBlock && (
              <p className="text-lg sm:text-xl leading-relaxed font-medium text-foreground/90 mb-7 max-w-[68ch]">
                {leadBlock.text}
              </p>
            )}
            {sanityLeadText && (
              <p className="text-lg sm:text-xl leading-relaxed font-medium text-foreground/90 mb-7 max-w-[68ch]">
                {sanityLeadText}
              </p>
            )}

            {/* Hero image with caption overlay */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-muted">
              <Image
                src={`https://picsum.photos/seed/${seed}/1200/675`}
                alt={article.imageCaption ?? article.title}
                fill
                priority
                className="object-cover"
              />
              {(article.imageCaption ?? article.imageCredit) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-3 px-4">
                  <p className="text-white/90 text-xs leading-snug">
                    {article.imageCaption}
                    {article.imageCaption && article.imageCredit && (
                      <span className="text-white/60">, {article.imageCredit}</span>
                    )}
                    {!article.imageCaption && article.imageCredit && (
                      <span className="text-white/70">{article.imageCredit}</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Article body */}
            <div className="max-w-[68ch]">
              {source === "sanity" ? (
                <PortableText
                  value={sanityBodyBlocks}
                  components={ptComponents}
                />
              ) : (
                bodyBlocks?.map((block, i) => <Block key={i} block={block} />)
              )}
            </div>

            {/* Share */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Udostępnij:</p>
              <SocialShare title={article.title} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/aktualnosci?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Comments */}
            <Comments articleId={article.id} />
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="space-y-8">

            {/* Author card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Autor</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ backgroundColor: "var(--brand)" }}
                >
                  {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-sm">{article.author}</p>
                  {article.authorRole && (
                    <p className="text-xs text-muted-foreground">{article.authorRole}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  {tags.length > 0 ? "Podobne artykuły" : "Przeczytaj również"}
                </h3>
                <div className="space-y-3">
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/aktualnosci/${rel.id}`}
                      className="group flex gap-3 p-3 rounded-xl border border-border hover:border-border/80 hover:bg-muted/20 transition-all bg-card"
                    >
                      <div className="relative w-16 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={`https://picsum.photos/seed/${articleImageSeed(rel.id)}/160/120`}
                          alt={rel.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${catColors[rel.category] ?? ""}`}>
                          {rel.category}
                        </span>
                        <p className="text-xs font-semibold leading-snug mt-1 line-clamp-2 group-hover:opacity-70 transition-opacity">
                          {rel.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/aktualnosci"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Wszystkie aktualności
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
