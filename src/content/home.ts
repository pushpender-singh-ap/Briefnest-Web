/**
 * Homepage copy, one export per section, in page order.
 *
 * Every product statement here is checked against the Briefnest repository (README.md, docs/FEATURES.md,
 * docs/FLOWS.md, docs/audit/PRIVACY.md) and the app itself. The running example is the film's fictional
 * Sentio payments team; quoted lines match the screenshots.
 */
import type { ImageId } from "@/lib/images";

/** A headline in three parts: plain text, the phrase set in Garamond italic, and optional text after it. */
export interface Headline {
  lead: string;
  turn: string;
  tail?: string;
}

export const hero = {
  eyebrow: "Native for macOS",
  /** Two lines on wide screens, one sentence per line on a phone. The last line ends on the italic turn. */
  headline: { lines: [["Your meetings.", "Your decisions."], ["Your work."]], turn: "Connected." },
  body: "Capture conversations, turn them into actionable knowledge, and keep the context behind every decision — all in one native macOS workspace.",
  posterAlt:
    "Title frame of the Briefnest film: the Aurora app icon beside the words “Meet Briefnest. From conversation to execution.”",
};

export const problem = {
  id: "product",
  eyebrow: "The problem",
  headline: { lead: "Conversations move fast. Context", turn: "shouldn’t disappear." } satisfies Headline,
  body: "A decision gets made on a call. The reason stays in someone’s head, the follow-up lands in a notes file, and the work shows up in a pull request. A month later nobody can say why it changed.",
  /** Where the same decision ends up when nothing connects it. */
  scattered: [
    { source: "On a call", text: "“I’ll implement retry backoff by Friday.”" },
    { source: "In a notes file", text: "Retries: 3? (was 5)" },
    { source: "In a tracker", text: "Retry backoff · unassigned" },
    { source: "In a pull request", text: "#42 Implement retry backoff" },
    { source: "In a chat thread", text: "why did we change the retry limit?" },
  ],
  /** The same story once it is one thread. */
  connected: [
    { kind: "Meeting", text: "Sprint Planning", detail: "0:12 · Mira" },
    { kind: "Decision", text: "At most three retries", detail: "Payment retry policy · v2" },
    { kind: "Action", text: "Implement retry backoff", detail: "Asha · due Friday" },
    { kind: "Code", text: "PR #42 merged", detail: "payments" },
    { kind: "Answer", text: "Why three, not five", detail: "2 sources" },
  ],
  outcomes: [
    { title: "Less time searching", text: "What was said, what was decided and what shipped live in one place, linked to each other." },
    { title: "Fewer dropped follow-ups", text: "An action item has an owner and a date from the moment the notes are approved." },
    { title: "The reason stays attached", text: "Every decision keeps the words, the speaker and the meeting it came from." },
  ],
};

export interface Step {
  key: string;
  title: string;
  text: string;
  image: ImageId;
  small: ImageId;
  alt: string;
  caption: string;
}

export const how = {
  id: "how-it-works",
  eyebrow: "How it works",
  headline: { lead: "From meeting", turn: "to momentum." } satisfies Headline,
  body: "Five steps, one record. Follow a single decision from the sentence that started it to the answer someone asks for later.",
  steps: [
    {
      key: "capture",
      title: "Capture",
      text: "Record a call or import a recording. Briefnest transcribes it, labels who spoke and keeps what was on screen.",
      image: "transcript",
      small: "m-transcript",
      alt: "The Sprint Planning meeting in Briefnest: a transcript with three timed turns from Mira and Asha, and tabs for Transcript, Screen, Summary and Chat.",
      caption: "Sprint Planning / Transcript",
    },
    {
      key: "understand",
      title: "Understand",
      text: "Notes arrive as a draft: a summary, the discussion, action items, decisions and open questions, each tied back to the transcript.",
      image: "notes",
      small: "m-notes",
      alt: "A notes draft in Briefnest with Summary, Discussion, Action items, Decisions and Open questions cards, and an Approve button above them.",
      caption: "Sprint Planning / Notes draft",
    },
    {
      key: "decide",
      title: "Decide",
      text: "Nothing joins the record until you approve it. Keep the decisions that are right, and drop the ones that weren’t really decided.",
      image: "win-review",
      small: "m-review",
      alt: "The Review page in Briefnest listing meeting notes to approve and a decision to confirm, with Approve & Save and Yes, Keep It buttons.",
      caption: "Review / Every workspace",
    },
    {
      key: "act",
      title: "Act",
      text: "Approved actions get an owner, a due date and a reminder. When matching work lands in the repository, Briefnest suggests the update for you to accept.",
      image: "actions-detail",
      small: "m-actions",
      alt: "An action item in Briefnest: Implement retry backoff, owned by Asha, due Friday, with a Looks done suggestion from a merged pull request.",
      caption: "Actions / Implement retry backoff",
    },
    {
      key: "remember",
      title: "Remember",
      text: "Later, ask why. The answer cites the meeting line and the decision version it came from, so you can check it.",
      image: "chat",
      small: "m-chat",
      alt: "A Briefnest chat answering “Why did we change the retry limit?” with two cited sources.",
      caption: "Chat / Sentio",
    },
  ] satisfies Step[],
};

