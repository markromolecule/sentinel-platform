# MediaPipe Integration Execution Guide

## Goal

Use the support telemetry sandbox as the primary MediaPipe build surface for gaze and face
detection, then reuse that calibrated runtime in the student `checkup -> attempt` flow without
creating a second telemetry pipeline.

## Scope

MediaPipe in Sentinel is an extension of the existing telemetry and examination runtime.

It must stay aligned with:

- `app/sentinel-api/src/modules/infrastructure/mediapipe`
- `app/sentinel-api/src/modules/telemetry`
- `app/sentinel-api/src/modules/examination`
- `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/views/sandbox-view.tsx`

## Current Implementation Map

### Support sandbox

- `sentinel-support` owns the first live MediaPipe runtime.
- The sandbox provides:
    - live camera preview
    - landmark overlay
    - face and gaze interpretation
    - confidence and calibration state
    - local telemetry payload preview
    - optional dry-run dispatch through `POST /telemetry/events`

### Shared runtime helpers

- `packages/shared/src/mediapipe/index.ts` is the shared browser and contract utility layer.
- It owns:
    - frame analysis
    - gaze estimation
    - confidence normalization
    - threshold resolution
    - signal dispatch suppression
    - payload shaping
    - runtime enablement checks

### Backend helper layer

- `app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts`
- `app/sentinel-api/src/modules/infrastructure/mediapipe/services/*`

This backend layer remains helper-driven:

- no MediaPipe-specific public logging route
- no raw frame upload
- no landmark persistence
- no separate MediaPipe incident model

### Student checkup

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.ts`

Checkup reuses support-managed settings for:

- runtime enablement
- calibration requirement
- overlay behavior
- frame interval
- confidence threshold

Checkup stays readiness-focused by default and does not persist MediaPipe telemetry.

### Student attempt

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client.ts`

Attempt runtime starts MediaPipe only when:

- an active exam session exists
- camera-backed attempt monitoring is allowed
- the sandbox is enabled
- `emitDuringExam` is enabled
- the relevant AI rule is enabled in exam configuration
- runtime access allows the attempt

When enabled, MediaPipe emits only shared telemetry payloads through the existing telemetry client.

## Supported v1 signals

MediaPipe currently maps to the existing telemetry contract for:

- `GAZE_OFF_SCREEN`
- `NO_FACE_DETECTED`
- `MULTIPLE_FACES`

`AUDIO_ANOMALY` remains outside the MediaPipe rollout and stays under the separate audio rule path.

## Phase-by-Phase Execution Stops

These are the intended stop points that keep rollout staged and reviewable.

### Phase 1 stop: support sandbox works locally

Before moving on:

- MediaPipe runs in `sentinel-support`
- support can launch and stop the sandbox
- live preview and overlay work
- payload preview reflects the shared telemetry contract

### Phase 2 stop: dependency and runtime ownership are explicit

Before moving on:

- `@mediapipe/tasks-vision` is installed where the runtime first lives
- browser capability failures are surfaced
- MediaPipe lifecycle is isolated behind reusable helpers

### Phase 3 stop: backend helper layer exists

Before moving on:

- threshold logic is centralized
- signal classification is centralized
- payload preview shaping is centralized
- no MediaPipe-only storage path is introduced

### Phase 4 stop: support settings control rollout

Before moving on:

- `TelemetrySettings.mediaPipeSandbox` is the stored contract
- rollout flags and thresholds are operational
- support warnings and page language reflect the real runtime

### Phase 5 stop: preview is contract-aligned

Before moving on:

- support can inspect the real payload shape
- preview uses the same event definitions and rule keys as student runtime
- optional dry-run dispatch is available only after the preview is visible

### Phase 6 stop: checkup is guidance-first

Before moving on:

- checkup runs MediaPipe only when support rollout and exam policy allow it
- readiness reflects calibration and camera state
- UI exposes face visibility, multiple-face warnings, gaze guidance, confidence, and calibration completion
- no default telemetry persistence is introduced during checkup

### Phase 7 stop: attempt runtime emits through existing telemetry

Before moving on:

- attempt emission uses `/telemetry/events`
- existing fullscreen, tab, clipboard, and browser monitoring remain intact
- MediaPipe behaves as an additional AI source, not a second runtime

