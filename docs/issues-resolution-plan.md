# Issue Resolution Implementation Plan

This document outlines the plan to resolve the 5 issues documented in `docs/issue-encounter-audio.md`.

> **Execution Order:** Phases 1 → 2 → 3 → 4. Phase 1 is a hard prerequisite for all subsequent phases since audio initialization failures block the attempt page entirely. Phases 2–4 are otherwise independent and can be parallelized across team members once Phase 1 is merged.

---

## Phase 1: Microphone Permission & Audio Anomaly Initialization

**Resolves:** Issue 1, Issue 3
**Effort:** Medium | **Risk:** High — blocks the attempt page for all students if unresolved

### Problem

The checkup page requests camera permissions but never prompts for microphone access. When the student reaches the attempt page, the `AudioAnomalyWorker` fails to initialize because the microphone stream was never acquired, producing the "audio anomaly is not available to this device" error even on capable hardware.

### Decision

Three approaches were considered:

| Option | Description                                                                              | Verdict                                                                                           |
| ------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1      | Add a separate audio-only UI step in the checkup sequence                                | Rejected — adds friction to an already multi-step flow                                            |
| 2      | Bundle audio into the existing `getUserMedia({ video: true, audio: true })` call         | Rejected — a single denied or missing device fails the entire request, blocking the whole checkup |
| **3**  | **Create a dedicated `use-checkup-audio` hook running in parallel with the camera hook** | **Selected**                                                                                      |

**Rationale for Option 3:** Parallel hooks maintain independent error boundaries — a denied microphone does not block camera setup and vice versa. The separated state fits the existing component architecture and makes each hook independently testable and replaceable.

### Tasks

- [x] **1.1** — Create `use-checkup-audio` hook
    - Call `getUserMedia({ audio: true })` and surface three states: `idle`, `granted`, `denied`
    - Store the resulting `MediaStream` ref so it can be passed downstream without re-requesting permission
    - Handle `NotAllowedError`, `NotFoundError`, and `NotReadableError` with distinct error messages

- [x] **1.2** — Integrate hook into the checkup page
    - File: `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.tsx`
    - Invoke `use-checkup-audio` alongside the existing camera hook
    - Display a unified permission status UI — a single "Allow Camera & Microphone" prompt if both are pending, or separate inline indicators if states diverge
    - Block progression to the next step until both `cameraReady` and `audioReady` are `true`

- [x] **1.3** — Thread audio readiness into the attempt page
    - Pass the stored `MediaStream` (or a derived permission token) to the `AudioAnomalyWorker` initialization call so it does not need to re-request permission
    - Add a guard: if audio state is `denied` on arrival at the attempt page, surface a recoverable error rather than a silent initialization failure

- [x] **1.4** — Tests
    - **Unit:** `use-checkup-audio` — mock `getUserMedia`; assert correct state transitions for `granted`, `NotAllowedError`, `NotFoundError`, and `NotReadableError`
    - **Unit:** Checkup page — assert the "Continue" button is disabled when `audioReady` is `false`; assert it enables when both `cameraReady` and `audioReady` are `true`
    - **Integration:** Simulate a full checkup → attempt flow and verify `AudioAnomalyWorker` initializes without error when audio permission is pre-granted

### Success Criteria

- A student who grants microphone permission on the checkup page reaches the attempt page without seeing "audio anomaly is not available to this device"
- A student who denies microphone permission sees a clear, actionable error message — not a silent failure
- The camera checkup flow is unaffected when microphone permission is denied

---

## Phase 2: Dynamic Student Lobby Count

**Resolves:** Issue 2
**Effort:** Low–Medium | **Risk:** Low — presentational; no data loss risk
**Depends on:** None (parallelizable after Phase 1 is merged)

### Problem

The student lobby hardcodes or defaults the active student count to `0`. Students waiting in the lobby see no indication of how many peers are also present.

### Decision

