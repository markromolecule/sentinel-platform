# Examination Attempt — Production Implementation Roadmap

> **Source:** `docs/examination-attempt-issue.md` + `.agents/plan/implementation-plan.md`
> **Architect:** Senior Systems Architect — Sentinel Platform
> **Standard:** `to-do-workflow.md` · `1-3-1-rule.md` · Sentinel Monorepo Rules

---

## Overview

Eight defects/feature requests were identified across the examination flow. They have been triaged, root-caused against the live codebase, and grouped into **five implementation milestones** ordered by dependency risk. Schema migrations are **minimal** — the existing `exam_lobby_admissions`, `exam_attempts.reconnect_attempt_count`, and `exam_configurations.lobby_admission_mode` tables already support the required data model.

---

## Architectural Decisions (1-3-1 Applied)

### Issue 2 — Auto-redirect bypass (Student bypasses Instructor gate)

**Three viable options:**

| Option | Summary                                                                                                                                                             | Risk                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| A      | Enforce gate at session `startSession` API — already partially in `AccessGatekeeperService`, verify lobby admission check is applied when mode = `INSTRUCTOR_GATED` | Low — surgical fix to existing service                    |
| B      | Add a middleware guard at the Next.js route level via `useLobbyState` before `handleEnterExam` fires                                                                | Medium — UI-only guard, bypassable if API is not hardened |
| C      | Dual enforcement: harden the API gatekeeper (Option A) **and** add a UI-level `canEnterExam` guard                                                                  | Low risk, defense-in-depth                                |

**✅ Best option: C.** Defense-in-depth is correct for an academic integrity system. The API is the true enforcement point; the UI guard prevents incorrect UX flow and premature navigation.

---

### Issue 7 — New Instructor Lobby Page

**Three viable options:**

| Option | Summary                                                                                                                                 | Risk                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| A      | Move the existing lobby admission section from `/monitoring` into a new `/lobby` route as a distinct page                               | Low — component already exists, move and refactor |
| B      | Build a brand-new standalone lobby page with real-time WebSocket-style polling                                                          | Medium — more robust but new infrastructure       |
| C      | Create a `/lobby` sub-route that wraps the admission panel in a dedicated layout, with navigation tabs linking `/lobby` ↔ `/monitoring` | Low — reuses existing components, clean UX        |

**✅ Best option: C.** Tabs between `/lobby` and `/monitoring` fit the existing route pattern (`/exams/[id]/builder`, `/exams/[id]/monitoring`). Minimizes new code while delivering the UX clearly.

---

### Issue 3 — MediaPipe not registering on attempt page

**Three viable options:**

| Option | Summary                                                                                                                           | Risk                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| A      | Trace the `useAttemptMediaPipeMonitoring` initialization path; verify that `examSessionId` is populated before the hook activates | Low — pure diagnostic + guard fix |
| B      | Refactor `useAttemptMonitoring` to lazily initialize MediaPipe only after session is confirmed                                    | Medium — changes hook signature   |
| C      | Add an explicit `enabled` guard in `useAttemptMediaPipeMonitoring` tied to `examSessionId && !isRedirectingToTurnIn`              | Low — minimal, testable           |

**✅ Best option: C.** Aligns with the `enabled: Boolean(requiredValue)` pattern mandated by `query-hooks.md`.

---

## Milestone Dependencies

```
M1 (Access Gate Bug) ──► M2 (MediaPipe Fix)
                     └──► M3 (Builder Persistence)
                     └──► M4 (Reconnect Counter)
M4 ──► M5 (Instructor Lobby Page + Toggle)
```

---

## Phase 1 — Critical Bug Fixes: Access Control & Session Integrity

> **Goal:** Prevent unauthorized exam entry and stop students being kicked back to lobby mid-attempt.
> **Affected areas:** `AccessGatekeeperService`, `useLobbyState`, `useLobbyActions`, `SessionManagerService`

### 1.1 — Lobby Gating: API Enforcement (Issue 2)

