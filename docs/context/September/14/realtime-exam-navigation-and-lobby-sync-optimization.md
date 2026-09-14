---
title: "Real-Time Exam Session Navigation and Lobby Admission Sync Optimization"
type: context
status: draft
created: "2026-09-14"
tags: [context, optimization, realtime, lobby, submission, navigation, mobile, web]
feature: "realtime-session-navigation-and-lobby-sync"
---

# Real-Time Exam Session Navigation and Lobby Admission Sync Optimization Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  1. **Lobby "Continue" Button Delay Upon Instructor Admission:** When an instructor approves a student in the exam lobby (via `sentinel-web` or `sentinel-core`), the student's lobby screen (both Mobile and Web) does not update in real-time. Instead, there is a noticeable lag (up to 10 seconds) before the "Waiting for Approval" button unlocks and transitions to "Continue".
  2. **Session Submission Page-to-Feedback Navigation Lag:** When a student clicks "Submit" on the mobile exam session screen, instructor monitoring immediately logs that the attempt has been submitted (server-side completion succeeds and database updates register instantly), but the student remains stranded on the active question screen for several seconds without visual feedback before finally navigating to the feedback page (`/exam/[id]/feedback`).
  3. **Underlying Latency Bottlenecks:**
     - **Identity Dissociation in Broadcast Dispatch:** `sentinel-api`'s `updateAdmissions` broadcasts `{ studentIds }` containing database primary keys (`students.student_id`), while the frontend (`useExamLobbySync` and `useLobbyState`) subscribes using the Supabase Auth identifier (`session.user.id`). Because `student_id !== user_id`, `useLobbyRealtime` evaluates `isTargetStudent` as `false`, silently dropping the real-time broadcast message. The student is forced to wait for HTTP polling fallback.
     - **Excessive Polling Fallback Interval:** The adaptive polling fallback in `useExamLobbyAdmissionStatusQuery` was increased to 10,000ms (10 seconds), causing students to wait up to 10 seconds when real-time messages fail to match.
     - **Awaited Global Query Invalidation on Submission:** In `use-exam-session-submission.ts`, `await queryClient?.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })` synchronously blocks the navigation transition until all active queries in the mounted tree refetch over the network.
     - **Missing Submission Interaction Feedback:** `ExamSessionScreen` does not consume `isSubmitting` from `useExamSession()`. When the confirmation dialog closes, the student sees no visual turn-in feedback or loading overlay.

- **Business / User Value:**
  - **Zero-Latency Lobby Entry:** Students experience instant (< 100ms) button unlock to "Continue" the exact moment the instructor admits them.
  - **Instant Submission Transition:** Eliminates anxiety and double-submission confusion by providing an immediate turn-in spinner and routing directly to the post-exam feedback screen without waiting on background cache invalidations.
  - **System Parity & Consistency:** Aligns Sentinel Mobile and Sentinel Web with a resilient dual-identifier real-time broadcast contract.

- **Success Criteria:**
  - Instructor admission propagates to student lobby and unlocks the "Continue" button in < 150ms under active WebSocket connection.
  - If a WebSocket packet is dropped, adaptive fallback polling detects admission within 3 seconds (reduced from 10 seconds).
  - Submitting an exam immediately presents a submission overlay on mobile, executes turn-in, and navigates to the feedback screen within < 500ms of API completion.
  - `queryClient.invalidateQueries` executes asynchronously in the background without blocking navigation.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student waiting in the mobile exam lobby,* I want the "Waiting for Approval" button to instantly change to "Continue" when the instructor approves me, so I can enter my exam without delay or confusion.
- *As a student finishing an exam,* I want clicking "Submit" to immediately show me a clear submitting state and quickly navigate me to the feedback screen once processed, so I know my answers were safely recorded.
- *As an instructor,* I want student lobby admissions and exam turn-in events to reflect in monitoring synchronously with the student's actual device state.

### Functional Requirements

- [ ] **FR-01 (Dual Identifier Real-Time Broadcast):**
  - In `sentinel-api` (`updateAdmissions.ts`), resolve and attach both `studentIds` (`students.student_id`) and `userIds` (`students.user_id`) to the `admission:updated` broadcast payload.
  - In `sentinel-api` (`authorizeStudentReentry.service.ts`), include `userId` alongside `studentId` in the broadcast payload.
- [ ] **FR-02 (Robust Real-Time Client Matching):**
  - In `packages/hooks` (`useLobbyRealtime.ts`), update `isTargetStudent` logic to match against `studentIds`, `userIds`, `payload.studentId`, `payload.userId`, or `session.user.id`.
- [ ] **FR-03 (Calibrated Adaptive Fallback Polling):**
  - In `packages/hooks` (`use-exam-lobby-admission-status-query.ts`), reduce the waiting fallback polling interval from 10,000ms to 3,000ms. Keep polling disabled (`false`) once `status === 'APPROVED'`.
