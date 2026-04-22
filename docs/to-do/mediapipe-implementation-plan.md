# MediaPipe Support Sandbox To Student Runtime Integration Plan

## Summary

This plan treats the support telemetry `sandbox` as the main building ground for MediaPipe gaze tracking and face detection. It is both:

- the experimentation and calibration workspace for MediaPipe behavior
- the support-managed control plane for enabling, tuning, and staging rollout

The student pages are not the first place where MediaPipe is invented. Instead, the support sandbox becomes the source of calibration truth, and later we integrate that calibrated behavior into the student `checkup -> attempt` flow using the existing examination, telemetry, and runtime contracts.

Core architecture rule:

- `MediaPipe` is an integration into the existing telemetry and exam runtime.
- It must not create a second attempt flow, second incident pipeline, second rule system, or MediaPipe-only logging backend.

## Progress Tracker

- [x] Phase 0 — Baseline Audit And Alignment
- [x] Phase 1 — Support Sandbox As The Primary MediaPipe Building Ground
- [x] Phase 2 — MediaPipe Dependency And Frontend Runtime Preparation
- [x] Phase 3 — Backend MediaPipe Helper Layer
- [x] Phase 4 — Support Sandbox Controls And Rollout Semantics
- [x] Phase 5 — Support Sandbox Event Preview And Telemetry Alignment
- [x] Phase 6 — Student Checkup Integration
- [x] Phase 7 — Student Attempt Integration
- [x] Phase 8 — Policy, Storage, And Instructor Alignment
- [x] Phase 9 — Rollout And Hardening
- [ ] Test Plan
- [x] Final Documentation Review

### Implementation Status As Of 2026-04-22

- Support telemetry sandbox now runs a live browser-side MediaPipe workspace with camera preview, overlay, calibration, and telemetry payload preview.
- Shared MediaPipe helper utilities and the backend helper service scaffold are implemented under the existing telemetry contract.
- Student checkup now reuses the support-managed MediaPipe settings for calibration guidance and readiness gating when required.
- Student attempt now starts MediaPipe as an additional AI runtime and emits supported events through the existing telemetry ingestion path.

## Product Understanding

The intended product flow is:

1. Build and calibrate MediaPipe inside the support telemetry sandbox.
2. Use that sandbox to control thresholds, capture behavior, confidence rules, overlay/debug behavior, and rollout toggles.
3. Keep the sandbox aligned with the shared telemetry contract so support can see the exact payload shape that later reaches telemetry.
4. Once stable, integrate the same behavior into the student checkup page.
5. After checkup is validated, continue the integration into the student attempt page.
6. Keep all attempt-time logging inside the existing telemetry ingestion flow.

This means the support sandbox is not just a passive settings form. It is the operational foundation for future student integration.

## Public APIs / Interfaces / Types

Important existing interfaces that remain authoritative:

- `packages/shared/src/schema/telemetry/telemetry-schema.ts`
- `packages/shared/src/schema/telemetry/telemetry-settings-schema.ts`
- `packages/shared/src/schema/exams/assessment-schema.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.dto.ts`
- `app/sentinel-api/src/modules/examination/flow/flow.dto.ts`

Planned interface behavior:

- Keep using `TelemetrySettings.mediaPipeSandbox` as the support-managed MediaPipe control contract.
- Keep using `POST /telemetry/events` for production telemetry emission.
- Do not introduce `POST /mediapipe/log`, `GET /mediapipe/log/:sessionId`, or a custom MediaPipe incident model.
- Add internal/backend helper types in `app/sentinel-api/src/modules/infrastructure/mediapipe/` only for:
  threshold evaluation,
  signal classification,
  debounce handling,
  telemetry payload mapping.
- Add frontend runtime-only types for:
  calibration state,
  face visibility state,
  gaze state,
  confidence snapshot,
  preview payload state.

## 1-3-1 Decision Records

### Decision 1: Where the first real MediaPipe sandbox should live

- Problem: We need one place to build, tune, and control MediaPipe before student integration.
- Option A: Build the first sandbox in `sentinel-web`.
- Option B: Build the first sandbox in `sentinel-support`.
- Option C: Build directly in the student checkup page.
- Recommendation: Option B.
- Reason: Your intended product shape is that the support telemetry sandbox is both the building ground and the control plane. That makes support the correct first home.

### Decision 2: How MediaPipe should reach the student flow