- [x] Open `app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts` and audit the `verifyStudentExamEligibility` method
- [x] Verify that when `exam.lobby_admission_mode === 'INSTRUCTOR_GATED'` and no active attempt exists, the method calls `buildLobbyRuntimeAccess` and sets `canStart: false` unless admission status is `APPROVED`
- [x] Add a targeted unit test in `app/sentinel-api/src/modules/examination/access/access.test.ts` covering the scenario: `INSTRUCTOR_GATED` mode + student admission status `WAITING` → `isEligible: false` + `reasonCode: LOBBY_WAITING`
- [x] Add a targeted unit test: `INSTRUCTOR_GATED` mode + admission status `APPROVED` → `isEligible: true` + `canStart: true`
- [x] Add a targeted unit test: `INSTRUCTOR_GATED` mode + **no admission record** → student is auto-checked-in with `WAITING` status (verify `checkInLobby` logic in `lobby/services/check-in-lobby.ts`)

### 1.2 — Lobby Gating: UI Guard (Issue 2)

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-actions.ts`
- [x] Confirm `handleEnterExam` checks `canEnterExam` before calling the session start API and short-circuits with a toast if `canEnterExam` is `false`
- [x] Open `use-lobby-state.ts` — confirm `requiresInstructorAdmission` logic correctly maps to `canEnterExam = false` when admission is `WAITING` or `REJECTED`
- [x] Verify `LobbyFooterActions` component disables the "Enter Exam" button when `canEnterExam === false || isAdmissionPendingRefresh === true`

### 1.3 — Student Redirected to Lobby During Attempt (Issue 5)

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
- [x] Trace `isSessionStartBlocked` — confirm it does **not** re-evaluate during an already-active session (session already started → should not block continuation)
- [x] Open `SessionRepository.createSession` in `app/sentinel-api/src/modules/examination/flow/data/` — confirm the `reconnect_attempt_count` increment logic does not accidentally mark the session as not resumable
- [x] Open `AccessGatekeeperService.verifyStudentExamEligibility` — confirm that when `latestAttempt.status === 'IN_PROGRESS'`, `canResume: true` is returned correctly and `buildLobbyRuntimeAccess` is **not** applied (line 303 guard: `latestAttempt?.status !== 'IN_PROGRESS'`)
- [x] Add a unit test: active attempt (`IN_PROGRESS`) + `INSTRUCTOR_GATED` mode → `canResume: true`, lobby gating bypassed
- [ ] Manual QA: Start an exam session, navigate to a question, answer it, then observe whether a lobby redirect occurs within 30 seconds

### 1.4 — Monitoring Page Not Fetching Lobby Students (Issue 1)

- [x] Open `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx`
- [x] Verify `refreshLobbyAdmissions` is being called correctly on mount (line 71) and on the 5-second interval (line 73–80)
- [x] Inspect the `getExamLobbyWaitingList` service in `packages/services` — confirm the API call path hits `GET /lobby/:examId/waiting-list`
- [x] Verify the API route handler in `lobby.routes.ts` is correctly wired (`getWaitingListRoute` → `getWaitingListRouteHandler`)
- [x] Open `app/sentinel-api/src/modules/examination/lobby/services/get-waiting-list.ts` — confirm the query joins `exam_lobby_admissions` with `students` and `user_profiles` and returns student names/numbers
- [ ] Manual QA: Open two browser tabs — one as Student (navigate to lobby), one as Instructor (navigate to monitoring). Confirm the student appears in "Waiting in lobby" within 10 seconds.

---

## Phase 2 — MediaPipe Monitoring Integration Fix (Issue 3)

> **Goal:** Ensure gaze tracking, face detection, and multiple-face detection are fully operational on the attempt page.
> **Affected areas:** `useAttemptMediaPipeMonitoring`, `useAttemptMonitoring`, attempt page components

### 2.1 — Diagnose MediaPipe Initialization

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts`
- [x] Confirm the hook has a guard: `enabled: Boolean(examSessionId && configuration && mediaPipeSandbox)`; if not, add it
- [x] Confirm `mediaPipeSandbox` is not `undefined` at the point `useAttemptMonitoring` is called in `index.ts` — trace `resolveStudentExamMediaPipeSandbox` to verify it returns a valid object even when MediaPipe settings are present
- [x] Open `useAttemptMonitoring` — confirm `mediaPipeSandbox` received as `TelemetryMediaPipeSandboxSettings` matches the resolved type from `effectiveMediaPipeSandbox`

