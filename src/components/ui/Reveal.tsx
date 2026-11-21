import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait after the element enters view; use small steps to stagger siblings. */
  delay?: number;
  /** Distance travelled, in pixels. The film's entrances move 6 to 32. */
  y?: number;
  className?: string;
}

/**
 * Marks content to fade up the first time it scrolls into view.
 *
 * This is plain markup: the content is in the HTML and visible from the first paint, with or without
 * JavaScript. <RevealController> then hides only what starts below the fold and lets it in as it arrives,
 * using the CSS transition on `.reveal` (opacity and transform only).
 */
export function Reveal({ children, delay = 0, y = 20, className }: RevealProps) {
  const style = { "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` } as CSSProperties;
  return (
    <div data-reveal="" className={cn("reveal", className)} style={style}>
      {children}
    </div>
  );
}
