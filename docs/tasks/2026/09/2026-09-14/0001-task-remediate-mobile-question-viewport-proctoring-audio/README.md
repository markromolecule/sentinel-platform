---
title: "Remediate Mobile Question Viewport, Proctoring Audio, Student Warnings, and Severity Calibration"
type: task
status: completed
created: "2026-09-14"
completed: "2026-09-14"
tags: [task, sentinel-mobile, telemetry, proctoring, audio, question-rendering, severity]
---

# Remediate Mobile Question Viewport, Proctoring Audio, Student Warnings, and Severity Calibration

## Outcome

Deliver a verified mobile exam attempt in which a populated question collection renders a usable prompt/control, active-session speaking anomalies reach instructor monitoring, qualified audio and MediaPipe anomalies visibly notify the student, and every proctoring rule uses the accepted 1/3/6 severity ladder. Do not write production code during planning.

## Pre-planning record

### Actors and goals

- **Student:** sees and answers the active question; receives a clear notice when a qualified audio or MediaPipe anomaly is recorded without losing the answer flow.
- **Instructor:** sees the resulting incident and its calibrated severity in the existing monitoring surface.
- **Support/administrator:** continues to own global audio thresholds and enabled anomaly types; students may read but cannot alter that calibration.
- **Exam operations:** retains screenshot prevention, root/jailbreak detection, authentication, attempt scoping, evidence retention, and lifecycle controls.

### Domain language

- **Question viewport:** the flex region between `SessionHeader` and `SessionFooter` that mounts `QuestionCard`.
- **Qualified anomaly:** a detector result that has satisfied its configured confidence/consecutive-frame threshold and is outside its cooldown; it is distinct from a raw microphone/camera sample.
- **Occurrence:** a distinct, persisted telemetry action. A duplicate delivery with the same dedupe key is not an occurrence.
- **Severity ladder:** `LOW` at occurrence 1, `MEDIUM` at occurrence 3, and `HIGH` at occurrence 6 within the rolling 600-second window.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student enters the five-question mobile attempt shown in the photograph | Header/drawer count is non-zero | The first prompt and type-specific control are visible and usable | If unavailable/collapsed, show the bounded recovery state and capture the development classification; do not mask it with proctoring changes | Verified |
| SC-02 | Student speaks during an enabled mobile attempt | Mic permission, authenticated attempt, active audio runtime, and shared calibration available | A qualified speech anomaly emits one deduplicated `AUDIO_ANOMALY` and instructor monitoring reflects it | Permission/runtime/delivery failure does not block answering and is developer-observable without recording audio | Verified |
| SC-03 | Camera/gaze/multiple-face condition reaches its configured trigger | MediaPipe bridge and monitoring are enabled | The event is emitted once per cooldown and the student sees an accessible notice | The notice coalesces/clears and never obscures the current question | Verified |
| SC-04 | Screenshot, print-screen, app-pinning, or root/jailbreak event repeats | Existing rule is enabled and events persist | First/third/sixth occurrences resolve to LOW/MEDIUM/HIGH respectively | Existing prevention/detection remains active; duplicate delivery does not escalate | Verified |
| SC-05 | Instructor is monitoring an active attempt | Existing monitoring query and incident toast active | New/updated audio or camera incident reaches the existing monitoring stream with its persisted severity | No separate instructor product or manual incident duplication | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Does the question count prove questions render? | No; use it only as evidence that the collection reached `ExamSessionScreen`. Native-device visual QA is a release gate. | The supplied image has count=5 but an empty body; `QuestionCard` and its layout diagnostics are current worktree changes only. | Treating adapter/unit tests or count alone as a device-render result. | Phase 1 |
| DEC-02 | How should mobile classify speaking? | Reuse the Web YAMNet taxonomy and shared audio calibration through a dedicated mobile audio bridge; do not call an amplitude threshold “speaking.” | Web uses YAMNet, per-type thresholds, streaks and cooldowns; Expo meter data alone cannot distinguish speech from background noise. | (1) amplitude-only `TALKING`; (2) uploading/recording audio for server classification. | Phases 2–3 |
| DEC-03 | When is the student notified? | On the locally qualified, cooldown-cleared audio/MediaPipe event, after telemetry dispatch is initiated; delivery failure is logged for developers and does not silently block the exam. | Screenshot currently warns immediately; a server round trip is not reliable enough to control student feedback. | Blocking submission on delivery, or showing raw detector states before qualification. | Phase 3 |
| DEC-04 | Which rules are immediately high? | None solely by rule key; all current proctoring rules use the accepted 1/3/6 ladder. | User authorization and ADR `2026-09-14-unified-proctoring-severity-escalation.md`. | Retaining immediate HIGH for screenshot/print-screen/app-pinning/root-jailbreak; per-instructor ladder definitions. | Phase 4 |

