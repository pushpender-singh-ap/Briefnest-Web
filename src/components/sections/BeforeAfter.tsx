"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Side {
  label: string;
  /** What this side shows, in a few words. */
  hint: string;
  node: ReactNode;
}

/**
 * Section 5 interaction: the same meeting before and after Briefnest writes the notes.
 * It opens on the transcript and turns to the notes once, shortly after it scrolls into view;
 * after that the switch is yours. People who prefer reduced motion get the notes straight away.
 */
export function BeforeAfter({ before, after }: { before: Side; after: Side }) {
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.55 });
  const touched = useRef(false);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    if (!inView || touched.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => !touched.current && setShowAfter(true), reduced ? 0 : 1100);
    return () => clearTimeout(timer);
  }, [inView]);

  const choose = (value: boolean) => {
    touched.current = true;
    setShowAfter(value);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Before and after" className="inline-flex rounded-full bg-white/5 p-1 shadow-[inset_0_0_0_1px_var(--line)]">
          {[
            { side: before, value: false, prefix: "Before" },
            { side: after, value: true, prefix: "After" },
          ].map(({ side, value, prefix }) => (
            <button
              key={prefix}
              type="button"
              aria-pressed={showAfter === value}
              onClick={() => choose(value)}
              className={cn(
                "min-h-11 cursor-pointer rounded-full px-4 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors duration-200 sm:px-5",
                showAfter === value ? "bg-paper text-ink-950" : "text-fog hover:text-paper",
              )}
            >
              <span className={cn("t-mono mr-2 uppercase", showAfter === value ? "text-ink-600" : "text-dim")}>{prefix}</span>
              {side.label}
            </button>
          ))}
        </div>
        <p className="t-small text-mist" aria-live="polite">
          {showAfter ? after.hint : before.hint}
        </p>
      </div>

      <div ref={stage} className="relative mt-6 aspect-[940/1200] [container-type:size] sm:aspect-[1520/1180]">
        {[
          { side: before, visible: !showAfter, away: "-translate-x-[3%] scale-[0.975]" },
          { side: after, visible: showAfter, away: "translate-x-[3%] scale-[0.975]" },
        ].map(({ side, visible, away }) => (
          <div
            key={side.label}
            aria-hidden={!visible}
            className={cn(
              "absolute inset-0 grid place-items-center transition-[opacity,transform] duration-700 ease-[var(--ease-out-quint)]",
              visible ? "opacity-100" : cn("pointer-events-none opacity-0", away),
            )}
          >
            {side.node}
          </div>
        ))}
      </div>
    </div>
  );
}
