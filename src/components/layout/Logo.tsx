import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import { brand } from "@/content/site";
import { cn } from "@/lib/cn";

/** The Aurora app icon with the product name, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)} aria-label={`${brand.name} home`}>
      {/* The icon file carries its own drop shadow, so it is drawn slightly larger than its box. */}
      <span className="relative block size-8 shrink-0">
        <Picture id="icon" alt="" sizes="40px" eager className="absolute -inset-1 block" imgClassName="size-full" />
      </span>
      <span className="text-[1.0625rem] font-semibold tracking-[-0.03em] text-paper">{brand.name}</span>
    </Link>
  );
}
