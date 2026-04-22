# MediaPipe Student Rollout Status

## Goal

- [x] Use one MediaPipe monitoring path from student `checkup` through `attempt`.
- [x] Keep support telemetry sandbox as the rollout control plane.
- [x] Keep MediaPipe persistence inside the existing telemetry ingestion and instructor review flow.
- [x] Avoid a second MediaPipe-only backend route, raw frame upload path, or landmark persistence model.

## Current Repo State

The student rollout is no longer unimplemented. MediaPipe is already integrated across the shared,
backend, support, and student layers:

- [x] Shared runtime and payload helpers live in `packages/shared/src/mediapipe/index.ts`.
- [x] Backend MediaPipe helper composition lives in `app/sentinel-api/src/modules/infrastructure/mediapipe`.
- [x] Student checkup runtime lives in `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.ts`.
- [x] Student attempt runtime lives in `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts`.
- [x] Student exam detail already includes `mediaPipeSandbox` from the API.
- [x] Student attempt emissions already use `POST /telemetry/events`.
- [x] `@mediapipe/tasks-vision` is already installed in both `app/sentinel-support` and `app/sentinel-web`.

## Architecture Lock

- [x] Canonical student flow remains `instruction -> privacy -> checkup -> lobby -> attempt -> result`.
- [x] `TelemetrySettings.mediaPipeSandbox` remains the support-managed rollout contract.
- [x] Student pages consume support-managed MediaPipe settings. They are not the source of truth.
- [x] Supported v1 MediaPipe student signals remain:
    - [x] `GAZE_OFF_SCREEN`
    - [x] `NO_FACE_DETECTED`
    - [x] `MULTIPLE_FACES`
- [x] `AUDIO_ANOMALY` remains outside the MediaPipe student rollout.

## Phase Checkpoints

### Phase 0 - Documentation Alignment

- [x] Replace the old "fully unimplemented" framing with a repo-accurate rollout status.
- [x] Record the already-implemented shared, backend, support, and student MediaPipe surfaces.
- [x] Capture the split between completed code work and remaining manual rollout work.

### Phase 1 - Student Lifecycle Locking

#### Checkup

- [x] Checkup MediaPipe starts only when camera stream access is active.
- [x] Checkup remains readiness-only and does not emit telemetry incidents.
- [x] Checkup exposes calibration progress, face visibility, gaze guidance, eye state, and confidence.
- [x] Lobby readiness is gated by MediaPipe calibration whenever student checkup capture is active.
- [x] Student checkup auto-bridges MediaPipe calibration into the later attempt only while the support-managed sandbox is enabled, preventing the student flow from implying exam-time rollout when the backend switch is off.
- [x] Calibration state resets when MediaPipe is disabled or the stream stops.

#### Lobby

- [x] Lobby remains free of route-local MediaPipe capture.
- [x] Lobby continues to act as readiness confirmation and entry into the exam session.

#### Attempt

- [x] Attempt MediaPipe starts only when a real exam session id exists.
- [x] Attempt MediaPipe respects runtime access gating.
- [x] Attempt MediaPipe requires camera-backed monitoring and attempt-time rollout enablement.
- [x] Attempt reacquires its own stream instead of sharing the checkup stream across routes.
- [x] Attempt MediaPipe stops on cleanup and route exit.
- [x] Attempt startup failure no longer leaves the camera stream open.
- [x] Attempt UI now shows a non-blocking warning if MediaPipe fails while the rest of the exam continues.

### Phase 2 - Shared Runtime Contract

- [x] `analyzeMediaPipeFrame` remains the shared frame analysis entrypoint.
- [x] `isMediaPipeRuntimeEnabled` remains the shared runtime gate.
- [x] `resolveMediaPipeThresholds` remains the shared threshold resolver.
- [x] `evaluateMediaPipeSignalDispatch` remains the shared dispatch suppression layer.
- [x] Shared payload shaping remains in the shared layer.
- [x] Route-local hooks do not duplicate the core MediaPipe signal analysis logic.

Hardening completed in this pass:

- [x] Immediate signals now emit once per continuous run instead of every analyzed frame.
- [x] Repeat-threshold dispatch is now supported in the shared dispatcher.
- [x] Signal suppression is scoped to the active signal instead of leaking `lastEmittedAtMs` across different signals.

### Phase 3 - Backend Helper Alignment

- [x] `MediaPipeService` remains helper-driven only.
- [x] Threshold resolution, classification, suppression, and payload mapping remain centralized under the infrastructure MediaPipe module.
- [x] Backend output remains aligned to the shared telemetry contract.
- [x] No MediaPipe-only public logging route was reintroduced.
- [x] No landmark persistence or frame upload endpoint was introduced.

### Phase 4 - Student Checkup Hardening

- [x] Checkup enablement remains tied to support rollout plus exam configuration.
- [x] Calibration progresses only on stable `ready` frames.
- [x] Calibration resets on disable and stream shutdown.
- [x] No-face and multiple-face states are surfaced explicitly in the student UI.
- [x] MediaPipe failure keeps checkup usable when calibration is optional.
- [x] Overlay rendering remains tied to `debugOverlayEnabled`.
- [x] Low-confidence frames do not mark the student calibrated.

