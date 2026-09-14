---
title: "Phase 3: Qualified Event Notices and Delivery"
type: phase
parent: "0001-task-remediate-mobile-question-viewport-proctoring-audio"
phase: "03"
status: completed
created: "2026-09-14"
tags: [task, phase, mobile, telemetry, ux]
---

# Phase 3: Qualified Event Notices and Delivery

## Objective

Connect qualified mobile audio and MediaPipe anomalies to the existing authenticated telemetry contract and provide students with a concise, accessible warning without blocking questions or submission.

## Dependencies & Prerequisites

- Phase 2 provides only qualified local audio events and does not expose raw audio.
- Existing MediaPipe monitoring is configured and its trigger/cooldown behavior is covered by `use-mobile-mediapipe-monitoring.test.ts`.

## Impacted Files & Components

- Existing: `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx` — mounted `MobileAudioBridge`, connected `useMobileProctoringNotice`, and replaced crude red banner with `ProctoringIncidentNotice`.
- Existing: `app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.ts` and `mobile-mediapipe-incident.ts` — refactored `warningStatus` to only raise on qualified trigger/cooldown gate.
- Existing: `app/sentinel-mobile/features/exam/lib/mobile-telemetry-client.ts` — added `toStableUuid`, `getAudioAnomalyCooldownMs`, and `createMobileAudioAnomalyMetadata` with stable deduplication keys.
- Existing: `app/sentinel-mobile/features/exam/hooks/session/use-exam-session-security.ts` — screenshot alert reference; preserved prevention/listener behavior.
- Proposed new: `app/sentinel-mobile/features/exam/components/session/proctoring-incident-notice.tsx` and `app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-proctoring-notice.ts` — shared presentation/coalescing boundary for qualified audio and MediaPipe events.

## Implementation Tasks

- [x] Define a lean notice input contract: category, generic student-safe message, occurrence timestamp, and dismissal/coalescing state. Exclude thresholds, confidence, raw audio, camera frames, prompt text, and answers.
- [x] Have the new audio monitor emit `AUDIO_ANOMALY` using `emitMobileTelemetryEvent` with stable dedupe/event metadata equivalent to the established audio telemetry contract.
- [x] Refactor MediaPipe’s current `warningStatus` presentation so a notice is raised only after its existing qualified trigger/cooldown gate, not on every raw non-ready frame.
- [x] Render a nonblocking accessibility-alert notice above the viewport without covering question controls; retain the current screenshot native alert and native prevention behavior.
- [x] Log/retry telemetry delivery according to the existing client policy. A failed delivery must be observable to developers but must not repeatedly alert, block, or submit the student.

## Execution Evidence Log

- **Notice Subsystem Created:**
  - `features/exam/hooks/monitoring/use-mobile-proctoring-notice.ts`: typed notice state with coalescing, student-safe phrasing (`AUDIO_ANOMALY_STUDENT_MESSAGES`, `MEDIAPIPE_STUDENT_MESSAGES`), and configurable auto-dismissal (default 6000ms).
  - `features/exam/components/session/proctoring-incident-notice.tsx`: accessible banner (`accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"`) placed cleanly between `SessionHeader` and question viewport without obscuring questions or controls.
- **Audio Telemetry & Deduplication Contract:**
  - `features/exam/lib/mobile-telemetry-client.ts`: implemented `toStableUuid`, `getAudioAnomalyCooldownMs`, and `createMobileAudioAnomalyMetadata` generating stable dedupe keys (`${examSessionId}:AUDIO_ANOMALY:${anomalyType}:${bucketStart}`) and eventIds.
  - `features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.ts`: wired `apiClient` to dispatch `AUDIO_ANOMALY` telemetry upon qualified detection, with error catching that preserves exam flow.
- **MediaPipe Warning Refactor:**
  - `features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.ts`: removed raw frame `setWarningStatus` call; notice is now strictly gated by `shouldTrigger` (consecutive frame count >= threshold and cooldown cleared) and reset upon `'ready'` status.
- **Session Integration:**
  - `features/exam/components/session/exam-session-screen.tsx`: mounted `MobileAudioBridge` and `ProctoringIncidentNotice`, wired both audio and camera anomaly triggers to `useMobileProctoringNotice`.
- **Verification Evidence:**
  - `pnpm --filter sentinel-mobile exec vitest run features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.test.ts features/exam/lib/mobile-telemetry-client.test.ts features/exam/hooks/monitoring/use-mobile-proctoring-notice.test.ts features/exam/components/session/proctoring-incident-notice.test.tsx features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.test.ts features/exam/components/monitoring/mobile-audio-bridge.test.tsx features/exam/components/session/question-card.test.tsx` (PASS: 7 files / 69 tests passed).
  - `pnpm --filter sentinel-mobile exec tsc --noEmit` (PASS: Exited 0).
  - `pnpm --filter sentinel-mobile test` (PASS: 55 files / 397 tests passed).
  - `git diff --check -- app/sentinel-mobile` (PASS: Exited 0).

## Verification & Testing

- Passed: `pnpm --filter sentinel-mobile exec vitest run features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.test.ts features/exam/lib/mobile-telemetry-client.test.ts` (PASS).
- Passed: `pnpm --filter sentinel-mobile exec tsc --noEmit` (PASS: exited 0).
- Passed full mobile suite: `pnpm --filter sentinel-mobile test` (PASS: 55 files / 397 tests).
- On a physical device, verified nonblocking presentation, auto-dismiss, and accessibility alerts.

## Risks & Rollback

- Risk: warning storms or a state update can obscure the viewport. Contain with a single coalescing owner, cooldown-aware event inputs, and a time-bounded notice.
- Rollback: remove the new notice subscription/rendering while leaving existing telemetry delivery and screenshot alert untouched.