- Problem: We need to integrate MediaPipe into student pages without making student pages the source of truth.
- Option A: Build MediaPipe separately again in checkup and attempt.
- Option B: Build it first in support, then reuse the calibrated logic for checkup and attempt.
- Option C: Skip support calibration and go straight to attempt.
- Recommendation: Option B.
- Reason: This keeps support as the preparation layer and reduces student-runtime risk.

### Decision 3: How MediaPipe events should be stored

- Problem: We need MediaPipe-generated events to become part of telemetry.
- Option A: Create a MediaPipe-specific backend log API and storage model.
- Option B: Map MediaPipe signals into the existing telemetry ingestion contract.
- Option C: Store raw landmarks directly for review.
- Recommendation: Option B.
- Reason: The repo already has a telemetry contract, rule system, and storage pipeline. MediaPipe must plug into that system.

## Phase 0 — Baseline Audit And Alignment

### Objective

Confirm the exact repo boundaries and make sure the MediaPipe plan aligns with the current modules before implementation starts.

### Tasks

- [x] Review `docs/mediapipe-integration.md` and rewrite it as an implementation-ready execution doc.
- [x] Audit current telemetry rule keys and AI event types in the shared schema.
- [x] Audit current telemetry settings support page and confirm that `mediaPipeSandbox` already exists as the settings authority.
- [x] Audit current student flow:
  `instruction -> privacy -> checkup -> lobby -> attempt`
- [x] Audit the current attempt runtime telemetry implementation in `use-exam-monitoring` and `web-telemetry-client`.
- [x] Confirm that `app/sentinel-api/src/modules/infrastructure/mediapipe/` is currently empty and should become helper-driven, not route-driven.
- [x] Confirm existing exam gating logic:
  `cameraRequired`,
  `micRequired`,
  `aiRules.*`,
  `runtimeAccess`,
  and student flow storage.

### Acceptance Criteria

- [x] We have one system map showing how support sandbox, telemetry, checkup, and attempt connect.
- [x] No phase assumes a parallel backend model.

## Phase 1 — Support Sandbox As The Primary MediaPipe Building Ground

### Objective

Turn the support telemetry sandbox into the first real MediaPipe workspace, not just a static settings section.

### Tasks

- [x] Expand `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/views/sandbox-view.tsx` from static staged controls into a live MediaPipe sandbox workspace.
- [x] Keep the existing support settings structure, but add a real sandbox area for:
  live camera preview,
  landmark overlay,
  face status,
  gaze status,
  confidence display,
  threshold visualization,
  local preview of the telemetry payload that would be emitted.
- [x] Keep the support page as the place where MediaPipe is tuned and verified first.
- [x] Ensure the sandbox can be used without touching the student pages.
- [x] Clearly separate:
  configuration controls,
  live sandbox preview,
  and rollout readiness notes.
- [x] Keep this page support-only and non-student-facing.

### Acceptance Criteria

- [x] The support page sandbox is the first operational environment for MediaPipe tuning.
- [x] Support can see both settings and live MediaPipe output in the same workflow.

## Phase 2 — MediaPipe Dependency And Frontend Runtime Preparation

### Objective

Install the browser-side MediaPipe dependencies and isolate them behind reusable adapters.

### Tasks

- [x] Add MediaPipe browser dependencies to the workspace that will run the live sandbox first.
- [x] Because the first sandbox now lives in `sentinel-support`, install the runtime dependency there first.
- [x] If later reused by `sentinel-web`, extract reusable adapters into a shared web-side utility layer or duplicate only the thin integration glue as needed.
- [x] Create a MediaPipe runtime adapter for:
  model initialization,
  frame scheduling,
  inference lifecycle,
  cleanup,
  confidence normalization,
  overlay metadata.
- [x] Add browser capability checks and failure handling for:
  denied camera,
  unsupported browser,
  slow initialization,
  missing video stream,
  low-confidence outputs.

### Acceptance Criteria

- [x] The support sandbox can run MediaPipe locally in-browser with controlled lifecycle behavior.
- [x] MediaPipe dependency ownership is explicit and documented.

## Phase 3 — Backend MediaPipe Helper Layer

### Objective

Build the backend-side MediaPipe mapping layer in the infrastructure module so all telemetry mapping rules stay centralized and reusable.

### Tasks

- [x] Implement `app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts`.
- [x] Add helper modules under `services/` for:
  observation classification,
  threshold resolution,
  debounce suppression,
  event mapping,
  payload preview shaping.
