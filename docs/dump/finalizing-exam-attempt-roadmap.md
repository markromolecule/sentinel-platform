# Finalizing Exam Attempt Roadmap

## Source

This roadmap is based on [docs/finalizing-exam-attempt.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/finalizing-exam-attempt.md).

## Objective

Finalize the student exam attempt hardening and instructor exam-card PDF export by:

- making right-click attempts emit `RIGHT_CLICK_ATTEMPT`, persist through telemetry, and show immediate student feedback
- making screenshot/print-screen attempts emit `PRINT_SCREEN_ATTEMPT`, persist through telemetry, and show immediate student feedback for supported shortcuts
- adding an exam-card PDF export path that produces a printable exam copy grouped by question type and section with exam header and student fields

## Current Repo State

- Student attempt browser-security listeners already live in [use-interaction-listeners.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts>).
- `PRINT_SCREEN_ATTEMPT` already checks `PrintScreen`, `Cmd+Shift+3/4/5`, and `Meta+Shift+S`, then emits telemetry, locks the exam, and shows a warning.
- `RIGHT_CLICK_ATTEMPT` already listens to `contextmenu` and emits telemetry, but it does not currently show an alert/toast or lock/feedback state.
- Shared telemetry contracts already include `RIGHT_CLICK_ATTEMPT` and `PRINT_SCREEN_ATTEMPT` in [telemetry-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/telemetry/telemetry-schema.ts).
- API ingestion and incident persistence already recognize both events through:
    - [web-rules.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/web-rules.ts)
    - [storage.constants.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.constants.ts)
    - [incident-persistence.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts)
- Instructor monitoring already maps both incident types in [flagging-timeline.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/monitoring/_components/flagging-timeline.tsx).
- Instructor exam cards are rendered from [ExamCard](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/index.tsx), with primary actions assembled in [use-exam-card](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_hooks/use-exam-card/index.ts).
- Exam detail payloads already include `questionSections` and `questions`, enough for an export source, through [get-exam-detail.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/get-exam-detail.ts) and [packages/services/src/api/exams/core.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/core.ts).

## 1-3-1 Analysis

### One Goal

- Ship a reliable attempt-finalization layer where monitored browser actions are visible to students and instructors, and instructors can export a clean exam PDF from the exam card without duplicating exam data models.

### Three Viable Options

#### Option 1: Frontend-Only Patch

- Add missing right-click alert behavior and PDF generation directly in `sentinel-web`, using the existing `GET /exams/:id` detail response.

Pros:

- Fastest path.
- No database migration.
- Minimal API risk because telemetry event contracts already exist.

Cons:

- Browser-generated PDFs can vary by browser.
- Large exams may be heavier on the client.
- Export authorization remains tied to existing exam-detail access only.

#### Option 2: Shared Export Adapter With Existing API Data [RECOMMENDED]

- Keep the telemetry hardening in the student attempt hook, then add a reusable exam export adapter in the web app that fetches existing exam detail data, normalizes/group questions, and renders/downloads a PDF from the exam card action.

Pros:

- Fits current architecture without schema changes.
- Keeps export formatting logic isolated and testable.
- Reuses existing service contracts and avoids a premature backend file-generation subsystem.
- Still allows a backend export endpoint later if browser PDF output becomes insufficient.

Cons:

- Requires careful handling of question content variants.
- Needs frontend tests for grouping/formatting plus manual visual QA.

#### Option 3: Backend PDF Export Endpoint

- Add `GET /exams/:id/export.pdf` in `sentinel-api`, generate the PDF server-side, and make the exam card download that binary.

Pros:

- Most consistent PDF output.
- Centralized authorization and audit opportunities.
- Better for very large exams or future batch exports.

Cons:

- Adds new API surface and binary response handling.
- Introduces server-side PDF dependency and deployment considerations.
- Higher delivery scope than the current issue requires.

### One Recommended Outcome

- Proceed with **Option 2** for V1. Patch the attempt monitoring behavior in place, add focused automated coverage, and build a reusable frontend export adapter from the existing exam detail contract. Revisit Option 3 only if V1 PDF fidelity or performance is not acceptable.

## Scope Decisions

- No Prisma schema change is required for V1 because telemetry event types, incident storage, exam questions, sections, and exam detail reads already exist.
- No telemetry enum change is required because `RIGHT_CLICK_ATTEMPT` and `PRINT_SCREEN_ATTEMPT` are already source-controlled contracts.
- PDF export should not expose correct-answer metadata unless the existing instructor-facing detail payload and product decision explicitly allow it.
- Student name, student ID, and date should be rendered as blank form fields in the exported exam PDF, not populated with a specific learner.
- Windows `Windows+Shift+S` should be detected with `event.metaKey && event.shiftKey && key === 's'`; manual QA must confirm this on Windows because browser/OS handling may intercept screenshot shortcuts before JavaScript receives them.
- The `PrintScreen` key and macOS `Cmd+Shift+3/4/5` shortcuts may be technically limited by browser/OS behavior; the implementation should record best-effort detection and document unsupported interception cases.