### 2.2 — MediaPipe Activation Guard

- [x] Add `enabled` guard in `useAttemptMediaPipeMonitoring` tied to: `enabled: Boolean(examSessionId) && !isRedirectingToTurnIn`
- [x] Verify that the video feed (`mediaPipeVideoRef`) is attached to a `<video>` DOM element in the attempt page components (check `_components` folder in the attempt route)
- [x] Confirm the `<video>` element is **not** conditionally hidden with `display: none` — MediaPipe requires a visible/mounted video element

### 2.3 — MediaPipe Events Verification

- [x] Open the attempt page component that renders the MediaPipe overlay
- [x] Confirm `mediaPipeIncident` state is wired to the incident banner/dialog component
- [x] Confirm `dismissMediaPipeIncident` is properly bound to the dismiss button
- [x] Add a smoke test in `page.test.tsx` that mocks `useStudentExamAttempt` and asserts the MediaPipe video element is rendered when `isMediaPipeEnabled === true`

### 2.4 — Manual QA: MediaPipe

- [ ] Start an exam attempt as a student in a published exam with MediaPipe enabled in the exam configuration
- [ ] Cover the camera — confirm a "Face Not Visible" incident is triggered within 5 seconds
- [ ] Show two faces to camera — confirm "Multiple Faces" incident is triggered
- [ ] Look away from screen — confirm gaze tracking incident is triggered
- [ ] Confirm incidents are persisted in `flagged_incidents` table via Prisma Studio

---

## Phase 3 — Builder Page: Imported Questions Persistence Bug (Issue 4)

> **Goal:** Imported questions must not be wiped when navigating to the Configuration page and back.
> **Affected areas:** Builder page components, question import state management, Zustand store or URL state

### 3.1 — Root Cause Diagnosis

- [x] Open `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_components/` and identify the component responsible for rendering imported questions
- [x] Identify whether question state is stored in Zustand, React state, or fetched from the API — if it is local React state, navigation away destroys it
- [x] Open `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/hooks/` — identify where imported questions are held

### 3.2 — Persistence Fix