- [ ] **FR-04 (Non-Blocking Submission Navigation):**
  - In `sentinel-mobile` (`use-exam-session-submission.ts`), unblock navigation by changing `await queryClient?.invalidateQueries(...)` to a fire-and-forget background invalidation (`void queryClient?.invalidateQueries(...)`).
  - Navigate immediately to `/exam/${id}/feedback?attemptId=${sessionId}` after writing local preview storage and clearing the session token.
- [ ] **FR-05 (Mobile Submission Feedback Overlay):**
  - In `sentinel-mobile` (`ExamSessionScreen`), consume `isSubmitting` and render a high-visibility loading overlay with an activity indicator and clear copy ("Submitting exam session... Recording your responses and preparing feedback...").
  - Disable footer navigation buttons while submission is in progress.

### Edge Cases & Failure Modes

- **Edge Case 1: WebSocket Disconnection During Admission.**
  - *Mitigation:* The 3-second adaptive polling fallback catches the database admission state within 3,000ms and disables itself once approved.
- **Edge Case 2: Network Timeout During `completeExamSession` API Call.**
  - *Mitigation:* `use-exam-session-submission.ts` captures errors, resets `isSubmitting`, and displays an actionable alert. Idempotent 409 responses ("already submitted") immediately proceed to feedback.
- **Edge Case 3: Student Clicks Submit Multiple Times.**
  - *Mitigation:* `isSubmittingRef.current` and UI overlay prevent duplicate submissions.

---

## 3. Technical & Architectural Context

### Affected Domains / Layers

- **Backend API (`app/sentinel-api`):**
  - [`src/modules/examination/lobby/services/update-admissions.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/update-admissions.ts)
  - [`src/modules/examination/lobby/services/broadcast-lobby-event.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/broadcast-lobby-event.ts)
  - [`src/modules/examination/student-overrides/services/authorize-student-reentry.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/student-overrides/services/authorize-student-reentry.service.ts)
- **Shared Client Hooks (`packages/hooks`):**
  - [`src/use-lobby-realtime.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/use-lobby-realtime.ts)
  - [`src/query/exams/use-exam-lobby-admission-status-query.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/use-exam-lobby-admission-status-query.ts)
- **Sentinel Mobile (`app/sentinel-mobile`):**
  - [`features/exam/hooks/session/use-exam-session-submission.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/session/use-exam-session-submission.ts)
  - [`features/exam/components/session/exam-session-screen.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx)
  - [`features/exam/hooks/lobby/use-exam-lobby-sync.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/lobby/use-exam-lobby-sync.ts)
- **Sentinel Web (`app/sentinel-web`):**
  - [`src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.ts)

### Data Model & Schema Changes

- **Zero Schema Migrations Required:** The database schema remains completely untouched. Changes utilize existing foreign keys and columns (`students.user_id`, `students.student_id`).

### Security & Authorization

- Real-time broadcasts do not contain sensitive test data or scores; they convey only status flags (`APPROVED`/`WAITING`), timestamps, and UUIDs scoped to `lobby:${examId}`.
- Telemetry enforcers and screen capture restrictions remain intact until the student transitions to the post-exam feedback screen.

---

## 4. UI/UX & Interaction Guidelines

- **Lobby Action Transition:**
  - Transition from "Waiting for Approval" to "Continue" should occur with instant visual reactivity.
  - The "Continue" button displays vibrant green/primary styling and unlocks immediately.
- **Session Turn-In Overlay:**
  - When submission begins, render a semi-transparent dark overlay (`rgba(0, 0, 0, 0.7)`) covering the full viewport with `zIndex: 9999`.
  - Display a smooth `ActivityIndicator`, with typography styled via `@/constants/theme`.
  - Prevent accidental back navigation or multiple button taps during the turn-in transition.

---

## 5. Scope & Boundaries

- **In Scope:**
  - Dual-identity broadcast payload (`studentIds` + `userIds`) from API to client.
  - Real-time matching fix in `useLobbyRealtime`.
  - Calibrating polling fallback from 10s to 3s in `useExamLobbyAdmissionStatusQuery`.
  - Eliminating blocking query invalidation during exam submission in `useExamSessionSubmission`.
  - Adding submission loading overlay in `ExamSessionScreen`.
- **Out of Scope / Non-Goals:**
  - Modifying scoring logic, essay evaluation, or assessment snapshot calculation.
  - Replacing Supabase Realtime transport with custom WebSockets or WebRTC data channels.
  - Modifying instructor monitoring grading or manual review workflows.

---

## 6. References & External Context

- Prior Context: [`docs/context/August/25/fix-student-lobby-realtime-admission-and-sync-latency.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/August/25/fix-student-lobby-realtime-admission-and-sync-latency.md)
- Prior Task: [`docs/tasks/2026/08/2026-08-25/fix-student-lobby-realtime-admission-and-sync-latency/README.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/08/2026-08-25/fix-student-lobby-realtime-admission-and-sync-latency/README.md)
- Related ADR: `docs/decisions/2026-09-14-realtime-session-navigation-and-admission-sync.md`
