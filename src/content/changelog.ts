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
    version: "0.2.0",
    date: "2026-11-26",
    title: "From a meeting to the right ticket",
    summary:
      "A client confirms a Friday rollout by email. The team already has a Jira ticket for the work. Briefnest can find that ticket, draft a comment with the new date and show you the words behind it. You choose what gets posted.",
    groups: [
      {
        title: "Jira, Multica and project email",
        items: [
          "Connect a Jira Cloud project or a Multica workspace. Browse assigned issues, read the discussion and open a linked ticket directly from a Briefnest action.",
          "Choose mailboxes from Apple Mail or folders on an IMAP server for each workspace. Read conversations with their formatting and attachments, and ask questions alongside a message or ticket.",
          "Meeting notes, relevant email and chat can propose new issues, comments, assignees, due dates and status changes. Briefnest checks existing tickets and their comments for work already covered. Edit, dismiss or apply each proposal.",
          "Updates from connected tools can suggest progress on an action, a revised decision or an answer to an open question. Changes to your Briefnest records go through Review by default. AI proposals that write to a tracker always require approval.",
        ],
      },
      {
        title: "Chat, search and history",
        items: [
          "Ask what’s on your board, or name a ticket to bring its details and recent activity into Full Chat. See which sources each answer read and follow a citation back to the meeting, email or issue.",
          "Chat can find passages by meaning as well as exact words. Apple’s on-device model is the default. Choose another local or cloud embedding model in History & Search, or enable optional English and Hinglish question expansion.",
          "Choose individual files or a local SQLite database for AI history, with optional cleanup. Set model and reasoning preferences separately for chat and Quick Lookup.",
        ],
      },
      {
        title: "Privacy and connected agents",
        items: [
          "Choose which connectors AI can read and which trackers it can suggest changes to. Sensitive-data masking is on by default. Project email and connected code are read-only.",
          "MCP agents can look up synced tickets, linked work and recent code activity. Mail access and asking the running Briefnest app for a cited answer have separate opt-ins. Test, repair or remove agent connections in Settings.",
        ],
      },
    ],
    limits: [
      "Tracker suggestions depend on your account’s permissions. Quick Lookup does not query Jira or Multica.",
      "Microsoft 365 work accounts that block IMAP app passwords can use mailboxes already set up in Apple Mail.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-11-25",
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
