import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournaments } from "@/lib/sanity";
import { PageHeader } from "@/components/site/PageHeader";
import { SkeletonCards } from "@/components/site/States";
import { CalendarClient } from "./CalendarClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kalendarz turniejów ATP i WTA",
  description: "Terminarz sezonu tenisowego: Wielki Szlem, ATP Masters 1000, ATP 500/250 i WTA 1000/500/250. Daty, nawierzchnie, pule nagród, obrońcy tytułów i wyniki.",
  alternates: { canonical: "/kalendarz" },
};

export default async function KalendarzPage() {
  const tournaments = await getTournaments();
  const year = new Date().getFullYear();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Terminarz"
        title="Kalendarz turniejów"
        description={`Sezon ${year}: turnieje ATP i WTA z datami, nawierzchnią i wynikami. Kliknij turniej, aby zobaczyć szczegóły i mecze.`}
      />
      <Suspense fallback={<SkeletonCards count={4} />}>
        <CalendarClient tournaments={tournaments} />
      </Suspense>
    </div>
  );
}