Three approaches were considered:

| Option | Description                                             | Verdict                                                                                         |
| ------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1      | **Polling via TanStack Query** with a `refetchInterval` | **Selected**                                                                                    |
| 2      | WebSocket presence channel broadcast                    | Deferred — no existing presence channel for student-to-student lobby events; adds backend scope |
| 3      | Server-Sent Events (SSE)                                | Deferred — introduces infrastructure overhead disproportionate to this feature's urgency        |

**Rationale for Option 1:** TanStack Query polling requires only a lightweight read endpoint and zero new infrastructure. The lobby count is low-stakes (a cosmetic number, not a transactional operation) and a 5-second staleness window is entirely acceptable. Option 2 should be revisited if real-time presence becomes a broader product requirement.

### Tasks

- [x] **2.1** — Create or update the backend endpoint
    - Route: `GET /exam/:id/lobby-count`
    - Returns: `{ count: number }` — the number of students currently in the lobby for the given exam
    - Scope query to active sessions only (exclude submitted or timed-out attempts)

- [x] **2.2** — Create `use-exam-lobby-count-query` hook
    - Use TanStack Query with `refetchInterval: 5000`
    - Expose `count`, `isLoading`, and `isError` to consumers
    - On error, default to displaying `--` rather than `0` to signal a fetch failure vs. a legitimate zero count

- [x] **2.3** — Integrate hook into the student lobby UI
    - Replace the hardcoded value with the dynamic `count`
    - Show a skeleton/placeholder while `isLoading` is `true`

- [x] **2.4** — Tests
    - **Unit:** `use-exam-lobby-count-query` — mock the endpoint; assert correct values for loading, success (`count > 0`), and error states; assert polling fires at the configured interval
    - **Integration:** Hit the real endpoint with a known number of active sessions and assert the returned count matches

### Success Criteria

- The lobby displays the live count of waiting students, refreshing approximately every 5 seconds
- A network error causes the count to display as `--`, not `0`
- The UI does not flash or reset to `0` between polling intervals

---

## Phase 3: Student Classroom Query Deduplication

**Resolves:** Issue 4
**Effort:** Medium | **Risk:** Medium — changes a shared query and its return type; downstream consumers must be updated
**Depends on:** None (parallelizable after Phase 1 is merged)

### Problem

When more than one instructor is assigned to a classroom, the classroom appears as duplicate entries in the student's classroom list. The underlying query returns one row per instructor rather than one row per classroom with an aggregated instructor array.

### Decision

Three approaches were considered:

| Option | Description                                                                                         | Verdict                                                                      |
| ------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1      | Client-side deduplication using `Array.reduce` grouped by classroom ID                              | Rejected — does not reduce over-fetching; the API response remains malformed |
| **2**  | **Aggregate at the database level using `json_agg` (Kysely/PostgreSQL) or Prisma nested `include`** | **Selected**                                                                 |
| 3      | Two-query approach: fetch classrooms, then fetch instructors separately and merge                   | Rejected — increases round trips and complicates error handling              |

**Rationale for Option 2:** Aggregating at the database level is the canonical solution. It eliminates over-fetching, keeps the API response correctly shaped, and produces a type-safe result that accurately reflects the data model without extra client or server glue code.

### Tasks

- [x] **3.1** — Locate and audit the existing query
    - File: likely `get-student-classrooms.ts` or similar in the `enrollments` module
    - Verify how instructors are joined (likely via `class_roles`)

- [x] **3.2** — Rewrite the query to aggregate instructor data
    - Remove the top-level join to `user_profiles` for instructors
    - Use a subquery or lateral join with `json_agg` (or `json_group_array` depending on dialet) to roll up instructor names into a single string array or comma-separated list
    - Ensure this prevents the parent row (classroom/subject) from duplicating

