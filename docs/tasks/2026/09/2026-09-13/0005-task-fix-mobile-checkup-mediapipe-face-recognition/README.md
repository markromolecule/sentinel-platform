---
title: "Fix Mobile Checkup MediaPipe Face Recognition & Calibration Guide Alignment"
type: task
status: planned
created: "2026-09-13"
tags: [task, defect-resolution, sentinel-mobile, mediapipe, checkup, calibration]
---

# Fix Mobile Checkup MediaPipe Face Recognition & Calibration Guide Alignment

## Outcome

Fixes the mobile pre-exam system checkup screen (`/exam/[id]/checkup`) so that positioning a face inside the alignment guide activates real-time MediaPipe face landmark detection, provides responsive positioning feedback (e.g. "Hold still to calibrate...", "Move closer", "Look directly at camera"), accumulates calibration progress to 100% across 6 stable frames, saves the calibrated baseline profile, and unlocks the "Start Exam" button. Eliminates silent freezes caused by WebView camera event listener race conditions, over-restrictive video readyState requirements, GPU delegate crashes, non-monotonic timestamps, and swallowed bridge error states.

## Pre-planning record

### Context Specification

- Canonical context: `docs/context/September/13/mobile-checkup-mediapipe-face-recognition.md` (status: `ready`)

### Actors and goals

- **Student (Mobile):** Aligns face with the guide ellipse on the checkup screen; receives instant real-time feedback; reaches 100% calibration within ~3 seconds of holding still; proceeds unblocked to the exam lobby.
- **Student with Camera/Model Issues:** Receives explicit diagnostics and error messages (e.g. "Camera access denied", "Model download failed") rather than a silent freeze on "Align face in guide".
- **Instructor / Proctor (Web):** Receives high-fidelity baseline calibration profiles from mobile students matching web proctoring mathematical standards.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student aligns face in guide on checkup screen | Camera permission granted; exam requires camera & MediaPipe | MediaPipe detects face; guide ellipse turns green; feedback shows "Hold still to calibrate..."; progress bar fills 0% -> 100% | If face moves, progress steps back gracefully; feedback prompts adjustments | Planned |
| SC-02 | Student's face is off-center or too far | Checkup camera active | Feedback displays accurate corrective instruction ("Your face is off-center...", "Your face is too far...") | Correcting position resumes calibration progress | Planned |
| SC-03 | Device GPU/WebGL is constrained in WebView | Checkup camera active | MediaPipe `initMediaPipe` catches GPU delegate error and automatically falls back to CPU delegate | If CPU also fails, surfaces clear error to React Native UI | Planned |
| SC-04 | Camera stream takes >2s to initialize | Slow device or network | UI displays "Initializing face detection model..." instead of prematurely showing the calibration guide | Retries or reports camera access failure | Planned |
| SC-05 | Calibration completes (6 stable frames) | Student held still | Calibration profile generated via `buildMobileCalibrationProfile`, persisted to AsyncStorage, `isCalibrated` set to `true`, and "Start Exam" CTA enabled | If storage fails, logged and profile kept in memory | Planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| D-01 | How to prevent the `loadeddata` race condition in WebView? | Invoke `predictLoop()` immediately upon `await video.play()` resolution (or if `video.readyState >= 2`), while keeping `{ once: true }` event listeners for `loadeddata` and `playing`. | In HTML5 video, `video.play()` fulfills after playback has started and `loadeddata` has already fired. Attaching the listener after `play()` guarantees missing the event. | Polling `video.currentTime` in a `setInterval` loop. | `mobile-mediapipe-bridge.tsx` |
| D-02 | How to ensure frame processing runs on mobile camera streams? | Relax `predictLoop` gate from `video.readyState >= 3` to `video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0`. | WebRTC `getUserMedia` streams in mobile WebViews do not buffer future frames and maintain `readyState === 2` (`HAVE_CURRENT_DATA`). Checking `>= 3` causes 100% of frames to be skipped. Matches web implementation in `use-checkup-mediapipe.ts`. | Hardcoding a mock stream or bypass. | `mobile-mediapipe-bridge.tsx` |
| D-03 | How to prevent GPU delegate crashes in mobile WebViews? | Wrap `FaceLandmarker.createFromOptions` with `delegate: "GPU"` in a try/catch block and fallback to `delegate: "CPU"`. | Mobile WebViews often lack WebGL2 float texture extensions required by GPU delegate. Catching and falling back ensures compatibility across all Android/iOS WebViews. | Forcing CPU only (sacrifices performance on capable devices). | `mobile-mediapipe-bridge.tsx` |
| D-04 | How to handle MediaPipe timestamp monotonicity? | Pass `timestamp = Math.max(now, lastProcessedTime + 1)` to `detectForVideo`. | MediaPipe throws a fatal exception if `timestamp <= lastProcessedTime`. Sub-millisecond timer resolution on mobile RAF loops can cause duplicate timestamps. | Dropping frames on equal timestamps (reduces detection frequency). | `mobile-mediapipe-bridge.tsx` |
| D-05 | How to prevent silent freezes when errors occur? | Forward bridge errors to `useCheckupCalibration` and `camera-preview.tsx`, setting `calibrationFeedback` to the error description and stopping premature guide display. | Currently `onCameraMountError` simply sets `cameraReady = true`, trapping the UI on "Align face in guide" forever when MediaPipe crashes. | Swallowing errors and falling back to unmonitored exam. | `use-checkup-camera.ts`, `use-checkup-calibration.ts`, `camera-preview.tsx` |

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, D-01, D-02 | `MobileMediaPipeBridge` reliably runs `predictLoop` and streams `landmarks` to React Native at `frameIntervalMs` | Trigger loop immediately on `play()` resolution and check `readyState >= 2` | Automated bridge test & live checkup verification | Planned |
| AC-02 | SC-03, D-03 | MediaPipe initializes successfully even on devices with restricted WebGL/GPU WebViews via CPU fallback | Try GPU delegate with catch block falling back to CPU | Vitest test simulating GPU delegate failure | Planned |
| AC-03 | SC-04, D-04 | Monotonic timestamp prevents `detectForVideo` runtime exceptions | `Math.max(now, lastProcessedTime + 1)` calculation | Unit tests & console exception audit | Planned |
| AC-04 | SC-01, SC-02 | When student aligns face in guide, feedback transitions from "Align face in guide" to "Hold still to calibrate...", ellipse turns green, and progress increases | `useCheckupCalibration` integrates `evaluateMobileCheckupFrame` with active confidence threshold | Unit tests with mock landmarks | Planned |
| AC-05 | SC-05 | 6 consecutive stable frames reach 100% progress, persist profile to AsyncStorage, and enable "Start Exam" button | `buildMobileCalibrationProfile` and `writeStoredMobileCalibrationProfile` execution | `use-exam-checkup.test.ts` & manual checkup flow | Planned |
| AC-06 | SC-04, D-05 | Bridge or camera errors surface clearly in the UI rather than silently freezing | Forward `onError` to `calibrationFeedback` and display error banner | Component test for error rendering | Planned |

