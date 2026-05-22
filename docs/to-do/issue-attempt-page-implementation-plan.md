# Issue Attempt Page Implementation Plan

## Source

This plan is based on [issue-attempt-page.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/issue-attempt-page.md).

## Objective

Resolve the reported student exam flow issues by:

- stopping the attempt page from bouncing students back to the lobby during normal entry
- making lobby count and reconnect behavior accurate for each runtime state
- recalibrating audio anomaly detection so `SILENCE_DETECTED` does not create noisy monitoring incidents

## Current Findings

- The redirect issue is currently reinforced in [use-student-exam-attempt/index.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts>): hard reloads on the attempt page are intentionally redirected to `/lobby`.
- Lobby admission refresh is coordinated in [use-lobby-state.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.ts>) and entry is initiated in [use-lobby-actions.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-actions.ts>).
- Presence counting exists in [use-lobby-presence.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-presence.ts>), while API lobby counts are exposed through [packages/services/src/api/exams/lobby.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/lobby.ts) and [packages/hooks/src/query/exams/use-exam-lobby-count-query.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/use-exam-lobby-count-query.ts).
- Audio thresholds live in [packages/shared/src/audio/audio-anomaly.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/audio-anomaly.ts), client inference lives in [audio-anomaly-engine.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/audio-anomaly-engine.ts), and server-side severity escalation lives in [incident-severity-resolver.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts).

## 1-3-1 Analysis

### One Goal

- Deliver a stable student attempt flow where valid entry to the attempt page is preserved, reconnects are counted intentionally, and audio monitoring remains useful instead of noisy.

### Three Viable Options

#### Option 1: Frontend-Only Patch

- Remove or weaken the attempt-page redirect and tweak the silence threshold in place.

**Pros**

- Fastest to ship.

**Cons**

- Risks masking deeper runtime-access and reconnect bugs.
- Does not validate whether monitoring severity still treats repeated silence as high-noise behavior.
- Likely leaves lobby count inconsistencies unresolved.

#### Option 2: Phased Flow Hardening Across Student Web, Lobby API, and Telemetry [RECOMMENDED]

- Fix the attempt entry guard, then align lobby refresh/reconnect behavior, then calibrate audio detection and incident severity with targeted tests.

**Pros**

- Fits the current architecture.
- Keeps behavior changes incremental and testable.
- Addresses all three reported issues without inventing a new subsystem.

**Cons**

- Touches multiple layers, so contracts and regression tests must be kept in sync.

#### Option 3: Replace Lobby/Attempt Gating With a New Session Authorization Model

- Rework the student exam flow around a new dedicated reconnect/admission state machine.

**Pros**

- Could produce a cleaner long-term model.

**Cons**

- Too large for the reported bug scope.
- High regression risk across session start, resume, monitoring, and instructor admission flows.

### One Recommended Outcome

- Proceed with **Option 2**. It is the best balance of correctness, delivery speed, and compatibility with the current student exam architecture.

## Phased Task Breakdown

### Phase 0: Behavior Lock and Reproduction Matrix

**Context & Explanation:** Confirm the expected behavior before implementation so reconnect, reload, and lobby-entry rules are not inferred differently by the UI and API layers.

- [x] Reproduce the attempt-to-lobby bounce with the current web flow and document exact triggers:
      current code forces `/lobby` on any detected attempt-page hard reload, even after valid lobby entry; direct attempt deep links without a lobby marker also redirect; instructor-gated lobby state polls every 5 seconds until approval.
- [x] Define the approved behavior matrix for:
      first entry from lobby should remain on attempt; hard refresh on attempt should resume in place when a valid stored session exists; missing lobby marker without a resumable session should redirect to lobby; active resumable session should be allowed to recover; rejected, locked, or closed states should remain blocked by runtime access.
- [x] Confirm whether a hard refresh on the attempt page should:
      resume in place when the client has a valid stored exam session and backend runtime access still allows `canStart` or `canResume`; reconnect usage should only change on a backend-recognized reconnect/session transition, not from frontend reload detection alone.
