"use client";

import { useEffect } from "react";
import { setIfMissing, useFormValue, type SlugInputProps } from "sanity";
import { slugify } from "../lib/format";

export function AutoSlugInput(props: SlugInputProps) {
  const title = useFormValue(["title"]) as string | undefined;
  const { value, onChange, readOnly } = props;
  useEffect(() => {
    if (readOnly || value?.current || !title?.trim()) return;
    // Generate once after typing; later headline edits keep the article URL stable.
    const timer = setTimeout(() => {
      const current = slugify(title).slice(0, 96).replace(/-+$/, "");
      if (current) onChange([setIfMissing({ _type: "slug" }), setIfMissing(current, ["current"])]);
    }, 800);
    return () => clearTimeout(timer);
  }, [title, value, onChange, readOnly]);
  return props.renderDefault(props);
}