- [x] **3.3** — Update return types and frontend schema
    - Update the Zod schema representing the classroom object
    - Change `instructorName: string | null` to `instructors: string[]`
    - Update frontend classroom cards to display `instructors.join(', ')`

- [x] **3.4** — Tests
    - Add a backend integration test (if possible) or update the existing one to assert that a class with two instructors returns exactly one classroom object with an array of two instructor names
    - **Unit (frontend):** Assert the classroom list component renders exactly one card per classroom regardless of instructor count

### Success Criteria

- A classroom with two instructors appears exactly once in the student's classroom list
- The `instructors` field on the returned classroom object is always an array (never `null`, never a flat repeated row)
- No existing call sites break — type errors at the TypeScript level are resolved before merge

---

## Phase 4: Exam Card UI State

**Resolves:** Issue 5
**Effort:** Low | **Risk:** Low — isolated presentational change
**Depends on:** None (parallelizable after Phase 1 is merged)

### Problem

The student dashboard's exam card always renders an "Open Exam" button, even after the student has submitted the exam. The card does not reflect terminal attempt states (`TURNED_IN`, `COMPLETED`).

### Decision

Three approaches were considered:

| Option | Description                                                   | Verdict                                                                            |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **1**  | **Conditional rendering inside `ExamCard` based on `status`** | **Selected**                                                                       |
| 2      | Derive UI state in a hook (`canStart`, `isSubmitted`, etc.)   | Rejected — over-engineered for a single status check that is purely presentational |
| 3      | Backend returns an `availableActions` array                   | Rejected — introduces backend coupling for a frontend display concern              |

**Rationale for Option 1:** The status field is already available on the exam object. A direct conditional in the component is the standard React pattern for this class of problem and keeps the change self-contained.

### Tasks

- [x] **4.1** — Isolate the `ExamCard` component
    - File: `app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.tsx`

- [x] **4.2** — Implement conditional UI rendering logic based on `exam.status`
    - Update the status pill colors: `available` -> primary, `upcoming` -> amber, `completed` -> muted/slate, `in-progress` -> secondary/blue
    - Update the action button based on state:
        - `upcoming`: Disabled "Upcoming" button
        - `available`: "Open Exam" (primary variant)
        - `in-progress`: "Resume Exam" (secondary variant)
        - `completed`: "Review Flow" (outline variant)

- [x] **4.3** — Tests
    - Unit test `ExamCard` rendering to assert the button copy and variant correctly correspond to `upcoming`, `available`, `in-progress`, and `completed` statuses

### Success Criteria

- An exam with status `TURNED_IN` or `COMPLETED` no longer shows a clickable "Open Exam" button
- The correct terminal-state label is visible without requiring a page reload
- All other exam card states are unaffected

---

## Cross-Cutting Concerns

### Database Migrations

No schema migrations are required. All changes target query logic, hook behavior, or component rendering.

### Access Control

No new permissions or roles are introduced. All changes operate within existing authorization boundaries.

### API Versioning

No breaking API changes are introduced with one exception: the classroom query in Phase 3 changes its return shape. Confirm no external consumers (mobile clients, third-party integrations) depend on the old flat shape before deploying.

### Feature Flags

No feature flags are required. All changes are bug fixes with no user-facing opt-in behavior.

### Rollback Plan

- **Phase 1:** Reverting the `use-checkup-audio` hook and its integration restores the prior (broken) behavior. No data is mutated, so rollback is safe.
- **Phase 2:** The polling hook can be removed without side effects. The endpoint can be left in place or removed independently.
- **Phase 3:** The query change is the highest-risk rollback. Keep the old query implementation in a separate branch until integration tests pass in staging.
- **Phase 4:** A one-line conditional — trivially reverted.

### Definition of Done (All Phases)

A phase is complete when:

1. All tasks are checked off
2. All specified tests are written and passing in CI
3. The relevant success criteria are met and verified in a staging environment
4. A peer code review has been approved
5. No new TypeScript errors or lint warnings are introduced