## Phase 1: Browser-Security Attempt Feedback

### Goal

- Ensure right-click and print-screen attempts consistently emit telemetry and give the student immediate feedback during an active attempt.

### Tasks

- [x] Audit `useInteractionListeners` for all browser-security events and confirm each configured event has a visible student alert path.
- [x] Add a `lastRightClickIncidentAtRef` dedupe window so repeated `contextmenu` events do not spam telemetry or alerts.
- [x] Update `blockContextMenu` to show the shared security alert for right-click attempts when `webSecurity.right_click_disable` is enabled.
- [x] Decide whether right-click should only warn or also call `lockExam('right-click')`; V1 uses the shared `AlertDialog` lock path, matching the `TAB_SWITCH` alert experience.
- [x] Confirm `PRINT_SCREEN_ATTEMPT` still warns and locks for `PrintScreen`, macOS `Cmd+Shift+3`, macOS `Cmd+Shift+4`, macOS `Cmd+Shift+5`, and Windows `Windows+Shift+S`.
- [x] Add a print-screen dedupe window if repeated keydown events produce duplicate incident bursts.
- [x] Verify monitoring suspension suppresses right-click and print-screen alerts during intentional redirects.
- [x] Verify disabled configuration flags suppress the matching listener behavior:
    - `webSecurity.right_click_disable: false`
    - `webSecurity.print_screen_disable: false`
- [x] Verify mobile mode does not emit desktop right-click or print-screen web events.

### Candidate Files

- [use-interaction-listeners.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts>)
- [use-exam-monitoring.test.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts>)
- [exam-session-storage.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/exam-session-storage.ts>)

### Acceptance Criteria

- [x] Right-clicking during an active attempt emits `RIGHT_CLICK_ATTEMPT`.
- [x] Right-clicking during an active attempt shows a clear shared security alert.
- [x] Supported print-screen shortcuts emit `PRINT_SCREEN_ATTEMPT`.
- [x] Supported print-screen shortcuts show a clear warning and shared security alert.
- [x] Disabled web-security flags suppress matching telemetry and alerts.
- [x] Incident emission continues to use the existing telemetry contract and persistence path.

## Phase 2: Telemetry Persistence And Monitoring Verification

### Goal

- Prove that emitted right-click and print-screen events become instructor-visible incidents.

### Tasks

- [x] Review `PrintScreenRule` and `RightClickRule` in API telemetry ingestion for correct source, rule key, and severity behavior.
- [x] Review `storage.constants.ts` labels/descriptions for both events and update copy only if it mismatches the student/instructor language.
- [x] Add or update API tests proving both event types persist as `flagged_incidents` for an active attempt.
- [x] Add or update monitoring UI test coverage if the timeline currently lacks direct assertions for both incident labels.
- [ ] Manually verify instructor monitoring timeline receives:
    - `RIGHT_CLICK_ATTEMPT`
    - `PRINT_SCREEN_ATTEMPT`
- [x] Confirm duplicate bursts either aggregate or dedupe according to existing incident-persistence policy.

### Candidate Files

- [web-rules.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/web-rules.ts)
- [incident-persistence.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts)
- [incident-severity-resolver.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts)
- [flagging-timeline.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/monitoring/_components/flagging-timeline.tsx)

### Acceptance Criteria

- [x] API tests prove both browser-security events are accepted and persisted.
- [x] Instructor monitoring shows recognizable event labels for both incidents.
- [x] No new telemetry database tables or migrations are introduced for V1.

## Phase 3: Exam PDF Export Contract And Renderer

### Goal

- Add a PDF export action to instructor exam cards that renders a clean paper exam from existing exam details.

### Tasks

- [x] Confirm the desired export availability by exam status:
    - draft
    - published/active/in-progress
    - archived
- [x] Add an `Export PDF` or `Download PDF` secondary action to the exam card action model.
- [x] Ensure the export action fetches full exam details when the card only has summary data.
- [x] Create a focused export normalization helper that groups questions by:
    - section
    - question type within each section
    - order index within each group
- [x] Include an exam header with at least:
    - exam title
    - subject
    - section/classroom when available
    - duration
    - total points or question count
- [x] Include blank student fields:
    - student name
    - student ID
    - date
- [x] Render supported question types with print-safe formatting:
    - multiple choice
    - true/false
    - short answer
    - essay
    - matching
    - ordering (not currently a source-controlled question type; order-indexed groups are preserved)
    - fill-in-the-blank
