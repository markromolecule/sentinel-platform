---
title: "Fix Mobile Exam Question Rendering, Turned-In Tab Filtering, MediaPipe Telemetry, Live Inspection & Feedback Styling"
type: task
status: completed
created: "2026-09-13"
tags: [task, defect-resolution, sentinel-mobile, telemetry, mediapipe]
---

# Fix Mobile Exam Question Rendering, Turned-In Tab Filtering, MediaPipe Telemetry, Live Inspection & Feedback Styling

## Outcome

Eliminates question rendering blocks and redundant camera permission modals on the mobile exam attempt page, moves turned-in exams out of the Available tab into Turned In, ensures MediaPipe anomaly incidents persist to the instructor's live monitoring timeline with full duration/confidence metadata, fixes the 409 lease version mismatch during live inspection publisher reconciliation, and updates feedback page action buttons to Sentinel brand blue.

## Pre-planning record

### Context Specification

- Canonical context: `docs/context/September/13/mobile-exam-session-telemetry-turned-in-fixes.md`

### Actors and goals

- **Student (Mobile):** Opens exam session without crashing or re-prompting for camera permissions; sees questions immediately; sees timely warning banner if face is not detected or gaze drifts; sees completed exams in "Turned In" tab.
- **Instructor (Web):** Views real-time flagged incidents (Gaze Off Screen, No Face Detected) on the exam monitoring timeline; views live mobile video feed during inspection without 409 lease conflict errors.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- |
| SC-01 | Student enters exam session from lobby | Exam started with proctoring enabled | No Android camera modal re-prompts; questions render immediately in QuestionCard | Bridge errors logged to catch without flooding JS thread | Verified |
| SC-02 | Student turns in exam | Exam submission completes | Exam is removed from Available tab and displayed under Turned In tab | Status normalization fallback based on completedAt | Verified |
| SC-03 | Student looks away from screen or covers camera | Active session with MediaPipe enabled | Warning banner appears on mobile; event emitted with `durationMs >= 4000`; backend persists incident to flagged_incidents | If network drops, retry or sync on reconnect | Verified |
| SC-04 | Instructor starts live inspection of student | Student is in active exam session | Mobile live inspection publisher acknowledges with active lease revision; video connects without 409 error | If lease expires, stopPublication cleanly | Verified |
| SC-05 | Student submits feedback | Completed exam feedback screen | Buttons use `colors.primary` (#323d8f) with white text | Graceful navigation back to exam list | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
| --- | --- | --- | --- | --- | --- |
| D-01 | How to prevent repeated camera permissions on Android WebView? | Add `mediaCapturePermissionGrantType="grant"` | React Native WebView Android standard prop to grant camera access when native app already holds permissions | Relying on custom `onPermissionRequest` event which fails on Android | `mobile-mediapipe-bridge.tsx` |
| D-02 | How to keep MediaPipe running when preview is hidden? | Keep `<video>` in DOM with `object-fit: cover` and call `video.play()`, style RN container `opacity: 0.01; width: 1; height: 1; pointerEvents: 'none'` | `display: none` sets video dimensions to 0, causing `@mediapipe/tasks-vision` to throw WASM exceptions continuously | Offscreen canvas only without video stream | `mobile-mediapipe-bridge.tsx` |
| D-03 | How to satisfy backend AI rules for anomaly persistence? | Pass `metadata: { durationMs: 4000, confidenceScore }` | Backend `aiRules.gaze_tracking` and `face_detection` require `durationMs >= 4000` to persist without waiting for repeat counts | Changing backend rule thresholds (violates backend authority) | `mobile-telemetry-client.ts` |
| D-04 | How to resolve live inspection lease version mismatch? | Track `connection.revision` returned by `createLiveInspectionPublisherConnection` and pass to `acknowledgeLiveInspectionPublisherReady` | Backend increments version from REQUESTED to PUBLISHER_CONNECTING; sending old revision results in 409 Conflict | Refetching directive before acknowledgment | `use-mobile-live-inspection.ts` |
| D-05 | How to filter turned-in exams on mobile? | Pass `{ viewer: 'student' }` to `useExamsQuery` AND normalize in `adaptExamForMobile` | Matches web's `normalizeStudentExam` pattern and forces backend `resolveStudentExamStatus` | Filtering client-side only without query parameters | `app/(tabs)/exam/index.tsx`, `mobile-exam-display-adapter.ts` |

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| AC-01 | SC-01, D-01, D-02 | Questions render immediately on `/exam/[id]/session/[sessionId]` without permission popups | Add `mediaCapturePermissionGrantType="grant"` and fix video styling in bridge | Mobile unit tests & session screen inspection | Verified |
| AC-02 | SC-02, D-05 | Turned-in exams appear under [Turned In] tab and not [Available] | `useExamsQuery({ viewer: 'student' })` + status normalization in adapter | Adapter unit tests | Verified |
| AC-03 | SC-03, D-03 | MediaPipe anomalies persist to backend `flagged_incidents` and display warning banner | `useMobileMediaPipeMonitoring` calculates duration; payload includes metadata | Telemetry client unit tests & backend policy tests | Verified |
| AC-04 | SC-04, D-04 | Live inspection stream connects without 409 lease conflict | Pass `connection.revision` to `acknowledgeLiveInspectionPublisherReady` | Live inspection bridge tests | Verified |
| AC-05 | SC-05 | Feedback and thank-you buttons use brand primary blue | Update style to `colors.primary` with white text | Visual style checks | Verified |

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1 — Discovery, Scenarios, and Boundary Analysis
- [x] `phase-02-architecture-and-contracts.md` — Phase 2 — Architecture, Contracts, and Data Modeling
- [x] `phase-03-implementation-and-tests.md` — Phase 3 — Incremental Implementation and Tests
- [x] `phase-04-verification-and-release.md` — Phase 4 — Verification, Quality Gates, and Release