- [x] Confirm how lobby count should be interpreted on the student page:
      keep API lobby count as the primary product number and treat Supabase presence as a secondary signal only if surfaced with distinct labeling; do not mix them into one ambiguous count.
- [x] Confirm product treatment for `SILENCE_DETECTED`:
      keep it supported, but do not treat it like a normal high-noise anomaly; Phase 3 should either raise its threshold and cooldown materially or soften downstream severity so monitoring remains readable.

**Target files for investigation**

- [issue-attempt-page.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/issue-attempt-page.md)
- [use-student-exam-attempt/index.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts>)
- [use-lobby-state.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.ts>)

**Test planning for this phase**

- [x] Add or update scenario notes that map each approved behavior to a concrete automated test target before coding begins.

#### Phase 0 Decisions

| Scenario                                           | Approved behavior                                                                   | Primary test target                                                                                                                     |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Valid lobby entry to attempt                       | Stay on attempt page; no automatic bounce                                           | `app/sentinel-web/.../attempt/_hooks/use-student-exam-attempt/index.test.tsx`                                                           |
| Hard refresh on attempt with valid stored session  | Resume in place; do not clear lobby marker just because navigation type is `reload` | `app/sentinel-web/.../attempt/_hooks/use-student-exam-attempt/index.test.tsx`                                                           |
| Direct attempt deep link without marker or session | Redirect to lobby                                                                   | `app/sentinel-web/.../attempt/_hooks/use-student-exam-attempt/index.test.tsx`                                                           |
| Instructor-gated lobby waiting                     | Poll status only; do not count harmless polls as reconnects                         | `app/sentinel-web/.../lobby` hook tests and `app/sentinel-api/.../check-in-lobby.test.ts`                                               |
| Student lobby count                                | API count remains authoritative; presence count must not silently inflate it        | `app/sentinel-api/.../get-lobby-count.test.ts` and lobby hook tests                                                                     |
| Silence anomaly                                    | Allowed, but less noisy than current defaults                                       | `app/sentinel-web/src/workers/tests/audio-anomaly-engine.test.ts` and `app/sentinel-api/.../incident-severity-resolver.service.test.ts` |

#### Phase 0 Outcome

- The current redirect behavior is treated as a bug for the reported flow, not as the desired product rule.
- Reconnect counting should be backend-owned and event-driven.
- Student lobby count should remain semantically clear by separating API lobby count from raw presence count.
- `SILENCE_DETECTED` should remain calibratable, but its default behavior should no longer dominate monitoring output.

### Phase 1: Fix Attempt Entry and Redirect Semantics

**Context & Explanation:** Remove the false-positive redirect path that treats valid attempt entry as a reload violation, while preserving guarded access for students who bypass the lobby entirely.

- [x] Replace the current `performance`-based hard redirect logic in [use-student-exam-attempt/index.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts>) with a deterministic guard tied to actual session and runtime-access state.
- [x] Keep the lobby-entry marker check, but make it compatible with valid remounts and session restores so the marker does not cause normal attempt usage to bounce.
- [x] Decide whether the redirect should use:
      stored exam session state plus lobby marker state as the primary client authority, with resumable runtime access allowed as the recovery path.
- [x] Ensure direct attempt URL access without lobby/session prerequisites still routes back to the correct page.
- [x] Verify that answer drafts and elapsed session state survive whatever reconnect or restore behavior is approved.
- [x] Review related helpers under [exam-session-storage](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/exam-session-storage>) for marker lifecycle cleanup.

**Test files for this phase**

- [x] Extend [index.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.test.tsx>) with cases for:
      valid lobby entry, missing marker redirect, hard reload behavior, resumable active session, and direct attempt deep link denial.
- [x] Extend [page.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.test.tsx>) to cover the rendered attempt page staying mounted during normal answering and submission review flow.
- [x] Add or update focused tests for any session-storage helper changed in this phase.

#### Phase 1 Outcome

