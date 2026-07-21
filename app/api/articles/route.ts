import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/sanity";

export async function GET() {
  try {
    const articles = await getAllArticles();
    if (!articles.length) return NextResponse.json([], { status: 204 });
    return NextResponse.json(articles);
  } catch (err) {
    console.error("Articles fetch failed:", err);
    return NextResponse.json({ error: "Nie można pobrać artykułów" }, { status: 503 });
  }
}