export const capture = {
  id: "capture",
  eyebrow: "Meeting capture",
  headline: { lead: "Stay", turn: "in the conversation." } satisfies Headline,
  body: "Capture what was said, who said it, and the context shared along the way.",
  features: [
    { title: "Record a meeting", text: "Start capture yourself. Meeting audio and your microphone are kept as separate sources." },
    { title: "Automatic capture, if you want it", text: "Opt in and Briefnest starts when a call begins and stops after it ends. It is off until you turn it on." },
    { title: "Audio and video imports", text: "Bring in recordings up to four hours long. Video imports also sample the shared screen." },
    { title: "Transcription you choose", text: "On your Mac with Apple speech recognition or a local model, or through a cloud speech service you configure." },
    { title: "Speaker labels", text: "Voices are separated on your Mac. Briefnest suggests names from introductions; you confirm them." },
    { title: "Screen snapshots, read on device", text: "Still snapshots when the screen changes, with their text recognized on your Mac for notes and chat." },
  ],
  note: "What Briefnest can capture depends on the macOS permissions you grant (Microphone, Screen & System Audio Recording), your settings and the call app. Recording laws differ by place, and some require everyone’s consent: tell people when you record.",
  images: {
    setup: "The Start live transcription sheet with Capture meeting application audio and Capture my microphone both ticked.",
    transcript: "A transcript in Briefnest with turns grouped by speaker and time stamps.",
    screen: "The Screen tab showing a snapshot of a shared slide, “Payment recovery by attempt”, captured at 00:12.",
  },
};

export const notes = {
  id: "notes",
  eyebrow: "AI-powered notes",
  headline: { lead: "From long conversations", turn: "to clear next steps." } satisfies Headline,
  body: "Briefnest drafts the notes. You decide what goes on the record.",
  before: {
    label: "Transcript",
    image: "transcript" as ImageId,
    small: "m-transcript" as ImageId,
    alt: "Before: the raw Sprint Planning transcript, three turns between Mira and Asha.",
  },
  after: {
    label: "Notes",
    image: "notes" as ImageId,
    small: "m-notes" as ImageId,
    alt: "After: a structured notes draft with a summary, discussion, one action item for Asha, one decision and one open question, ready to approve.",
  },
  sections: ["Summary", "Discussion", "Action items", "Decisions", "Open questions"],
  points: [
    { title: "Edit in place", text: "Each section opens in a formatted editor: headings, lists and checklists, no Markdown to read." },
    { title: "Approve, or ask for changes", text: "Approve to save the notes to the meeting, or send feedback and get a new draft." },
    { title: "It learns your style", text: "Turn on Learn from my edits and later drafts follow the changes you keep making." },
  ],
  control:
    "A draft stays a draft. Nothing is saved to the meeting until you approve it, and an older draft can’t overwrite edits you made since.",
  disclosure: "Notes are written by the AI provider you select. The transcript and screen text for that meeting are sent to it.",
  editorAlt: "The Briefnest notes editor with a formatting toolbar above the Summary, Discussion, Action items and Decisions sections.",
};

