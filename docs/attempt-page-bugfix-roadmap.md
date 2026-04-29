# Attempt Page — Bug Fix Implementation Roadmap

> **Source:** `docs/attempt-page-issue.md` + `.agents/plan/implementation-plan.md`  
> **Architect:** Senior Systems Architect — Sentinel Platform  
> **Standard:** `to-do-workflow.md` · `1-3-1-rule.md` · Sentinel Monorepo Rules  
> **DO NOT START CODING** until this plan is explicitly approved.

---

## Overview

Three production defects were identified from the student attempt page. They have been triaged and root-caused against the live codebase. No schema migration is required — all fixes are frontend and hook-layer changes only.

| #   | Issue                                                           | Root Cause                                                                                                                                                                                                                                                           | Phase |
| --- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | MediaPipe alert **not shown** to student on gaze/face violation | `mediaPipeIncident` → `incident` prop wiring is correct but `use-mediapipe-camera-runtime.ts` never calls `setActiveIncident` unless the signal threshold counter is met; the `enabled` guard on `isRedirectingToTurnIn` is also blocking the counter from advancing | P1    |
| 2   | Student **redirected to lobby** mid-attempt (loop)              | `use-exam-session.ts` reads a `sessionStorage` lobby-entry marker then **immediately clears it** on mount; any StrictMode double-invocation or fast remount clears the marker before the guard reads it on the second pass, triggering `router.replace(lobby)`       | P2    |
| 3   | **Inconsistent unanswered count** on turn-in                    | `unansweredCount` in `index.ts` uses `!answersHook.selectedAnswers[question.id]` (falsy check); an empty string `''` or a zero-index number `0` are falsy and would count as unanswered even after the student interacted; the correct gate is `hasAnswer()`         | P3    |

---

## Architectural Decisions (1-3-1 Applied)

### Bug 1 — MediaPipe incident not surfacing to student

**Three viable options:**

| Option | Summary                                                                                                                                                                                                                                | Risk                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| A      | Add a `console.log` diagnostic pass, verify `setActiveIncident` is actually called in `use-mediapipe-camera-runtime.ts` when threshold is hit                                                                                          | Low — read-only, diagnostic only                            |
| B      | Bypass the threshold counter and fire `setActiveIncident` immediately on any signal frame                                                                                                                                              | High — would spam the student with false positives          |
| C      | Audit `use-mediapipe-camera-runtime.ts` signal dispatch path: confirm the counter advances, the threshold is reached, and `setActiveIncident` is called; add a minimum viable integration test to assert the incident flows end-to-end | Low — targets the real root cause, adds regression coverage |

**✅ Best option: C.** Option A is diagnosis without a fix. Option B breaks the UX. Option C surgically fixes the signal dispatch path with test coverage.

---

### Bug 2 — Lobby redirect loop mid-attempt

**Three viable options:**

