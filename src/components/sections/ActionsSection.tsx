import { FeatureList } from "@/components/ui/FeatureList";
import { Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { actions } from "@/content/home";
import { ActionChain } from "./ActionChain";

/** Section 6. An action item from the sentence that created it to the pull request that closed it. */
export function ActionsSection() {
  return (
    <section id={actions.id} aria-labelledby="actions-title" className="section">
      <div className="container-page">
        <Reveal>
          <SectionHeading id="actions-title" eyebrow={actions.eyebrow} title={<Headline {...actions.headline} />} className="max-w-4xl">
            <p>{actions.body}</p>
          </SectionHeading>
        </Reveal>

        <div className="mt-14">
          <ActionChain />
        </div>

        <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-[1.45fr_1fr] lg:items-end">
          <Reveal>
            <Plate caption="Actions / Detail">
              <Picture
                id="actions-detail"
                small={{ id: "m-actions" }}
                alt={actions.images.detail}
                sizes="(min-width: 1024px) 720px, 92vw"
              />
            </Plate>
          </Reveal>
          <Reveal delay={0.1}>
            <Plate caption="Actions / History">
              <Picture id="history" alt={actions.images.history} sizes="(min-width: 1024px) 480px, 92vw" />
            </Plate>
          </Reveal>
        </div>

        <FeatureList items={actions.features} className="mt-16 lg:mt-20" />
      </div>
    </section>
  );
}