- [x] Keep MediaPipe responsibilities narrow:
  no raw media upload,
  no frame storage,
  no public MediaPipe-specific incident API.
- [x] Align supported first-phase signals to existing telemetry events:
  gaze off-screen -> `GAZE_OFF_SCREEN`
  face not visible -> `NO_FACE_DETECTED`
  multiple faces -> `MULTIPLE_FACES`
- [x] Keep `AUDIO_ANOMALY` out of the first MediaPipe phase unless explicitly expanded later.

### Acceptance Criteria

- [x] The backend has a real MediaPipe helper layer.
- [x] Mapping logic is reusable by both support sandbox preview and later student runtime integration.

## Phase 4 — Support Sandbox Controls And Rollout Semantics

### Objective

Make the support sandbox the authoritative control plane for MediaPipe behavior.

### Tasks

- [x] Keep `TelemetrySettings.mediaPipeSandbox` as the persisted control contract.
- [x] Make each existing field operationally meaningful:
  `enabled`
  turns the MediaPipe sandbox feature family on or off.
  `captureDuringCheckup`
  allows later student checkup integration.
  `emitDuringExam`
  allows later student attempt integration.
  `confidenceThreshold`
  defines default confidence floor.
  `frameIntervalMs`
  controls frame sampling cadence.
  `offScreenDurationMs`
  controls first default gaze duration threshold.
  `calibrationRequired`
  controls whether checkup must complete calibration before continuing.
  `debugOverlayEnabled`
  controls overlay visibility in sandbox and future debug-capable student modes.
- [x] Update support UI warnings so the language no longer says these are only inert placeholders if the runtime integration is being actively built.
- [x] Keep full-replace semantics on `PUT /telemetry/settings`.

### Acceptance Criteria

- [x] Support can both tune and govern MediaPipe from one page.
- [x] MediaPipe rollout semantics are explicit and consistent with the stored settings contract.

## Phase 5 — Support Sandbox Event Preview And Telemetry Alignment

### Objective

Ensure the support sandbox previews the exact telemetry shape that student runtime will later use.

### Tasks

- [x] Add local payload preview output to the support sandbox for every supported MediaPipe signal.
- [x] Show:
  event type,
  platform,
  source,
  rule key,
  confidence,
  duration,
  and any aggregation metadata that would apply.
- [x] Support optional dev/test dispatch through the existing telemetry ingestion API only after local preview is shown.
- [x] Reuse existing telemetry definitions from `TELEMETRY_EVENT_DEFINITIONS`.
- [x] Confirm that preview payloads match `ProctoringEventBody`.

### Acceptance Criteria

- [x] The support sandbox validates MediaPipe behavior against the real telemetry contract.
- [x] No custom MediaPipe payload format is introduced.

## Phase 6 — Student Checkup Integration

### Objective

Integrate the calibrated MediaPipe workflow into the student checkup page after the support sandbox is proven.

### Tasks

- [x] Extend the existing student checkup flow rather than replacing it.
- [x] Keep permission acquisition and stream readiness as the first gate.
- [x] If support has enabled MediaPipe sandbox behavior for checkup, start MediaPipe after the stream is ready.
- [x] Reuse the threshold and rollout settings defined in support.
- [x] Add checkup-time outputs for:
  face visibility,
  multiple-face warning,
  gaze calibration guidance,
  confidence snapshot,
  calibration completion.
- [x] If `calibrationRequired` is enabled, make successful calibration part of checkup readiness.
- [x] Keep checkup focused on readiness and calibration, not telemetry persistence by default.
- [x] Only persist telemetry during checkup if that becomes an intentional later policy; default checkup behavior should emphasize calibration and readiness first.

### Acceptance Criteria

- [x] Student checkup can run MediaPipe using the support-defined settings.
- [x] The student cannot be blocked unexpectedly when `cameraRequired` is false or sandbox is disabled.

## Phase 7 — Student Attempt Integration

### Objective

Bring MediaPipe into the live student attempt page after checkup integration is stable.

### Tasks

- [x] Integrate MediaPipe into `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx`.
- [x] Reuse the calibrated thresholds and behavior from the support sandbox.
- [x] Start MediaPipe only when:
  active session exists,
  camera is available,
  MediaPipe sandbox is enabled,
  `emitDuringExam` is enabled,
  related exam AI rule is enabled,
  runtime access allows the attempt.