### Phase 5 - Student Attempt Hardening

- [x] Attempt MediaPipe starts only after session bootstrap has produced a real session id.
- [x] Attempt MediaPipe does not start in blocked runtime states.
- [x] Attempt MediaPipe does not start when camera monitoring is not required.
- [x] Attempt MediaPipe failure does not block the main exam runtime.
- [x] Existing browser security monitoring remains active even if MediaPipe fails.
- [x] Duplicate suppression prevents noisy repeat emissions.
- [x] Gaze signal dispatch still respects duration-threshold behavior.
- [x] Hidden video lifecycle is cleaned up during teardown.
- [x] Camera tracks are closed during cleanup and startup-failure teardown.

### Phase 6 - Telemetry And Monitoring Alignment

- [x] Attempt-time MediaPipe emission stays inside `emitMediaPipeTelemetryEvent`.
- [x] MediaPipe event gating remains tied to the current exam AI rule configuration.
- [x] MediaPipe payloads remain aligned to the existing telemetry event definitions.
- [x] Incidents still flow through the standard telemetry ingestion path.
- [x] Instructor monitoring continues to consume the same telemetry-backed incident stream.
- [x] No parallel instructor-only MediaPipe stream was introduced.

### Phase 7 - Rollout Sequence

The code path is ready for staged rollout, but the operational rollout steps still need manual QA:

- [ ] Stage 1: Support sandbox only
- [ ] Stage 2: Student checkup capture enabled
- [ ] Stage 3: Calibration required if needed
- [ ] Stage 4: Attempt emission enabled

## Test Coverage Added Or Expanded

### Backend and shared alignment

- [x] `app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.test.ts`
    - [x] Low-confidence single-face classification
    - [x] No-face classification
    - [x] Multiple-face classification
    - [x] Off-screen gaze classification
    - [x] Closed-eye off-screen classification
    - [x] Threshold override behavior
    - [x] Duration-threshold suppression
    - [x] Null-signal reset behavior
    - [x] Immediate-signal duplicate suppression
    - [x] Repeat-threshold behavior
    - [x] Preview/runtime payload mapping

### Student checkup

- [x] `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.test.tsx`
    - [x] Sandbox-disabled behavior
    - [x] Calibration-required lobby lock behavior
- [x] `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.test.tsx`
    - [x] Startup with active stream
    - [x] No-start without stream
    - [x] Cleanup on disable
    - [x] Calibration progression on stable frames
    - [x] Initialization failure recovery

### Student attempt

- [x] `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.test.tsx`
    - [x] Enabled startup path
    - [x] Disabled `emitDuringExam`
    - [x] Blocked runtime access
    - [x] Disabled camera requirement
    - [x] Duration-threshold emission for gaze monitoring
    - [x] Duplicate suppression inside the threshold window
    - [x] Cleanup on unmount
    - [x] Cleanup on startup failure
- [x] `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.test.tsx`
    - [x] MediaPipe status rendering
    - [x] Non-blocking MediaPipe failure messaging while exam content stays visible

### Session and payload flow

- [x] `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.test.tsx`
    - [x] Preserve valid stored session
    - [x] Clear invalid stored session
    - [x] Start session creation when runtime access allows it
    - [x] Avoid auto-start when startup is blocked
- [x] `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client.test.ts`
    - [x] AI rule gating
    - [x] Shared payload shaping
    - [x] Disabled and enabled emission behavior

### API mapping and settings defaults

- [x] `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.test.ts`
    - [x] Student exam detail carries `mediaPipeSandbox`
- [x] `app/sentinel-api/src/modules/telemetry/settings/telemetry-settings-resolver.service.test.ts`
    - [x] Default `mediaPipeSandbox` contract stays stable when no persisted settings row exists

## Validation Executed On 2026-04-22

- [x] `pnpm --dir app/sentinel-web exec vitest run src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.test.tsx src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.test.tsx src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.test.tsx src/app/(protected)/student/exam/[id]/attempt/page.test.tsx src/app/(protected)/student/exam/[id]/checkup/page.test.tsx src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client.test.ts`
- [x] `pnpm --dir app/sentinel-api exec vitest run src/modules/infrastructure/mediapipe/mediapipe.service.test.ts src/modules/examination/exams/services/map-exam-response.test.ts src/modules/telemetry/settings/telemetry-settings-resolver.service.test.ts`

## Remaining Manual QA

- [ ] Verify support sandbox can preview all three MediaPipe v1 signal types on real devices.
- [ ] Verify student checkup starts after camera permission is granted in Chrome, Edge, and Safari-compatible environments.
- [ ] Verify optional-calibration exams remain passable when MediaPipe initialization fails.
- [ ] Verify required-calibration exams keep the lobby locked until stable calibration completes.
- [ ] Verify attempt-time MediaPipe emission on a small rollout cohort before enabling it broadly.
- [ ] Keep `debugOverlayEnabled` off outside controlled verification.
