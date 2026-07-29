import { getAllVideos } from "@/lib/sanity";
import WideoClient from "./WideoClient";

export default async function WideoPage() {
  const videos = await getAllVideos();

  // Collect unique tournaments from fetched data for filter tabs
  const tournaments = Array.from(
    new Set(videos.map((v) => v.tournament).filter((t): t is string => Boolean(t))),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ color: "var(--brand)" }}>
          Wideo
        </h1>
        <p className="text-muted-foreground">Skróty meczów, wywiady i analizy taktyczne</p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Brak filmów — dodaj wideo w panelu CMS (/studio)
        </div>
      ) : (
        <WideoClient videos={videos} tournaments={tournaments} />
      )}
    </div>
  );
}
