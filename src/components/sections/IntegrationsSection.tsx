import { Info } from "lucide-react";
import { Plate } from "@/components/ui/Frame";
import { Headline } from "@/components/ui/Headline";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { integrations } from "@/content/home";

/**
 * Section 9. Repositories in, and Briefnest out to the coding agent, over MCP.
 * Other products are named in plain text; no third-party logos are used.
 */
export function IntegrationsSection() {
  const { exchange } = integrations;
  return (
    <section id={integrations.id} aria-labelledby="integrations-title" className="section border-t border-white/6 bg-ink-850/60">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="integrations-title"
            eyebrow={integrations.eyebrow}
            title={<Headline {...integrations.headline} />}
            className="max-w-4xl"
          >
            <p>{integrations.body}</p>
          </SectionHeading>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
          <Reveal>
            <Plate caption="Code / Inknest">
              <Picture id="repository" small={{ id: "m-code" }} alt={integrations.images.repository} sizes="(min-width: 1024px) 700px, 92vw" />
            </Plate>
          </Reveal>

          {/* What the conversation looks like from the agent's side. Typeset here, not a capture of any product. */}
          <Reveal delay={0.1}>
            <figure className="flex h-full flex-col">
              <div className="flex-1 rounded-[var(--radius-plate)] bg-ink-950 p-5 font-mono text-[0.8rem] leading-relaxed shadow-[inset_0_0_0_1px_var(--line-strong)] sm:p-6 sm:text-[0.84rem]">
                <p className="text-mist">
                  <span className="text-thread select-none" aria-hidden="true">
                    ›{" "}
                  </span>
                  <span className="sr-only">You ask: </span>
                  <span className="text-paper">{exchange.prompt}</span>
                </p>
                <p className="mt-4 text-teal-300">
                  <span className="select-none" aria-hidden="true">
                    ⏺{" "}
                  </span>
                  <span className="sr-only">The agent calls: </span>
                  {exchange.tool}
                </p>
                <ul className="mt-2 grid gap-2 border-l border-white/12 pl-4 text-mist">
                  {exchange.results.map((result) => (
                    <li key={result}>{result}</li>
                  ))}
                </ul>
                <p className="mt-4 text-fog">
                  <span className="sr-only">The agent answers: </span>
                  {exchange.reply}
                </p>
              </div>
              <figcaption className="t-eyebrow mt-4">{exchange.label}</figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-14 gap-y-12 lg:mt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
            <Plate caption="Settings / Connect agents">
              <Picture id="agents" alt={integrations.images.agents} sizes="(min-width: 1024px) 520px, 92vw" />
            </Plate>
          </Reveal>

          <div className="grid gap-9">
            {integrations.groups.map((group, index) => (
              <Reveal key={group.title} delay={0.06 * index} className="border-t border-white/10 pt-6">
                <h3 className="t-h3">{group.title}</h3>
                <p className="mt-3 text-fog">{group.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${group.title}: supported`}>
                  {group.names.map((name) => (
                    <li key={name} className="pill">
                      {name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}

            <Reveal className="border-t border-white/10 pt-6">
              <h3 className="t-eyebrow is-plain text-dim">What a connected agent can ask for</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {integrations.tools.map((tool) => (
                  <li key={tool} className="t-mono rounded-md bg-white/6 px-2 py-1 text-fog">
                    {tool}
                  </li>
                ))}
              </ul>
              <p className="t-small mt-6 flex gap-3 text-mist">
                <Info className="mt-0.5 size-4 shrink-0 text-thread" aria-hidden="true" />
                <span>{integrations.note}</span>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
