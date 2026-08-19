"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export default function SocialShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function getUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function shareX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={shareX}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-black text-white hover:bg-black/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Udostępnij na X (Twitter)"
      >
        <XIcon />
        X / Twitter
      </button>

      <button
        onClick={shareFacebook}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-85 hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: "#1877F2" }}
        aria-label="Udostępnij na Facebook"
      >
        <FacebookIcon />
        Facebook
      </button>

      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Kopiuj link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Skopiowano!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Kopiuj link
          </>
        )}
      </button>
    </div>
  );
}
