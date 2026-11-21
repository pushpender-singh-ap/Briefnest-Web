import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { problem } from "@/content/home";
import { brand } from "@/content/site";
import { ThreadScene } from "./ThreadScene";

/** Section 2. One decision, scattered across five places, becomes one thread. */
export function Problem() {
  return (
    <section id={problem.id} aria-labelledby="problem-title" className="section overflow-x-clip">
      <div className="container-page grid gap-x-16 gap-y-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <SectionHeading id="problem-title" eyebrow={problem.eyebrow} title={<Headline {...problem.headline} />}>
              <p>{problem.body}</p>
            </SectionHeading>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-6 max-w-2xl border-l border-thread pl-5 text-[1.05rem] leading-relaxed text-paper">{brand.proposition}</p>
          </Reveal>

          <dl className="mt-12 grid gap-6 border-t border-white/8 pt-8 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {problem.outcomes.map((outcome, index) => (
              <Reveal key={outcome.title} delay={index * 0.08}>
                <dt className="t-h4 text-paper">{outcome.title}</dt>
                <dd className="t-small mt-2 text-mist">{outcome.text}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <Reveal delay={0.1}>
          <ThreadScene />
        </Reveal>
      </div>
    </section>
  );
}