- [x] Hide instructor-only metadata that should not appear on a student paper copy.
- [x] Choose and install a PDF strategy only after checking existing dependencies:
    - browser print stylesheet with `window.print`
    - `@react-pdf/renderer`
    - `jspdf` plus `html2canvas`
- [x] Prefer a dependency-light print/PDF route for V1 unless product requires direct binary download.
- [x] Add loading/error state on the exam-card export action.
- [x] Add a toast for successful export start and export failures.

### Candidate Files

- [ExamCard](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/index.tsx)
- [exam-card-footer.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-footer.tsx)
- [use-exam-card](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_hooks/use-exam-card/index.ts)
- [use-exam-card types](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_hooks/use-exam-card/_types.ts)
- [packages/services/src/api/exams/core.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/core.ts)
- New candidate directory: `app/sentinel-web/src/features/exams/export/`

### Acceptance Criteria

- [x] Exam cards expose a PDF export action to authorized instructor users.
- [x] Export uses existing exam detail data and does not require a Prisma migration.
- [x] PDF content is grouped by section and question type.
- [x] PDF header and blank student fields are present.
- [ ] Exported content remains readable across short and long exams.

## Phase 4: Data Layer And Authorization Review

### Goal

- Confirm the feature is secure and does not require unnecessary schema work.

### Tasks

- [x] Verify `GET /exams/:id` returns all fields required for export for instructor users.
- [x] Verify existing route permissions prevent students from exporting instructor copies.
- [x] Confirm whether correct answers are present in the payload and decide if export should strip or include them.
- [x] If the frontend payload is insufficient, add an API response field only through shared schemas and DTOs, not direct ad hoc client types.
- [x] If direct binary export becomes required, design `GET /exams/:id/export.pdf` as a follow-up backend endpoint.
- [x] Do not generate a Prisma migration unless export requires new audit records or stored export jobs.

### Data-Layer Decision

- [x] V1 data-layer decision: no schema change and no migration.
- [ ] Optional follow-up: add export audit logging only if product needs compliance tracking for generated exam copies.

## Phase 5: Testing And Manual QA

#### Automated Tests

- [x] Add `RIGHT_CLICK_ATTEMPT` emission and warning coverage in [use-exam-monitoring.test.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts>).
- [x] Add `RIGHT_CLICK_ATTEMPT` disabled-configuration coverage in `use-exam-monitoring.test.ts`.
- [x] Add `PRINT_SCREEN_ATTEMPT` coverage for `PrintScreen` in `use-exam-monitoring.test.ts`.
- [x] Add `PRINT_SCREEN_ATTEMPT` coverage for `Cmd+Shift+3` in `use-exam-monitoring.test.ts`.
- [x] Add `PRINT_SCREEN_ATTEMPT` coverage for `Meta+Shift+S` in `use-exam-monitoring.test.ts`.
- [x] Add print-screen disabled-configuration coverage in `use-exam-monitoring.test.ts`.
- [x] Add export normalization tests for section grouping, question-type grouping, and ordering.
- [x] Add export rendering tests that assert header fields and blank student fields are present.
- [x] Add exam-card action tests proving the export action calls the export handler without breaking existing primary actions.
- [x] Run `pnpm --dir app/sentinel-web test`.
- [x] Run `pnpm --dir app/sentinel-api test` if API telemetry tests are touched.
- [x] Run `pnpm lint`.
- [x] Run `pnpm format:check`.

### Manual QA

- [x] Start `sentinel-api` and `sentinel-web` with valid local env files.
- [x] Open a monitored student attempt with right-click disabled.
- [x] Right-click inside the attempt and verify:
    - browser context menu does not open
    - warning appears
    - incident reaches instructor monitoring
- [x] Trigger `PrintScreen` on Windows and verify warning plus incident when the browser receives the event.
- [x] Trigger `Windows+Shift+S` on Windows and verify best-effort warning plus incident when the browser receives the event.
- [x] Trigger `Cmd+Shift+3` on macOS and verify best-effort warning plus incident when the browser receives the event.
- [x] Disable each web-security flag and verify the corresponding warning/incident is suppressed.
- [x] Export a draft exam card as PDF.
- [x] Export a published exam card as PDF.
- [x] Verify the exported PDF has exam header, student name, student ID, date, sections, question-type groupings, and ordered questions.
- [x] Verify long question text, options, and matching/ordering prompts do not overlap in the PDF.

## Delivery Order

- [x] Complete Phase 1 before touching export work so attempt security behavior is stabilized first.
- [x] Complete Phase 2 before declaring the browser-security bugs fixed.
- [x] Complete Phase 3 after telemetry behavior is verified.
- [x] Complete Phase 4 before adding any new schema or dependency.
- [x] Complete Phase 5 before handoff.
