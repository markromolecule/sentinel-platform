---
title: "Phase 2: Relax BullMQ polling intervals and ensure embedded worker isolation"
type: phase
parent: "0001-fix-ai-worker-redis-quota-and-runaway-loop"
phase: "2"
status: complete
created: "2026-09-26"
tags: [task, phase, config, polling]
---

# Phase 2: Relax BullMQ polling intervals and ensure embedded worker isolation

## Objective
Reduce idle Redis command frequency by >80% by tuning BullMQ worker polling options (`drainDelay`, `stalledInterval`) to match conservative operational defaults, and ensuring the API process does not duplicate worker polling in production.

## Dependencies & Prerequisites
- Phase 1 completed (circuit-breaker in place).

## Impacted Files & Components
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.ts`: Define conservative polling constants and configuration helpers.
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-worker.lifecycle.ts`: Pass `drainDelay` and conservative `stalledInterval` to BullMQ `Worker`.
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.test.ts`: Unit tests for config defaults and environment parsing.
- `app/sentinel-api/src/server.ts`: Verify embedded worker gating.

## Implementation Tasks
- [x] In `ai-generation-queue.config.ts`:
  - Increase `DEFAULT_STALLED_INTERVAL_MS` to `120_000` (2 minutes).
  - Add `DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS = 30` and getter `getAiWorkerDrainDelaySeconds()`.
  - Export and document the rationale for conservative intervals.
- [x] In `ai-generation-worker.lifecycle.ts`:
  - Pass `drainDelay: getAiWorkerDrainDelaySeconds()` into BullMQ `Worker` options.
  - Pass `stalledInterval: getAiWorkerStalledIntervalMs()`.
- [x] Verify `shouldStartEmbeddedAiWorker()` strictly requires `ENABLE_EMBEDDED_AI_WORKER=true`, defaulting to `false` in production.
- [x] Update unit tests in `ai-generation-queue.config.test.ts` to assert config resolution.

## Verification & Testing
- Run test suite: `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue` (PASS: 23/23 tests passed)
- Verify config options resolve as expected.

## Risks & Rollback
- Risk: Jobs taking longer than 2 minutes to process might be flagged as stalled if lock isn't renewed.
- Mitigation: BullMQ automatically renews locks for active jobs via `lockDuration` (`DEFAULT_LOCK_DURATION_MS: 60_000ms`); stalled interval only checks for completely crashed processes.