export const actions = {
  id: "actions",
  eyebrow: "Action tracking",
  headline: { lead: "Decisions become work. Work becomes", turn: "progress." } satisfies Headline,
  body: "Every action item keeps its owner, its deadline and the sentence it came from.",
  chain: [
    { kind: "Meeting", label: "Sprint Planning · 0:21", text: "“Retry failed payments at most three times. I’ll implement retry backoff by Friday.”", by: "Asha" },
    { kind: "Action item", label: "Open · due Fri 27 Nov", text: "Implement retry backoff", by: "Asha" },
    { kind: "Code progress", label: "payments · PR #42", text: "Implement retry backoff and cap retries at three.", by: "Merged" },
  ],
  suggestion: { title: "Looks done", text: "Retry backoff landed in the payments service.", accept: "Mark Done", dismiss: "Dismiss" },
  features: [
    { title: "Ownership", text: "Assign to yourself, your team or anyone named in a meeting." },
    { title: "Due dates", text: "Deadlines are read the way people say them: “by Friday”, “end of week”, “tomorrow morning”." },
    { title: "Reminders", text: "Set a reminder, snooze an item, or let overdue and stale items surface on their own." },
    { title: "History", text: "Each change is logged with who made it: you, chat, an agent, a commit author or a meeting." },
    { title: "Linked code activity", text: "Commits and pull requests that mention the work attach to the item." },
    { title: "Suggested progress", text: "Later meetings and repository activity can suggest an update. You accept or dismiss it." },
  ],
  images: {
    detail: "The action Implement retry backoff: owner Asha, due Friday 27 November, a Thursday reminder and a Looks done suggestion citing merged PR #42.",
    history: "The action’s history: agreed in Sprint Planning, assigned to Asha by Mira, then PR #42 merged with its commit message.",
  },
};

export const decisions = {
  id: "decisions",
  eyebrow: "Project memory",
  headline: { lead: "Never lose", turn: "the why", tail: "behind a decision." } satisfies Headline,
  body: "Decisions are versioned. Each version keeps its reason, its evidence and the meeting it came from.",
  title: "Payment retry policy",
  from: "5",
  to: "3",
  versions: [
    {
      key: "v1",
      label: "Version 1",
      meeting: "Payments kickoff",
      date: "19 Nov",
      statement: "Start with five retries while we measure recovery.",
      why: "No reason was given in the meeting.",
      image: "v1-detail" as ImageId,
      alt: "Version 1 of the decision Payment retry policy: “Start with five retries while we measure recovery,” quoted from Asha at 0:08 in Payments kickoff.",
    },
    {
      key: "v2",
      label: "Version 2",
      meeting: "Sprint Planning",
      date: "20 Nov",
      statement: "Retry failed payments at most three times.",
      why: "Recovery is rare after attempt three. Extra retries keep customers waiting.",
      image: "v2-detail" as ImageId,
      alt: "Version 2 of the decision Payment retry policy: “Retry failed payments at most three times,” with the reason and the Sprint Planning quotes from Mira and Asha.",
    },
  ],
  features: [
    { title: "Versioned decisions", text: "Every edit is a new version with the reason for the change. Older versions stay readable." },
    { title: "Supporting evidence", text: "The quote, the speaker and the time are saved with the version, so later edits to a meeting can’t rewrite it." },
    { title: "Relationships", text: "Link decisions as related, dependent or superseding, and see what replaced what." },
    { title: "Linked actions", text: "See the action items carrying a decision out, and the commits and pull requests linked to them." },
    { title: "Open questions", text: "Questions a meeting leaves open are tracked until someone answers or dismisses them." },
  ],
  export: "Need the record elsewhere? Export decisions with their full history as Markdown, or as an RDF graph with Open Knowledge Format documents.",
};

export const chat = {
  id: "ask",
  eyebrow: "Chat and project knowledge",
  headline: { lead: "Ask your project. Get answers", turn: "with context." } satisfies Headline,
  body: "Ask in plain words. Briefnest answers from your saved meetings, decisions and code, and shows where each statement came from.",
  question: "Why did we change the retry limit?",
  answer: [
    { text: "After attempt three, recovery was rare. More attempts meant a longer wait for customers.", source: "S1" },
    { text: "The team lowered the limit from five retries to three.", source: "S2" },
  ],
  sources: [
    {
      id: "S1",
      title: "Sprint Planning · Mira · 00:12",
      kind: "Meeting transcript",
      excerpt: "After the third attempt, recovery is rare. Extra retries keep customers waiting.",
    },
    {
      id: "S2",
      title: "Payment retry policy · v2",
      kind: "Decision",
      excerpt: "Retry failed payments at most three times.",
    },
  ],
  points: [
    { title: "Sources on every answer", text: "Open a source to see the exact transcript line, decision version or code link that was used." },
    { title: "Scoped to the workspace", text: "A chat searches its own workspace. Start one in All Workspaces to ask across projects." },
    { title: "Changes need your approval", text: "Chat can propose marking an action done or revising a decision. It shows the change; you apply it." },
  ],
  limits:
    "Answers depend on what you’ve saved and synced. Search is keyword-based, and when nothing matches Briefnest says so instead of guessing. A citation shows where a statement came from; check the excerpt for anything that matters.",
  images: {
    chat: "A Briefnest chat: the question “Why did we change the retry limit?” and a two-sentence answer marked S1 and S2, with a 2 sources button.",
    proposal: "A Proposed update card in chat: mark Implement retry backoff done, status Open to Done, with Dismiss and Apply buttons.",
    applied: "The same card after approval, marked Applied.",
  },
};

