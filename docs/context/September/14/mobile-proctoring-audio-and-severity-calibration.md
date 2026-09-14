---
title: "Mobile Proctoring Audio Delivery, Student Warnings, and Severity Calibration"
type: context
status: ready
created: "2026-09-14"
tags: [context, sentinel-mobile, proctoring, audio, mediapipe, telemetry, severity]
feature: "mobile-proctoring-audio-and-severity-calibration"
---

# Mobile Proctoring Audio Delivery, Student Warnings, and Severity Calibration Context Specification

## 1. Overview & Objective

- **Problem Statement:** A populated mobile attempt can show a blank question viewport even though the header and question navigator display the correct count. Separately, speaking during an active mobile exam produces no observed instructor monitoring event. Screenshot events are recorded as `HIGH` on their first occurrence, while the requested policy is a proportionate escalation from low to high across anomaly types.
- **Business / User Value:** Students need a usable attempt view and clear, immediate but non-blocking notice when proctoring records an event. Instructors need credible, consistently calibrated telemetry rather than missing audio incidents or overly severe first-occurrence records.
- **Success Criteria:**
  - A populated mobile attempt visibly renders the current question or an explicit recovery state; it never leaves an unexplained blank viewport.
  - Active-session audio monitoring, when enabled for the exam, produces a deduplicated `AUDIO_ANOMALY` event that reaches the existing instructor monitoring stream.
  - Students receive the same bounded warning treatment for persisted audio and MediaPipe incidents as they do for screenshot detection, without disclosing detector thresholds or evidence details.
  - Screenshot severity and the other in-scope anomaly rules follow an approved low-to-medium-to-high escalation policy with tests for first, repeated, and cooldown-window events.

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student taking a mobile exam, I want the active prompt and answer control to be visible whenever the navigator says questions are available, so that I can complete the attempt.*
- *As a student, I want a concise warning when the exam records an audio or camera-based proctoring anomaly, so that I know the behavior has been logged.*
- *As an instructor, I want active-session speaking anomalies to appear in monitoring with a calibrated severity, so that a single potentially noisy event does not look equivalent to sustained misconduct.*

### Functional Requirements

- [ ] Preserve the existing native-device verification gate for the mobile question viewport; do not classify the count visible in the supplied photograph as proof that the current `QuestionCard` layout repair is installed or works on that device.
- [ ] Start and own microphone metering/anomaly evaluation for the active exam session only when `aiRules.audio_anomaly_detection` and microphone requirements permit it; stop and release it on session exit.
- [ ] Emit audio telemetry through the existing mobile telemetry client with the active attempt, authenticated student identity, rule key, event metadata, debounce/cooldown behavior, and delivery-failure observability.
- [ ] Surface a student warning after a qualifying MediaPipe or audio incident is emitted, using the screenshot notice as the behavioral reference but without blocking answering or revealing detection internals.
- [ ] Replace immediate-high screenshot severity with the approved occurrence ladder and apply the approved scope consistently to comparable anomaly rules.

### Edge Cases & Failure Modes

- A denied microphone permission, unavailable recorder, or telemetry delivery failure must not block question rendering or answer submission; the failure must be inspectable by developers without logging prompt text or audio content.
- Audio events must be suppressed when the exam rule is disabled, the attempt identity is incomplete, or the event is inside its cooldown/deduplication window.
- A screenshot listener may be unavailable on a platform or hardware capture can be blocked; severity handling must cover only events actually persisted.
- An anomaly warning must clear or coalesce predictably so it does not obscure the question viewport or create an alert storm.

## 3. Technical & Architectural Context

