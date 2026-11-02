"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateTime, timeAgo } from "@/lib/format";

/** Legacy articles have a date only; do not invent a publication hour. */
export function PublicationTime({ date, publishedAt }: { date: string; publishedAt?: string | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!publishedAt) return;
    const timer = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(timer);
  }, [publishedAt]);
  return (
    <time dateTime={publishedAt || date} title={publishedAt ? formatDateTime(publishedAt) : formatDate(date)} suppressHydrationWarning>
      {publishedAt ? timeAgo(publishedAt) : formatDate(date, { day: "numeric", month: "short" })}
    </time>
  );
}