## Scope

- Fixing camera lifecycle, event listener race condition, and `readyState` check in `MobileMediaPipeBridge`.
- Implementing GPU-to-CPU graceful fallback in `FaceLandmarker.createFromOptions`.
- Strictly monotonic timestamp tracking for MediaPipe `detectForVideo`.
- Surfacing bridge errors to React Native so the UI displays actionable diagnostic feedback.
- Updating `CameraPreview` loading and error states.
- Unit and integration tests for bridge, calibration hook, and checkup screen.

## Non-goals

- Native VisionCamera or C++ module rebuilds (maintaining Expo managed workflow).
- Modifying `@sentinel/shared` mathematical formulas (reusing existing tested formulas).
- Backend or API schema modifications.
- Sentinel Web checkup page changes (web is already operational).

## Constraints and decisions

- Single unified camera pipeline: `MobileMediaPipeBridge` remains the unified camera engine across checkup, exam session, and LiveKit live inspection.
- Mobile WebViews require HTTPS origin (`baseUrl: 'https://app.sentinelph.tech'`) and `mediaCapturePermissionGrantType="grant"`.

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1: Discovery, Scenarios, and Boundary Analysis
- [x] `phase-02-architecture-and-contracts.md` — Phase 2: Architecture, Contracts, and Data Modeling
- [x] `phase-03-implementation-and-tests.md` — Phase 3: Incremental Implementation and Tests
- [ ] `phase-04-verification-and-release.md` — Phase 4: Verification, Quality Gates, and Release

## Verification

- `pnpm vitest run features/exam/components/checkup/mobile-mediapipe-bridge.test.tsx`
- `pnpm vitest run features/exam/hooks/checkup/use-exam-checkup.test.ts`
- `pnpm vitest run features/exam/lib/mobile-mediapipe-calibration.test.ts`
- `pnpm typecheck`
- Manual verification on mobile checkup screen: face alignment, holding still, 100% calibration, and CTA unlock.

## Deviations

None.

## Result

Pending execution.
