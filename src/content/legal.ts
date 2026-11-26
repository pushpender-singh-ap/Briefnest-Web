/**
 * Privacy and terms pages.
 *
 * Both are DRAFTS. The privacy notes describe what the app and this site actually do, taken from
 * docs/audit/PRIVACY.md, docs/SCREEN_CAPTURE.md and the site's own code. The terms page is an outline of what
 * final terms need to cover. Neither has had legal review, and both say so on the page.
 */
import { deployment } from "./site";

export interface LegalBlock {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  after?: string[];
}

const contactEmail = deployment.availability.kind === "contact" ? deployment.availability.email : undefined;
const hasWaitlist =
  deployment.availability.kind === "waitlist" || (deployment.availability.kind === "expired" && deployment.availability.fallback.kind === "waitlist");

export const privacyPage = {
  title: "Privacy",
  status: "Draft for legal review",
  statusNote:
    "This page describes how Briefnest and this website handle data today. It was written from the product’s own privacy audit and has not been reviewed by a lawyer. It is not yet a final privacy policy.",
  updated: "2026-11-26",
  lead: "Briefnest is a Mac app that keeps your meetings and project memory in files on your Mac. Data leaves the Mac only when you use a feature that needs a service you chose.",
  blocks: [
    {
      heading: "This website",
      paragraphs: [
        "This site is a set of static pages. It sets no cookies, runs no analytics or advertising scripts and embeds nothing from third parties. Fonts, images and the film are served from the same place as the pages.",
        "Like any website, the company that hosts it may log technical details of each request, such as IP address, time and browser, to operate and protect the service.",
        hasWaitlist
          ? "If you ask for early access, the email address you enter is sent to the form service configured for this site, and is used only to tell you about Briefnest’s availability. You can ask for it to be removed at any time."
          : "This site has no sign-up or contact form, so it collects nothing you type.",
      ],
    },
    {
      heading: "What the app stores, and where",
      paragraphs: [
        "Everything below is stored for your macOS user account under ~/Library/Application Support/Briefnest. Secrets are kept in the macOS Keychain.",
      ],
      table: {
        head: ["Data", "Stored", "Leaves the Mac?"],
        rows: [
          ["Meeting audio", "In memory while transcribing. On disk only if you turn on Keep audio recordings.", "Only if you choose a cloud speech service."],
          ["Transcripts, speaker labels and names", "In the app’s archive file.", "When used as context for AI notes or chat, or read by a connected coding agent."],
          ["Screen snapshots and their recognized text", "Images in the Recordings folder; text in the archive.", "Images never. Text only as AI context."],
          ["Notes, action items, decisions, open questions", "In the app’s archive file.", "As AI context, through a connected agent, or when you share them with a group."],
          ["Chat questions, answers and quoted sources", "In local AI history, stored as files or in a SQLite database.", "The question and matching passages go to your chosen AI provider."],
          ["Team list and your profile", "In the app’s archive file.", "Names, roles and nicknames go into notes prompts. Email addresses are not sent."],
          ["Repository data", "In a local search database.", "Fetched from GitHub or GitLab; excerpts can be sent as chat context."],
          ["Jira and Multica issues", "Synced issue details and links to Briefnest work are kept on your Mac.", "Refreshing reads the connected tracker. Approved AI proposals send the selected change to that tracker."],
          ["Project email and attachments", "Selected folders in a local mail database, with attachments stored separately.", "Relevant text can go to your AI provider when mail reading is enabled. MCP mail access needs a separate opt-in. Imported mail is excluded from team-sharing exports."],
          ["Search by meaning", "A local index of the passages used for search.", "Apple, Ollama and LM Studio can process passages on your Mac. A cloud embedding model receives passages and questions when selected."],
          ["Tokens, keys and passphrases", "macOS Keychain.", "Only to the service they belong to."],
        ],
      },
      after: [
        "These files are readable by your macOS account and are not encrypted by Briefnest. Protect them the way you protect the rest of your Mac, for example with FileVault.",
      ],
    },
    {
      heading: "When data leaves your Mac",
      list: [
        "AI notes and chat send the relevant text to the AI provider you selected. With Claude Code, Codex or another cloud provider that means their service; with Ollama or LM Studio it stays on your Mac.",
        "Cloud transcription, if you choose Deepgram, ElevenLabs or an OpenAI-compatible endpoint, sends short chunks of audio to that service.",
        "Repository sync calls the GitHub or GitLab API for the repositories you connect.",
        "Each connector has an AI reading switch. Jira and Multica also have a switch for suggesting changes. Sensitive-data masking is on by default and replaces recognized passwords, access tokens and other sensitive patterns before AI processing.",
        "A connected MCP agent can use the workspace material it reads with its own provider. Mail access and asking the running Briefnest app to answer with its AI have separate opt-ins. Recognized sensitive data is always masked for MCP and cloud embeddings.",
        "Team sharing publishes only the items you choose, to the Git repository you choose, after showing you a preview.",
      ],
      after: [
        "For local processing, choose on-device transcription, local models for chat and search, and leave external connectors, agent access and team publishing off.",
        "The app itself has no analytics, crash reporting or other phone-home.",
      ],
    },
    {
      heading: "Service providers you choose",
      paragraphs: [
        "Briefnest does not run an AI or speech service of its own. When you use one, your data is handled under that provider’s terms and retention policy, and Briefnest cannot delete what has already been sent to them. Check the settings and policies of the providers you connect.",
      ],
    },
    {
      heading: "Recording other people",
      paragraphs: [
        "Briefnest records everyone in a call, not just you. Laws on recording differ by country and state, and some require the consent of everyone taking part. You are responsible for telling people and getting any consent that applies.",
        "Automatic recording is off until you enable it. When a recording starts, the app shows a notification and the menu bar shows that it is recording. Screen snapshots can include other apps and notifications visible on your main display.",
      ],
    },
    {
      heading: "Keeping and deleting data",
      list: [
        "Delete a meeting to remove its transcript, speaker names, notes, screen snapshots, saved audio and AI drafts. You can choose to keep its chats, action items and decisions.",
        "Delete a chat, a decision, or kept audio and screen images individually. Automatic cleanup of saved audio and images is available and off by default.",
        "Remove a repository to remove its local snapshot and search index.",
        "When disconnecting a mailbox, choose whether to keep or delete its imported messages. History & Search lets you manage AI history and clear the meaning-based search index.",
        "To remove everything, quit Briefnest and delete ~/Library/Application Support/Briefnest and the Briefnest items in Keychain Access.",
        "Anything you published to a team repository stays in that repository’s history and in existing clones.",
      ],
    },
    {
      heading: "Changes and contact",
      paragraphs: [
        "This draft will be replaced by a reviewed policy before Briefnest is offered for sale. The date at the top shows when it last changed.",
        contactEmail ? `Questions about privacy: ${contactEmail}.` : "A contact address for privacy questions will be published here with the reviewed policy.",
      ],
    },
  ] satisfies LegalBlock[],
};

