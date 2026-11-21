import { FileOutput } from "lucide-react";
import { FeatureList } from "@/components/ui/FeatureList";
import { ContainedPlate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { decisions } from "@/content/home";
import { image } from "@/lib/images";
import { DecisionTimeline } from "./DecisionTimeline";

/** Section 7. A decision and how it changed, with the evidence for each version. */
export function DecisionsSection() {
  const shots = decisions.versions.map((version) => {
    const { width, height } = image(version.image);
    return (
      <ContainedPlate key={version.key} width={width} height={height}>
        <Picture id={version.image} alt={version.alt} sizes="(min-width: 1024px) 680px, 92vw" imgClassName="size-full" />
      </ContainedPlate>
    );
  });

  return (
    <section id={decisions.id} aria-labelledby="decisions-title" className="section border-t border-white/6 bg-ink-850/60">
      <div className="container-page">
        <Reveal>
          <SectionHeading id="decisions-title" eyebrow={decisions.eyebrow} title={<Headline {...decisions.headline} />}>
            <p>{decisions.body}</p>
          </SectionHeading>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 lg:mt-16">
          <DecisionTimeline shots={shots} />
        </Reveal>

        <FeatureList items={decisions.features} className="mt-16 lg:mt-24" columns="sm:grid-cols-2 lg:grid-cols-5" />

        <Reveal className="mt-12">
          <p className="t-small flex max-w-3xl gap-3 text-mist">
            <FileOutput className="mt-0.5 size-4 shrink-0 text-thread" aria-hidden="true" />
            <span>{decisions.export}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
