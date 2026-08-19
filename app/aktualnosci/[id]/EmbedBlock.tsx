"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface Twttr {
  widgets: { load: (el?: Element | null) => void };
}

declare global {
  interface Window {
    twttr?: Twttr;
  }
}

export default function EmbedBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function loadWidgets() {
    window.twttr?.widgets.load(ref.current);
  }

  useEffect(loadWidgets, []);

  return (
    <div ref={ref} className="my-8 flex justify-center overflow-x-auto">
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="w-full max-w-[550px]"
      />
      <Script
        src="https://platform.x.com/widgets.js"
        strategy="lazyOnload"
        onLoad={loadWidgets}
      />
    </div>
  );
}
