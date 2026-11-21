/**
 * Frequently asked questions. Answers are plain text (they are also published as FAQ structured data) and
 * each one is taken from the repository's documentation: README.md, docs/FEATURES.md, docs/RELEASING.md,
 * docs/audit/PRIVACY.md.
 */
import { deployment, product } from "./site";

export interface Faq {
  id: string;
  question: string;
  /** One or more paragraphs. */
  answer: string[];
}

const installStatus: Record<typeof deployment.availability.kind, string> = {
  download: "The current build and its details are on the Download page.",
  expired: "The last published build has reached the end of its lifetime; the Download page has the current status.",
  waitlist: "Public builds aren’t available yet. You can ask for early access on the Download page.",
  contact: "Public builds aren’t available yet. The Download page says how to ask for early access.",
  unavailable: "Public builds aren’t available yet; the Download page shows the current status.",
};

export const faqs: Faq[] = [
  {
    id: "what-is-briefnest",
    question: "What is Briefnest?",
    answer: [
      "Briefnest is a native macOS app for meetings and project memory. It records or imports a meeting, transcribes it, and drafts notes with action items, decisions and open questions.",
      "It keeps those connected to each other and to your repositories, so you can later ask what was decided and why, and see the sources behind the answer.",
    ],
  },
  {
    id: "operating-systems",
    question: "Which operating systems are supported?",
    answer: [`${product.minimumOSLong}, on a Mac with ${product.chip}. There are no Windows, iOS or web versions.`],
  },
  {
    id: "offline",
    question: "Does Briefnest work offline?",
    answer: [
      "Partly. Your archive is stored on your Mac, so browsing, editing and search work without a connection, and transcription can run on-device.",
      "AI notes and chat need the AI provider you choose. That can be a local model through Ollama or LM Studio, or a cloud service reached through a tool such as Claude Code or Codex. Repository sync and team sharing need the network.",
    ],
  },
  {
    id: "transcription",
    question: "Which transcription options are available?",
    answer: [
      "On your Mac: Apple’s on-device speech recognition, in the languages your Mac supports, or a local Core ML model (Underdog Bark, English only) that you install separately.",
      "In the cloud, if you choose: Deepgram, ElevenLabs or any OpenAI-compatible transcription endpoint you configure. With a cloud engine, audio is sent to that service. Speaker separation runs on your Mac either way.",
    ],
  },
  {
    id: "claude-code-codex",
    question: "Can I use Claude Code or Codex?",
    answer: [
      "Yes, in two ways. Briefnest can use your existing Claude Code or Codex sign-in to write notes and answer questions, with their tools turned off, so no new API key is needed.",
      "You can also connect Briefnest to Claude Code, Codex and other MCP clients, so your coding agent can look up meetings, decisions and action items while you work. Both need Node.js 22 or later, and the agents are installed separately.",
    ],
  },
  {
    id: "github-gitlab",
    question: "Can Briefnest connect to GitHub and GitLab?",
    answer: [
      "Yes. It reads commits, pull or merge requests, issues and the files you select from GitHub.com and GitLab, including self-hosted GitLab over HTTPS, and it can read local Git folders.",
      "Access is read-only: Briefnest doesn’t push to or change your repositories. GitHub Enterprise Server isn’t supported yet.",
    ],
  },
  {
    id: "review-ai-changes",
    question: "Can I review AI-generated changes?",
    answer: [
      "Yes, and that is the default. Notes arrive as a draft, decisions as proposals, and anything chat wants to change appears as a card showing what would change. Nothing is saved until you approve it.",
      "If you prefer, you can turn on auto-approve for meeting notes.",
    ],
  },
  {
    id: "multiple-projects",
    question: "Can I use Briefnest with multiple projects?",
    answer: [
      "Yes. Each workspace keeps its own meetings, decisions, actions, repositories, team and AI settings, and nothing crosses between them unless you ask. All Workspaces shows every project on one page.",
    ],
  },
  {
    id: "team-sharing",
    question: "How does team sharing work?",
    answer: [
      "Through Git. You create a group, choose or create a repository for it, pick the items to share, preview exactly what will be published, then publish. Teammates pull the updates into their own Briefnest, and if two people changed the same item, Review asks which version to keep.",
      "There is no hosted Briefnest service. Access is whoever can read each repository, and published content stays in that repository’s history.",
    ],
  },
  {
    id: "install",
    question: "How do I install Briefnest?",
    answer: [
      "Briefnest is distributed as a signed, notarized disk image, outside the Mac App Store. Open the DMG, drag Briefnest to Applications and launch it from there. macOS asks for Microphone and Screen & System Audio Recording permission the first time you record.",
      installStatus[deployment.availability.kind],
    ],
  },
];