export const integrations = {
  id: "developers",
  eyebrow: "Developer integrations",
  headline: { lead: "Your meetings and your code belong", turn: "in the same conversation." } satisfies Headline,
  body: "Bring repository activity into the workspace, and let the coding agent you already use ask Briefnest what was decided.",
  groups: [
    {
      title: "Repositories",
      names: ["GitHub", "GitLab", "Local Git folders"],
      text: "Commits, pull and merge requests, issues and the files you select become searchable context beside your meetings. Access is read-only: Briefnest doesn’t push to or change your repositories.",
    },
    {
      title: "AI agents and models",
      names: ["Claude Code", "Codex", "OpenCode", "Gemini CLI", "Cursor Agent", "Copilot CLI", "Ollama", "LM Studio"],
      text: "Notes and chat run through the agent you already have installed and signed in to, or a local model, or any OpenAI-compatible API. Switch providers from the sidebar.",
    },
    {
      title: "MCP-connected workflows",
      names: ["Claude Code", "Codex", "Cursor", "Antigravity", "Gemini CLI", "OpenCode", "VS Code"],
      text: "Add Briefnest’s MCP server to your coding agent and ask it “what did we decide about retries?” from the terminal. Reading is off until you turn it on; letting agents update action items and decisions is a second, separate switch.",
    },
  ],
  tools: ["search", "list_meetings", "get_meeting", "list_decisions", "list_actions", "trace", "list_workspaces"],
  exchange: {
    label: "Example exchange · illustration",
    prompt: "what did we decide about retries?",
    tool: "briefnest · search “retries”",
    results: [
      "Decision “Payment retry policy” [Agreed, v2]: Retry failed payments at most three times.",
      "Transcript “Sprint Planning” 2026-11-20 at 0:12, Mira: After the third attempt, recovery is rare.",
    ],
    reply: "You capped retries at three in Sprint Planning on 20 November. Mira’s data showed recovery is rare after the third attempt.",
  },
  note: "What an agent reads goes to that agent’s AI provider. Connecting Briefnest doesn’t give any agent write access to your repositories.",
  images: {
    repository: "The Code page for the Sentio workspace: one repository, payments, with merged pull request #42 Implement retry backoff by Asha.",
    agents: "The Connect agents sheet: switches for Let agents read Briefnest and Let agents update work, and a list of clients including Claude Code, Codex, Cursor, Gemini CLI, OpenCode and VS Code.",
  },
};

export const workspaces = {
  id: "workspaces",
  eyebrow: "Workspaces and collaboration",
  headline: { lead: "One workspace for every project. A clearer view", turn: "of everything." } satisfies Headline,
  body: "Keep clients and products apart, then step back and see all of them at once.",
  features: [
    { title: "Separate workspaces", text: "Each project has its own meetings, decisions, actions, repositories, team and AI choice. Nothing crosses over unless you ask." },
    { title: "All Workspaces", text: "One page for open and late actions, recent meetings and decisions to check, across every project." },
    { title: "Team members", text: "List the people on a project so actions get the right owner and names in notes are matched." },
    { title: "Share what you choose", text: "Publish selected decisions, actions and meetings to a group. You see exactly what will be sent before it goes." },
    { title: "Private items", text: "Mark a meeting, a decision or a single transcript line private and it is never published." },
    { title: "Review incoming updates", text: "Pull what teammates published. If you both changed something, Review asks which version to keep." },
  ],
  sharing:
    "Sharing runs on Git, not on a Briefnest server. Each group has its own repository, and access is whoever can read that repository. Anything already published stays in its Git history.",
  images: {
    all: "The All Workspaces page: cards for Sentio, Atlas and Personal with meetings this week and open actions, plus lists of items needing attention, recent meetings and decisions to check.",
    sharing: "The Share “Sentio” sheet with three steps: add a group, choose what to share, publish. It reads “Nothing leaves this Mac until you publish.”",
    team: "The Team sheet for Sentio listing Mira, Product lead, and Asha, Payments engineer.",
  },
};

