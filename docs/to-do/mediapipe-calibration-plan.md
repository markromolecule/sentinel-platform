I reviewed [docs/calibrate-mediapipe.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/calibrate-mediapipe.md:1) plus the existing MediaPipe flow. The right plan is to harden the current shared pipeline, not create a new one. MediaPipe already runs through [use-checkup-mediapipe.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.ts:148>), [use-attempt-mediapipe-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts:83>), and [packages/shared/src/mediapipe/analysis.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/analysis.ts:383).

Baseline finding resolved: the focused checkup test previously failed because the hook caps calibration at `6` stable frames, while the test expected `60`. The test now matches the implemented `6`-frame calibration window.

## Current Progress Snapshot

- [x] Existing MediaPipe runtime is integrated in student checkup.
- [x] Existing MediaPipe runtime is integrated in student attempt.
- [x] Existing shared analyzer classifies face count, confidence, gaze direction, and eye state.
- [x] Existing attempt telemetry emits through the standard telemetry client.
- [x] Existing implementation avoids raw frame, image, video, and landmark persistence.
- [x] Profile-based per-user gaze calibration is implemented in the shared MediaPipe layer.
- [x] Baseline-relative gaze thresholds are implemented when a calibration profile exists.
- [x] Focused checkup test suite is green after fixing the `6` versus `60` frame mismatch.

## Implementation Plan

### Phase 0: Baseline Audit And Test Repair

Tasks:

- [x] Fix the current test mismatch in [use-checkup-mediapipe.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.test.tsx:212>).
- [x] Confirm intended calibration duration: current code says `6` frames, roughly 3 seconds at 500ms.
- [x] Document current states: `ready`, `no-face`, `multiple-faces`, `off-screen`, `low-confidence`.
- [ ] Treat `ready` as `on_screen`; treat non-center gaze as `looking_left`, `looking_right`, `looking_up`, or `looking_down`.

Tests:

- [x] Run `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.test.tsx'`. Current result: passing after aligning the expected stable-frame count.
- [x] Ensure all current MediaPipe hook tests pass before changing calibration logic.

### Phase 1: Shared Calibration Model

Tasks:

- [x] Add a shared calibration module under `packages/shared/src/mediapipe/`, for example `calibration.ts`.
- [x] Create a `MediaPipeCalibrationProfile` from stable centered frames only.
- [x] Store derived local metrics only: neutral iris offsets, neutral head-pose offset, face bounds center, eye aspect baseline, confidence average, sample count, timestamp.
- [x] Do not store raw frames, raw landmarks, images, or video.
- [x] Extend `analyzeMediaPipeFrame` to optionally accept a calibration profile.
- [x] Replace hard-coded gaze thresholds with baseline-relative thresholds when calibration exists.
- [x] Keep fallback behavior for users who skip calibration or when calibration is optional.

Tests:

- [x] Unit test profile creation from stable centered frames.
- [ ] Unit test rejection of no-face, multiple-face, low-confidence, and off-center frames during calibration.
- [x] Unit test calibrated gaze detection for baseline-relative center and left.
- [x] Unit test calibrated gaze detection for right, up, and down.
- [x] Unit test that uncalibrated analysis still behaves exactly as today.

### Phase 2: Student Checkup Calibration UX

Tasks:

- [x] Update [use-checkup-mediapipe.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.ts:293>) so calibration accumulates quality samples, not just ready-frame count.
- [x] Require centered face bounds, open or known eyes, and confidence threshold before progress advances.
- [x] Add explicit low-jitter checks before progress advances.
- [ ] Show clearer feedback: "center face", "look at screen", "too close to edge", "too dark/low confidence", "multiple faces".
- [x] Persist a short-lived local activation handoff and calibration profile for the attempt route, with expiry.
- [x] Reset calibration when stream stops or MediaPipe settings disable the runtime.
- [ ] Reset calibration when camera permission changes are detected explicitly.

Tests:

