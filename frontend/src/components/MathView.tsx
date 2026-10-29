"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export default function MathView({ math, block = false, className = "" }: MathViewProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: "ignore",
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`w-full max-w-full overflow-x-auto text-center font-mono py-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block font-mono whitespace-nowrap ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