- [x] **If local React state:** Move to a **Zustand store** keyed by `examId` so state survives route changes within the same exam flow (N/A — builder already uses `useExamStore`; fixed same-exam hydration instead)
    - [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/_stores/use-builder-store.ts` following the `zustand-store.md` template (N/A — existing store is `app/sentinel-web/src/features/exams/builder/_stores/use-exam-store.ts`)
    - [x] State shape: `{ importedQuestions: Question[], examId: string }` (N/A — existing state uses `examId`, `questionSections`, and `questions`)
    - [x] Actions: `setImportedQuestions`, `clearImportedQuestions` (N/A — existing actions use `addQuestion`, `setQuestions`, and hydration guards)
- [x] **If API-persisted:** Ensure the builder always re-fetches on mount using `useQuery` — verify the query key includes `examId`
- [x] Wire the fix into `ExamBuilderScreen` — on return from `/config`, questions must be present
- [ ] Manual QA: Import 5 questions via AI in the builder → navigate to `/config` → navigate back → confirm all 5 questions are still present

---

## Phase 4 — Reconnect Counter: Tracking & Instructor Visibility (Issue 6)

> **Goal:** Count how many times a student returns to the lobby; expose the count to instructors; allow override when count ≥ 3.
> **Data Layer:** `exam_attempts.reconnect_attempt_count` already exists. Need API endpoint + UI.

### 4.1 — Schema Verification (No Migration Required)

- [x] Confirm `exam_attempts.reconnect_attempt_count Int? @default(0)` exists in `packages/db/prisma/schema.prisma` ✅
- [x] Confirm Kysely DB types include `reconnect_attempt_count` in the `exam_attempts` table definition

### 4.2 — API: Expose Reconnect Count in Monitoring Endpoints

- [x] Open `app/sentinel-api/src/modules/examination/monitoring/` — identify the service/query used to build the `students` array returned by the monitoring overview
- [x] Modify the monitoring query to include `reconnect_attempt_count` from `exam_attempts` for each student
- [x] Update the monitoring DTO/response shape to include `reconnectCount: number` per student entry
- [x] Update `monitoring.dto.ts` Zod schema to add `reconnectCount`

### 4.3 — API: Instructor Override Endpoint (Issue 6 — count ≥ 3)

- [x] Create `app/sentinel-api/src/modules/examination/student-overrides/controllers/override-reconnect-limit.controller.ts`
- [x] Route: `POST /student-overrides/:examId/reconnect-override/:studentId` — body: `{ reason?: string }`
- [x] Service logic: validate that `reconnect_attempt_count >= max_reconnect_attempts`, then upsert a `student_override` record granting a one-time resume entitlement
- [x] Register the new route in `student-overrides.routes.ts`
- [x] Write a unit test for the override service: exceed limit → override granted → student can resume

### 4.4 — Frontend: Reconnect Count in Monitoring/Lobby UI

- [x] Update the student card component in `app/sentinel-web/src/features/exams/` to display `reconnectCount` for each student
- [x] Add a visual badge: if `reconnectCount >= maxReconnectAttempts` (from exam config), show a warning indicator
- [x] Add an "Override" button that appears only when `reconnectCount >= maxReconnectAttempts`
- [x] Wire the override mutation hook: `app/sentinel-web/src/hooks/query/student-overrides/use-override-reconnect-mutation.ts` following `mutation-hooks.md`

### 4.5 — Reconnect Count Increment (Student Side)

- [x] Verify that `SessionRepository.createSession` correctly increments `reconnect_attempt_count` when `isResumed === true`
- [x] Add a unit test: second `startSession` call for same student + exam → `reconnect_attempt_count` is 1

---

## Phase 5 — Instructor Lobby Page + Builder Lobby Toggle (Issues 7 & 8)

> **Goal:** Split lobby admission management into its own `/lobby` page; add a toggle in Builder → Configuration for enabling/disabling instructor-gated lobby.

### 5.1 — New Instructor Lobby Route (Issue 7)

- [x] Create route directory: `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/lobby/`
- [x] Create `page.tsx` — this will host the new `InstructorLobbyPage` component
- [x] Move the "Lobby Admission" section (lines 284–401 of `monitoring/page.tsx`) into a new component: `_components/instructor-lobby-admission-panel.tsx`
- [x] Create `_hooks/use-instructor-lobby.ts` to encapsulate `refreshLobbyAdmissions`, `handleUpdateLobbyAdmissions`, and the 5-second polling logic
- [x] The new lobby page must display: student name, student number, check-in time, reconnect count, admit/reject buttons
- [x] Move the `Waiting` / `Approved` / `In Attempt` status indicators from `monitoring/page.tsx` to the new lobby page
- [x] Add a DB-backed lobby count endpoint and shared query hook so the student lobby count reflects durable lobby admissions
- [x] Remove these indicators from `monitoring/page.tsx` and replace with a "Go to Lobby" link/button

### 5.2 — Navigation: Monitoring Card → Lobby First (Issue 7)

- [x] Update the instructor exam card's "Monitoring" button to navigate to `/exams/[id]/lobby` instead of `/exams/[id]/monitoring`
- [x] Add tab navigation inside the lobby and monitoring pages: `Lobby | Monitoring`
- [x] Confirm back-and-forth navigation preserves polling state (restart polling on mount, clean up on unmount)

### 5.3 — Builder Configuration: Lobby Enable/Disable Toggle (Issue 8)

- [x] Search `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/` for any reference to `lobbyAdmissionMode` or `lobby_admission_mode`
- [x] If no UI toggle exists, add one in the appropriate configuration component as a `<Switch>` labeled **"Require instructor approval to enter exam (Instructor-Gated Lobby)"**
- [x] Wire the toggle: `checked` = `lobbyAdmissionMode === 'INSTRUCTOR_GATED'`, `onCheckedChange` = updates field and calls save mutation
- [x] Verify the save mutation hits the correct configuration update API endpoint and persists `lobby_admission_mode`
- [ ] Manual QA: Set mode to `INSTRUCTOR_GATED` → publish exam → student joins lobby → student remains in WAITING state until instructor admits

---

## Data Layer Summary

| Change                                              | Type       | Status                 |
| --------------------------------------------------- | ---------- | ---------------------- |
| `exam_lobby_admissions` table                       | Existing   | ✅ No migration needed |
| `exam_attempts.reconnect_attempt_count`             | Existing   | ✅ No migration needed |
| `exam_configurations.lobby_admission_mode`          | Existing   | ✅ No migration needed |
| Monitoring API response: add `reconnectCount`       | DTO change | 🔧 Code change only    |
| New `student-overrides` reconnect override endpoint | New route  | 🔧 Code change only    |

> **No Prisma migration is required.** All necessary columns and tables are already in the schema.

---

## Testing Strategy

### Automated Tests

| File                                                                           | Test Type   | Coverage Target                                                                                                                                |
| ------------------------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/sentinel-api/src/modules/examination/access/access.test.ts`               | Unit        | `INSTRUCTOR_GATED` + `WAITING` → `isEligible: false`; `APPROVED` → `canStart: true`; `IN_PROGRESS` attempt → `canResume: true`, lobby bypassed |
| `app/sentinel-api/src/modules/examination/lobby/` (new test file)              | Unit        | `checkInLobby`: `AUTOMATIC` → instant approve; `INSTRUCTOR_GATED` → `WAITING` record created                                                   |
| `app/sentinel-api/src/modules/examination/flow/flow.test.ts`                   | Integration | `startSession` with `INSTRUCTOR_GATED` + `WAITING` → access denied; `reconnect_attempt_count` increments on resume                             |
| `app/sentinel-api/src/modules/examination/student-overrides/` (new test)       | Unit        | Override granted when count ≥ limit; student can resume post-override                                                                          |
| `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.test.tsx` | Component   | MediaPipe video element rendered when `isMediaPipeEnabled: true`; not rendered when `false`                                                    |
| Builder store (new file)                                                       | Unit        | `setImportedQuestions` persists across mock navigation                                                                                         |

### Manual QA Scenarios

| ID    | Scenario                                                            | Pass Criteria                                                                 |
| ----- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| QA-01 | Student enters lobby for an `INSTRUCTOR_GATED` exam                 | Student sees "Waiting for instructor approval" message; Enter button disabled |
| QA-02 | Instructor admits student from lobby                                | Student's "Enter Exam" button becomes active within 5 seconds                 |
| QA-03 | Student in active attempt (`IN_PROGRESS`)                           | Student is NOT redirected to lobby; attempt continues uninterrupted           |
| QA-04 | Instructor opens monitoring page                                    | Students from the lobby appear in the waiting list within 10 seconds          |
| QA-05 | MediaPipe on attempt page                                           | Covering camera triggers "Face Not Visible" incident within 5 seconds         |
| QA-06 | Import questions in builder → navigate to Config → navigate back    | All imported questions still present in the builder                           |
| QA-07 | Student reconnects 3 times                                          | Instructor sees reconnect count badge ≥ 3 with Override button                |
| QA-08 | Instructor overrides reconnect limit                                | Student can resume attempt; override recorded                                 |
| QA-09 | Instructor navigates: exam card → lobby → monitoring → lobby        | Navigation is smooth; lobby admission panel always shows current state        |
| QA-10 | Builder Config: toggle lobby mode to INSTRUCTOR_GATED, save, reopen | Toggle state persists; student entering lobby is gated correctly              |

---

## Progress Tracking

Update task status as work progresses:

- `[ ]` Not started
- `[/]` In progress
- `[x]` Completed

> **Rule:** Do not begin Phase 2 until Phase 1 Issues 1 & 2 are verified by QA-01, QA-02, QA-03, and QA-04.