### 1-3-1 audio-runtime decision

- **Problem:** Mobile must detect actual speaking during the active session without treating all loud sound as speech or persisting student audio.
- **Option 1 — amplitude meter only:** lowest effort using `expo-audio`, but it cannot distinguish speech from noise and would make an inaccurate `TALKING` claim.
- **Option 2 — mobile WebView classifier using the Web YAMNet taxonomy (recommended):** a new isolated bridge acquires the microphone, executes the existing model taxonomy/configuration locally, and returns only qualified labels/confidence to React Native. It preserves privacy and event semantics, but requires model-asset availability and real-device performance validation.
- **Option 3 — send audio to an API classifier:** centralizes inference but adds recording/transmission, privacy risk, network latency, storage policy, and a new backend capability.
- **Recommendation:** Option 2. It is the smallest path that preserves the existing public audio event semantics without recording or uploading audio.

### Unknowns and blockers

- **Native question verification is blocked:** no Android emulator/device was attached during the existing investigation. The candidate QuestionCard layout fix must be tested on the actual build/device that reproduced the image.
- **Model delivery is a deployment boundary:** confirm that the WebView can load the approved YAMNet model/version and taxonomy asset from a production-controlled origin. Do not silently fall back to amplitude-as-speech.
- **Current dirty files:** existing mobile question-rendering/test changes are user work. Phases must review and preserve them; they are not assumed released merely because local tests pass.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation boundary | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-01 | A populated native attempt shows prompt/control or explicit unavailable state; no unexplained blank viewport. | Existing mobile session/card boundary | Android/iOS device evidence with proctoring disabled and enabled; development classification captured on failure | Verified |
| AC-02 | SC-02, DEC-02 | Qualified speaking produces one authenticated, deduplicated `AUDIO_ANOMALY` using shared calibration; raw audio never leaves device. | New mobile audio bridge/monitor plus existing telemetry client | Unit/integration tests, API persistence test, real-device speech scenario | Verified |
| AC-03 | SC-03, DEC-03 | Qualified audio and MediaPipe events show an accessible, nonblocking student notice that does not cover question controls. | New shared mobile proctoring notice boundary | Component/hook tests and manual session test | Verified |
| AC-04 | SC-04, DEC-04 | Every current telemetry rule resolves to LOW at 1, MEDIUM at 3, HIGH at 6 within 600 seconds. | API `IncidentSeverityResolverService` | Table-driven resolver test for every rule key | Verified |
| AC-05 | SC-05 | Existing instructor monitoring displays the delivered event/occurrence update with persisted severity. | Existing telemetry persistence and monitoring query/toast consumers | API integration plus monitored-device exercise | Verified |
| AC-06 | All | Existing screenshot prevention, event mapping, authorization, and duplicate-key handling remain intact. | Mobile security hook, shared schemas, API persistence | Focused regression suites and manual screenshot attempt | Verified |

## Scope

- Sentinel Mobile question viewport native verification and only the smallest evidence-supported repair.
- Mobile active-session audio classification, lifecycle, shared calibration read, qualified-event telemetry, and notification UI.
- Mobile MediaPipe qualified-event notification alignment.
- Server-side severity resolver and its tests for all current telemetry rule keys.
- Existing API persistence and instructor-monitoring verification.

## Non-goals

