"use client";

import React, { useMemo } from "react";
import MathView from "./MathView";

interface MarkdownMathViewProps {
  content: string;
  className?: string;
}

export default function MarkdownMathView({ content, className = "" }: MarkdownMathViewProps) {
  // Normalize latex block and inline patterns without breaking existing math
  const processedContent = useMemo(() => {
    if (!content) return "";

    return content
      .replace(/\\\[([\s\S]*?)\\\]/g, "\n\n$$$$$1$$$$\n\n")
      .replace(/\\\(([\s\S]*?)\\\)/g, " $$$1$$ ");
  }, [content]);

  // Parse lines into structured blocks
  const blocks = useMemo(() => {
    const lines = processedContent.split("\n");
    const result: React.ReactNode[] = [];
    let keyIdx = 0;

    let inBlockMath = false;
    let blockMathBuffer: string[] = [];

    const flushBlockMath = () => {
      if (blockMathBuffer.length > 0) {
        const mathStr = blockMathBuffer.join(" ").trim();
        result.push(
          <div
            key={`block-math-${keyIdx++}`}
            className="my-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center overflow-x-auto shadow-2xs"
          >
            <MathView math={mathStr} block />
          </div>
        );
        blockMathBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      // Handling $$ block math opening/closing
      if (line.startsWith("$$") && line.endsWith("$$") && line.length > 2) {
        flushBlockMath();
        const inner = line.slice(2, -2).trim();
        result.push(
          <div
            key={`block-math-${keyIdx++}`}
            className="my-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center overflow-x-auto shadow-2xs"
          >
            <MathView math={inner} block />
          </div>
        );
        continue;
      }

      if (line === "$$") {
        if (inBlockMath) {
          inBlockMath = false;
          flushBlockMath();
        } else {
          inBlockMath = true;
          blockMathBuffer = [];
        }
        continue;
      }

      if (inBlockMath) {
        blockMathBuffer.push(line);
        continue;
      }

      // Empty line -> spacing
      if (!line) {
        result.push(<div key={`empty-${keyIdx++}`} className="h-2" />);
        continue;
      }

      // Horizontal Rule
      if (line === "---" || line === "***" || line === "___") {
        result.push(
          <hr
            key={`hr-${keyIdx++}`}
            className="my-3.5 border-t border-slate-200 dark:border-slate-800"
          />
        );
        continue;
      }

      // Headings
      if (line.startsWith("### ")) {
        result.push(
          <h4
            key={`h3-${keyIdx++}`}
            className="font-bold text-slate-900 dark:text-white text-sm mt-3.5 mb-1.5 flex items-center gap-1.5"
          >
            {renderInline(line.slice(4))}
          </h4>
        );
        continue;
      }

      if (line.startsWith("## ")) {
        result.push(
          <h3
            key={`h2-${keyIdx++}`}
            className="font-extrabold text-slate-900 dark:text-white text-base mt-4 mb-2 flex items-center gap-2"
          >
            {renderInline(line.slice(3))}
          </h3>
        );
        continue;
      }

      if (line.startsWith("# ")) {
        result.push(
          <h2
            key={`h1-${keyIdx++}`}
            className="font-extrabold text-slate-900 dark:text-white text-lg mt-4.5 mb-2.5 flex items-center gap-2"
          >
            {renderInline(line.slice(2))}
          </h2>
        );
        continue;
      }

      // Bullet List item (•, -, *, or 1., 2.)
      const bulletMatch = line.match(/^([•\-\*]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const isNumber = /^\d+\./.test(bulletMatch[1]);
        result.push(
          <div
            key={`bullet-${keyIdx++}`}
            className="flex items-start gap-2.5 my-1 text-slate-800 dark:text-slate-200 leading-relaxed pl-1"
          >
            <span
              className={`shrink-0 select-none ${
                isNumber
                  ? "font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 mt-0.5"
                  : "text-emerald-600 dark:text-emerald-400 font-bold mt-0.5"
              }`}
            >
              {isNumber ? bulletMatch[1] : "•"}
            </span>
            <div className="flex-1 min-w-0">{renderInline(bulletMatch[2])}</div>
          </div>
        );
        continue;
      }

      // Regular Paragraph
      result.push(
        <p
          key={`p-${keyIdx++}`}
          className="my-1 text-slate-800 dark:text-slate-200 leading-relaxed"
        >
          {renderInline(line)}
        </p>
      );
    }

    if (inBlockMath) {
      flushBlockMath();
    }

    return result;
  }, [processedContent]);

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}

/**
 * Render inline text parsing math ($...$), bold (**...**), and code (`...`)
 * Standard ISO LaTeX math is displayed naturally without heavy green badges!
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by $math$
  const parts = text.split(/\$([^$]+)\$/g);

  return parts.map((part, index) => {
    // Odd index is math
    if (index % 2 === 1) {
      return (
        <span
          key={`math-${index}`}
          className="inline-block mx-0.5 align-baseline font-serif text-slate-900 dark:text-white font-medium"
        >
          <MathView math={part.trim()} />
        </span>
      );
    }

    // Even index is regular markdown text: parse bold (**...**) and inline code (`...`)
    return <span key={`text-${index}`}>{parseMarkdownTokens(part)}</span>;
  });
}

function parseMarkdownTokens(raw: string): React.ReactNode {
  // Split by bold **bold**
  const boldParts = raw.split(/\*\*([^*]+)\*\*/g);

  return boldParts.map((bPart, bIdx) => {
    if (bIdx % 2 === 1) {
      return (
        <strong key={`b-${bIdx}`} className="font-bold text-slate-900 dark:text-white">
          {parseCodeTokens(bPart)}
        </strong>
      );
    }
    return parseCodeTokens(bPart);
  });
}

function parseCodeTokens(raw: string): React.ReactNode {
  const codeParts = raw.split(/`([^`]+)`/g);

  return codeParts.map((cPart, cIdx) => {
    if (cIdx % 2 === 1) {
      return (
        <code
          key={`code-${cIdx}`}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
        >
          {cPart}
        </code>
      );
    }
    return cPart;
  });
}
