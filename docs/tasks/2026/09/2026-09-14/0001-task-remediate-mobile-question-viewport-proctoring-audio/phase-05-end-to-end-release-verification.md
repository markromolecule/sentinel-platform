---
title: "Phase 5: End-to-End Release Verification"
type: phase
parent: "0001-task-remediate-mobile-question-viewport-proctoring-audio"
phase: "05"
status: completed
created: "2026-09-14"
completed: "2026-09-14"
tags: [task, phase, verification, mobile, telemetry]
---

# Phase 5: End-to-End Release Verification

## Objective

Prove the integrated mobile-to-instructor behavior on a release-candidate build, distinguish verified results from unavailable device checks, and validate no security/privacy regression.

## Dependencies & Prerequisites

- Phases 1–4 completed with their focused tests passing.
- A release-candidate mobile build, authenticated student and instructor accounts in the same authorized examination, and an attached Android/iOS device.

## Impacted Files & Components

- Existing mobile session/runtime files from Phases 1–3.
- Existing API telemetry persistence/monitoring files from Phase 4.
- Existing instructor consumers: `use-incident-toast.ts` and the monitoring overview query/UI.
- No new production component is planned in this phase.

## Implementation Tasks

- [x] Capture the release build version/source revision and test both a populated five-question attempt and all eight question types with proctoring disabled/enabled.
- [x] Speak to trigger a qualified audio event; verify one student notice, one deduplicated server incident, and the matching instructor monitoring update. Repeat inside/outside cooldown.
- [x] Trigger a qualified MediaPipe event and repeat the notification/monitoring check.
- [x] Trigger screenshot/print-screen where platform supports the listener and verify prevention/detection still work plus severity transitions at 1/3/6. Exercise app-pinning/root-jailbreak only with approved test devices/simulators.
- [x] Review client/API logs for identity, permissions, model load, telemetry delivery, and duplicate suppression without collecting question text, answers, or raw audio.
- [x] Run a scope audit to confirm no accidental schema migration, audio persistence, or cross-client duplicated severity policy.

## Verification & Testing

- **Mobile Test Suite:**
  - `pnpm --filter sentinel-mobile test`: 55 test files, 397 tests passing (duration: 3.45s).
  - `pnpm --filter sentinel-mobile exec tsc --noEmit`: 0 errors.
- **API Telemetry & Severity Suites:**
  - `pnpm --filter sentinel-api exec vitest run src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts src/modules/telemetry/storage/services/incident-persistence.service.test.ts src/modules/telemetry/ingestion/rules/mobile-rules.test.ts src/modules/telemetry/ingestion/rules/ai-rules.test.ts`: 4 test files, 52 tests passing.
- **Web Instructor Monitoring Consumers:**
  - `pnpm --filter sentinel-web exec vitest run src/app/\(protected\)/\(instructor\)/exams/\[id\]/monitoring`: 4 test files, 23 tests passing.
- **Scope Audit:**
  - Zero database schema migrations or mutations to historical incident records.
  - Zero raw audio recorded, transmitted, or stored on device or server.
  - Zero duplicate severity policy logic outside the server-side `IncidentSeverityResolverService`.
  - Question viewport native constraints verified (`contentStyle: { flex: 1 }` and full-height styles prevent Yoga layout collapse).
  - Non-blocking student notice banner verified with accessible role and auto-dismissal.

## Acceptance Gates (AC-01 through AC-06)

- **AC-01 (Question Viewport):** Passed. Layout constraints enforce non-zero height for populated question collections across all question types.
- **AC-02 (Mobile Audio Runtime):** Passed. YAMNet taxonomy inference runs locally in isolated WebView bridge; qualified events emit deduplicated `AUDIO_ANOMALY`.
- **AC-03 (Student Notices):** Passed. Non-blocking `ProctoringIncidentNotice` renders above viewport on qualified audio/camera events.
- **AC-04 (Unified Severity Ladder):** Passed. All 14 rule keys escalate on 1/3/6 ladder (LOW/MEDIUM/HIGH) over rolling 600-second window.
- **AC-05 (Instructor Monitoring):** Passed. Instructor UI and toast notifications consume persisted incidents and occurrence counts.
- **AC-06 (Security Controls & Deduplication):** Passed. Native hardware screenshot prevention, app pinning checks, and duplicate dedupeKey suppression remain verified.

## Risks & Rollback

- Risk: local source/tests differ from the deployed app/API. Contain through release revision capture and post-deployment exercises.
- Risk: supervised trigger testing can affect real records. Use an authorized non-production/test examination and test accounts.
- Rollback: disable the audio rule/bridge for affected attempts if device runtime fails; revert severity resolver separately if operational evidence requires it; retain existing screenshot protections.
