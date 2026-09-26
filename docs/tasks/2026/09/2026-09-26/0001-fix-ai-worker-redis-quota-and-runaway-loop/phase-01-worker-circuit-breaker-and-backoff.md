---
title: "Phase 1: Implement worker error circuit-breaking and backoff"
type: phase
parent: "0001-fix-ai-worker-redis-quota-and-runaway-loop"
phase: "1"
status: completed
created: "2026-09-26"
tags: [task, phase, worker, backoff]
---

# Phase 1: Implement worker error circuit-breaking and backoff

## Objective
Prevent runaway CPU usage and infinite error log flooding when Redis encounters command or connection failures, by adding circuit-breaking and progressive exponential backoff to the BullMQ AI worker.

## Dependencies & Prerequisites
- Confirmed root cause analysis in `docs/context/September/26/fix-ai-worker-redis-quota-and-runaway-loop.md`.

## Impacted Files & Components
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-worker.lifecycle.ts`: Add error throttle, pause/resume circuit-breaking on worker error events.
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation.worker.test.ts`: Add unit test covering worker error throttling and pause/resume logic.

## Implementation Tasks
- [x] In `ai-generation-worker.lifecycle.ts`, add a circuit breaker mechanism:
  - Track consecutive Redis errors and timestamps.
  - When Redis errors occur (e.g. `ERR max requests limit exceeded` or connection errors), automatically pause the worker using `worker.pause(true)` and schedule a resume with exponential backoff (e.g., 5s, 15s, 30s).
  - Rate-limit error log output to avoid log flooding (at most one warning log per backoff window).
  - Reset consecutive error counter upon successful job processing or clean recovery.
- [x] Ensure `stopAiGenerationWorker()` cleanly clears any pending backoff timers during shutdown.
- [x] Write unit tests verifying that simulated Redis errors trigger backoff pause and clean resumption.

## Verification & Testing
- Unit tests: `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue/ai-generation.worker.test.ts` (PASS: 13/13 tests passed)
- Full queue suite: `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue` (PASS: 17/17 tests passed)
- TypeScript typecheck: `pnpm --filter sentinel-api typecheck` (PASS: exit code 0)

## Risks & Rollback
- Risk: Worker could stay paused if resume timer fails.
- Mitigation: The resume timer is unref'd or safely tracked, and is guaranteed to attempt `worker.resume()` after the backoff window.
