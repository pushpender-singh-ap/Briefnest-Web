"use client";

import { Check, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Two real captures of the same chat card: the change chat proposes, and the card after it is approved.
 * The button swaps between them.
 */
export function ProposalDemo({ proposal, applied }: { proposal: ReactNode; applied: ReactNode }) {
  const [isApplied, setApplied] = useState(false);
  return (
    <figure>
      <div className="plate relative">
        <div aria-hidden={isApplied} className={cn("transition-opacity duration-500", isApplied ? "opacity-0" : "opacity-100")}>
          {proposal}
        </div>
        <div aria-hidden={!isApplied} className={cn("absolute inset-0 transition-opacity duration-500", isApplied ? "opacity-100" : "opacity-0")}>
          {applied}
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="t-eyebrow">Chat / {isApplied ? "Applied" : "Proposed update"}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setApplied((value) => !value)}>
          {isApplied ? <RotateCcw className="size-3.5" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
          {isApplied ? "Show the proposal again" : "See it applied"}
        </button>
      </figcaption>
    </figure>
  );
}