- **Question-rendering evidence:** The supplied image shows five questions in both the header and drawer while the body is blank. The active draft investigation at `docs/context/September/13/investigate-mobile-attempt-question-rendering.md` establishes that a non-empty adapted collection reaches `ExamSessionScreen`; its native-device verification remains outstanding. The related working-tree repair and diagnostics are user changes and are not modified by this context work.
- **Audio delivery evidence:** `use-checkup-audio.ts` requests microphone permission and meters audio only during checkup. `use-exam-checkup.ts` stops that recorder before routing to the lobby. The active `ExamSessionScreen` mounts MediaPipe monitoring but no audio monitor, and the only active `AUDIO_ANOMALY` source found is the telemetry client’s rule mapping. This is the current source-level explanation for no observed audio monitoring event; it is not yet a device/runtime reproduction result.
- **MediaPipe notification evidence:** `use-mobile-mediapipe-monitoring.ts` can emit telemetry after its consecutive-frame and cooldown gate. `ExamSessionScreen` shows a red inline warning from `warningStatus` before telemetry delivery is confirmed. A shared student-warning contract must define whether the notice is shown on detector qualification, successful persistence, or both.
- **Screenshot evidence:** `use-exam-session-security.ts` emits `SCREENSHOT_ATTEMPT` and shows a native alert. `incident-severity-resolver.service.ts` makes selected security rules immediate `HIGH`, while other AI rules use `LOW` at 1, `MEDIUM` at 3, and `HIGH` at 6 occurrences in 600 seconds. The user has authorized replacing immediate severity for every current proctoring rule with this ladder. The new ADR supersedes only the severity portion of `2026-08-31-screenshot-detection-and-prevention.md`; screenshot prevention and event attribution remain in force.
- **Affected Domains / Layers:** Sentinel Mobile session monitoring and student feedback; Sentinel API telemetry ingestion/storage and severity resolution; shared telemetry definitions/settings; instructor monitoring consumers. No new persistence model is established by this context.
- **Security & Authorization:** Keep mobile telemetry authenticated and scoped to the active attempt/student. Do not persist audio recordings, raw microphone samples, question text, answers, tokens, or camera content as part of notifications. Preserve existing screenshot prevention and platform permissions.

## 4. UI/UX & Interaction Guidelines

- Use a concise, accessible warning with a generic event category (for example, audio activity or camera attention) and clear auto-dismiss/coalescing behavior.
- Warnings must not use a blocking modal for routine audio or MediaPipe anomalies and must not cover the active prompt or fixed navigation/footer controls.
- Screenshot behavior is the existing notification reference, not a mandate to duplicate its immediate-high severity or disruptive modal style.

## 5. Scope & Boundaries

- **In Scope:** Mobile question-rendering verification coordination; active-session audio detection and event delivery; student warnings for qualified audio and MediaPipe events; a reviewed cross-rule severity escalation policy; affected telemetry tests and instructor-stream verification.
- **Out of Scope / Non-Goals:** Recording or storing student audio; a new instructor monitoring product; changing examination questions/API payloads to solve a native layout failure; weakening screenshot prevention; treating one detector’s event as proof of academic misconduct.

## 6. References & External Context

- Question rendering investigation: `docs/context/September/13/investigate-mobile-attempt-question-rendering.md`.
- Proposed parity decision: `docs/decisions/2026-09-05-mobile-web-exam-runtime-and-telemetry-parity.md`.
- Screenshot decision to be reviewed: `docs/decisions/2026-08-31-screenshot-detection-and-prevention.md`.
- Active session: `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`.
- Checkup-only audio: `app/sentinel-mobile/features/exam/hooks/checkup/use-checkup-audio.ts`.
- MediaPipe telemetry: `app/sentinel-mobile/features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.ts`.
- Mobile security notification: `app/sentinel-mobile/features/exam/hooks/session/use-exam-session-security.ts`.
- Severity policy: `app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts`.

## Resolved Decision & Readiness

- **Severity authority:** The user directed that all current proctoring anomaly categories use the calibrated ladder, including screenshot, print-screen, app-pinning, and root/jailbreak events. No category remains immediate `HIGH` solely because of its rule key.
- **Baseline policy:** Preserve the existing, tested occurrence thresholds as the common default: `LOW` on the first persisted occurrence, `MEDIUM` on the third, and `HIGH` on the sixth, each within a rolling 600-second window. Existing authorized runtime overrides remain able to adjust repeat thresholds without changing the ladder order.
- **ADR boundary:** This is a durable cross-client/server telemetry policy, so the accepted ADR at `docs/decisions/2026-09-14-unified-proctoring-severity-escalation.md` is required before planning.
- **Readiness:** Ready for `/plan`. The question-rendering repair remains independently gated on native-device QA; it is not declared complete by this context specification.
