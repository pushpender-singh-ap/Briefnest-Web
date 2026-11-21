import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  /** Mono provenance label above the headline. */
  eyebrow: string;
  /** The headline. Wrap the turn in <em> for the Garamond italic. */
  title: ReactNode;
  /** Supporting copy. */
  children?: ReactNode;
  id?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}

/** Eyebrow, headline and lead for a section, in the film's reading order. */
export function SectionHeading({ eyebrow, title, children, id, align = "left", as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("t-eyebrow", align === "center" && "is-plain")}>{eyebrow}</p>
      <Tag id={id} className={cn(Tag === "h1" ? "t-display" : "t-h2", "mt-5")}>
        {title}
      </Tag>
      {children && <div className={cn("t-lead mt-6 max-w-2xl", align === "center" && "mx-auto")}>{children}</div>}
    </div>
  );
}
