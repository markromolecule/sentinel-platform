---
title: "Phase 4: Unified Severity Ladder"
type: phase
parent: "0001-task-remediate-mobile-question-viewport-proctoring-audio"
phase: "04"
status: completed
created: "2026-09-14"
completed: "2026-09-14"
tags: [task, phase, api, telemetry, severity]
---

# Phase 4: Unified Severity Ladder

## Objective

Implement the accepted server-side severity policy for all current rule keys without changing clients, event contracts, persistence schema, or detection/prevention controls.

## Dependencies & Prerequisites

- ADR `docs/decisions/2026-09-14-unified-proctoring-severity-escalation.md` is accepted.
- The implementer must preserve the existing duplicate-dedupe-key behavior in `incident-writer.service.ts`; duplicates are not additional occurrences.

## Impacted Files & Components

- Existing: `app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts` — single severity-policy owner.
- Existing: `app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts` — current ladder and former immediate-high regression coverage.
- Existing: `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts` — matching lookback and persisted occurrence aggregation.
- Existing: `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts` — persistence/duplicate path regression coverage.
- Existing consumers: `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/_hooks/use-monitoring/use-incident-toast.ts` and API monitoring responses.

## Implementation Tasks

- [x] Replace the four immediate severity strategies for print-screen, screenshot, app-pinning, and root/jailbreak with the common calibrated strategy; keep the existing 600-second window and override scaling semantics.
- [x] Convert the immediate-high unit test into table-driven coverage that enumerates every `TelemetryRuleKey` and checks occurrence 1, 3, and 6.
- [x] Preserve special silence-audio matching behavior unless a test proves it conflicts with the general ladder; it must still use LOW/MEDIUM/HIGH ordering.
- [x] Verify that configuration snapshots, event-to-rule mapping, dedupe, automatic lifecycle policy inputs, and instructor consumers retain their contracts.
- [x] Do not migrate or rewrite historical `flagged_incidents`; document that the new policy applies to future resolution only.

## Verification & Testing

- Run `pnpm --filter sentinel-api exec vitest run src/modules/telemetry/storage/services/incident-severity-resolver.service.test.ts src/modules/telemetry/storage/services/incident-persistence.service.test.ts src/modules/telemetry/ingestion/rules/mobile-rules.test.ts src/modules/telemetry/ingestion/rules/ai-rules.test.ts`:
  - **Passed:** 4 test files, 52 tests passing (2026-09-14).
  - `incident-severity-resolver.service.test.ts`: 22 tests verifying table-driven 1/3/6 escalation across all 14 `TELEMETRY_RULE_KEYS` including former immediate-high rules (`webSecurity.print_screen_disable`, `mobileSecurity.app_pinning_required`, `mobileSecurity.screenshot_block`, `mobileSecurity.root_jailbreak_detection`), silence audio rules, and forced severity overrides.
  - `incident-persistence.service.test.ts`: 23 tests verifying occurrence escalation, deduplication window handling, dedupeKey duplicate ignores (occurrence remains 1), and auto-close policies.
  - `ai-rules.test.ts`: 6 tests passing.
  - `mobile-rules.test.ts`: 1 test passing.
- Duplicate deduplication verification:
  - Verified that duplicate submissions with identical `dedupeKey` are ignored without incrementing occurrence count or advancing severity. Distinct dedupe keys within the 600s window increment occurrence count and escalate according to the ladder.

## Risks & Rollback

- Risk: lowering the first event to LOW changes operational triage. Mitigate with instructor monitoring verification and post-exam incident-volume review specified in the ADR.
- Rollback: restore only the former strategies in the resolver for future classifications. Do not mutate historic severities.
