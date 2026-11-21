import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FrameProps {
  children: ReactNode;
  className?: string;
  /** Mono label under the frame, the way the film names its sources. */
  caption?: ReactNode;
}

/** A captured sheet, pane or card on the stage: rounded, fine border, soft shadow. */
export function Plate({ children, className, caption }: FrameProps) {
  if (!caption) return <div className={cn("plate", className)}>{children}</div>;
  return (
    <figure className={className}>
      <div className="plate">{children}</div>
      <figcaption className="t-eyebrow mt-4">{caption}</figcaption>
    </figure>
  );
}

interface WindowProps extends FrameProps {
  /** Shown in the title bar. */
  title?: string;
  /** Drop the title bar below 640 px, where the picture swaps to a narrow render that isn't a whole window. */
  plainWhenSmall?: boolean;
}

/**
 * A full-window capture in a Mac window frame.
 * The captures are rendered without a title bar, so the bar and its three controls are drawn here as
 * presentation. Everything below the bar is the app's own pixels.
 */
export function AppWindow({ children, className, caption, title = "Briefnest", plainWhenSmall = false }: WindowProps) {
  const frame = (
    <div className="plate">
      <div
        aria-hidden="true"
        className={cn(
          "relative flex h-[clamp(1.5rem,3.1vw,2.25rem)] items-center border-b border-black/40 bg-[#2b2b2b] px-[clamp(0.6rem,1.3vw,0.9rem)]",
          plainWhenSmall && "max-sm:hidden",
        )}
      >
        <span className="flex gap-[clamp(0.3rem,0.6vw,0.5rem)]">
          {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
            <span
              key={color}
              className="size-[clamp(0.45rem,0.95vw,0.75rem)] rounded-full"
              style={{ backgroundColor: color, boxShadow: "inset 0 0 0 0.5px rgb(0 0 0 / 0.25)" }}
            />
          ))}
        </span>
        <span className="absolute inset-x-0 text-center text-[clamp(0.6rem,1vw,0.8rem)] font-medium tracking-[-0.01em] text-white/55">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
  if (!caption) return <div className={className}>{frame}</div>;
  return (
    <figure className={className}>
      {frame}
      <figcaption className="t-eyebrow mt-4">{caption}</figcaption>
    </figure>
  );
}

interface ContainedPlateProps {
  /** Intrinsic size of the screenshot inside, used for its proportions. */
  width: number;
  height: number;
  /** Size of the alternate image shown below 640 px, when the picture uses one. */
  small?: { width: number; height: number };
  children: ReactNode;
  className?: string;
}

/**
 * A plate that fits inside a fixed stage without cropping, like `object-fit: contain` for a framed element.
 * The stage must be a size container (`[container-type:size]`); screenshots of different proportions can then
 * cross-fade in the same place and each keeps its own shape. Sizing lives in `.contained-plate` (globals.css).
 */
export function ContainedPlate({ width, height, small, children, className }: ContainedPlateProps) {
  const style: Record<string, string> = { "--ratio": (width / height).toFixed(4) };
  if (small) style["--ratio-small"] = (small.width / small.height).toFixed(4);
  return (
    <div className={cn("plate contained-plate", className)} style={style}>
      {children}
    </div>
  );
}