| Option | Summary                                                                                                                                                                                                                                | Risk                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| A      | Delay `clearStoredLobbyEntryMarker` by moving it **after** the marker has been used as a guard (i.e., don't clear it at mount, clear it after the session is confirmed established)                                                    | Low — one-line timing fix                                          |
| B      | Replace the `sessionStorage` marker approach with a URL query param `?from=lobby` that Next.js preserves across React re-renders                                                                                                       | Medium — changes the routing contract                              |
| C      | Check for an **active stored session** as the primary guard (already exists in `readStoredExamSession`) and use the lobby marker only as a supplemental signal; if a valid session exists in storage, skip the lobby redirect entirely | Low — defense-in-depth, aligns with the session-first architecture |

**✅ Best option: C.** The lobby marker approach is inherently fragile in React StrictMode because effects run twice. Using the pre-existing stored session as the primary guard is robust. The lobby marker becomes a secondary check only for fresh (non-resumed) attempts.

---

### Bug 3 — Inconsistent unanswered count on turn-in

**Three viable options:**

| Option | Summary                                                                                                                                                                   | Risk                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| A      | Replace `!answersHook.selectedAnswers[question.id]` with `!hasAnswer(answersHook.selectedAnswers[question.id])` in `index.ts`                                             | Low — single expression swap                       |
| B      | Move `unansweredQuestions` computation into `useAttemptAnswers` so the correct `hasAnswer` filter is co-located with the answer state                                     | Low — better separation of concerns                |
| C      | Expose `unansweredQuestionIds` from `useAttemptAnswers` directly (already has `answeredQuestionIds`) and derive `unansweredCount` from `questions.length - answeredCount` | Low — zero new logic, uses existing correct counts |

**✅ Best option: C.** `useAttemptAnswers` already exports `answeredCount` (computed via `hasAnswer`). Deriving `unansweredCount = questions.length - answeredCount` is guaranteed consistent without duplicating filter logic.

---

## Milestone Dependencies

```
P1 (MediaPipe Incident Fix)  ──► QA-01, QA-01b, QA-01c
P2 (Lobby Redirect Fix)      ──► QA-02, QA-03
P3 (Unanswered Count Fix)    ──► QA-04, QA-04b
                              └──► All three must pass before closing this roadmap
```

---

## Phase 1 — MediaPipe Incident Alert Not Shown to Student

> **Goal:** Ensure that when a student looks away, covers the camera, or a second face appears, the `MediaPipeIncidentDialog` is triggered and visible.  
> **Affected files:** `use-mediapipe-camera-runtime.ts`, `use-mediapipe-runtime-eligibility.ts`, `index.test.tsx`, `mediapipe-incident-dialog.tsx`

### 1.1 — Root Cause Audit

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring/_hooks/use-mediapipe-camera-runtime.ts`
- [x] Locate the signal counter logic — confirm there is a counter that increments per-frame when a violation is detected (gaze, no-face, multi-face)
- [x] Confirm that when `counter >= threshold`, `setActiveIncident` is called with the correct `MediaPipeAttemptIncident` shape
- [x] Confirm `setActiveIncident` is passed into this hook correctly from `useAttemptMediaPipeMonitoring` (`index.ts` line 65)
- [x] Confirm `activeIncident` is returned from `useAttemptMediaPipeMonitoring` and propagated through `useAttemptMonitoring → useStudentExamAttempt → AttemptView → MediaPipeIncidentDialog`
- [x] Inspect `use-mediapipe-runtime-eligibility.ts` — confirm `isEnabled` is `true` when `examSessionId` is set, `configuration.cameraRequired` is `true`, and `activationState.isValid` is `true`

### 1.2 — Fix: Signal Dispatch Guard

- [x] If `setActiveIncident` is never called because `eligibility.isEnabled === false` during the attempt: trace `resolveStoredStudentExamMediaPipeActivation` — confirm the checkup activation state is written to `localStorage` after the pre-exam checkup flow
- [x] If the activation state is missing/stale: add a fallback in `use-mediapipe-runtime-eligibility.ts` — when `configuration.cameraRequired === true` and `examSessionId` is set and an active attempt exists, treat `isEnabled` as `true` even if the stored activation is missing (emit a warning log, do not hard-block)
- [x] If `setActiveIncident` is called but the dialog never opens: add a `data-testid="mediapipe-incident-dialog"` to `<AlertDialog>` in `mediapipe-incident-dialog.tsx` and verify `open={Boolean(dialogContent)}` evaluates correctly when `incident` is non-null

### 1.3 — Fix: Camera Runtime Dispatch Verification

- [x] Open `use-mediapipe-camera-runtime.ts` — locate every call site where `setActiveIncident(...)` is invoked
- [x] Confirm the `MediaPipeAttemptIncident` object shape matches the type defined in `_types.ts` (fields: `type`, `label`, `description`, `detectedAt`)
- [x] Verify the incident is **not** immediately overwritten by a `setActiveIncident(null)` call in the same tick (e.g., from a cleanup effect or a conflicting condition)
- [x] Confirm the camera runtime loop does not silently swallow errors via try/catch that would prevent `setActiveIncident` from being reached

### 1.4 — Testing

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring/index.test.tsx`
- [x] Add a test: when `eligibility.isEnabled = true` and the camera runtime fires `setActiveIncident({ type: 'gaze_away', ... })`, `activeIncident` is non-null in the hook's return
- [x] Add a test: `dismissIncident()` resets `activeIncident` to `null`
- [x] Add a component-level smoke test in `page.test.tsx`: when `mediaPipeIncident` is non-null, the `MediaPipeIncidentDialog` has `open={true}`

---

## Phase 2 — Student Redirected to Lobby Mid-Attempt (Loop)

> **Goal:** A student who is actively in an exam attempt (`IN_PROGRESS`) must never be redirected back to the lobby.  
> **Root cause:** `use-exam-session.ts` effect (lines 53–90) runs in React StrictMode with double-invocation; the lobby marker is cleared before the second pass reads it, causing `!hasLobbyMarker` to be true, which triggers lobby redirect.  
> **Affected files:** `use-exam-session.ts`, `lobby-storage.ts`, `use-exam-session.test.tsx`

### 2.1 — Fix: Session-First Guard in `use-exam-session.ts`

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.ts`
- [x] Locate the effect at lines 53–90 (lobby-entry marker check)
- [x] **Replace the current guard logic** with the following priority order:
    1. If `readStoredExamSession(examId)` returns a valid session with a `sessionId` → **skip the lobby redirect entirely** (session already exists; student is resuming)
    2. If no stored session AND no lobby marker → redirect to lobby (fresh entry without proper flow)
    3. If no stored session AND lobby marker exists → clear the marker and proceed (normal first entry from lobby)
- [x] Ensure `clearStoredLobbyEntryMarker` is called **only after** the marker-based guard has been evaluated — move the clear to after the redirect condition checks, not at the top of the effect

### 2.2 — Fix: Prevent Re-entry Redirect During StrictMode Double-Invoke

- [x] In the same effect, add a `hasProcessedRef = useRef(false)` guard — set it to `true` after the first successful pass so StrictMode's second invocation is a no-op
- [x] Alternatively: use `sessionStorage.getItem` directly (non-consuming read) for the guard check, and only call `clearStoredLobbyEntryMarker` after the session is fully initialized, not on mount

### 2.3 — Verify `runtimeAccess` Re-evaluation Guard

- [x] Locate the `useEffect` at lines 104–115 in `use-exam-session.ts`
- [x] Confirm the condition `runtimeAccess && !examSession && !runtimeAccess.canStart && !runtimeAccess.canResume` is not triggering for an `IN_PROGRESS` session — the `&& !examSession` check should be sufficient if `examSession` is correctly populated from storage
- [x] Confirm `useStudentExamData` → `useExamQuery` returns `runtimeAccess.hasActiveAttempt = true` for a student with an `IN_PROGRESS` attempt, and that `canResume = true` is set so the redirect condition is never met

### 2.4 — Testing

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.test.tsx`
- [x] Add a test: student with a valid stored session (`sessionId` present) + no lobby marker → **no lobby redirect fires**
- [x] Add a test: student with no stored session + no lobby marker → lobby redirect fires
- [x] Add a test: student with no stored session + lobby marker present → marker is consumed, no redirect, session initialization begins
- [x] Add a test: React StrictMode double-invoke simulation — first call clears the marker, second call finds no marker but finds a stored session → no redirect

---

## Phase 3 — Inconsistent Unanswered Count on Turn-In

> **Goal:** `unansweredCount` must agree with the actual number of questions that `hasAnswer()` considers unanswered. A student who answered all questions must never see a warning that some questions are unanswered.  
> **Root cause:** `index.ts` lines 86–88 use `!answersHook.selectedAnswers[question.id]` (falsy check) instead of `!hasAnswer(value)`, causing answered questions with falsy-but-valid values to be misclassified.  
> **Affected files:** `use-student-exam-attempt/index.ts`, `use-attempt-answers.ts`

### 3.1 — Fix: Derive `unansweredCount` Correctly in `index.ts`

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
- [x] Locate lines 86–93 (the `unansweredQuestions` derivation)
- [x] Import `hasAnswer` from `@/features/exams/_components/engine` at the top of `index.ts`
- [x] Replace the buggy filter:

    ```ts
    // BEFORE (falsy check — misses '' and 0)
    const unansweredQuestions = questions.filter(
        (question) => !answersHook.selectedAnswers[question.id],
    );

    // AFTER — consistent with answeredCount
    const unansweredQuestions = questions.filter(
        (question) => !hasAnswer(answersHook.selectedAnswers[question.id]),
    );
    const unansweredCount = unansweredQuestions.length;
    ```

- [x] Confirm `unansweredCount` is no longer separately derived — it flows from `unansweredQuestions.length`

### 3.2 — Verify `AttemptView` Local Computation

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_components/attempt-view.tsx`
- [x] Locate lines 61–63: `answeredQuestionIds` is computed locally with `value !== null && value !== undefined`
- [x] Add a comment: this local computation is used only for navigation rail highlighting — it does not affect submission logic
- [x] Optionally: remove the local duplication by using `answeredQuestionIds` from `useStudentExamAttempt` (export it from the hook — it already exists in `answersHook.answeredQuestionIds`)

### 3.3 — Testing

- [x] Open `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.test.tsx`
- [x] Add a unit test for `useAttemptAnswers`: a student who selects answer `''` (empty string) → `answeredCount` remains 0
- [x] Add a unit test: student who selects `'A'` → `answeredCount` is 1
- [x] Add an integration test for `useStudentExamAttempt`: given 10 questions all answered with valid values → `unansweredCount === 0`
- [x] Add an integration test: given 10 questions with 2 answers as `''` → `unansweredCount === 2`

---

## Data Layer Summary

| Change                                                        | Type           | Status                                                    |
| ------------------------------------------------------------- | -------------- | --------------------------------------------------------- |
| No schema migration needed                                    | —              | ✅ No migration required                                  |
| `use-exam-session.ts` — session-first guard reorder           | Frontend logic | 🔧 Code change only                                       |
| `use-student-exam-attempt/index.ts` — `hasAnswer` swap        | Frontend logic | 🔧 Code change only                                       |
| `use-mediapipe-camera-runtime.ts` — signal dispatch audit/fix | Frontend logic | 🔧 Code change (may be no-op if dispatch already correct) |

> **No Prisma migration is required.** All fixes are pure frontend/hook-layer changes.

---

## Testing Strategy

### Automated Tests

| File                                              | Test Type | Coverage Target                                                                                                               |
| ------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `use-attempt-mediapipe-monitoring/index.test.tsx` | Unit      | `setActiveIncident` called → `activeIncident` non-null; `dismissIncident` → null                                              |
| `attempt/page.test.tsx`                           | Component | `mediaPipeIncident` non-null → `MediaPipeIncidentDialog` open=true                                                            |
| `use-exam-session.test.tsx`                       | Unit      | Stored session exists → no lobby redirect; no session + no marker → redirect; StrictMode double-invoke → no spurious redirect |
| `use-student-exam-attempt` tests                  | Unit      | All questions answered → `unansweredCount === 0`; `''` answer → counts as unanswered                                          |
| `use-attempt-answers.ts` tests                    | Unit      | `hasAnswer` consistency: `''` = unanswered, `'A'` = answered                                                                  |

### Manual QA Scenarios

| ID     | Scenario                                                          | Pass Criteria                                                                              |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| QA-01  | Student on attempt page looks away from screen                    | `MediaPipeIncidentDialog` appears within 5 seconds with gaze warning                       |
| QA-01b | Student covers camera entirely                                    | Dialog appears within 5 seconds with "face not visible" message                            |
| QA-01c | Student shows two faces to camera                                 | Dialog appears with "multiple faces detected" message                                      |
| QA-02  | Student on attempt page — no action taken for 30 seconds          | Student remains on attempt page; no lobby redirect occurs                                  |
| QA-03  | Student refreshes browser tab while on attempt page               | Student lands back on attempt page (session restored from storage); no lobby redirect loop |
| QA-04  | Student answers all 10 questions, clicks Turn In                  | Proceeds directly to result page; no unanswered-question warning                           |
| QA-04b | Student types and clears an answer (empty string), clicks Turn In | Warning correctly shows 1 unanswered question                                              |

---

## Progress Tracking

Update task status as work progresses:

- `[ ]` Not started
- `[/]` In progress
- `[x]` Completed

> **Rule:** Do not begin Phase 2 until Phase 1 QA-01, QA-01b, QA-01c pass. Do not begin Phase 3 until Phase 2 QA-02, QA-03 pass.