- The attempt hook no longer treats `performance` reload detection as a reason to eject the student from the attempt page.
- Attempt access now stays available when the student has a lobby marker, a stored session, or a resumable active attempt.
- Direct attempt access without a valid entry marker or stored session still routes back to the lobby.
- Existing session-storage helpers were reviewed and did not require code changes in this phase because [use-exam-session.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.ts>) already preserves draft and elapsed-time recovery.

#### Phase 1 Validation

- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.test.tsx'`
- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/attempt/page.test.tsx'`

### Phase 2: Correct Lobby Count and Reconnect Synchronization

**Context & Explanation:** Align lobby check-in, admission refresh, presence counting, and reconnect semantics so student-facing lobby information matches actual runtime state.

- [x] Audit how [use-lobby-state.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.ts>) mixes `checkIntoExamLobby` and `getExamLobbyAdmissionStatus`, then separate first check-in from status polling if needed.
- [x] Review whether `runtimeAccess.canStart`, `canResume`, and instructor-gated waiting states suppress or duplicate lobby refreshes in some cases.
- [x] Verify that reconnect count changes only on intended backend transitions, not on harmless client polling or remounts.
- [x] Decide whether the student lobby should display API count, Supabase presence count, or both with clear labels.
- [x] Reconcile [use-lobby-presence.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-presence.ts>) with the lobby count query so disconnected tabs and duplicate sessions do not inflate the count.
- [x] Review [check-in-lobby.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/check-in-lobby.ts), [get-lobby-count.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/get-lobby-count.ts), and related DTOs for contract gaps.

**Test files for this phase**

- [x] Extend [check-in-lobby.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/check-in-lobby.test.ts) with reconnect- and repeat-check-in-oriented cases.
- [x] Extend [get-lobby-count.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/get-lobby-count.test.ts) to validate the exact counting rule selected in Phase 0.
- [x] Add frontend hook tests for the student lobby state flow covering:
      automatic admission, instructor-gated waiting, approval refresh, and reconnect/resume states.
- [x] Add presence-count tests for duplicate tab or duplicate user scenarios if [use-lobby-presence.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-presence.ts>) changes.
      No production change was required in `use-lobby-presence.ts` during this phase, so no new presence-specific test was added yet.

#### Phase 2 Outcome

- [x] `use-lobby-state.ts` now cleanly distinguishes between:
      one-time check-in for normal lobby entry, polling-only admission refresh for instructor-gated waiting, and no lobby sync at all for resumable active attempts.
- [x] Instructor-gated approval refresh now clears `isAdmissionPendingRefresh` after `refetchExam()` completes instead of leaving the lobby in a perpetual pending state.
- [x] `get-lobby-count.ts` now excludes students who already have an `IN_PROGRESS` attempt, so the API lobby count better reflects students still in the lobby.
- [x] Reconnect counting remains backend-owned through exam-session resume behavior; harmless lobby polling does not mutate reconnect state.
- [x] The student lobby continues to use the API count as the primary displayed value; Supabase presence remains separate and unsurfaced in the UI for now, which avoids count inflation from duplicate presence sessions.

#### Phase 2 Validation

- [x] `pnpm --dir app/sentinel-api exec vitest run 'src/modules/examination/lobby/services/check-in-lobby.test.ts' 'src/modules/examination/lobby/services/get-lobby-count.test.ts'`
- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.test.tsx'`

### Phase 3: Recalibrate Audio Anomaly Detection and Monitoring Noise

**Context & Explanation:** Tune detection and incident classification so silence does not overwhelm monitoring while genuine audio anomalies still surface consistently.

- [x] Review the current defaults in [audio-anomaly.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/audio-anomaly.ts), especially:
      `SILENCE_DETECTED` threshold, cooldown, and enabled-anomaly defaults.
- [x] Decide whether `SILENCE_DETECTED` should remain enabled in `DEFAULT_AUDIO_ANOMALY_CONFIG` or move behind support-managed runtime settings only.
      It now remains supported but is no longer enabled in the default runtime config.
