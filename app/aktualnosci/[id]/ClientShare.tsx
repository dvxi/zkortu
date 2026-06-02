"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ClientShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Skopiowano link</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Kopiuj link
        </>
      )}
    </button>
  );
}
