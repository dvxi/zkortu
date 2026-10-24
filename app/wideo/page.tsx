import type { Metadata } from "next";
import { Video } from "lucide-react";
import { getAllVideos } from "@/lib/sanity";
import { PageHeader } from "@/components/site/PageHeader";
import { EmptyState } from "@/components/site/States";
import WideoClient from "./WideoClient";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Wideo: skróty meczów, wywiady, analizy",
  description: "Skróty meczów ATP i WTA, wywiady z zawodnikami i analizy taktyczne. Najlepsze materiały wideo ze świata tenisa.",
  alternates: { canonical: "/wideo" },
};

export default async function WideoPage() {
  const videos = await getAllVideos();
  const tournaments = Array.from(new Set(videos.map((v) => v.tournament).filter((t): t is string => Boolean(t))));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Materiały wideo" title="Wideo" description="Skróty meczów, wywiady i analizy taktyczne. Odtwarzanie w serwisie YouTube." />
      {videos.length === 0 ? (
        <EmptyState title="Brak materiałów wideo" description="Pierwsze filmy pojawią się wkrótce." icon={<Video className="h-5 w-5" />} />
      ) : (
        <WideoClient videos={videos} tournaments={tournaments} />
      )}
    </div>
  );
}
