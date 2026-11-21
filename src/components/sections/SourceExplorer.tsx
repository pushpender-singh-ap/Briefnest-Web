"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { useId, useState } from "react";
import { chat } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Section 8 interaction: an answer whose every sentence opens onto its source.
 * A reconstruction of the app's answer and source list using the same wording as the screenshot beside it;
 * the markers and rows are buttons, so it works by keyboard and with a screen reader.
 */
export function SourceExplorer() {
  const [open, setOpen] = useState<string | null>(chat.sources[0].id);
  const id = useId();

  const toggle = (source: string) => setOpen((current) => (current === source ? null : source));

  return (
    <div className="surface p-5 sm:p-7">
      {/* The question */}
      <p className="ml-auto w-fit max-w-[90%] rounded-[1.4rem] rounded-br-md bg-teal-400/15 px-4 py-2.5 text-[1.02rem] font-medium tracking-[-0.015em] text-paper shadow-[inset_0_0_0_1px_rgb(90_210_204/0.25)] sm:px-5 sm:text-[1.15rem]">
        {chat.question}
      </p>

      {/* The answer, each sentence with its marker */}
      <div className="mt-6 flex gap-3.5">
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-teal-400/15" aria-hidden="true">
          <Sparkles className="size-4 text-teal-300" />
        </span>
        <div className="grid gap-2.5 text-[1.02rem] leading-relaxed text-paper sm:text-[1.08rem]">
          {chat.answer.map((sentence) => (
            <p key={sentence.source}>
              {sentence.text}{" "}
              <button
                type="button"
                onClick={() => toggle(sentence.source)}
                aria-expanded={open === sentence.source}
                aria-controls={`${id}-${sentence.source}`}
                className={cn(
                  "t-mono inline-flex min-h-7 cursor-pointer items-center rounded-md px-1.5 align-baseline transition-colors duration-150",
                  open === sentence.source ? "bg-teal-400/25 text-teal-300" : "bg-white/8 text-mist hover:bg-white/14 hover:text-paper",
                )}
              >
                [{sentence.source}]<span className="sr-only"> show where this came from</span>
              </button>
            </p>
          ))}
        </div>
      </div>

      {/* The sources */}
      <div className="mt-7 border-t border-white/10 pt-5">
        <p className="t-eyebrow is-plain text-dim">Sources</p>
        <ul className="mt-3 grid gap-2">
          {chat.sources.map((source) => {
            const expanded = open === source.id;
            return (
              <li key={source.id} className={cn("rounded-xl transition-colors duration-200", expanded ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}>
                <button
                  type="button"
                  onClick={() => toggle(source.id)}
                  aria-expanded={expanded}
                  aria-controls={`${id}-${source.id}`}
                  className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn("size-4 shrink-0 text-mist transition-transform duration-300 ease-[var(--ease-out-quint)]", expanded && "rotate-90")}
                  />
                  <span className="min-w-0 flex-1 text-[0.95rem] text-paper">
                    <span className="t-mono mr-2 text-teal-300">[{source.id}]</span>
                    {source.title}
                  </span>
                  <span className="t-mono hidden text-dim sm:inline">{source.kind}</span>
                </button>
                <div
                  id={`${id}-${source.id}`}
                  role="region"
                  aria-label={`${source.kind}: ${source.title}`}
                  className={cn("grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-quint)]", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden" inert={!expanded}>
                    <blockquote className="mx-3 mb-3.5 ml-10 border-l border-thread pl-4 text-[0.95rem] leading-relaxed text-fog">
                      “{source.excerpt}”
                    </blockquote>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
