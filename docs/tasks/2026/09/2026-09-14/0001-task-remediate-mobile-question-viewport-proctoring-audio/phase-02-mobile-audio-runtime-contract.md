---
title: "Phase 2: Mobile Audio Runtime Contract"
type: phase
parent: "0001-task-remediate-mobile-question-viewport-proctoring-audio"
phase: "02"
status: completed
created: "2026-09-14"
tags: [task, phase, mobile, audio, telemetry]
---

# Phase 2: Mobile Audio Runtime Contract

## Objective

Add an isolated, on-device mobile audio classifier that detects speaking using the existing YAMNet taxonomy/configuration, starts only for an active eligible attempt, and exposes only qualified anomaly results to the session layer.

## Dependencies & Prerequisites

- Phase 1 records the question viewport outcome; audio work must not hide an unresolved viewport failure.
- Student access to `GET /settings/audio` is confirmed by `audio-authorization.service.ts`; existing `useAudioSettingsQuery` can supply calibration.
- The Web YAMNet model/taxonomy asset must be deployed from a production-controlled origin usable by the mobile WebView. This is a release blocker, not an amplitude fallback opportunity.

## Impacted Files & Components

- Existing: `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-audio.ts` — checkup-only recorder; do not let it own active-session monitoring.
- Existing: `app/sentinel-mobile/features/exam/lib/mobile-audio-anomaly.ts` — level utility; do not misuse it as semantic speech classification.
- Existing: `app/sentinel-mobile/features/exam/components/checkup/mobile-mediapipe-bridge.tsx` and `mobile-mediapipe-bridge-html.ts` — reference for a hidden, non-interactive WebView bridge, not a shared responsibility target.
- Existing: `packages/hooks/src/query/audio/use-audio-settings-query.ts`, `packages/services/src/api/audio.ts`, and `packages/shared/src/audio/audio-anomaly.ts` — shared calibration/taxonomy contract.
- Existing web reference: `app/sentinel-web/src/workers/audio-anomaly-engine.ts` and `app/sentinel-web/src/hooks/use-audio-anomaly-worker/`.
- Proposed new: `app/sentinel-mobile/features/exam/components/monitoring/mobile-audio-bridge.tsx` and `mobile-audio-bridge-html.ts` — isolated microphone/classifier bridge.
- Proposed new: `app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.ts` and focused tests — React Native lifecycle and qualified-event boundary.

## Implementation Tasks

- [x] Define the bridge message contract for status/error, model-ready, and qualified `{ anomalyType, confidenceScore, detectedAt }` results; never return PCM/audio buffers to React Native or the API.
- [x] Load the same approved YAMNet model version and shared anomaly mapping as Web, respecting `enabledAnomalyTypes`, thresholds, consecutive frames, and per-type cooldowns from `useAudioSettingsQuery`.
- [x] Mount the bridge only when the active attempt has `audio_anomaly_detection` enabled, microphone requirements allow it, an authenticated session/student exists, and calibration is ready; release microphone/model resources on unmount, submission, or disablement.
- [x] Surface a bounded operational state for denied permission/model load failure. Continue the exam without audio monitoring; never silently replace classifier failure with a volume-based `TALKING` event.
- [x] Add deterministic bridge/hook tests for enablement, config propagation, qualified trigger, cooldown, cleanup, denied permission, and model failure.

## Execution Evidence Log

- **Components & Hooks Implemented:**
  - `features/exam/components/monitoring/mobile-audio-bridge.types.ts`: typed message contract (`AudioBridgeStatus`, `AudioBridgeError`, `QualifiedAudioAnomaly`, `BridgeInboundMessage`, `BridgeOutboundMessage`).
  - `features/exam/components/monitoring/mobile-audio-bridge-html.ts`: standalone HTML generator hosting TensorFlow.js YAMNet CPU inference, 16 kHz linear resampling, buffer accumulation (15,600 samples), shared anomaly taxonomy mapping, and streak/cooldown trigger evaluation.
  - `features/exam/components/monitoring/mobile-audio-bridge.tsx`: isolated React Native WebView component managing bridge lifecycle, bidirectional postMessage synchronization, and forwarding qualified anomaly events without audio payloads.
  - `features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.ts`: lifecycle hook providing enablement gating, shared calibration via `useAudioSettingsQuery()`, and graceful error handling.
- **Verification evidence:**
  - Command: `pnpm --filter sentinel-mobile exec vitest run features/exam/components/monitoring/mobile-audio-bridge.test.tsx features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.test.ts features/exam/lib/mobile-audio-anomaly.test.ts features/exam/lib/mobile-telemetry-client.test.ts` (PASS: 4 files / 30 tests passed).
  - Command: `pnpm --filter sentinel-mobile exec tsc --noEmit` (PASS: Exited 0).
  - Command: `pnpm --filter sentinel-mobile test` (PASS: 53 files / 382 tests passed).
  - Command: `git diff --check -- app/sentinel-mobile` (PASS: Exited 0).

## Verification & Testing

- Passed: `pnpm --filter sentinel-mobile exec vitest run features/exam/components/monitoring/mobile-audio-bridge.test.tsx features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.test.ts features/exam/lib/mobile-audio-anomaly.test.ts features/exam/lib/mobile-telemetry-client.test.ts` (PASS: 4 files / 30 tests passed).
- Passed: `pnpm --filter sentinel-mobile exec tsc --noEmit` — exited 0 (2026-09-14).
- Passed: `pnpm --filter sentinel-mobile test` — 53 files / 382 tests passed (2026-09-14).
- On a real device, test spoken voice, non-speech ambient sound, permission denial, route/session exit, and model-unavailable behavior; confirm no audio file/network payload is created.

## Risks & Rollback

- Risk: model asset load, WebView microphone behavior, battery/CPU use, or device constraints differ from Web. Mitigate with explicit bridge status, one model lifecycle owner, frame/cooldown limits, and physical-device QA.
- Rollback: unmount/disable the new bridge through the existing rule/configuration gate; the attempt and all non-audio proctoring remain usable.
