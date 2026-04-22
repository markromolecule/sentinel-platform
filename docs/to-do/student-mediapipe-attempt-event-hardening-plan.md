# Student MediaPipe Attempt Event Hardening Plan

## Goal

Make the student exam flow consistent from `checkup -> lobby -> attempt` so that:

- MediaPipe starts at checkup as the activation and calibration entry point.
- MediaPipe continues as an active monitoring runtime during the actual attempt.
- expected exam-time events are visible in the right shape across ingestion, storage, and monitoring.
- browser security actions such as clipboard attempts show immediate student feedback and remain reviewable in telemetry.

## Scope

This plan focuses on:

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client.ts`
- `packages/shared/src/schema/telemetry/telemetry-schema.ts`
- `packages/shared/src/schema/exams/monitoring-schema.ts`
- `app/sentinel-api/src/modules/telemetry/storage/storage.constants.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/map-monitoring-response.ts`

## Current Investigation Snapshot

- [x] Confirmed the raw MediaPipe exam-time events already exist as `GAZE_OFF_SCREEN`, `NO_FACE_DETECTED`, and `MULTIPLE_FACES`.
- [x] Confirmed the attempt page already emits MediaPipe telemetry through `emitMediaPipeTelemetryEvent(...)`.
- [x] Confirmed the checkup page already runs MediaPipe and gates readiness through calibration state.
- [x] Confirmed the lobby currently stores only `checkupCompleted`, not a reusable calibration/runtime token.
- [x] Confirmed the attempt page starts a fresh MediaPipe runtime instead of reusing the checkup stream.
- [x] Confirmed clipboard copy/cut/paste actions already show `Clipboard actions are disabled for this exam.` during attempt.
- [x] Confirmed the downstream monitoring shape does not preserve the raw event names:
  - `GAZE_OFF_SCREEN` -> `GAZE`
  - `NO_FACE_DETECTED` -> `FACE_NOT_VISIBLE`
  - `CLIPBOARD_ATTEMPT` -> `SUSPICIOUS_MOVEMENT`
- [x] Confirmed the database `incident_type` enum does not currently support raw types like `NO_FACE_DETECTED` or `CLIPBOARD_ATTEMPT`.
- [x] Confirmed the student attempt UI can now reach MediaPipe-derived statuses such as `MediaPipe no-face`.
- [ ] Confirmed the browser actually sends MediaPipe telemetry requests when the status badge changes.
- [ ] Confirmed the API receives MediaPipe events with logs like:
  - `[TelemetryIngestion] Received event`
  - `[TelemetryPolicy] Event flagged for persistence`
  - `[TelemetryStorage] Incident appended successfully`
- [ ] Confirmed the student alert dialog opens for MediaPipe incidents with the same reliability as browser-security incidents.
- [ ] Confirmed instructor monitoring receives persisted MediaPipe incidents during a live attempt.

## Updated Failure Snapshot

The latest reproduction changes the diagnosis:

- The student attempt page visibly reaches `MediaPipe no-face`, which means the client runtime is classifying the frame state.
- The API logs still only show browser-security events like `FULL_SCREEN_EXIT`.
- The instructor monitoring page still does not show MediaPipe-triggered incidents.
- The student still does not get the expected blocking alert dialog for MediaPipe incidents.

This means the issue is no longer best described as "MediaPipe cannot detect gaze/face state." The stronger current hypothesis is:

1. MediaPipe classification succeeds on the student client.
2. The promoted incident is not reliably reaching the telemetry ingestion endpoint, or it is being gated before submission.
3. The alert dialog likely fails inside the same branch that should set `activeIncident`, rather than in a separate monitoring-only path.

## Problem Statement

The likely reason the expected labels are not showing on the attempt/monitoring side is not that MediaPipe cannot classify the event. The stronger issue is that the system currently has two layers of naming:

1. raw telemetry event types used by the runtime and ingestion
2. normalized incident types used by storage and monitoring

That means a student or proctor expecting to see `NO_FACE_DETECTED` or `CLIPBOARD_ATTEMPT` may instead see `FACE_NOT_VISIBLE` or `SUSPICIOUS_MOVEMENT`, even when the event was correctly emitted.

## 1-3-1 Decision Records

### Decision 1: What should be the canonical label shown to users

- One problem:
  The runtime emits raw event names, but the monitoring layer shows normalized incident names, which creates confusion during investigation.
- Three options:
  - Option A: Keep normalized incident names only and update all product copy to match them.
  - Option B: Expose both raw event type and normalized incident type in monitoring details.
  - Option C: Replace incident normalization and store only raw event names end-to-end.
- One recommendation:
  Option B.
- Why:
  It keeps the existing incident model intact while making investigations easier. Monitoring can show a user-friendly label plus the exact raw trigger such as `NO_FACE_DETECTED`.

### Decision 2: How checkup should activate MediaPipe for the exam flow

- One problem:
  Checkup proves readiness today, but attempt still boots a separate runtime with no persisted activation handoff other than `checkupCompleted`.
- Three options:
  - Option A: Keep checkup as calibration only and let attempt decide activation again from scratch.
  - Option B: Treat checkup as the required activation gate, persist activation metadata, and require attempt to honor it before starting exam-time emission.
  - Option C: Skip checkup activation and start MediaPipe only inside attempt.
- One recommendation:
  Option B.
- Why:
  This matches the intended product behavior. Checkup should be the explicit start of MediaPipe readiness, while attempt becomes the continuation of an already-authorized monitoring path.

### Decision 3: How clipboard violations should be represented

- One problem:
  The student already gets a toast for clipboard actions, but storage currently maps `CLIPBOARD_ATTEMPT` into generic `SUSPICIOUS_MOVEMENT`.
- Three options:
  - Option A: Keep the current generic stored incident type and only improve frontend wording.
  - Option B: Keep current storage for now, but expose raw event type in details so the UI can say `Clipboard Attempt`.
  - Option C: Introduce a dedicated clipboard incident type in schema, DB enum, storage mapping, and monitoring UI.
- One recommendation:
  Option B for the immediate fix, with Option C as a later schema upgrade if reporting needs first-class clipboard analytics.
- Why:
  Option B gives fast clarity with lower migration risk. Option C is cleaner long-term, but it expands schema, DB enum, and downstream compatibility work.

### Decision 4: How attempt should alert the student for blocked shortcuts

- One problem:
  Clipboard blocking relies on `copy`, `cut`, and `paste` events, but users may expect explicit feedback the moment they press `Ctrl+C` / `Cmd+C`.
- Three options:
  - Option A: Keep relying on clipboard DOM events only.
  - Option B: Add explicit keydown detection for clipboard shortcuts and use it to trigger the same UX guardrail before or alongside clipboard events.
  - Option C: Remove clipboard toasts and only log silently.
- One recommendation:
  Option B.
- Why:
  It creates a clearer student experience and reduces ambiguity during exams, especially when browser behavior differs by platform or focus state.

### Decision 5: Where to debug first now that the student badge changes

- One problem:
  The attempt page shows `MediaPipe no-face`, but the API receives no MediaPipe telemetry logs and the instructor monitoring timeline stays empty.
- Three options:
  - Option A: Keep tuning MediaPipe analysis thresholds first.
  - Option B: Debug the contract from client-side promoted incident to telemetry submission before touching more analysis logic.
  - Option C: Focus first on instructor monitoring rendering.
- One recommendation:
  Option B.
- Why:
  The badge already proves the classifier is producing a meaningful state. The highest-signal gap is now between client runtime dispatch and API ingestion.

## Phase 0 — Audit And Contract Alignment

### Objective

Freeze the exact behavior that exists today before changing runtime, schema, or UI messaging.

### To-Do

- [x] Audit the student MediaPipe runtime in checkup and attempt.
- [x] Audit telemetry event definitions and incident labels.
- [x] Audit incident storage mappings in the API.
- [x] Audit monitoring DTO/schema expectations.
- [ ] Document the exact expected outputs for:
  - student attempt alert copy
  - monitoring timeline label
  - raw event type
  - normalized incident type
- [x] Decide whether the student-facing expectation is:
  - raw telemetry event labels
  - normalized incident labels
  - both
- [x] Decision made:
  - show both, with normalized incident labels kept for storage/reporting and raw event types exposed for investigation.

### Exit Criteria

- [ ] The team agrees which label is authoritative in runtime, storage, and monitoring.

## Phase 1 — Event Naming And Schema Clarity

### Objective

Remove ambiguity between emitted event types and displayed incident labels.

### To-Do

- [x] Add an explicit mapping table in code or docs for:
  - `GAZE_OFF_SCREEN` -> `GAZE`
  - `NO_FACE_DETECTED` -> `FACE_NOT_VISIBLE`
  - `MULTIPLE_FACES` -> `MULTIPLE_FACES`
  - `CLIPBOARD_ATTEMPT` -> `SUSPICIOUS_MOVEMENT`
- [x] Extend monitoring response shaping so the UI can access both:
  - normalized `incidentType`
  - raw `lastEvent.eventType`
- [x] Update the monitoring timeline UI to prefer human-friendly labels while still exposing the raw trigger in detail panels or badges.
- [ ] Review whether `SUSPICIOUS_MOVEMENT` is too generic for clipboard and right-click incidents.
- [ ] If the team chooses first-class clipboard labeling, prepare follow-up schema and DB changes for a dedicated clipboard incident type.

### Exit Criteria

- [x] A proctor can distinguish between `Face Not Visible` and raw `NO_FACE_DETECTED`.
- [x] A proctor can distinguish between generic suspicious movement and raw clipboard-triggered violations.

## Phase 2 — Checkup As Activation Gate

### Objective

Make checkup the authoritative start of the MediaPipe journey before the student reaches the live attempt.

### Desired Logic

- Checkup should request camera access.
- Checkup should start MediaPipe once the stream is ready.
- Checkup should complete calibration before the student can continue when calibration is required.
- Lobby should only be enterable after checkup marks MediaPipe readiness complete.
- Attempt should be treated as a continuation of approved monitoring, not the first activation point.

### To-Do

- [x] Define a small persisted handoff contract for MediaPipe readiness, for example:
  - `checkupCompleted`
  - `mediaPipeActivatedAt`
  - `calibrationCompletedAt`
  - `activationSource: 'checkup'`
- [x] Keep the contract lightweight and session-scoped only; do not persist face landmarks or video data.
- [x] Update lobby gating so MediaPipe-dependent exams clearly explain why entry is blocked when calibration is incomplete.
- [x] Add expiry behavior so stale checkup activation does not silently grant attempt access much later.
- [ ] Decide whether a re-check is required when:
  - the student refreshes
  - the student changes camera permissions
  - the exam session starts after a long delay

### Exit Criteria

- [x] Students cannot reach a MediaPipe-enforced attempt without completing the expected checkup activation path.
- [x] The handoff from checkup to lobby is explicit and debuggable.

## Phase 3 — Attempt Runtime Continuation And Event Emission

### Objective

Keep attempt-time MediaPipe monitoring active, understandable, and aligned with the checkup gate.

### Desired Logic

- Attempt reacquires its own camera stream.
- Attempt validates that MediaPipe was activated by checkup for this session.
- Attempt emits only supported telemetry events.
- Attempt shows immediate student guidance when a violation is detected.

### To-Do

- [x] Require attempt startup to verify the checkup activation handoff before enabling MediaPipe emission.
- [x] Keep the current supported attempt-time signals:
  - `GAZE_OFF_SCREEN`
  - `NO_FACE_DETECTED`
  - `MULTIPLE_FACES`
- [ ] Add lightweight runtime diagnostics for support and QA:
  - MediaPipe started
  - MediaPipe blocked by config
  - MediaPipe blocked by missing checkup activation
  - MediaPipe failed to initialize
  - MediaPipe analysis promoted to incident
  - MediaPipe telemetry emit skipped with explicit reason
  - MediaPipe telemetry emit attempted
  - MediaPipe telemetry emit failed
- [ ] Review current threshold values so checkup calibration behavior and attempt emission behavior are intentionally different, not accidentally divergent.
- [ ] Verify that dedupe and severity behavior still matches expectation once the events persist into monitoring.
- [ ] Trace the exact attempt-time path for `GAZE_OFF_SCREEN` and `NO_FACE_DETECTED`:
  - analysis status
  - normalized signal
  - `dispatch.shouldEmit`
  - `setActiveIncident(...)`
  - `emitMediaPipeTelemetryEvent(...)`
- [ ] Add client tests that prove a promoted MediaPipe signal both:
  - opens the student incident dialog
  - calls the telemetry ingest client with the matching raw event type
- [ ] Add browser QA steps that verify a real network request exists when the student badge changes to:
  - `MediaPipe no-face`
  - `MediaPipe off-screen`

### Exit Criteria

- [ ] Attempt page emits the right raw events all the way to the ingestion endpoint.
- [ ] Student gets an immediate alert dialog when a MediaPipe incident is promoted.
- [ ] Monitoring can explain what happened without losing the exact trigger.

## Phase 4 — Browser Security Alerts And Clipboard UX

### Objective

Ensure browser-side security violations feel immediate to the student and remain precise in telemetry.

### Desired Logic

- During attempt, blocked clipboard actions should show immediate feedback.
- Shortcut-based clipboard attempts such as `Ctrl+C`, `Ctrl+V`, `Cmd+C`, and `Cmd+V` should feel consistently handled.
- The logged telemetry should remain attributable to clipboard behavior, not just a generic movement bucket.

### To-Do

- [x] Add explicit shortcut detection for:
  - `Ctrl+C`
  - `Ctrl+X`
  - `Ctrl+V`
  - `Meta+C`
  - `Meta+X`
  - `Meta+V`
- [x] Reuse the current message:
  `Clipboard actions are disabled for this exam.`
- [x] Prevent duplicate student notifications when both keydown and clipboard DOM events fire for the same action.
- [ ] Decide whether right-click should keep sharing the same stored incident family as clipboard or be separated in the future.
- [ ] Verify that clipboard warnings do not fire outside the active attempt route.

### Exit Criteria

- [x] Students consistently see the clipboard warning during blocked copy/paste attempts.
- [x] Telemetry for clipboard violations is easy to interpret in monitoring.

## Phase 5 — Validation, QA, And Rollout

### Objective

Prove the full flow works across student runtime, telemetry ingestion, and monitoring review.

### To-Do

- [x] Add or update tests for checkup gating and attempt startup dependencies.
- [x] Add or update tests for MediaPipe event emission visibility in monitoring mapping.
- [x] Add or update tests for clipboard shortcut handling and duplicate suppression.
- [ ] Add end-to-end verification for MediaPipe incident submission:
  - client badge changes
  - telemetry request appears in browser network tools
  - API ingestion logs appear
  - storage append or dedupe logs appear
  - instructor monitoring timeline updates
- [ ] Manually verify these flows:
  - [ ] single face, centered, no alert
  - [ ] no face detected
  - [ ] multiple faces detected
  - [ ] gaze off screen
  - [ ] clipboard shortcut blocked during attempt
  - [ ] lobby blocked until calibration completes
  - [ ] attempt disabled when checkup activation is missing or stale
- [x] Confirm monitoring output shows both the normalized incident label and raw event trigger where needed.

### Exit Criteria

- [ ] QA can reproduce and identify each expected event without reading backend code.
- [ ] Product and support can explain the meaning of the label seen in monitoring.
- [ ] For each MediaPipe incident, QA can point to all four checkpoints:
  - student alert
  - browser telemetry request
  - API ingestion log
  - instructor monitoring record

## Recommended Implementation Order

- [ ] Phase 1 first: make naming and monitoring clarity explicit.
- [ ] Phase 2 next: formalize checkup activation handoff.
- [ ] Phase 3 after that: tighten attempt startup, incident promotion, and telemetry diagnostics.
- [ ] Phase 4 next: harden clipboard shortcut UX and telemetry clarity.
- [ ] Phase 5 last: validate the full path end-to-end.

## Immediate Next Steps

### 1 Problem

MediaPipe state is visible on the student page, but the incident contract is still incomplete end-to-end.

### 3 Workstreams

- Client runtime trace:
  instrument the attempt hook so we can see when `no-face` or `off-screen` reaches `dispatch.shouldEmit`, `setActiveIncident(...)`, and `emitMediaPipeTelemetryEvent(...)`.
- Telemetry emit hardening:
  make `emitMediaPipeTelemetryEvent(...)` log why it returns `false` or throws, instead of failing silently from the student runtime point of view.
- Monitoring verification:
  once the client emits, verify that the API storage path and instructor monitoring timeline reflect the same incident with both normalized and raw labels.

### 1 Recommendation

Do not spend the next cycle retuning MediaPipe classification first. The best next move is to debug from promoted client incident to telemetry submission, because the student badge already proves classification is happening.

## Notes

- This plan assumes the fastest path is to preserve the current incident model and improve visibility of raw event types rather than immediately changing the database enum.
- If the product requirement is to literally show `NO_FACE_DETECTED` and `CLIPBOARD_ATTEMPT` as the primary labels everywhere, that becomes a schema and reporting migration task, not just a frontend wording fix.
