"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Step } from "@/content/home";
import { cn } from "@/lib/cn";

interface HowItWorksStepsProps {
  steps: Step[];
  /** One rendered screenshot per step, in order. Server-rendered and passed in. */
  wide: ReactNode[];
  narrow: ReactNode[];
}

/**
 * Section 3 interaction: Capture → Understand → Decide → Act → Remember.
 * Wide screens get a tab strip on a thread with one screenshot stage; arrow keys move between steps.
 * Narrow screens get every step in order down the page, joined by the same thread.
 */
export function HowItWorksSteps({ steps, wide, narrow }: HowItWorksStepsProps) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = steps.length - 1;
    const next =
      event.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : event.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <>
      {/* Wide: tabs on a thread */}
      <div className="hidden lg:block">
        <div role="tablist" aria-label="How Briefnest works" onKeyDown={onKeyDown} className="relative grid grid-cols-5">
          <span aria-hidden="true" className="absolute top-[0.6875rem] right-[10%] left-[10%] h-px bg-white/12" />
          <span
            aria-hidden="true"
            className="absolute top-[0.6875rem] left-[10%] h-px origin-left bg-thread transition-transform duration-700 ease-[var(--ease-out-quint)]"
            style={{ width: "80%", transform: `scaleX(${active / (steps.length - 1)})` }}
          />
          {steps.map((step, index) => {
            const selected = index === active;
            const done = index < active;
            return (
              <button
                key={step.key}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                role="tab"
                type="button"
                id={`${id}-tab-${step.key}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${step.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-xl px-2 pb-3 text-center"
              >
                <span
                  className={cn(
                    "relative z-[1] grid size-[1.4375rem] place-items-center rounded-full bg-ink-900 transition-shadow duration-300",
                    selected || done ? "shadow-[inset_0_0_0_1px_var(--color-thread)]" : "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)]",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-[background-color,transform] duration-300",
                      selected ? "scale-[1.7] bg-mint" : done ? "bg-thread" : "bg-white/30 group-hover:bg-white/60",
                    )}
                  />
                </span>
                <span>
                  <span className="t-mono block text-dim">{String(index + 1).padStart(2, "0")}</span>
                  <span
                    className={cn(
                      "mt-1 block text-[1.2rem] font-[560] tracking-[-0.03em] transition-colors duration-200",
                      selected ? "text-paper" : "text-mist group-hover:text-fog",
                    )}
                  >
                    {step.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] items-center gap-14">
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
            {steps.map((step, index) => (
              <div
                key={step.key}
                role="tabpanel"
                id={`${id}-panel-${step.key}`}
                aria-labelledby={`${id}-tab-${step.key}`}
                hidden={index !== active}
                tabIndex={0}
                className="rounded-xl"
              >
                <p className="t-eyebrow">{step.caption}</p>
                <h3 className="t-h3 mt-5">{step.title}</h3>
                <p className="t-lead mt-4">{step.text}</p>
              </div>
            ))}
          </div>

          {/* One stage; the screenshots cross-fade in place and keep their own proportions. */}
          <div className="relative aspect-[16/10.4] [container-type:size]">
            {wide.map((shot, index) => (
              <div
                key={steps[index].key}
                aria-hidden={index !== active}
                className={cn(
                  "absolute inset-0 grid place-items-center transition-[opacity,transform] duration-500 ease-[var(--ease-out-quint)]",
                  index === active ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                {shot}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Narrow: every step, in order */}
      <ol className="relative grid gap-12 pl-9 lg:hidden">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-gradient-to-b from-thread via-thread/40 to-thread/5" />
        {steps.map((step, index) => (
          <li key={step.key} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-0.5 -left-9 grid size-[1.4375rem] place-items-center rounded-full bg-ink-900 shadow-[inset_0_0_0_1px_var(--color-thread)]"
            >
              <span className="size-1.5 rounded-full bg-mint" />
            </span>
            <p className="t-mono text-dim">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="t-h3 mt-1">{step.title}</h3>
            <p className="mt-3 text-fog">{step.text}</p>
            <div className="mt-6">{narrow[index]}</div>
          </li>
        ))}
      </ol>
    </>
  );
}
