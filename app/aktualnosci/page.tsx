import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArticles, getAllTags } from "@/lib/sanity";
import { PageHeader } from "@/components/site/PageHeader";
import { SkeletonCards } from "@/components/site/States";
import { NewsExplorer } from "./NewsExplorer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Aktualności tenisowe",
  description: "Najnowsze wiadomości ze świata tenisa: wyniki, relacje z turniejów ATP i WTA, transfery, polscy zawodnicy.",
  alternates: { canonical: "/aktualnosci" },
};

export default async function AktualnosciPage() {
  const [articles, tags] = await Promise.all([getAllArticles(300), getAllTags()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Redakcja"
        title="Aktualności"
        description="Wyniki, relacje z turniejów, transfery i polski tenis. Codziennie nowe materiały."
      />
      <Suspense fallback={<SkeletonCards count={6} className="lg:grid-cols-3" />}>
        <NewsExplorer articles={articles} tags={tags.slice(0, 12)} />
      </Suspense>
    </div>
  );
}