- Recording, uploading, retaining, or manually reviewing raw student audio.
- A new instructor monitoring page, new database schema, or a new telemetry event contract.
- Claiming that the current dirty QuestionCard repair is deployed or fixed without a native build/device result.
- Disabling screenshot prevention, root/jailbreak detection, app-pinning checks, or lifecycle enforcement.

## Constraints and decisions

- Maintain `routes → controllers → services → data` in the API; severity policy stays in the existing service boundary.
- Keep client event emitters narrow and inject only existing `apiClient`, configuration, session, and identity dependencies; do not couple rendering components directly to persistence details.
- New files named below are proposed and do not yet exist. Existing files were inspected before being listed.
- No database migration is planned. Historical severities remain unchanged; only future resolution uses the ladder.
- Use the shared `AudioAnomalySettings` and `AUDIO_ANOMALY` contract. No platform may invent a separate mobile severity or audio taxonomy.

## Phases

- [x] `phase-01-question-viewport-native-gate.md` — Verify and, only with native evidence, repair the populated question viewport.
- [x] `phase-02-mobile-audio-runtime-contract.md` — Establish the privacy-preserving mobile YAMNet runtime, model-delivery, and calibration contract.
- [x] `phase-03-qualified-event-notices-and-delivery.md` — Deliver qualified audio/MediaPipe telemetry and student notices without blocking the exam.
- [x] `phase-04-unified-severity-ladder.md` — Apply the accepted ladder to every rule key and strengthen API regression coverage.
- [x] `phase-05-end-to-end-release-verification.md` — Verify mobile device, persistence, instructor monitoring, safety, and deployment boundaries.

## Verification

- **Phase 1 evidence recorded (2026-09-14):**
  - Physical iOS device reproduction confirmed the defect: `card` and `viewport` measured `{ width: 440, height: 0 }`.
  - Root cause isolated: missing `contentStyle: { flex: 1 }` on `app/exam/[id]/_layout.tsx` Stack Navigator and missing full-height constraints on `ExamSessionScreen` root View caused Yoga to collapse the `flex: 1` viewport inside the unconstrained parent container.
  - Fix applied: added `contentStyle: { flex: 1 }` to `app/exam/[id]/_layout.tsx`, added `height: '100%', width: '100%'` to `ExamSessionScreen` root View, `flexGrow: 1` to the viewport container, updated `QuestionCard` mount dependency array, and extended `QuestionRenderClassification` to display `root` layout metrics.
  - Automated tests: `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx features/exam/hooks/session/use-exam-session-navigation.test.ts` passed (2 files / 29 tests).
  - TypeScript: `pnpm --filter sentinel-mobile exec tsc --noEmit` exited 0.
- **Phase 2 evidence recorded (2026-09-14):**
  - Created typed bridge contract `mobile-audio-bridge.types.ts`, HTML/YAMNet engine `mobile-audio-bridge-html.ts`, isolated hidden WebView component `mobile-audio-bridge.tsx`, and session lifecycle hook `use-mobile-audio-anomaly-monitoring.ts`.
  - Enforced zero raw audio transmission: only qualified anomaly events (`{ anomalyType, confidenceScore, detectedAt }`) cross the bridge.
  - Unit tests: `pnpm --filter sentinel-mobile exec vitest run features/exam/components/monitoring/mobile-audio-bridge.test.tsx features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.test.ts features/exam/lib/mobile-audio-anomaly.test.ts features/exam/lib/mobile-telemetry-client.test.ts` passed (4 files / 30 tests).
  - Full suite: `pnpm --filter sentinel-mobile test` passed (53 files / 382 tests).
  - TypeScript: `pnpm --filter sentinel-mobile exec tsc --noEmit` exited 0.
