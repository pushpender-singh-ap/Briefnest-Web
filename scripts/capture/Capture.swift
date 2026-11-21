import AppKit
import SwiftUI
import BriefnestCore
import BriefnestAI
import BriefnestRepositories

// Website screenshots. Compiled beside the production views in a disposable copy of the package (see capture.sh).
// It extends marketing/briefnest-product-video/scripts/Capture.swift: the same synthetic Sentio fixture, plus
// full-window renders, Review, All Workspaces, Search, the menu bar panel and the team sheet.
// Nothing here talks to a provider, a call app or a real repository.

/// The meeting page keeps its tab in private view state. capture.sh points that state's initial value here, so a
/// render can open on Summary the way a click on the tab would.
enum CaptureTab { nonisolated(unsafe) static var value = 0 }

private actor NoNetwork: AIProviding {
    func events(settings: AISettings, request: AIProviderRequest) async throws -> AsyncThrowingStream<AIProviderEvent, Error> {
        AsyncThrowingStream { $0.yield(.init(type: "text", text: "{}")); $0.yield(.init(type: "complete")); $0.finish() }
    }
}

@main enum CaptureWebsite {
    @MainActor static func main() async throws {
        let environment = ProcessInfo.processInfo.environment
        let out = URL(fileURLWithPath: environment["BRIEFNEST_CAPTURE_OUT"]!)
        let media = URL(fileURLWithPath: environment["BRIEFNEST_CAPTURE_MEDIA"]!)
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        _ = NSApplication.shared.setActivationPolicy(.prohibited)
        NSApp.appearance = NSAppearance(named: .darkAqua)
        let calendar = Calendar.current
        let now = Date()
        func daysAgo(_ days: Int, hour: Int, minute: Int = 0) -> Date {
            calendar.date(bySettingHour: hour, minute: minute, second: 0, of: now.addingTimeInterval(-Double(days) * 86400)) ?? now
        }

        // Sentio: the payments team from the launch film.
        var w = Workspace(name: "Sentio")
        w.team = [TeamMember(name: "Mira", role: "Product lead"), TeamMember(name: "Asha", role: "Payments engineer")]
        var connection = RepositoryConnection()
        connection.url = "https://github.com/sentio-film-fixture/payments"
        w.repositories = [connection]
        let target = try RepositoryTarget(connection)
        let repo = try RepositoryStore(directory: root)
        try await repo.save(.init(workspaceID: w.id, target: target, name: "Sentio / Payments", summary: "Payment processing", branch: "main", revision: "film-fixture", branches: ["main"], files: [], documents: [], warnings: [], activity: [.init(id: "pr-42", kind: .pullRequest, title: "Implement retry backoff", author: "Asha", date: Date(), state: "merged", number: 42)]))
        var first = Meeting(workspaceID: w.id, title: "Payments kickoff", platform: .zoom)
        first.createdAt = daysAgo(1, hour: 14, minute: 30)
        first.segments = [.init(text: "Start with five retries while we measure recovery.", source: .meeting, startSeconds: 8, endSeconds: 14, speaker: "Asha")]
        first.status = .transcribed
        var m = Meeting(workspaceID: w.id, title: "Sprint Planning", platform: .zoom)
        if calendar.component(.hour, from: now) >= 11 { m.createdAt = daysAgo(0, hour: 10) }
        m.status = .transcribed
        m.segments = [
            .init(text: "After the third attempt, recovery is rare. Extra retries keep customers waiting.", source: .meeting, startSeconds: 12, endSeconds: 20, speaker: "Mira"),
            .init(text: "Retry failed payments at most three times. I’ll implement retry backoff by Friday.", source: .meeting, startSeconds: 21, endSeconds: 30, speaker: "Asha"),
            .init(text: "Which failures should skip the retry queue?", source: .meeting, startSeconds: 34, endSeconds: 38, speaker: "Mira")]
        let shot = ScreenSnapshot(seconds: 12, text: "Payment recovery by attempt. Most recovery happens in the first three retries.", filename: "recovery.png")
        m.screenSnapshots = [shot]

        // Two more workspaces, so Review and All Workspaces have something to gather.
        var atlas = Workspace(name: "Atlas")
        atlas.team = [TeamMember(name: "Mira", role: "Product lead"), TeamMember(name: "Devi", role: "Design"), TeamMember(name: "Jon", role: "Support")]
        let personal = Workspace(name: "Personal")
        var onboarding = Meeting(workspaceID: atlas.id, title: "Onboarding review", platform: .meet)
        onboarding.createdAt = daysAgo(2, hour: 15)
        onboarding.status = .transcribed
        onboarding.segments = [
            .init(text: "New accounts stall at the workspace step. Let’s cut setup to three screens.", source: .meeting, startSeconds: 15, endSeconds: 24, speaker: "Devi"),
            .init(text: "I’ll draft the welcome checklist by Wednesday.", source: .meeting, startSeconds: 26, endSeconds: 31, speaker: "Mira"),
            .init(text: "I can record the setup walkthrough next week.", source: .meeting, startSeconds: 33, endSeconds: 38, speaker: "Jon")]
        var checklist = ActionItem(text: "Draft the welcome checklist", owner: "Mira", due: "Wednesday", segmentID: onboarding.segments[1].id)
        checklist.dueDate = ActionItem.parseDue("Wednesday", from: now)
        var walkthrough = ActionItem(text: "Record the setup walkthrough", owner: "Jon", due: "next week", segmentID: onboarding.segments[2].id)
        walkthrough.dueDate = ActionItem.parseDue("next week", from: now)
        onboarding.actionItems = [checklist, walkthrough]
        var design = Meeting(workspaceID: atlas.id, title: "Design sync", platform: .meet)
        if calendar.component(.hour, from: now) >= 13 { design.createdAt = daysAgo(0, hour: 11, minute: 30) }
        design.status = .transcribed
        design.segments = [
            .init(text: "The empty state should point at Import, not at Settings.", source: .meeting, startSeconds: 9, endSeconds: 16, speaker: "Devi"),
            .init(text: "Agreed. I’ll update the mockups before Thursday’s review.", source: .meeting, startSeconds: 18, endSeconds: 24, speaker: "Devi")]
        var catchUp = Meeting(workspaceID: personal.id, title: "Catch-up with Devi", platform: .other)
        catchUp.createdAt = daysAgo(3, hour: 17)
        catchUp.status = .transcribed
        catchUp.segments = [.init(text: "Let’s review the Atlas onboarding numbers on Monday.", source: .meeting, startSeconds: 5, endSeconds: 10, speaker: "Devi")]

        var archive = Archive()
        archive.workspaces = [w, atlas, personal]; archive.selectedWorkspaceID = w.id; archive.personalWorkspaceID = personal.id
        archive.meetings = [m, first, design, onboarding, catchUp]
        archive.profile = .init(name: "Mira")
        try ArchiveStore(directory: root).save(archive)
        let model = AppModel(directory: root, aiProvider: NoNetwork())
        let history = AIHistoryStore(directory: root)

        func render<V: View>(_ name: String, _ view: V, _ width: CGFloat, _ height: CGFloat) async throws {
            let size = NSSize(width: width, height: height)
            let host = NSHostingView(rootView: view.tint(.teal).environment(\.colorScheme, .dark)
                .frame(width: width, height: height).background(Color(nsColor: .windowBackgroundColor)))
            host.sizingOptions = []
            let window = NSWindow(contentRect: NSRect(origin: .zero, size: size), styleMask: [.borderless], backing: .buffered, defer: false)
            window.isReleasedWhenClosed = false; window.appearance = NSApp.appearance; host.appearance = window.appearance
            window.contentView = host; host.frame = NSRect(origin: .zero, size: size)
            defer { window.close() }
            try await Task.sleep(for: .milliseconds(700)); host.layoutSubtreeIfNeeded()
            let bitmap = host.bitmapImageRepForCachingDisplay(in: host.bounds)!
            host.effectiveAppearance.performAsCurrentDrawingAppearance { host.cacheDisplay(in: host.bounds, to: bitmap) }
            try bitmap.representation(using: .png, properties: [:])!.write(to: out.appendingPathComponent("\(name).png"))
            print("captured \(name)")
        }
        /// The whole main window on one page.
        func window(_ name: String, section: Int, meeting: UUID? = nil, tab: Int = 0) async throws {
            if let meeting { model.openMeeting(meeting) } else { model.selectedMeetingID = nil; model.workspaceSection = section }
            CaptureTab.value = tab
            try await render(name, WorkspaceView(model: model), 1180, 760)
            CaptureTab.value = 0
        }

        // 1 · Capture
        try await render("setup", LiveCaptureSetup(model: model, meeting: m), 600, 410)
        try await render("transcript", MeetingDetail(model: model, meeting: m), 740, 460)
        try await render("screen", ScreenSnapshotsView(directory: media, snapshots: [shot]), 530, 370)

        // 2 · A notes draft waiting for approval
        var note = AIRecord(workspaceID: w.id, meetingID: m.id, kind: .notes, title: m.title, context: try AIContextBuilder.notes(workspace: w, meeting: m), settings: w.ai)
        note.notes = MeetingNotesDraft(summary: "Limit retries to three and space them out. [S1]", decisions: "- **Payment retry limit** — Retry failed payments at most three times. [S1]", actionItems: "- [ ] **Asha** — Implement retry backoff — Due: Friday [S1]", openQuestions: "- Which failures should skip the retry queue? [S1]", discussion: "Recovery falls off after attempt three. Extra attempts keep customers waiting. [S1]")
        note.response = note.notes!.markdown; note.status = .completed
        try await history.save(note)
        var atlasNote = AIRecord(workspaceID: atlas.id, meetingID: design.id, kind: .notes, title: design.title, context: try AIContextBuilder.notes(workspace: atlas, meeting: design), settings: atlas.ai)
        atlasNote.notes = MeetingNotesDraft(summary: "Point the empty state at Import. [S1]", decisions: "- **Empty state** — Lead with Import instead of Settings. [S1]", actionItems: "- [ ] **Devi** — Update the empty-state mockups — Due: Thursday [S1]", openQuestions: "", discussion: "New users look for Import first. Settings can wait until there is something to configure. [S1]")
        atlasNote.response = atlasNote.notes!.markdown; atlasNote.status = .completed
        try await history.save(atlasNote)
        // Visit Atlas once so its draft joins the cross-workspace review list, then come back.
        model.selectWorkspace(atlas.id); await model.ai.reload()
        model.selectWorkspace(w.id); await model.ai.reload()
        try await render("notes", MeetingNotesView(model: model, studio: model.ai, meeting: m), 760, 615)
        try await render("editor", CitedNotesEditor(markdown: .constant(note.notes!.markdown), height: 370).padding(12), 710, 430)
        try await window("win-meeting-draft", section: 0, meeting: m.id, tab: 1)

        // 3 · Approved: an action with an owner and a deadline, and a decision to check
        guard await model.applyNotes(note) else { throw BriefnestError.message("Demo approval failed") }
        try model.commit { a in
            let i = a.meetings.firstIndex(where: { $0.id == m.id })!
            var item = a.meetings[i].actionItems![0]
            item.context = "Space out retries and stop after the third attempt."
            item.dueDate = Calendar.current.nextDate(after: now, matching: DateComponents(hour: 17, minute: 0, weekday: 6), matchingPolicy: .nextTime)
            item.remindAt = item.dueDate.flatMap { Calendar.current.date(byAdding: .day, value: -1, to: $0) }
            item.updates = [.init(text: "Assigned to Asha", author: "Mira"), .init(text: "PR #42 merged", detail: "Implement retry backoff and cap retries at three.", author: "Asha")]
            item.suggestion = .init(status: .done, note: "Retry backoff landed in the payments service.", source: "Payments · PR #42 merged")
            a.meetings[i].actionItems = [item]
        }
        var proposed = DecisionDraft(workspaceID: w.id)
        proposed.content.title = "Payment retry limit"; proposed.content.statement = "Retry failed payments at most three times."
        proposed.content.rationale = "Recovery is rare after attempt three."
        proposed.content.topic = "Payments"; proposed.content.status = .draft
        proposed.content.evidence = [.init(meeting: m, passage: Array(m.segments.prefix(2)), focus: m.segments[1])]
        guard model.saveDecision(proposed) else { throw BriefnestError.message("Missing proposed decision") }
        try await window("win-review", section: 5)
        try await render("m-review", ReviewView(model: model), 470, 640)
        model.allWorkspaces = true
        try await window("win-all-workspaces", section: 0)
        try await render("m-all-workspaces", AllWorkspacesOverview(model: model), 470, 800)
        model.allWorkspaces = false
        model.selectWorkspace(w.id); await model.ai.reload()

        // 4 · The decision keeps both versions
        var old = DecisionDraft(workspaceID: w.id)
        old.content.title = "Payment retry policy"; old.content.statement = first.segments[0].text
        old.content.topic = "Payments"
        old.content.status = .stable; old.content.evidence = [.init(meeting: first, segment: first.segments[0])]
        guard model.saveDecision(old) else { throw BriefnestError.message("Missing original decision") }
        var change = DecisionDraft(decision: model.decisions.first(where: { $0.id == old.id })!)
        change.content.statement = "Retry failed payments at most three times."
        change.content.rationale = "Recovery is rare after attempt three. Extra retries keep customers waiting."
        change.content.evidence = [.init(meeting: m, passage: Array(m.segments.prefix(2)), focus: m.segments[0])]
        change.changeSummary = "Lowered the limit from five attempts to three."
        guard model.saveDecision(change) else { throw BriefnestError.message("Missing revision") }
        try model.commit { a in
            a.decisions.removeAll { $0.id != old.id }
            let i = a.meetings.firstIndex(where: { $0.id == m.id })!
            a.meetings[i].decisionIDs = [old.id]
            var item = a.meetings[i].actionItems![0]
            item.decisionID = old.id
            a.meetings[i].actionItems = [item]
        }
        let approved = model.archive.meetings.first(where: { $0.id == m.id })!, item = approved.actionItems![0]
        model.selectedMeetingID = nil; model.workspaceSection = 0
        try await render("actions", ActionsView(model: model), 1050, 710)
        try await render("history", ActionHistoryView(updates: item.updates!, agreedIn: m.title, created: m.createdAt).padding(18), 540, 260)
        model.openDecision(old.id, version: 1)
        try await render("v1", DecisionsView(model: model, workspace: w), 1060, 620)
        model.openDecision(old.id, version: 2)
        try await render("v2", DecisionsView(model: model, workspace: w), 1060, 640)
        try await render("questions", QuestionsView(model: model), 1000, 450)

        // 5 · An answer with its sources
        let decision = model.decisions.first(where: { $0.id == old.id })!
        let sources = [AISource(kind: .transcript, title: "Sprint Planning · Mira · 00:12", excerpt: m.segments[0].text, meetingID: m.id, segmentID: m.segments[0].id, capturedAt: m.createdAt),
            AISource(kind: .decision, title: "Payment retry policy · v2", excerpt: decision.current.content.statement, capturedAt: m.createdAt, decisionID: old.id, decisionVersion: 2)]
        var answer = AIRecord(workspaceID: w.id, kind: .answer, title: "Payment retry policy", question: "Why did we change the retry limit?", context: .init(workspaceID: w.id, workspaceName: w.name, sources: sources, notices: []), settings: w.ai)
        answer.response = "After attempt three, recovery was rare. More attempts meant a longer wait for customers. [S1]\n\nThe team lowered the limit from five retries to three. [S2]"
        answer.status = .completed; try await history.save(answer)
        model.renameChat(answer.conversationID, to: "Why did we change the retry limit?")
        await model.ai.reload()
        try await render("chat", ChatView(model: model, studio: model.ai, workspace: w), 790, 490)
        await model.repositories.reload()
        try await render("repository", RepositoryView(model: model, library: model.repositories, workspace: w), 920, 370)

        // 6 · The same moment, as whole windows
        try await window("win-home", section: 0)
        try await window("win-meeting-summary", section: 0, meeting: m.id, tab: 1)
        try await window("win-meeting-transcript", section: 0, meeting: m.id, tab: 0)
        try await window("win-actions", section: 4)
        model.openDecision(old.id, version: 2)
        try await window("win-decisions", section: 3)
        try await window("win-chat", section: 2)
        try await window("win-code", section: 1)
        try await render("search", SearchView(model: model, query: "retry"), 640, 430)
        // Narrow renders of the same views, for small screens.
        model.selectedMeetingID = nil; model.workspaceSection = 0
        try await render("m-home", WorkspaceHome(model: model, workspace: w, importRecording: {}), 470, 600)
        try await render("m-notes", MeetingNotesView(model: model, studio: model.ai, meeting: approved), 470, 600)
        try await render("m-transcript", MeetingDetail(model: model, meeting: approved), 470, 560)
        try await render("m-chat", ChatView(model: model, studio: model.ai, workspace: w), 470, 560)
        try await render("menubar", StatusPanel(model: model, close: {}).padding(18), 376, 420)
        try await render("team", TeamSheet(model: model, workspaceID: w.id), 640, 520)

        // 7 · Review the change chat proposes
        answer.proposedChange = try ChatChange.parse("<briefnest-change>{\"operation\":\"completeAction\",\"targetID\":\"\(item.id.uuidString)\",\"reason\":\"Payments PR #42 merged.\"}</briefnest-change>", targets: [ChatTarget(action: item, meeting: approved)])
        try await render("proposal", ChangeCard(model: model, record: answer).padding(14), 610, 205)
        try await history.save(answer); await model.ai.reload()
        guard model.resolveChatChange(answer, approve: true) else { throw BriefnestError.message("Could not approve fixture proposal") }
        try await render("applied", ChangeCard(model: model, record: answer).padding(14), 610, 205)
        try await render("sharing", WorkspaceSharingView(model: model, workspace: w), 720, 520)
        try await render("agents", ConnectAgentsView(model: model).padding(16), 680, 760)

        // Leave no trace of this run in the capture process's preferences.
        UserDefaults.standard.removeObject(forKey: "allWorkspaces")
    }
}
