---
title: "Phase 3: Truthful Client Progress and Contract Tests"
type: phase
parent: "0001-task-durable-supabase-storage-handoff-for-ai-generation"
phase: "03"
status: completed
created: "2026-09-16"
tags: [task, phase, frontend, realtime]
---

# Phase 3: Truthful Client Progress and Contract Tests

## Objective

Ensure the instructor UI reflects only persisted job state, while retaining existing Supabase Realtime and polling fallback behavior.

## Dependencies & Prerequisites

- Phase 2 provides durable statuses for queued, processing/retrying, completed, and failed jobs.

## Impacted Files & Components

- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-processing-progress.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-processing-progress.test.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.test.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step.test.tsx`
- Parity files in `app/sentinel-core`:
  - `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.ts`
  - `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-processing-progress.ts`
  - `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-processing-progress.test.ts`
  - `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.test.ts`
  - `app/sentinel-core/src/app/(protected)/question/bank/_components/dialogs/import-modal/_components/configure-step.test.tsx`

## Implementation Tasks

- [x] On 202 acceptance, initialize local state as `0% / Queued`; do not set the unsupported 5% `Staging lecture documents...` value before a server update.
- [x] Remove the elapsed-time simulation that currently clamps display progress between 5% and 94%. Render an explicit queued/waiting state at 0, and advance only when Realtime or polling delivers durable `progress`/`currentStep`.
- [x] Preserve subscription cleanup, polling fallback, completion retrieval, and terminal error behavior. Display the server retry step without converting it to completed or failed.
- [x] Add tests proving a queued 0% job stays at 0%, a durable processing update advances it, a retry update remains nonterminal, Realtime loss continues through polling, and completed/failed behavior remains unchanged.
- [x] Inspect parity with the active `sentinel-core` import modal and either make an equivalent change with tests or document it as unused/out-of-scope before release.

## Verification & Testing

- `pnpm --filter sentinel-web test src/app/\(protected\)/\(instructor\)/question/bank/_components/dialogs/import-modal/` (PASS: 19/19 passed across 4 test suites)
- `pnpm --filter sentinel-core test src/app/\(protected\)/question/bank/_components/dialogs/import-modal/` (PASS: 14/14 passed across 3 test suites)
- `npx tsc --noEmit --project tsconfig.json` in `sentinel-web` and `sentinel-core` (PASS: 0 diagnostics in `import-modal`)
- Unit tests verified:
  - Initial 202 acceptance sets `jobProgress: 0` and `currentStep: 'Queued'`.
  - Timer advancement does not increment progress when worker has not picked up job.
  - Server milestone update (5%, 50%, 100%) advances progress truthfully.
  - Nonterminal retry progress updates (`Temporary failure encountered. Retrying attempt 1 of 3...`) preserve in-flight status without triggering premature resolution or failure.

## Risks & Rollback

- Removing simulated motion changes perceived responsiveness; explicit queued/retrying copy must explain that work is safely running in the background.
- No API contract changes are required for the client beyond interpreting existing `status`, `progress`, and `currentStep` truthfully.
