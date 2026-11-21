import type { Headline as HeadlineParts } from "@/content/home";

/** Renders a headline with its turn in the Garamond italic, as the film sets its statements. */
export function Headline({ lead, turn, tail }: HeadlineParts) {
  return (
    <>
      {lead} <em>{turn}</em>
      {tail ? ` ${tail}` : null}
    </>
  );
}
