export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null;
    const v = parsed.searchParams.get("v");
    if (v) return v;
    const match = parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/);
    if (match) return match[1];
  } catch {
    /* invalid URL */
  }
  return null;
}

export function youtubeThumb(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