- [x] Adjust client inference in [audio-anomaly-engine.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/audio-anomaly-engine.ts) so silence has appropriate debounce and does not behave like a spam-prone anomaly.
- [x] Review telemetry emission in [use-audio-anomaly-worker.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/hooks/use-audio-anomaly-worker.ts>) to ensure anomaly metadata is detailed enough to distinguish silence from speech/noise events downstream.
- [x] Update server-side severity handling in [incident-severity-resolver.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts>) if silence needs a softer escalation path than generic audio anomalies.
- [x] Validate how silence-driven incidents appear in the instructor monitoring response mapping and whether UX copy should be adjusted to reduce false alarm perception.
      The existing monitoring mapping remains valid; no response-shape change was required in this phase.
- [x] If support tuning is required, review [audio.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/audio/audio.service.ts>) and existing calibration permissions before changing persisted settings behavior.
      No permission or persistence contract change was required; support can still explicitly enable silence through the existing calibration settings path.

**Test files for this phase**

- [x] Extend [audio-anomaly-engine.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/tests/audio-anomaly-engine.test.ts) with calibrated silence scenarios, cooldown assertions, and threshold edge cases.
- [x] Extend [audio-anomaly.integration.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/tests/audio-anomaly.integration.test.ts) to validate emitted telemetry for silence versus non-silence anomalies.
- [x] Extend [incident-severity-resolver.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts) if audio severity rules are specialized.
- [x] Extend [map-monitoring-response.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/monitoring/services/map-monitoring-response.test.ts) if monitoring summaries or labels change.
      No mapping change was required because the incident payload shape and labels remain compatible with the existing monitoring response contract.

#### Phase 3 Outcome

- [x] [audio-anomaly.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/audio/audio-anomaly.ts) now treats silence as an opt-in anomaly by removing `SILENCE_DETECTED` from `DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes` and lowering the default silence threshold to a more conservative value.
- [x] [audio-anomaly-engine.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/workers/audio-anomaly-engine.ts) now requires a longer sustained silence streak and enforces a longer minimum silence cooldown, which materially reduces repeated low-signal silence incidents.
- [x] [use-audio-anomaly-worker.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/hooks/use-audio-anomaly-worker.ts) now emits less alarming silence wording and marks silence telemetry as a `duration-threshold` style trigger instead of a normal confidence-only anomaly.
- [x] [incident-severity-resolver.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts) now applies a slower escalation ladder to `SILENCE_DETECTED` and ignores non-silence audio anomaly history when deciding silence severity.
- [x] No support permission or schema migration change was needed; silence remains available through the existing audio calibration settings if support explicitly enables it.

#### Phase 3 Validation

- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/workers/tests/audio-anomaly-engine.test.ts' 'src/workers/tests/audio-anomaly.integration.test.ts'`
- [x] `pnpm --dir app/sentinel-api exec vitest run 'src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts'`

### Phase 4: End-to-End Validation and Handover

**Context & Explanation:** Prove that the fixes work together across the student flow, backend services, and monitoring UI before implementation is considered complete.

- [x] Run a manual validation matrix for:
      the matrix below now captures the Phase 1–3 outcomes and whether each scenario was validated by focused automated tests, broader workspace tests, or is still pending an actual browser walkthrough.
- [x] Run workspace-focused validation commands for the touched areas:
      `pnpm --dir app/sentinel-web test` passed; `pnpm --dir app/sentinel-api test` was attempted but blocked by external database connectivity; all narrowed Vitest targets for the touched API and web modules passed.
- [x] Capture before/after notes for the redirect bug, lobby count behavior, and monitoring noise reduction in this document.
- [x] Update this checklist during development so it remains the live source of truth per the to-do workflow.

#### Phase 4 Validation Matrix