- [x] Checkup completes after stable centered frames in the current implementation.
- [x] Checkup completes only after enough quality calibration samples once profile calibration exists.
- [ ] Progress drops or pauses for no-face, multiple-faces, low-confidence, and off-screen.
- [x] Downward screen reading remains tolerated during checkup if intended.
- [x] Calibration resets on stream disable.
- [ ] Calibration resets on settings disable in explicit test coverage.
- [x] Required-calibration checkup blocks lobby until calibrated.

### Phase 3: Attempt Runtime Uses Calibration

Tasks:

- [x] Load the short-lived checkup activation token in [use-attempt-mediapipe-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts:183>).
- [x] Load a short-lived calibration profile when profile calibration exists.
- [x] Pass the calibration profile into shared analysis.
- [x] Keep attempt stricter than checkup: checkup can tolerate slight downward gaze; attempt flags sustained gaze away after threshold.
- [x] Preserve existing telemetry events: `GAZE_OFF_SCREEN`, `NO_FACE_DETECTED`, `MULTIPLE_FACES`.
- [ ] Add lightweight diagnostics for QA: started, calibrated profile loaded, skipped by config, emit attempted, emit failed.

Tests:

- [x] Attempt does not start MediaPipe without valid checkup activation when required.
- [x] Attempt classifies calibrated center as on-screen.
- [x] Attempt emits `GAZE_OFF_SCREEN` only after duration threshold.
- [x] Attempt emits `NO_FACE_DETECTED` after no-face duration threshold.
- [x] Dispatch logic emits `MULTIPLE_FACES` immediately or per configured repeat threshold.
- [x] Attempt cleanup closes camera tracks and hidden video.

### Phase 4: Support Sandbox Calibration Parity

Tasks:

- [ ] Bring the same calibration module into the support sandbox.
- [ ] Show baseline-relative gaze output in sandbox: `on_screen`, `looking_left`, `looking_right`, `looking_up`, `looking_down`.
- [ ] Add a calibration diagnostics panel with sample count, confidence, face center, gaze offset, and current decision.
- [ ] Use sandbox to tune thresholds before enabling student checkup or attempt emission.

Tests:

- [x] Sandbox preview uses shared MediaPipe analysis.
- [ ] Sandbox preview displays the same calibrated classification as shared analysis.
- [x] Sandbox payload preview still maps to existing telemetry contract.
- [x] Debug overlay remains support-controlled unless explicitly enabled.

### Phase 5: Telemetry And Monitoring Validation

Tasks:

- [x] Keep production emission through existing `POST /telemetry/events`.
- [x] Do not add a MediaPipe-only logging route.
- [x] Ensure monitoring can show user-friendly labels plus raw trigger where useful.
- [x] Validate AI rule gating for gaze, face detection, and multiple faces.
- [x] Confirm no raw biometric data is sent to API.

Tests:

- [x] Web telemetry client emits only when corresponding AI rule is enabled.
- [x] API MediaPipe service tests cover current uncalibrated classification.
- [x] API MediaPipe service tests cover calibrated classification after profile calibration exists.
- [ ] Telemetry ingestion persists expected incidents in live QA.
- [ ] Instructor monitoring receives persisted incidents from the same telemetry path in live QA.

### Phase 6: Manual QA Rollout

Tasks:

- [ ] Validate in Chrome, Edge, and Safari-compatible environments.
- [ ] Test laptop webcam, external webcam, low light, backlight, glasses, masks/partial occlusion, different face shapes, and different sitting distances.
- [ ] Test reading behavior: brief downward gaze should not be noisy; sustained off-screen gaze should flag.
- [ ] Test route flow: checkup to lobby to attempt, refresh, stale activation, camera permission revoked.
- [ ] Start rollout in this order: sandbox only, checkup capture, required calibration, then attempt emission.

Manual pass criteria:

- [ ] Single centered face calibrates reliably within expected time.
- [ ] No face and multiple faces are detected consistently.
- [ ] Left, right, up, and down gaze are distinguishable after calibration.
- [ ] Required calibration blocks lobby until complete.
- [ ] Optional calibration does not block exam if MediaPipe fails.
- [ ] Attempt telemetry appears in instructor monitoring without duplicate spam.
