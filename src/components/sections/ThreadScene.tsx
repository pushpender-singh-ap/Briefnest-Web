"use client";

import { useInView } from "motion/react";
import * as m from "motion/react-m";
import { useRef, useState } from "react";
import { problem } from "@/content/home";
import { cn } from "@/lib/cn";

// Where each fragment sits while the story is still scattered: offset in pixels and a slight turn.
const SCATTER = [
  { x: -14, y: 20, rotate: -3.5 },
  { x: 38, y: -4, rotate: 2.5 },
  { x: -26, y: -10, rotate: 2 },
  { x: 46, y: 8, rotate: -2.5 },
  { x: 6, y: -18, rotate: 3.5 },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Section 2 visual: five fragments of one decision, scattered across tools, pull into a single thread.
 * It connects once when scrolled into view; the switch lets you scatter it and connect it again.
 * Only opacity and transform change, and the connected state is the natural layout, so nothing shifts.
 */
export function ThreadScene() {
  const scene = useRef<HTMLDivElement>(null);
  const seen = useInView(scene, { once: true, amount: 0.45 });
  // Until someone uses the switch, the scene simply follows whether it has been seen.
  const [choice, setChoice] = useState<boolean | null>(null);
  const connected = choice ?? seen;

  const state = connected ? "connected" : "scattered";

  return (
    <div ref={scene}>
      <div
        role="group"
        aria-label="Show the same decision scattered or connected"
        className="mb-7 inline-flex rounded-full bg-white/5 p-1 shadow-[inset_0_0_0_1px_var(--line)]"
      >
        {[
          { label: "Scattered", value: false },
          { label: "Connected", value: true },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={connected === option.value}
            onClick={() => setChoice(option.value)}
            className={cn(
              "min-h-10 cursor-pointer rounded-full px-4 text-[0.85rem] font-medium tracking-[-0.01em] transition-colors duration-200",
              connected === option.value ? "bg-paper text-ink-950" : "text-fog hover:text-paper",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ol className="relative grid gap-3.5 pl-9">
        {/* The thread */}
        <m.span
          aria-hidden="true"
          className="absolute top-6 bottom-6 left-[0.6875rem] w-px origin-top bg-gradient-to-b from-thread/10 via-thread to-thread/10"
          initial="scattered"
          animate={state}
          variants={{ scattered: { scaleY: 0, opacity: 0 }, connected: { scaleY: 1, opacity: 1 } }}
          transition={{ duration: connected ? 1.1 : 0.35, ease: EASE, delay: connected ? 0.25 : 0 }}
        />

        {problem.connected.map((item, index) => {
          const scattered = problem.scattered[index];
          return (
            <m.li
              key={item.kind}
              className="scene-chip relative"
              initial="scattered"
              animate={state}
              variants={{ scattered: { ...SCATTER[index], opacity: 0.62 }, connected: { x: 0, y: 0, rotate: 0, opacity: 1 } }}
              transition={{ duration: 0.85, ease: EASE, delay: connected ? index * 0.09 : 0 }}
            >
              {/* Node on the thread */}
              <m.span
                aria-hidden="true"
                className="absolute top-1/2 -left-9 grid size-[1.4375rem] -translate-y-1/2 place-items-center rounded-full bg-ink-900 shadow-[inset_0_0_0_1px_var(--color-thread)]"
                variants={{ scattered: { scale: 0, opacity: 0 }, connected: { scale: 1, opacity: 1 } }}
                transition={{ duration: 0.5, ease: EASE, delay: connected ? 0.35 + index * 0.09 : 0 }}
              >
                <span className="size-1.5 rounded-full bg-mint" />
              </m.span>

              <div className="surface grid px-4 py-3.5 sm:px-5 [&>*]:col-start-1 [&>*]:row-start-1">
                {/* Before: where this piece lives today */}
                <m.div
                  aria-hidden={connected}
                  variants={{ scattered: { opacity: 1 }, connected: { opacity: 0 } }}
                  transition={{ duration: 0.3, delay: connected ? index * 0.09 : 0.25 }}
                >
                  <p className="t-mono text-dim uppercase">{scattered.source}</p>
                  <p className="mt-1 text-[0.98rem] leading-snug tracking-[-0.012em] text-fog">{scattered.text}</p>
                </m.div>
                {/* After: its place in the record */}
                <m.div
                  aria-hidden={!connected}
                  variants={{ scattered: { opacity: 0 }, connected: { opacity: 1 } }}
                  transition={{ duration: 0.45, delay: connected ? 0.3 + index * 0.09 : 0 }}
                >
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="t-mono text-label uppercase">{item.kind}</span>
                    <span className="t-mono truncate text-dim">{item.detail}</span>
                  </p>
                  <p className="mt-1 text-[0.98rem] leading-snug font-medium tracking-[-0.012em] text-paper">{item.text}</p>
                </m.div>
              </div>
            </m.li>
          );
        })}
      </ol>
    </div>
  );
}
