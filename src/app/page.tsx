import type { Metadata } from "next";
import { ActionsSection } from "@/components/sections/ActionsSection";
import { CaptureSection } from "@/components/sections/CaptureSection";
import { ChatSection } from "@/components/sections/ChatSection";
import { DecisionsSection } from "@/components/sections/DecisionsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { NotesSection } from "@/components/sections/NotesSection";
import { PrivacySection } from "@/components/sections/PrivacySection";
import { Problem } from "@/components/sections/Problem";
import { TourSection } from "@/components/sections/TourSection";
import { WorkspacesSection } from "@/components/sections/WorkspacesSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { brand } from "@/content/site";
import { pageMetadata, softwareApplicationLd, videoLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ description: brand.description, path: "/" });

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorksSection />
      <CaptureSection />
      <NotesSection />
      <ActionsSection />
      <DecisionsSection />
      <ChatSection />
      <IntegrationsSection />
      <WorkspacesSection />
      <PrivacySection />
      <TourSection />
      <FaqSection />
      <FinalCta />
      <JsonLd data={softwareApplicationLd()} />
      <JsonLd data={videoLd()} />
    </>
  );
}
