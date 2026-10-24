import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { getArticlesByTag, getAllTags, resolveTag } from "@/lib/sanity";
import { pluralPl } from "@/lib/format";
import { ArticleCard } from "@/components/site/ArticleCard";
import { PageHeader } from "@/components/site/PageHeader";
import { EmptyState } from "@/components/site/States";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const resolved = await resolveTag(decodeURIComponent(tag));
  if (!resolved) return { title: "Tag" };
  return {
    title: `${resolved.tag} – artykuły`,
    description: `Wszystkie artykuły zkortu.pl z tagiem ${resolved.tag}.`,
    alternates: { canonical: `/tag/${resolved.slug}` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const resolved = await resolveTag(decodeURIComponent(tag));
  if (!resolved) notFound();
  const articles = await getArticlesByTag(resolved.tag);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/aktualnosci" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong hover:opacity-70">
        <ArrowLeft className="h-3.5 w-3.5" /> Wszystkie aktualności
      </Link>
      <PageHeader
        eyebrow="Tag"
        title={resolved.tag}
        description={`${articles.length} ${pluralPl(articles.length, "artykuł", "artykuły", "artykułów")} oznaczonych tym tagiem.`}
      />
      {articles.length === 0 ? (
        <EmptyState title="Brak artykułów z tym tagiem" icon={<Tag className="h-5 w-5" />} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
