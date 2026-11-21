"use client";

import { ArrowRight, CircleHelp, ListChecks } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { decisions } from "@/content/home";
import { cn } from "@/lib/cn";

interface DecisionTimelineProps {
  /** One screenshot per version, in order, rendered on the server. */
  shots: ReactNode[];
}

/**
 * Section 7 interaction: one decision across two meetings. Pick a version to read what was agreed then and why;
 * the screenshot follows. Up and down arrows move along the timeline.
 */
export function DecisionTimeline({ shots }: DecisionTimelineProps) {
  const versions = decisions.versions;
  const [active, setActive] = useState(versions.length - 1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = versions.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight" ? Math.min(active + 1, last)
      : event.key === "ArrowUp" || event.key === "ArrowLeft" ? Math.max(active - 1, 0)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (next < 0 || next === active) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <div>
        {/* The change, in the film's shorthand. */}
        <p className="flex items-center gap-5 text-paper">
          <span className="sr-only">
            {decisions.title}: from {decisions.from} retries to {decisions.to}.
          </span>
          <span aria-hidden="true" className={cn("tabular text-[clamp(3.5rem,7vw,5.5rem)] leading-none font-[540] tracking-[-0.06em] transition-opacity duration-500", active === 0 ? "opacity-100" : "opacity-40")}>
            {decisions.from}
          </span>
          <ArrowRight aria-hidden="true" className="size-[clamp(1.75rem,3.2vw,2.75rem)] text-thread" strokeWidth={1.5} />
          <span aria-hidden="true" className={cn("tabular text-[clamp(3.5rem,7vw,5.5rem)] leading-none font-[540] tracking-[-0.06em] transition-opacity duration-500", active === 1 ? "opacity-100" : "opacity-40")}>
            {decisions.to}
          </span>
        </p>
        <p className="t-mono mt-3 text-dim uppercase">{decisions.title} · retries</p>

        <div className="relative mt-10 pl-9">
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-[0.6875rem] w-px bg-gradient-to-b from-thread via-thread/50 to-thread/10" />

          <div role="tablist" aria-label="Versions of the decision" aria-orientation="vertical" onKeyDown={onKeyDown} className="grid gap-3">
            {versions.map((version, index) => {
              const selected = index === active;
              return (
                <button
                  key={version.key}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  role="tab"
                  type="button"
                  id={`${id}-tab-${version.key}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className={cn(
                    "group relative cursor-pointer rounded-[var(--radius-card)] p-4 text-left transition-[background-color,box-shadow] duration-300 sm:p-5",
                    selected ? "bg-white/[0.06] shadow-[inset_0_0_0_1px_rgb(132_205_183/0.45)]" : "shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white/[0.03]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-6 -left-9 grid size-[1.4375rem] place-items-center rounded-full bg-ink-900 transition-shadow duration-300",
                      selected ? "shadow-[inset_0_0_0_1px_var(--color-thread)]" : "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)]",
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full transition-[background-color,transform] duration-300", selected ? "scale-[1.7] bg-mint" : "bg-white/35")} />
                  </span>
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="t-mono text-label uppercase">{version.label}</span>
                    <span className="t-mono text-mist">
                      {version.date} · {version.meeting}
                    </span>
                  </span>
                  <span className={cn("mt-2 block text-[1.05rem] leading-snug font-medium tracking-[-0.018em] transition-colors", selected ? "text-paper" : "text-fog")}>
                    {version.statement}
                  </span>
                  <span className="t-small mt-2 block text-mist">
                    <span className="font-medium text-fog">Why: </span>
                    {version.why}
                  </span>
                </button>
              );
            })}
          </div>

          {/* What the decision is linked to today. */}
          <ul className="mt-3 grid gap-3">
            {[
              { icon: ListChecks, label: "Linked action", text: "Implement retry backoff · Asha" },
              { icon: CircleHelp, label: "Open question", text: "Which failures should skip the retry queue?" },
            ].map((row) => (
              <li key={row.label} className="relative rounded-[var(--radius-card)] px-4 py-3 shadow-[inset_0_0_0_1px_var(--line)] sm:px-5">
                <span aria-hidden="true" className="absolute top-1/2 -left-9 grid size-[1.4375rem] -translate-y-1/2 place-items-center rounded-full bg-ink-900 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]">
                  <row.icon className="size-3 text-mist" />
                </span>
                <span className="t-mono text-dim uppercase">{row.label}</span>
                <span className="mt-1 block text-[0.95rem] text-fog">{row.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${versions[active].key}`} tabIndex={0} className="rounded-[var(--radius-plate)]">
        <div className="relative aspect-[1478/912] [container-type:size]">
          {shots.map((shot, index) => (
            <div
              key={versions[index].key}
              aria-hidden={index !== active}
              className={cn(
                "absolute inset-0 grid place-items-start transition-[opacity,transform] duration-500 ease-[var(--ease-out-quint)]",
                index === active ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
              )}
            >
              {shot}
            </div>
          ))}
        </div>
        <p className="t-eyebrow mt-4">
          Decisions / {versions[active].label} · {versions[active].meeting}
        </p>
      </div>
    </div>
  );
}
