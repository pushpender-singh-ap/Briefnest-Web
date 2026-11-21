"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { TourItem } from "@/content/home";
import { cn } from "@/lib/cn";

interface TourProps {
  items: TourItem[];
  /** One rendered screenshot per item, in order. */
  shots: ReactNode[];
}

const SWIPE_PX = 48;

/**
 * Section 12 interaction: a product tour of real windows.
 * Tabs choose a page; ← and → move between them from the tab strip; a horizontal swipe does the same on touch;
 * the arrow buttons work everywhere. The screenshots cross-fade in place.
 */
export function Tour({ items, shots }: TourProps) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const strip = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const id = useId();
  const last = items.length - 1;

  const go = (index: number, focus = false) => {
    const next = index < 0 ? last : index > last ? 0 : index;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  // Keep the chosen tab in view inside its scrolling strip, without moving the page.
  useEffect(() => {
    const tab = tabs.current[active];
    const container = strip.current;
    if (!tab || !container) return;
    const left = tab.offsetLeft - (container.clientWidth - tab.offsetWidth) / 2;
    container.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") go(active + 1, true);
    else if (event.key === "ArrowLeft") go(active - 1, true);
    else if (event.key === "Home") go(0, true);
    else if (event.key === "End") go(last, true);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // A swipe is mostly sideways; anything else is a scroll or a tap.
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? active + 1 : active - 1);
  };

  const current = items[active];

  return (
    <div>
      <div
        ref={strip}
        role="tablist"
        aria-label="Product tour"
        onKeyDown={onKeyDown}
        className="no-scrollbar -mx-[var(--gutter)] flex gap-1.5 overflow-x-auto px-[var(--gutter)] pb-1 lg:mx-0 lg:justify-center lg:px-0"
      >
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.key}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              role="tab"
              type="button"
              id={`${id}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => go(index)}
              className={cn(
                "min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-[0.9rem] font-medium tracking-[-0.012em] transition-colors duration-200",
                selected ? "bg-paper text-ink-950" : "bg-white/5 text-fog shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white/10 hover:text-paper",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${current.key}`}
        tabIndex={0}
        className="mt-8 rounded-[var(--radius-plate)] lg:mt-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div className="max-w-2xl">
            <p className="t-mono text-dim" aria-hidden="true">
              {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
            <h3 className="t-h3 mt-2">{current.title}</h3>
            <p className="mt-2 text-fog">{current.text}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(active - 1)}
              className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/5 text-paper shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors hover:bg-white/12"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/5 text-paper shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors hover:bg-white/12"
              aria-label="Next page"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* From 640 px up every screenshot is the same window size, so they share one grid cell and cross-fade.
            Below that the narrow renders differ in height, so only the chosen one takes up space. */}
        <div className="mt-7 grid touch-pan-y [&>*]:col-start-1 [&>*]:row-start-1" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (drag.current = null)}>
          {shots.map((shot, index) => (
            <div
              key={items[index].key}
              aria-hidden={index !== active}
              className={cn(
                "transition-[opacity,transform] duration-500 ease-[var(--ease-out-quint)]",
                index === active
                  ? "opacity-100 max-sm:[animation:rise_500ms_var(--ease-out-quint)]"
                  : "pointer-events-none scale-[0.985] opacity-0 max-sm:hidden",
              )}
            >
              {shot}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
