import Link from "next/link";
import { ArrowUpRight, Check, HardDrive, Send } from "lucide-react";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { privacy } from "@/content/home";

/** Section 11. What stays on the Mac, what leaves it, and when. Taken from docs/audit/PRIVACY.md. */
export function PrivacySection() {
  return (
    <section id={privacy.id} aria-labelledby="privacy-title" className="section border-t border-white/6 bg-ink-850/60">
      <div className="container-page">
        <Reveal>
          <SectionHeading id="privacy-title" eyebrow={privacy.eyebrow} title={<Headline {...privacy.headline} />}>
            <p>{privacy.body}</p>
          </SectionHeading>
        </Reveal>

        <div className="mt-14 grid overflow-hidden rounded-[var(--radius-card)] shadow-[inset_0_0_0_1px_var(--line-strong)] lg:mt-16 lg:grid-cols-2">
          <Reveal className="bg-white/[0.035] p-6 sm:p-9">
            <h3 className="t-h3 flex items-center gap-3">
              <HardDrive className="size-5 text-teal-400" aria-hidden="true" />
              {privacy.local.title}
            </h3>
            <ul className="mt-6 grid gap-3.5">
              {privacy.local.items.map((item) => (
                <li key={item} className="flex gap-3 text-fog">
                  <Check className="mt-1 size-4 shrink-0 text-teal-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="border-t border-white/10 p-6 sm:p-9 lg:border-t-0 lg:border-l">
            <h3 className="t-h3 flex items-center gap-3">
              <Send className="size-5 text-iris" aria-hidden="true" />
              {privacy.remote.title}
            </h3>
            <ul className="mt-6 grid gap-3.5">
              {privacy.remote.items.map((item) => (
                <li key={item.when} className="flex gap-3 text-fog">
                  <ArrowUpRight className="mt-1 size-4 shrink-0 text-iris" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-paper">{item.when}</strong> {item.what}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="t-lead text-paper">{privacy.localOnly}</p>
            <p className="t-small mt-6 text-mist">{privacy.caveat}</p>
            <Link href="/privacy" className="link mt-6 inline-flex items-center gap-1.5 text-[0.95rem]">
              Read the full privacy notes
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="t-eyebrow is-plain text-dim">Built in</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {privacy.capabilities.map((capability) => (
                <li key={capability} className="pill">
                  <Check className="size-3.5 text-teal-400" aria-hidden="true" />
                  {capability}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
