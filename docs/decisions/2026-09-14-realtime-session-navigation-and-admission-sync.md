---
title: "ADR: Real-Time Session Navigation and Dual-Identity Lobby Admission Sync"
type: decision
status: proposed
created: "2026-09-14"
tags: [adr, realtime, lobby, navigation, submission, mobile, web, performance]
---

# ADR: Real-Time Session Navigation and Dual-Identity Lobby Admission Sync

## Context

During examination workflows across Sentinel Mobile and Sentinel Web, two critical client transition delays compromise user experience and runtime responsiveness:

1. **Lobby Admission Reflection Lag:**
   When an instructor approves student entry from the exam lobby dashboard, the student interface experiences an 8–10 second delay before the "Waiting for Approval" button transforms into "Continue".
   *Root Cause:* The backend dispatch (`updateAdmissions.ts`) broadcasts Supabase Realtime messages with `studentIds` containing database primary keys from the `students` table (`students.student_id`). Client hooks (`useExamLobbySync` and `useLobbyState`) subscribe with the authenticated user ID (`authSession?.user?.id`). Because `student_id !== user_id`, client filter predicates drop the WebSocket broadcast. The student relies entirely on an over-calibrated 10-second polling fallback in `useExamLobbyAdmissionStatusQuery`.

2. **Exam Submission to Feedback Page Navigation Stall:**
   When a student submits their exam session on mobile, the instructor monitoring console immediately logs the submission (as the API completion and database persistence take < 300ms). However, the student remains stranded on the active question screen for several seconds without any indication of progress before navigating to `/exam/[id]/feedback`.
   *Root Cause:* `useExamSessionSubmission.ts` executes `await queryClient?.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })` before calling `router.replace`. This forces the runtime to synchronously refetch all active mounted queries (including `useExamQuery`) across the network before allowing router navigation. Additionally, `ExamSessionScreen` fails to bind `isSubmitting` to any loading indicator or overlay.

### Constraints and Success Criteria

- Eliminate the lobby admission lag: reflect instructor approval on student devices in < 150ms under healthy WebSocket connections.
- Ensure 100% reliability even if WebSockets drop: reduce polling fallback from 10s to 3s while waiting, immediately disabling upon approval.
- Transition from exam session to feedback in < 500ms after server submission completes.
- Provide immediate visual confirmation (submitting modal/overlay) the instant the student confirms submission.
- Zero database migrations; maintain backwards compatibility with existing clients and telemetry contracts.

---

## Options Considered

### Option 1: Dual-Identity Broadcast Payload, Background Cache Invalidation, and Optimistic UI (Recommended)

1. **Dual-Identity Real-Time Contract:** Update `sentinel-api`'s `updateAdmissions` and student override services to broadcast both `studentIds` (`students.student_id`) and `userIds` (`students.user_id`) in the `admission:updated` payload. Update `useLobbyRealtime` to match incoming events against both identifiers and current auth state.
2. **Non-Blocking Query Invalidation:** Decouple navigation from cache refetching in `useExamSessionSubmission.ts`. Fire `queryClient.invalidateQueries` asynchronously (`void`) and call `router.replace` immediately upon local storage persistence.
3. **Adaptive Polling Tuning:** Calibrate `useExamLobbyAdmissionStatusQuery` fallback interval to 3,000ms (ceasing upon `APPROVED`).
4. **Mobile Turn-In Feedback State:** Render an explicit submitting overlay in `ExamSessionScreen` while `isSubmitting` is true.

- **Advantages:**
  - Solves the root cause with zero breaking changes or schema alterations.
  - Sub-150ms lobby button unlocks via direct WebSocket broadcast.
  - Sub-500ms session-to-feedback navigation with clear turn-in feedback.
  - Fail-safe fallback within 3 seconds if real-time packets drop.
- **Costs and Failure Modes:**
  - `updateAdmissions` performs a fast lookup of `students.user_id` prior to broadcast (which is already done for notification delivery).
- **Choose when:** High responsiveness, clean architecture, and minimal operational overhead are paramount.

### Option 2: Full Client-Side Polling Acceleration Without Real-Time Broadcast Enhancement

Rely solely on HTTP polling without fixing the real-time payload identifier mismatch by dropping the poll interval to 1,000ms.

- **Advantages:**
  - No changes to broadcast payload structure or API services.
- **Costs and Failure Modes:**
  - Strains the database and API gateway with 60 requests/minute per waiting student during concurrent exam rushes (e.g. 500 students = 30,000 req/min).
  - Still produces a noticeable 1-second lag compared to instant WebSocket delivery.
- **Choose when:** Real-time WebSockets are completely unavailable or deprecated.

### Option 3: Automatic Server-Side Push Routing via Persistent WebSockets

Maintain long-lived bi-directional WebSocket connections on the server to push forced page-redirection commands to clients.

- **Advantages:**
  - Server maintains absolute control over student navigation state.
- **Costs and Failure Modes:**
  - Requires persistent stateful servers (incompatible with serverless/stateless container architecture).
  - High complexity, brittle connection lifecycles, and significant memory footprint.
- **Choose when:** Building an air-gapped or dedicated kiosk system with centralized push orchestration.

---

## Decision

Adopt **Option 1**.

1. **Dual-Identity Broadcast Dispatch:** Update `updateAdmissions` in `sentinel-api` to broadcast `{ examId, studentIds, userIds, status, decidedAt }`. Update `useLobbyRealtime` in `packages/hooks` to match against both arrays.
2. **Calibrated Polling Fallback:** Set `refetchInterval` in `useExamLobbyAdmissionStatusQuery` to 3,000ms while waiting, automatically terminating on `APPROVED`.
3. **Asynchronous Cache Invalidation:** Convert `await queryClient.invalidateQueries` to non-blocking `void queryClient.invalidateQueries` in `useExamSessionSubmission.ts`, allowing instant navigation to the feedback screen.
4. **Submitting Turn-In Feedback:** Mount a dedicated turn-in loading overlay in `ExamSessionScreen` during active submission.

---

## Consequences

- **Dependency Direction and Contract:** The real-time payload contract gains `userIds?: string[]`. Existing clients that ignore this property remain fully functional. No dependency inversion or breaking changes.
- **Data and Migration:** No database migrations or schema adjustments required.
- **Security and Privacy:** Broadcast events contain only identifiers and status metadata scoped to the specific exam channel (`lobby:${examId}`).
- **Performance and Operations:**
  - Immediate < 150ms lobby button response upon admission.
  - Eliminates the 2–4 second artificial delay during exam submission.
  - Reduces background HTTP polling load compared to aggressive 1s polling.
- **Rollback:** Reverting this change simply restores the former single-array broadcast payload and 10s polling interval without data corruption risks.

---

## Validation and Review Date

- **Automated Tests:**
  - Verify unit tests in `use-exam-session.test.ts` pass with non-blocking query invalidation.
  - Verify unit tests in `use-lobby-realtime.test.ts` and `update-admissions.test.ts` for dual-identity matching.
- **Manual Verification:**
  - In Mobile Lobby: Approve student from Web Instructor Lobby; observe student's "Waiting for Approval" button turn to "Continue" in < 150ms.
  - In Mobile Session: Submit exam; verify immediate appearance of the submitting indicator followed by immediate navigation to `/exam/[id]/feedback`.
- **Review Date:** Review on 2026-10-14 or after the first live cohort exam deployment.
