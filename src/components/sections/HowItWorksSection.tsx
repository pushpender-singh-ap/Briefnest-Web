import { ContainedPlate, Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { how } from "@/content/home";
import { image } from "@/lib/images";
import { HowItWorksSteps } from "./HowItWorks";

/** Section 3. The workflow, with a real screen for each stage. */
export function HowItWorksSection() {
  // Screenshots are rendered here, on the server, and handed to the interactive part as finished markup.
  const wide = how.steps.map((step) => {
    const { width, height } = image(step.image);
    return (
      <ContainedPlate key={step.key} width={width} height={height}>
        <Picture id={step.image} alt={step.alt} sizes="(min-width: 1280px) 760px, 60vw" imgClassName="size-full" />
      </ContainedPlate>
    );
  });
  const narrow = how.steps.map((step) => (
    <Plate key={step.key} caption={step.caption}>
      <Picture id={step.small} alt={step.alt} sizes="(min-width: 640px) 560px, 86vw" />
    </Plate>
  ));

  return (
    <section id={how.id} aria-labelledby="how-title" className="section border-t border-white/6 bg-ink-850/60">
      <div className="container-page">
        <Reveal>
          <SectionHeading id="how-title" eyebrow={how.eyebrow} title={<Headline {...how.headline} />}>
            <p>{how.body}</p>
          </SectionHeading>
        </Reveal>
        <Reveal delay={0.1} className="mt-14 lg:mt-20">
          <HowItWorksSteps steps={how.steps} wide={wide} narrow={narrow} />
        </Reveal>
      </div>
    </section>
  );
}