export const termsPage = {
  title: "Terms",
  status: "Draft, not in force",
  statusNote:
    "These are working notes on what Briefnest’s terms will need to cover. They are not a contract, they have not been reviewed by a lawyer, and nothing here binds you or Briefnest yet.",
  updated: "2026-11-26",
  lead: "Briefnest is pre-release software. Final terms will be published here before any build is sold. Until then, this is what you can rely on as a description of how things work.",
  blocks: [
    {
      heading: "The software today",
      list: [
        "Briefnest is a macOS app distributed as a signed, notarized disk image outside the Mac App Store.",
        "Pre-release builds can be time-limited. A time-limited build says when it expires, stops working at that time, and leaves your meetings, notes and decisions on your Mac to open in a later build.",
        "No price has been announced and nothing is sold through this website.",
      ],
    },
    {
      heading: "Your content",
      paragraphs: [
        "Your recordings, transcripts, notes, decisions and other content are yours. Briefnest stores them on your Mac and does not receive a copy.",
      ],
    },
    {
      heading: "Services you connect",
      paragraphs: [
        "The AI and speech providers, repositories, Jira or Multica accounts, mail services and coding agents you connect have their own terms and account settings. Those terms apply when you use those services through Briefnest.",
      ],
    },
    {
      heading: "Your responsibilities",
      list: [
        "Follow the recording and consent laws that apply to you and the people you meet with.",
        "Check AI-written notes, answers and suggestions before relying on them. Briefnest shows its sources so you can.",
        "Share only what you have the right to share when you publish to a team repository.",
      ],
    },
    {
      heading: "Still to be written, with legal review",
      list: [
        "The legal entity that provides Briefnest and how to contact it.",
        "The licence you receive, including for paid versions, and what happens when a build expires.",
        "Warranty, liability and support terms.",
        "Governing law and how disputes are handled.",
        "Third-party notices and licence terms for bundled components.",
      ],
    },
  ] satisfies LegalBlock[],
};
