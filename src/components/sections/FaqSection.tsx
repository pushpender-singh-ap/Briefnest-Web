import { Plus } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/content/faq";
import { faqLd } from "@/lib/seo";

/**
 * Section 13. Questions and answers as native disclosure elements: each question is a real, focusable control
 * that Enter and Space toggle, and the browser announces its state. The open/close animation is CSS
 * (see `.faq` in globals.css), so the accordion needs no script at all.
 */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section border-t border-white/6 bg-ink-850/60">
      <div className="container-page grid gap-x-16 gap-y-12 lg:grid-cols-[0.75fr_1.25fr]">
        <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
          <SectionHeading id="faq-title" eyebrow="Questions" title={<>Good to <em>know.</em></>}>
            <p>Straight answers about what Briefnest runs on, what it connects to and where your data goes.</p>
          </SectionHeading>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-t border-white/12">
            {faqs.map((faq) => (
              <details key={faq.id} id={faq.id} className="faq group border-b border-white/12">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[1.125rem] leading-snug font-medium tracking-[-0.02em] text-paper transition-colors group-open:text-mint sm:text-[1.25rem]">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full text-mist shadow-[inset_0_0_0_1px_var(--line-strong)] transition-[transform,color,background-color] duration-300 ease-[var(--ease-out-quint)] group-open:rotate-45 group-open:bg-white/8 group-open:text-paper"
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <div className="grid max-w-[44rem] gap-3 pr-10 pb-7 text-fog">
                  {faq.answer.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
      <JsonLd data={faqLd(faqs)} />
    </section>
  );
}
