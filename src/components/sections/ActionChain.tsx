"use client";

import { useInView } from "motion/react";
import * as m from "motion/react-m";
import { Check, GitMerge, ListChecks, RotateCcw, Sparkles, AudioLines } from "lucide-react";
import { useRef, useState } from "react";
import { actions } from "@/content/home";
import { cn } from "@/lib/cn";

type Outcome = "pending" | "done" | "dismissed";

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS = [AudioLines, ListChecks, GitMerge];

/**
 * Section 6 interaction: Meeting → Action item → Code progress, drawn as one connected line.
 * The cards restate what the screenshots below show, and the suggestion can be accepted or dismissed here
 * to show the review step. It changes nothing but this demo.
 */
export function ActionChain() {
  const chain = useRef<HTMLDivElement>(null);
  const seen = useInView(chain, { once: true, amount: 0.4 });
  const [outcome, setOutcome] = useState<Outcome>("pending");
  const [meeting, item, code] = actions.chain;
  const done = outcome === "done";

  return (
    <div ref={chain}>
      <ol className="relative grid gap-4 lg:grid-cols-3 lg:gap-0">
        {[meeting, item, code].map((step, index) => {
          const Icon = ICONS[index];
          return (
            <m.li
              key={step.kind}
              className="js-motion relative lg:px-3 lg:first:pl-0 lg:last:pr-0"
              initial={{ opacity: 0, y: 18 }}
              animate={seen ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, ease: EASE, delay: index * 0.28 }}
            >
              {/* Connector to the next card: down the page on narrow screens, across on wide ones. */}
              {index < 2 && (
                <m.span
                  aria-hidden="true"
                  className="absolute top-full left-7 z-[1] h-4 w-px origin-top bg-thread lg:top-9 lg:right-[-0.75rem] lg:left-auto lg:h-px lg:w-6 lg:origin-left"
                  initial={{ scaleX: 0, scaleY: 0 }}
                  animate={seen ? { scaleX: 1, scaleY: 1 } : undefined}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.35 + index * 0.28 }}
                />
              )}

              <div className="surface h-full p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="t-eyebrow is-plain">
                    <Icon className="size-3.5 text-thread" aria-hidden="true" />
                    {step.kind}
                  </span>
                  {index === 1 && (
                    <span
                      className={cn(
                        "pill transition-colors duration-300",
                        done ? "bg-app-green/15 text-app-green" : "bg-app-orange/15 text-app-orange",
                      )}
                    >
                      {done ? "Done" : "Open"}
                    </span>
                  )}
                  {index === 2 && <span className="pill bg-app-purple/15 text-[#ec8cf9]">{step.by}</span>}
                </div>

                <p className={cn("mt-4 text-paper", index === 0 ? "text-[0.98rem] leading-relaxed" : "t-h4")}>{step.text}</p>

                <p className="t-mono mt-4 flex items-center gap-2 text-dim">
                  {index < 2 && (
                    <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[0.62rem] font-semibold text-fog" aria-hidden="true">
                      {step.by[0]}
                    </span>
                  )}
                  <span>
                    {index < 2 ? `${step.by} · ` : ""}
                    {index === 1 && done ? "Done · was due Fri 27 Nov" : step.label}
                  </span>
                </p>
              </div>
            </m.li>
          );
        })}
      </ol>

      {/* The review step: evidence arrives, Briefnest suggests, a person decides. */}
      <m.div
        className="js-motion mt-4 lg:mx-auto lg:mt-6 lg:max-w-2xl"
        initial={{ opacity: 0, y: 14 }}
        animate={seen ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE, delay: 1.05 }}
      >
        <div className="rounded-[var(--radius-card)] bg-teal-400/[0.07] p-5 shadow-[inset_0_0_0_1px_rgb(90_210_204/0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold tracking-[-0.01em] text-teal-300">
                <Sparkles className="size-4" aria-hidden="true" />
                {actions.suggestion.title}
              </p>
              <p className="mt-1.5 text-[0.98rem] text-paper">{actions.suggestion.text}</p>
              <p className="t-mono mt-2 text-dim">From Payments · PR #42 merged</p>
            </div>

            <div className="flex items-center gap-2" aria-live="polite">
              {outcome === "pending" ? (
                <>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOutcome("dismissed")}>
                    {actions.suggestion.dismiss}
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setOutcome("done")}>
                    <Check className="size-4" aria-hidden="true" />
                    {actions.suggestion.accept}
                  </button>
                </>
              ) : (
                <>
                  <span className="t-small text-fog">{done ? "Marked done, and logged in its history." : "Dismissed. The action stays open."}</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOutcome("pending")}>
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <p className="t-small mt-3 text-center text-dim">A sketch of the review step you can try. The app’s own screen is below.</p>
      </m.div>
    </div>
  );
}
