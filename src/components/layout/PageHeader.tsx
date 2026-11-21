import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  eyebrow: string;
  /** The page's h1. Wrap the turn in <em>. */
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** The opening of an inner page: lighting, eyebrow, h1 and lead. Clears the fixed header. */
export function PageHeader({ eyebrow, title, children, className }: PageHeaderProps) {
  return (
    <header className={cn("relative isolate overflow-hidden pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))] pb-[clamp(2.5rem,5vw,4.5rem)]", className)}>
      <div aria-hidden="true" className="aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] mask-fade-b" />
      <div className="container-page">
        <p className="t-eyebrow rise" style={{ ["--i" as string]: 0 }}>
          {eyebrow}
        </p>
        <h1 className="t-display rise-solid mt-6 max-w-[9.9em] text-[clamp(2.5rem,1.2rem+5vw,5rem)]" style={{ ["--i" as string]: 1 }}>
          {title}
        </h1>
        {children && (
          <div className="t-lead rise-solid mt-7 max-w-2xl" style={{ ["--i" as string]: 2 }}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
