"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twttr?: { widgets: { load: (el?: Element | null) => void } };
    instgrm?: { Embeds: { process: () => void } };
  }
}

const loaded = new Set<string>();

function loadScript(src: string, onLoad: () => void) {
  if (loaded.has(src)) {
    onLoad();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    existing.addEventListener("load", onLoad, { once: true });
    return;
  }
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.onload = () => {
    loaded.add(src);
    onLoad();
  };
  document.body.appendChild(s);
}

/** Strip <script> tags: React will not execute them and we load providers ourselves. */
function sanitize(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<script[^>]*\/>/gi, "");
}

export default function EmbedBlock({ html, caption }: { html: string; caption?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (/twitter-tweet|x\.com|twitter\.com/.test(html)) {
      loadScript("https://platform.twitter.com/widgets.js", () => window.twttr?.widgets.load(el));
    }
    if (/instagram-media|instagram\.com/.test(html)) {
      loadScript("https://www.instagram.com/embed.js", () => window.instgrm?.Embeds.process());
    }
  }, [html]);

  return (
    <figure className="embed my-8 flex flex-col items-center">
      <div ref={ref} className="w-full max-w-[560px] [&_iframe]:max-w-full [&_iframe]:rounded-xl" dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
      {caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