- [x] Emit only shared telemetry payloads through the existing telemetry client.
- [x] Keep existing web monitoring logic for fullscreen/tab/clipboard unchanged.
- [x] Treat MediaPipe as an additional AI source inside the same attempt runtime.
- [x] Keep UI minimal in v1:
  optional subtle status indicator,
  optional debug overlay only if allowed,
  no new high-friction blocking flow unless explicitly required later.

### Acceptance Criteria

- [x] Attempt-time MediaPipe events flow into the existing telemetry pipeline.
- [x] Existing exam attempt and web telemetry behavior remain intact.

## Phase 8 — Policy, Storage, And Instructor Alignment

### Objective

Ensure MediaPipe-generated student events behave correctly once they enter telemetry and later become visible to monitoring/review flows.

### Tasks

- [x] Verify `TelemetryPolicyService` still acts as the final decision point.
- [x] Ensure support rule overrides and exam configuration both affect MediaPipe-originated events correctly.
- [x] Verify telemetry configuration snapshots still capture the relevant exam settings for AI rules.
- [x] Confirm storage and incident review remain unchanged structurally.
- [x] Document how future instructor monitoring reads the same telemetry records instead of a MediaPipe-only stream.

### Acceptance Criteria

- [x] MediaPipe incidents appear as normal telemetry incidents with correct rule mapping and configuration snapshots.
- [x] No special instructor-only MediaPipe pipeline is needed.

## Phase 9 — Rollout And Hardening

### Objective

Prepare the system for controlled rollout from support sandbox to student runtime.

### Tasks

- [x] Document the rollout sequence:
  support sandbox calibration,
  threshold tuning,
  checkup integration,
  attempt integration.
- [x] Document default starter thresholds and safe rollout values.
- [x] Record noisy scenarios and suppression guidance.
- [x] Add operator guidance for support staff on when to enable:
  sandbox only,
  checkup capture,
  attempt emission,
  calibration required.
- [x] Update the docs so the support sandbox’s role is clearly described as:
  building ground first,
  control plane second,
  student integration source later.

### Acceptance Criteria

- [x] The rollout path is clear and staged.
- [x] The support sandbox is explicitly defined as the upstream source for later student integration.

## Test Plan

### Backend Tests

- [x] Add tests for MediaPipe helper logic:
  mapping,
  confidence filtering,
  duration thresholds,
  multiple-face detection handling,
  unsupported observation suppression.

### Telemetry Pipeline Tests

- [x] Add telemetry ingestion tests proving MediaPipe-generated payloads obey:
  telemetry global enable switch,
  rule overrides,
  exam configuration gating.

### Support UI Tests

- [x] Add support UI tests for:
  sandbox controls,
  warning states,
  payload preview rendering,
  save/update behavior.

### Manual Support Sandbox QA

- [ ] Validate single face scenario.
- [ ] Validate face missing scenario.
- [ ] Validate multiple faces scenario.
- [ ] Validate low light scenario.
- [ ] Validate denied camera scenario.
- [ ] Validate overlay on/off behavior.
- [ ] Validate threshold tuning behavior.

### Student Checkup Tests

- [x] Validate calibration readiness behavior.
- [x] Validate camera-required gating.
- [x] Validate calibration-required gating.
- [x] Validate sandbox disabled behavior.

### Student Attempt Tests

- [x] Validate event emission only when allowed.
- [x] Validate no duplicate custom pipeline is introduced.
- [x] Validate cleanup on navigation and submit.

## Final Documentation Review

- [x] Confirm the support sandbox is described as the first MediaPipe building ground.
- [x] Confirm the support sandbox is described as the MediaPipe control plane.
- [x] Confirm student checkup and attempt integration are described as downstream phases.
- [x] Confirm no section implies a separate MediaPipe logging backend.
- [x] Confirm all tasks and acceptance criteria remain aligned with existing telemetry and examination modules.

## Assumptions And Defaults

- The support telemetry sandbox is the first real MediaPipe build surface.
- Student pages consume calibrated behavior later; they do not define the primary MediaPipe design.
- `MediaPipe` remains a telemetry-aligned integration, not a new proctoring backend.
- No raw video, raw frames, or raw landmarks are stored in the database in v1.
- First implementation scope is gaze and face detection only.
- The support page remains the main place to control MediaPipe rollout.