### Phase 8 stop: telemetry and instructor review stay unified

Before moving on:

- `TelemetryPolicyService` remains the final decision point
- support overrides and exam configuration still gate MediaPipe events
- storage still writes into `flagged_incidents`
- instructor monitoring and review continue reading the same telemetry-backed incident records

There is no separate instructor-only MediaPipe stream. Future instructor views should continue to
query telemetry incidents by rule key, source, platform, and incident type.

### Phase 9 stop: rollout guidance is documented

Before moving on:

- support knows the order of activation
- default starter values are documented
- noisy scenarios and suppression guidance are documented
- operator guidance exists for each rollout flag

## Rollout Sequence

Use this order and stop after each stage long enough to validate results:

1. Sandbox only
2. Checkup capture enabled
3. Calibration required if needed
4. Attempt emission enabled

Do not jump directly from inactive settings to live exam emission unless the sandbox and checkup
results are already stable.

## Default Starter Values

These are the current conservative starter settings from the shared telemetry defaults:

- `confidenceThreshold`: `0.80`
- `frameIntervalMs`: `500`
- `offScreenDurationMs`: `3000`
- `captureDuringCheckup`: `false`
- `emitDuringExam`: `false`
- `calibrationRequired`: `false`
- `debugOverlayEnabled`: `false`

Recommended rollout posture:

- Start with sandbox only.
- Enable checkup capture before attempt emission.
- Require calibration only after the checkup signal looks stable across a few devices and lighting
  conditions.
- Keep debug overlay off outside support verification and controlled testing.

## Noisy Scenarios And Suppression Guidance

Watch for these before widening rollout:

- low light or backlighting causing unstable face confidence
- camera framing too close to viewport edges
- multiple people passing briefly through the background
- low-resolution or laggy cameras causing jitter between `ready` and `no-face`
- students looking down briefly while reading or writing

Use these mitigations first:

- raise `offScreenDurationMs` if gaze events are too chatty
- keep `confidenceThreshold` conservative when poor framing causes false positives
- validate multiple-face behavior in the sandbox before enabling live exam emission
- use checkup as the first rollout stage for calibration tuning instead of pushing changes directly to attempts

## Operator Guidance

### Enable sandbox only

Use when:

- validating device/browser compatibility
- tuning thresholds
- checking overlay behavior
- reviewing payload shape with no student runtime impact

### Enable checkup capture

Use when:

- support wants readiness and calibration guidance in student checkup
- the sandbox already behaves acceptably on the target browsers
- attempt-time persistence is still too risky

### Enable attempt emission

Use when:

- checkup calibration is already stable
- AI rule mappings have been reviewed
- support is ready for incidents to flow into normal telemetry review

### Require calibration

Use when:

- a stable single-face calibration is necessary for readiness
- support has already confirmed that calibration completes reliably on expected devices

Avoid enabling this early if:

- camera access is optional for the exam
- devices frequently stall during initialization
- the sandbox still shows unstable confidence or face visibility readings

## Telemetry And Review Alignment

MediaPipe is intentionally not a second logging backend.

Production emission continues to rely on:

- `POST /telemetry/events`
- `TelemetryIngestionService`
- `TelemetryPolicyService`
- `flagged_incidents`
- the existing telemetry health route
- the existing incident review routes and instructor monitoring queries

That means:

- support tunes the upstream runtime
- student attempt emits shared payloads
- telemetry policy decides whether to persist
- storage persists normal telemetry incidents
- instructor and review surfaces continue reading those same telemetry records

## Constraints

The following remain out of scope for this rollout:

- raw webcam or audio uploads
- persistent landmark storage
- a custom `/mediapipe/*` production logging API
- a MediaPipe-only instructor review feed
- bypassing telemetry rule evaluation for MediaPipe events

## Validation Checklist

Automated coverage should continue to prove:

- helper-layer mapping and threshold behavior
- shared payload contract alignment
- telemetry pipeline behavior under global disable and rule overrides
- support UI payload preview and settings interactions
- student checkup gating behavior
- attempt cleanup and emission gating behavior

Manual QA should still be run before wider rollout for:

- single-face calibration
- no-face detection
- multiple-face detection
- denied camera permissions
- overlay toggling
- low-light behavior