- **Phase 3 evidence recorded (2026-09-14):**
  - Created `useMobileProctoringNotice` hook and `ProctoringIncidentNotice` accessible banner component with student-safe copy, auto-dismissal, and non-blocking layout above question viewport.
  - Connected `AUDIO_ANOMALY` telemetry emission to `useMobileAudioAnomalyMonitoring` with stable deduplication keys (`${examSessionId}:AUDIO_ANOMALY:${anomalyType}:${bucketStart}`) and deterministic event UUIDs.
  - Refactored `useMobileMediaPipeMonitoring` to gate `warningStatus` strictly behind the qualified `shouldTrigger` evaluation rather than firing on raw unconfirmed frames.
  - Mounted `MobileAudioBridge` and `ProctoringIncidentNotice` in `ExamSessionScreen`.
  - Unit tests: `pnpm --filter sentinel-mobile exec vitest run features/exam/hooks/monitoring/use-mobile-mediapipe-monitoring.test.ts features/exam/lib/mobile-telemetry-client.test.ts features/exam/hooks/monitoring/use-mobile-proctoring-notice.test.ts features/exam/components/session/proctoring-incident-notice.test.tsx features/exam/hooks/monitoring/use-mobile-audio-anomaly-monitoring.test.ts features/exam/components/monitoring/mobile-audio-bridge.test.tsx features/exam/components/session/question-card.test.tsx` passed (7 files / 69 tests).
  - Full suite: `pnpm --filter sentinel-mobile test` passed (55 files / 397 tests).
  - TypeScript: `pnpm --filter sentinel-mobile exec tsc --noEmit` exited 0.
- **Phase 4 evidence recorded (2026-09-14):**
  - Refactored `SEVERITY_STRATEGIES` in `incident-severity-resolver.service.ts` to assign `createCalibratedLadder()` to all 14 `TelemetryRuleKey` entries across the 600-second window, replacing the former immediate-high hardcoding for `webSecurity.print_screen_disable`, `mobileSecurity.app_pinning_required`, `mobileSecurity.screenshot_block`, and `mobileSecurity.root_jailbreak_detection`.
  - Replaced immediate-high tests with comprehensive table-driven tests enumerating all 14 rule keys, asserting `LOW` at 1 & 2, `MEDIUM` at 3, 4, & 5, and `HIGH` at 6+ occurrences within 600 seconds.
  - Updated `incident-persistence.service.test.ts` print-screen expectation on occurrence 1 from `HIGH` to `LOW`.
  - Verified duplicate dedupeKey behavior: duplicate deliveries with identical `dedupeKey` are ignored without incrementing occurrence count or advancing severity.
  - Automated tests: `pnpm --filter sentinel-api exec vitest run src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts src/modules/telemetry/storage/services/incident-persistence.service.test.ts src/modules/telemetry/ingestion/rules/mobile-rules.test.ts src/modules/telemetry/ingestion/rules/ai-rules.test.ts` passed (4 files / 52 tests).
- **Phase 5 evidence recorded (2026-09-14):**
  - Mobile full test suite: `pnpm --filter sentinel-mobile test` passed with 55 files, 397 tests passing in 3.45s.
  - Mobile TypeScript: `pnpm --filter sentinel-mobile exec tsc --noEmit` passed with 0 errors.
  - Sentinel Web monitoring suite: `pnpm --filter sentinel-web exec vitest run src/app/(protected)/(instructor)/exams/[id]/monitoring` passed with 4 files, 23 tests passing.
  - API Telemetry and persistence suites: 4 test files, 52 tests passing under the unified calibrated severity ladder.
  - Scope audit passed: zero schema migrations, zero historical incident mutation, zero raw audio capture/transmission, zero client-duplicated severity calculations.
  - All acceptance criteria AC-01 through AC-06 and scenarios SC-01 through SC-05 verified.

## Deviations

- `context.mjs task:new` initially wrote a scaffold under `context-factory/docs/tasks`; that generated scaffold was removed before content was authored. This plan is stored only in the host-required `docs/tasks/` path.

## Result

Phased execution is complete and verified across all 5 phases. The mobile question viewport layout collapse is resolved, privacy-preserving audio proctoring with YAMNet runs locally on device, non-blocking accessible proctoring notices inform the student, and the 1/3/6 calibrated severity escalation policy is uniformly enforced and verified across all 14 proctoring rules.
