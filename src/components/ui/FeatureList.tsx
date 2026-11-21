import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface FeatureListProps {
  items: readonly { title: string; text: string }[];
  /** Tailwind grid-column classes for the breakpoints this list should use. */
  columns?: string;
  className?: string;
}

/**
 * A numbered definition list on hairlines: what the product does, without a wall of cards.
 * Each term is a real capability from the product's documentation.
 */
export function FeatureList({ items, columns = "sm:grid-cols-2 lg:grid-cols-3", className }: FeatureListProps) {
  return (
    <dl className={cn("grid gap-x-10 gap-y-9", columns, className)}>
      {items.map((item, index) => (
        <Reveal key={item.title} delay={(index % 3) * 0.07} className="border-t border-white/10 pt-5">
          <dt className="flex items-baseline gap-3">
            <span aria-hidden="true" className="t-mono text-thread">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="t-h4 text-paper">{item.title}</span>
          </dt>
          <dd className="t-small mt-2.5 text-mist">{item.text}</dd>
        </Reveal>
      ))}
    </dl>
  );
}