export const privacy = {
  id: "privacy",
  eyebrow: "Privacy and control",
  headline: { lead: "Your context.", turn: "Your control." } satisfies Headline,
  body: "Your archive lives on your Mac. Text and audio leave it only for the services you choose to use.",
  local: {
    title: "Stays on your Mac",
    items: [
      "Meeting audio, transcripts and speaker names",
      "Notes, decisions, action items and their history",
      "Screen snapshots (the images never leave)",
      "Repository snapshots and the search index",
      "Keys and tokens, in the macOS Keychain",
    ],
  },
  remote: {
    title: "Leaves only when you use it",
    items: [
      { when: "AI notes and chat", what: "send the relevant text to the AI provider you selected." },
      { when: "Cloud transcription", what: "sends audio to the speech service, if you choose one." },
      { when: "Repository sync", what: "reads from GitHub or GitLab." },
      { when: "A connected coding agent", what: "sends what it reads to its own provider." },
      { when: "Team sharing", what: "publishes only the items you pick, after a preview." },
    ],
  },
  localOnly:
    "Prefer to keep everything local? Choose on-device transcription and a local model through Ollama or LM Studio, and leave agent access off. Then nothing leaves the Mac except repository sync, if you connect repositories.",
  capabilities: [
    "On-device transcription options",
    "Workspace isolation",
    "Local storage",
    "Reviewable AI changes",
    "Selective sharing",
    "Source-backed answers",
  ],
  caveat:
    "Briefnest has no analytics or crash reporting. It stores its files for your macOS account without adding its own encryption, so use FileVault. What you send to an AI or speech provider is covered by that provider’s terms.",
};

export interface TourItem {
  key: string;
  label: string;
  title: string;
  text: string;
  image: ImageId;
  small: ImageId;
  alt: string;
}

export const tour = {
  id: "tour",
  eyebrow: "Product tour",
  headline: { lead: "The whole workspace,", turn: "page by page." } satisfies Headline,
  body: "Real Briefnest windows, showing the sample Sentio project.",
  items: [
    {
      key: "workspace",
      label: "Workspace",
      title: "Workspace overview",
      text: "Open actions, open questions, decisions and recent meetings for one project.",
      image: "win-home",
      small: "m-home",
      alt: "The Sentio workspace home in Briefnest: one open action, one open question, one decision, and the recent meetings Sprint Planning and Payments kickoff.",
    },
    {
      key: "notes",
      label: "Meeting notes",
      title: "Meeting notes",
      text: "Approved notes with the meeting’s action items, decisions and open questions.",
      image: "win-meeting-summary",
      small: "m-notes",
      alt: "The Sprint Planning meeting on its Summary tab: summary, discussion, the action Implement retry backoff for Asha, the decision Payment retry policy and one open question.",
    },
    {
      key: "transcript",
      label: "Transcript",
      title: "Transcript",
      text: "Turns grouped by speaker with time stamps. Citations jump to the exact line.",
      image: "win-meeting-transcript",
      small: "m-transcript",
      alt: "The Sprint Planning meeting on its Transcript tab, with timed turns from Mira and Asha.",
    },
    {
      key: "actions",
      label: "Actions",
      title: "Action tracking",
      text: "Owner, due date, reminder, the quote it came from and a suggested update from code.",
      image: "win-actions",
      small: "m-actions",
      alt: "The Actions page with Implement retry backoff selected: owner Asha, due Friday, a Looks done suggestion and the meeting quote.",
    },
    {
      key: "decisions",
      label: "Decisions",
      title: "Decisions",
      text: "What was agreed, why, the evidence, linked work and the version history.",
      image: "win-decisions",
      small: "m-decisions",
      alt: "The Decisions page with Payment retry policy selected: the decision, its reason, the meeting quote and linked work.",
    },
    {
      key: "chat",
      label: "Chat",
      title: "Chat",
      text: "Questions answered from the workspace, with numbered sources.",
      image: "win-chat",
      small: "m-chat",
      alt: "A chat in the Sentio workspace answering “Why did we change the retry limit?” with two sources.",
    },
    {
      key: "code",
      label: "Code",
      title: "Code",
      text: "Repository activity beside the meetings: commits, pull requests, issues.",
      image: "win-code",
      small: "m-code",
      alt: "The Code page showing the payments repository and merged pull request #42, Implement retry backoff.",
    },
    {
      key: "review",
      label: "Review",
      title: "Review",
      text: "One inbox for everything waiting on you, from every workspace.",
      image: "win-review",
      small: "m-review",
      alt: "The Review page: three items waiting, with meeting notes to approve for Design sync and a decision to confirm, Payment retry limit.",
    },
  ] satisfies TourItem[],
};

export const closing = {
  headline: { lead: "Keep the conversation.", turn: "Move the work forward." } satisfies Headline,
  line: "Briefnest — Where conversations connect to the work.",
};
