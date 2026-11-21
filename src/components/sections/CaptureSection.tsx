import { Info } from "lucide-react";
import { FeatureList } from "@/components/ui/FeatureList";
import { Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { capture } from "@/content/home";

/** Section 4. Recording, importing, transcription, speakers and what was on screen. */
export function CaptureSection() {
  return (
    <section id={capture.id} aria-labelledby="capture-title" className="section">
      <div className="container-page">
        <div className="grid gap-x-14 gap-y-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <SectionHeading id="capture-title" eyebrow={capture.eyebrow} title={<Headline {...capture.headline} />}>
              <p>{capture.body}</p>
            </SectionHeading>
          </Reveal>

          {/* Three real views, layered on wide screens and stacked on narrow ones. */}
          <Reveal delay={0.1}>
            <div className="relative grid gap-5 lg:block lg:pt-[9%] lg:pb-[19%]">
              <Plate className="lg:ml-auto lg:w-[90%]">
                <Picture
                  id="transcript"
                  small={{ id: "m-transcript" }}
                  alt={capture.images.transcript}
                  sizes="(min-width: 1024px) 620px, 92vw"
                />
              </Plate>
              <Plate className="lg:absolute lg:top-0 lg:right-[-3%] lg:w-[40%]">
                <Picture id="screen" alt={capture.images.screen} sizes="(min-width: 1024px) 290px, 92vw" />
              </Plate>
              <Plate className="lg:absolute lg:bottom-0 lg:left-0 lg:w-[58%]">
                <Picture id="setup" alt={capture.images.setup} sizes="(min-width: 1024px) 400px, 92vw" />
              </Plate>
            </div>
          </Reveal>
        </div>

        <FeatureList items={capture.features} className="mt-16 lg:mt-24" />

        <Reveal className="mt-12">
          <p className="t-small flex max-w-4xl gap-3 text-mist">
            <Info className="mt-0.5 size-4 shrink-0 text-thread" aria-hidden="true" />
            <span>{capture.note}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
