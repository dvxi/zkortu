import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getAllPageSlugs, getPageBySlug } from "@/lib/sanity";
import { PageHeader } from "@/components/site/PageHeader";
import { pageComponents } from "@/app/aktualnosci/[id]/PortableTextComponents";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Nie znaleziono strony" };
  return { title: page.title, alternates: { canonical: `/strona/${page.slug}` } };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="zkortu.pl" title={page.title} />
      <div className="prose-article">
        <PortableText value={page.body} components={pageComponents} />
      </div>
    </div>
  );
}
