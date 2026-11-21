import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/LegalDocument";
import { privacyPage } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "What Briefnest stores on your Mac, what leaves it and when: transcripts, notes, screen text, AI providers, cloud speech, repositories and team sharing. Draft pending legal review.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalDocument {...privacyPage} />;
}
