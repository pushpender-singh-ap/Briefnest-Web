/**
 * Product updates. Only what the repository records: the version in Config/Info.plist, the work log in TASKS.md,
 * the feature list in README.md and the commit history. No dates or releases are invented.
 */

export interface ChangelogEntry {
  version: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  summary: string;
  groups: { title: string; items: string[] }[];
  limits: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2026-11-20",
    title: "The first build",
    summary:
      "Briefnest 0.1.0 is the first packaged build: a native macOS workspace that takes a meeting from recording to notes, decisions, action items and answers you can trace. On 20 November 2026 it was packaged as a Developer ID–signed, notarized disk image for Apple Silicon.",
    groups: [
      {
        title: "Capture and transcription",
        items: [
          "Record calls on demand or let opt-in detection start and stop recording for you.",
          "Import audio and video recordings up to four hours long, with recovery for truncated files.",
          "Transcribe on-device with Apple speech recognition or a local model, or through a configured cloud service.",
          "Separate speakers on the Mac, with name suggestions you confirm.",
          "Capture screen snapshots during calls and read their text on device.",
        ],
      },
      {
        title: "Notes, actions and decisions",
        items: [
          "AI-drafted notes in five sections with transcript references, edited in place and saved only on approval.",
          "A Review inbox for notes, decisions, action updates and chat changes across workspaces.",
          "Action items with owners, parsed due dates, reminders, a history and suggested progress from code and later meetings.",
          "Versioned decisions with reasons, evidence and relationships, exportable as Markdown or as RDF with Open Knowledge Format documents.",
          "Tracked open questions, with suggested answers from later meetings.",
        ],
      },
      {
        title: "Chat, search and code",
        items: [
          "Workspace chat with numbered sources, Full Chat and Quick Lookup modes, and reviewable change proposals.",
          "Local ⌘K search across meetings, chats, actions and decisions.",
          "Read-only GitHub and GitLab sync, plus local Git folders, with an activity feed and searchable snapshots.",
          "A choice of AI agents and models, including Claude Code, Codex, local models and OpenAI-compatible APIs.",
          "An MCP server so coding agents can read Briefnest and, if allowed, update work items.",
        ],
      },
      {
        title: "Workspaces, sharing and packaging",
        items: [
          "Independent workspaces, an All Workspaces view, team lists and a personal profile.",
          "Git-backed sharing with groups, previews before publishing, private items and conflict review.",
          "A menu bar panel, notifications and reminders.",
          "Signed, notarized DMG packaging outside the Mac App Store, with an optional build lifetime.",
        ],
      },
    ],
    limits: [
      "Recording has been verified with automated and synthetic tests; acceptance on real Teams, Zoom and Meet calls is still in progress.",
      "The local transcription model is English only. Other languages use Apple’s on-device recognition or a cloud engine.",
      "GitHub Enterprise Server, and GitLab installed under a URL subpath, are not supported.",
      "Chat retrieval is keyword-based rather than semantic.",
    ],
  },
];
