/**
 * The Features page, chapter by chapter. Each line restates documented behaviour of the app
 * (docs/FEATURES.md, docs/FLOWS.md, docs/SCREEN_CAPTURE.md, README.md); limits are quoted as the docs give them.
 */
import type { Headline } from "./home";
import type { ImageId } from "@/lib/images";

export interface FeatureChapter {
  id: string;
  /** Short name for the page's chapter navigation. */
  nav: string;
  eyebrow: string;
  headline: Headline;
  lead: string;
  features: { title: string; text: string }[];
  shots: { image: ImageId; small?: ImageId; alt: string; caption: string; window?: boolean }[];
  /** A condition or limit worth stating next to the chapter. */
  note?: string;
}

export const featuresIntro = {
  eyebrow: "Features",
  headline: { lead: "Everything Briefnest does,", turn: "in detail." } satisfies Headline,
  lead: "From the first minute of a call to the question someone asks six months later. Every screen below is the real app showing the sample Inknest project.",
};

export const chapters: FeatureChapter[] = [
  {
    id: "capture",
    nav: "Capture",
    eyebrow: "Capture and transcription",
    headline: { lead: "Record it once.", turn: "Keep all of it." },
    lead: "Briefnest captures the call’s audio and your microphone, transcribes as it goes and saves every few seconds, so a crash or a closed laptop doesn’t cost you the meeting.",
    features: [
      { title: "Three ways to start", text: "Record now from the sidebar or menu bar, let Briefnest detect calls automatically, or create a meeting and import audio, video or text." },
      { title: "Automatic detection is opt-in", text: "When you turn it on, recording starts a few seconds after a call begins and stops shortly after it ends. A notification says when it starts." },
      { title: "Separate sources", text: "Meeting audio and your microphone are captured as separate sources, so your own voice is labelled even before speakers are separated." },
      { title: "Survives device changes", text: "Plugging in headphones or connecting AirPods mid-call doesn’t stop the recording. After sleep or a lost signal, capture pauses and you choose when to resume." },
      { title: "On-device or cloud transcription", text: "Apple’s on-device recognition, a local Core ML model (Underdog Bark, English) that you install, or Deepgram, ElevenLabs or an OpenAI-compatible endpoint." },
      { title: "Language detection for recordings", text: "Imports and finished recordings can detect the spoken language piece by piece, and you can transcribe a saved recording again in another language." },
      { title: "Speaker separation", text: "Voices are separated on your Mac, live and for recordings. Briefnest suggests names from introductions and your team list; nothing is renamed until you confirm." },
      { title: "Screen snapshots with text recognition", text: "Still snapshots of the screen when it changes, every 10 seconds by default and up to 200 per meeting, read on your Mac with Apple’s Vision framework." },
      { title: "Recordings up to four hours", text: "Import audio or video files. A truncated file is salvaged and marked partial instead of failing. Video imports sample the shared screen too." },
    ],
    shots: [
      { image: "setup", alt: "The Start live transcription sheet: capture meeting application audio from all apps, and capture my microphone.", caption: "Meeting / Start live transcription" },
      { image: "screen", alt: "The Screen tab with a snapshot of a slide titled Payment recovery by attempt, captured at 00:12.", caption: "Meeting / Screen" },
    ],
    note: "Capture needs macOS Microphone and Screen & System Audio Recording permission. Screen snapshots are of the main display and can include other visible apps and notifications; turn them off or change the interval in Meeting Detection. With a cloud speech engine, audio is sent to that service.",
  },
  {
    id: "notes",
    nav: "Notes",
    eyebrow: "Notes and review",
    headline: { lead: "A draft in seconds.", turn: "Your record, on your say." },
    lead: "The AI writes; you edit and approve. Until then nothing is added to the meeting, and nothing you’ve already changed is overwritten.",
    features: [
      { title: "Five sections, every time", text: "Summary, Discussion, Action items, Decisions and Open questions. Each point keeps a reference to the transcript it came from." },
      { title: "Edit like a document", text: "Bold, headings, bulleted, numbered and checklist items, indent and outdent, right in the section you’re reading. No Markdown is shown." },
      { title: "Ask for changes", text: "Tell the AI what’s wrong in plain words and it regenerates the draft with your feedback." },
      { title: "One Review inbox", text: "Notes to approve, decisions to confirm, suggested action updates and changes from chat, from every workspace, with the same count in the sidebar and menu bar." },
      { title: "Auto-approve when you trust it", text: "Prefer hands-off? Turn on auto-approve for notes. It’s off by default." },
      { title: "Learns from your edits", text: "With Learn from my edits on, Briefnest turns the changes you keep making into a few style rules for later drafts. You can read, remove or forget them." },
      { title: "Open questions are tracked", text: "Questions a meeting leaves open get their own list. When a later meeting seems to answer one, Briefnest suggests the answer and links the moment." },
      { title: "Speaker names flow through", text: "Name a voice once and the name appears in the transcript, notes, actions and exports, with no extra AI request." },
    ],
    shots: [
      { image: "win-meeting-draft", small: "m-notes", alt: "A meeting’s Summary tab showing a notes draft with an Approve button above Summary, Discussion, Action items, Decisions and Open questions.", caption: "Meeting / Draft to approve", window: true },
      { image: "questions", alt: "The Questions page with one open question, Which failures should skip the retry queue?, an answer box and the meeting it came up in.", caption: "Questions" },
    ],
    note: "Notes are written by the AI provider you select; that meeting’s transcript and screen text are sent to it. Learning from edits sends a sample of your recent edits to the same provider.",
  },
  {
    id: "actions",
    nav: "Actions & decisions",
    eyebrow: "Actions and decisions",
    headline: { lead: "What was agreed,", turn: "and what happened next." },
    lead: "Action items and decisions are first-class records with owners, dates, versions and evidence. Later meetings and code extend them instead of creating duplicates.",
    features: [
      { title: "Owners and deadlines", text: "Assign to yourself, your team or people named in meetings. “By Friday”, “end of week” and “tomorrow morning” become real dates, counted from the meeting." },
      { title: "Reminders and nudges", text: "Set a reminder or snooze an item. Anything overdue, or untouched for 14 days, moves to Needs attention." },
      { title: "History like a commit log", text: "Who changed what and when: you, chat, an agent, a commit author or a meeting, with the commit message or note underneath." },
      { title: "Progress from code and meetings", text: "A merged pull request or a later meeting can suggest that an action looks done. You accept or dismiss each suggestion." },
      { title: "Proposed, agreed, replaced", text: "Decisions from notes start as proposals. Keep the real ones and they become agreed; a newer decision can replace an older one without deleting it." },
      { title: "Every edit is a version", text: "Changing a decision adds a version with its reason. Earlier versions stay readable, with the quote and time that supported them." },
      { title: "One chain of memory", text: "When a later meeting changes, repeats or adds to a decision or action, the existing record is updated. If Briefnest isn’t sure it’s the same one, it asks." },
      { title: "Export with history", text: "Copy or export decisions as Markdown, or as an RDF Turtle graph with Open Knowledge Format documents that carry every version and its evidence." },
    ],
    shots: [
      { image: "win-actions", small: "m-actions", alt: "The Actions page with Implement retry backoff selected, showing its owner, due date, a Looks done suggestion and the quote from the meeting.", caption: "Actions", window: true },
      { image: "win-decisions", small: "m-decisions", alt: "The Decisions page with Payment retry policy selected, showing the decision, why, the meeting quote, linked work and history.", caption: "Decisions", window: true },
    ],
  },
  {
    id: "chat",
    nav: "Chat & search",
    eyebrow: "Chat and search",
    headline: { lead: "Find where it was said.", turn: "Ask what it means." },
    lead: "Search finds the place. Chat answers the question, using those places as its sources.",
    features: [
      { title: "Answers with sources", text: "Each statement carries a numbered source. Open one to jump to the transcript line, the decision version or the code link." },
      { title: "Full Chat or Quick Lookup", text: "Full Chat reads everything relevant and can propose changes. Quick Lookup is a shorter, read-only answer on a lighter model." },
      { title: "The right scope", text: "A workspace chat covers that workspace’s meetings, decisions and code. A meeting’s Chat tab uses that meeting. All Workspaces chats cover the meetings and decisions of every project, not code." },
      { title: "Ask in place", text: "Every decision, action, commit and pull request has an Ask button that opens a chat with that item attached." },
      { title: "Changes as reviewable cards", text: "When chat proposes completing an action or revising a decision, you see each field, old to new, and choose Apply or Dismiss." },
      { title: "Says when it doesn’t know", text: "If nothing saved matches the question, Briefnest replies that there’s no evidence, without calling the AI." },
      { title: "Search with ⌘K", text: "Instant, local search across every workspace: meeting titles, transcript lines, notes, chats, actions and decisions. It never calls the AI." },
      { title: "See what it costs", text: "AI Usage shows the tokens your requests used, by day, by model and by kind of request, where the provider reports them." },
    ],
    shots: [
      { image: "search", alt: "Search results for “retry”: the Sprint Planning meeting, a chat, the action Implement retry backoff and the decision Payment retry policy.", caption: "Search / ⌘K" },
      { image: "win-chat", small: "m-chat", alt: "A workspace chat answering Why did we change the retry limit? with two numbered sources.", caption: "Chat", window: true },
    ],
    note: "Chat sends the question and the matching passages to the AI provider you selected. Retrieval is keyword-based, so a question worded very differently from the source can miss it.",
  },
  {
    id: "code",
    nav: "Code & agents",
    eyebrow: "Code and agents",
    headline: { lead: "Context for the people", turn: "and the agents who build." },
    lead: "Repository activity sits beside the meetings that caused it, and the coding agent in your terminal can ask Briefnest what was decided.",
    features: [
      { title: "GitHub, GitLab and local folders", text: "Add a repository by URL or pick local Git folders. Self-hosted GitLab over HTTPS works; GitHub Enterprise Server isn’t supported yet." },
      { title: "A feed of what changed", text: "Commits, pull and merge requests, issues, discussions and uncommitted changes, synced on demand or every 15 minutes while the app is open." },
      { title: "Read-only by design", text: "Briefnest fetches. It never pushes to or edits your repositories. Sign in with your existing gh or glab login, a token in the Keychain, or an SSH key." },
      { title: "Tickets tie code to work", text: "Mention a linked ticket ID in a commit or pull request title and the update lands on the related action or decision." },
      { title: "Bring your own agent", text: "Claude Code and Codex use your existing sign-in, with their tools turned off. OpenCode, Gemini CLI, Cursor Agent and Copilot CLI run in an empty folder in their read-only modes." },
      { title: "Local and custom models", text: "Use Ollama or LM Studio on your Mac, any OpenAI-compatible API, or a command of your own. One switch changes the provider for every workspace." },
      { title: "Connect agents over MCP", text: "Add the bundled server to Claude Code, Codex, Cursor, Antigravity, Gemini CLI, OpenCode or VS Code, or copy the config for any other client." },
      { title: "Two separate switches", text: "Let agents read Briefnest, and, separately, let agents update work items. Both are off by default, and every agent update is logged with the agent’s name." },
    ],
    shots: [
      { image: "win-code", small: "m-code", alt: "The Code page for Inknest with the payments repository and merged pull request #42, Implement retry backoff.", caption: "Code", window: true },
      { image: "agents", alt: "The Connect agents sheet with switches for reading and updating, and a list of supported clients.", caption: "Settings / Connect agents" },
    ],
    note: "AI features need Node.js 22 or later and a separately installed agent or model. Whatever an agent reads through MCP is sent to that agent’s own AI provider.",
  },
  {
    id: "workspaces",
    nav: "Workspaces & sharing",
    eyebrow: "Workspaces, sharing and the Mac",
    headline: { lead: "Organized by project.", turn: "At home on the Mac." },
    lead: "Workspaces keep projects apart, sharing is something you choose item by item, and the app behaves like a Mac app should.",
    features: [
      { title: "Workspaces", text: "One per client or product, each with its own meetings, decisions, actions, repositories, team and AI choice. Detected meetings are routed by workspace name and keywords." },
      { title: "All Workspaces", text: "A card per project with open and late actions, a combined list of what needs attention, and chats that search the meetings and decisions of every project." },
      { title: "Team and your profile", text: "List teammates with roles and nicknames so “PK” becomes the right person. Actions assigned to you show as You." },
      { title: "Groups with their own repository", text: "Share with Development, Product, a client or your other Mac. Each group gets its own Git repository, so access is who can read it." },
      { title: "Preview, then publish", text: "See exactly which decisions, actions and meetings will leave before anything is sent. Or export a folder and hand it over yourself." },
      { title: "Private means private", text: "Mark a meeting, decision, action or a single transcript line private and it is left out of everything shared or exported." },
      { title: "Nothing overwritten silently", text: "When you pull a teammate’s changes and you both edited the same item, Review shows both and you pick: Keep Mine or Use Theirs." },
      { title: "A menu bar panel", text: "See whether Briefnest is listening or recording, what’s waiting for you and today’s meetings, over any app, including full-screen ones." },
      { title: "Native throughout", text: "System fonts, sheets, menus and keyboard shortcuts, light and dark mode, an accent colour and three app icons to choose from." },
    ],
    shots: [
      { image: "sharing", alt: "The Share Inknest sheet: add a group, choose what to share, publish.", caption: "Share Workspace" },
      { image: "menubar", alt: "The Briefnest menu bar panel: Not listening, Record Now, two items under Needs you, and today’s meetings.", caption: "Menu bar" },
    ],
    note: "Sharing is Git-backed. There is no hosted Briefnest service, and content already published stays in that repository’s history.",
  },
];