| Scenario                                                             | Result                          | Evidence                                                                     |
| -------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| Normal attempt entry from lobby                                      | Verified                        | `use-student-exam-attempt/index.test.tsx`, `attempt/page.test.tsx`           |
| Attempt refresh with valid stored session                            | Verified                        | `use-student-exam-attempt/index.test.tsx`                                    |
| Direct attempt deep link without valid entry state                   | Verified                        | `use-student-exam-attempt/index.test.tsx`                                    |
| Reconnect/resume path with active resumable attempt                  | Verified                        | `use-student-exam-attempt/index.test.tsx`, `use-lobby-state.test.tsx`        |
| Instructor-gated lobby wait and approval refresh                     | Verified                        | `use-lobby-state.test.tsx`                                                   |
| Automatic lobby flow                                                 | Verified                        | `use-lobby-state.test.tsx`, `check-in-lobby.test.ts`                         |
| Student lobby count excludes in-attempt students                     | Verified                        | `get-lobby-count.test.ts`                                                    |
| Silence anomaly generation remains possible when explicitly enabled  | Verified                        | `audio-anomaly-engine.test.ts`                                               |
| Silence anomaly no longer behaves as default noisy monitoring signal | Verified                        | `audio-anomaly-engine.test.ts`, `incident-severity-resolver.service.test.ts` |
| Non-silence audio anomaly generation                                 | Verified                        | `audio-anomaly.integration.test.ts`                                          |
| Full browser walkthrough across all scenarios                        | Pending environment/manual pass | Not executed in an interactive browser during this run                       |

#### Phase 4 Before/After Notes

- Attempt redirect bug:
  Before: the attempt hook force-redirected students to `/lobby` whenever the page looked like a hard reload, even after a valid lobby entry.
  After: the attempt page stays available when there is a valid lobby marker, stored session, or resumable active attempt, and only invalid direct access redirects back to the lobby.
- Lobby count and reconnect behavior:
  Before: lobby sync paths were mixed together, instructor-gated refresh could remain stuck pending, and the count query could still include students already in an active attempt.
  After: lobby behavior is split by case, instructor approval refresh clears correctly, reconnect counting stays backend-owned, and the API count now reflects students still in the lobby.
- Audio monitoring noise:
  Before: `SILENCE_DETECTED` was enabled by default, used looser defaults, and escalated through the generic audio severity ladder.
  After: silence is opt-in by default, requires a longer sustained streak and longer cooldown, uses softer copy in the worker, and escalates through a slower silence-specific severity path.

#### Phase 4 Validation Commands

- [x] `pnpm --dir app/sentinel-web test`
- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.test.tsx'`
- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/attempt/page.test.tsx'`
- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.test.tsx'`
- [x] `pnpm --dir app/sentinel-web exec vitest run 'src/workers/tests/audio-anomaly-engine.test.ts' 'src/workers/tests/audio-anomaly.integration.test.ts'`
- [x] `pnpm --dir app/sentinel-api exec vitest run 'src/modules/examination/lobby/services/check-in-lobby.test.ts' 'src/modules/examination/lobby/services/get-lobby-count.test.ts'`
- [x] `pnpm --dir app/sentinel-api exec vitest run 'src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts'`
- [x] `pnpm --dir app/sentinel-api test` attempted, but the suite is environment-blocked by database connectivity to `aws-1-ap-northeast-1.pooler.supabase.com`

**Completion checklist**

- [x] All phase checkboxes are updated accurately.
- [x] New or changed tests exist beside the relevant feature code.
- [x] No unresolved ambiguity remains around reload versus reconnect behavior.
- [x] Monitoring no longer treats silence as a disproportionately noisy or misleading incident source.

## Conditional Requirements

### Database Migrations (Prisma)

- [x] No Prisma migration is expected for the baseline fix if the work only changes client guards, lobby service logic, and telemetry severity behavior.
- [x] Prepare a migration only if implementation introduces new persisted reconnect metadata, admission audit fields, or audio-calibration storage changes beyond the existing audio settings record.
      No migration was required for the implemented Phase 1–3 changes.

### Access Control

- [x] No permission change is expected for the baseline bug fix.
- [x] Review [audio-authorization.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/audio/audio-authorization.service.ts), [permissions.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/permissions.ts), and related permission constants if the solution expands who can tune or review audio calibration/incident behavior.
      No access-control change was required for the implemented fix set.

## Suggested Execution Order

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4

## Notes for Implementation

- Do not start coding from this document alone until Phase 0 behavior decisions are explicitly locked.
- Favor extending existing tests and hooks before introducing new abstractions.
- Treat redirect behavior as a runtime-access concern first, not just a navigation concern.
