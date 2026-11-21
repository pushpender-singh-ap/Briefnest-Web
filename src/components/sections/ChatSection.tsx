import { Info } from "lucide-react";
import { Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { chat } from "@/content/home";
import { ProposalDemo } from "./ProposalDemo";
import { SourceExplorer } from "./SourceExplorer";

/** Section 8. Ask the workspace a question and follow the answer back to its evidence. */
export function ChatSection() {
  return (
    <section id={chat.id} aria-labelledby="chat-title" className="section">
      <div className="container-page grid gap-x-16 gap-y-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
          <Reveal>
            <SectionHeading id="chat-title" eyebrow={chat.eyebrow} title={<Headline {...chat.headline} />}>
              <p>{chat.body}</p>
            </SectionHeading>
          </Reveal>

          <dl className="mt-10 grid gap-7">
            {chat.points.map((point, index) => (
              <Reveal key={point.title} delay={0.05 * index} className="border-t border-white/10 pt-5">
                <dt className="t-h4 text-paper">{point.title}</dt>
                <dd className="t-small mt-2 text-mist">{point.text}</dd>
              </Reveal>
            ))}
          </dl>

          <Reveal className="mt-10">
            <p className="t-small flex gap-3 text-mist">
              <Info className="mt-0.5 size-4 shrink-0 text-thread" aria-hidden="true" />
              <span>{chat.limits}</span>
            </p>
          </Reveal>
        </div>

        <div className="grid content-start gap-8">
          <Reveal delay={0.1}>
            <SourceExplorer />
            <p className="t-small mt-3 text-dim">Try it: open a source. This panel restates the chat below so you can explore it here.</p>
          </Reveal>
          <Reveal>
            <Plate caption="Chat / Sentio">
              <Picture id="chat" small={{ id: "m-chat" }} alt={chat.images.chat} sizes="(min-width: 1024px) 660px, 92vw" />
            </Plate>
          </Reveal>
          <Reveal>
            <ProposalDemo
              proposal={<Picture id="proposal" alt={chat.images.proposal} sizes="(min-width: 1024px) 660px, 92vw" />}
              applied={<Picture id="applied" alt={chat.images.applied} sizes="(min-width: 1024px) 660px, 92vw" />}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
