---
title: "Fix AI Worker Redis Quota Limit and Runaway CPU Loop"
type: task
status: planned
created: "2026-09-26"
tags: [task, redis, bullmq, ai-worker]
---

# Fix AI Worker Redis Quota Limit and Runaway CPU Loop

## Outcome
Eliminate runaway server CPU/resource exhaustion caused by BullMQ worker error spinning, prevent request quota starvation by tuning worker polling and migrating to dedicated Railway Redis, and restore reliable AI question generation without HTTP 503 errors.

## Pre-planning record

### Actors and goals
- **Teacher / Admin:** Generate assessment preview questions from uploaded documents reliably without encountering HTTP 503 errors.
- **Platform Engineer:** Ensure background queue workers gracefully back off during Redis outages or error states, avoiding 100% CPU spinning and infinite error log flooding.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Normal generation request | Railway Redis configured and connected | Job enqueues with 202 Accepted, worker processes task and saves preview questions | Worker retries transient failures up to 3 times | Planned |
| SC-02 | Redis command or quota failure | Redis returns `ReplyError` or drops connection | Worker catches error, pauses consumption, backs off exponentially (5s -> 15s -> 30s), avoids tight CPU spin | Resumes automatically when Redis is healthy | Planned |
| SC-03 | Idle queue polling | Zero generation jobs in queue | Worker polls with relaxed `drainDelay` (30s) and conservative stalled check (120s), keeping command volume low | Graceful idle wait | Planned |
| SC-04 | API startup in production | Dedicated worker service running | API starts without starting embedded worker unless explicitly forced via env | API only acts as queue producer | Planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Redis hosting provider for BullMQ | Migrate to dedicated Railway Redis | BullMQ requires persistent TCP connections and unlimited commands. Upstash meters commands and capped at 500k/mo. Railway Redis costs ~$0.50-$1.00/mo and has no request limits. | Upstash Fixed plan ($10/mo), staying on Upstash free tier. | `docs/context/September/26/fix-ai-worker-redis-quota-and-runaway-loop.md` |
| DEC-02 | Worker loop behavior on fatal Redis error | Implement circuit-breaking and backoff | BullMQ's default loop retries in ~2ms on immediate command errors, consuming 100% CPU. Adding circuit-breaking pauses the worker. | Leaving worker unthrottled, relying purely on process crashes. | `docs/context/September/26/fix-ai-worker-redis-quota-and-runaway-loop.md` |
| DEC-03 | Polling parameters for AI generation queue | Increase stalled interval to 120s and set drainDelay to 30s | Matches the proven pattern in `pdf-generation-queue.config.ts`, reducing idle Redis command frequency by >80%. | Aggressive 30s stalled check and 5s drainDelay. | `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.ts` |

### Unknowns and blockers
- None. Root cause verified with production log timestamps and reproduction analysis.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-02, DEC-02 | Worker does not spin in a tight CPU loop when Redis errors occur | Add circuit-breaking / backoff pause logic to `ai-generation-worker.lifecycle.ts` | Automated unit test simulating consecutive Redis command errors | Verified |
| AC-02 | SC-03, DEC-03 | Worker uses conservative stalled intervals and drain delay | Update `ai-generation-queue.config.ts` and pass options to `Worker` | Unit tests in `ai-generation-queue.config.test.ts` verifying intervals | Verified |
| AC-03 | SC-04 | Production API does not start embedded poller by default | Verify `ENABLE_EMBEDDED_AI_WORKER` default in `ai-generation-queue.config.ts` | Unit tests asserting default disabled state in production | Verified |
| AC-04 | DEC-01 | Operational runbook for Railway Redis cutover | Create operation documentation for Railway Redis provisioning and env update | Review `docs/operations/redis-railway-runbook.md` | Verified |

## Scope
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-worker.lifecycle.ts`
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.ts`
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation.worker.test.ts`
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.test.ts`
- `docs/operations/redis-railway-runbook.md`

## Non-goals
- Rewriting Gemini/Vertex AI question generation pipeline.
- Addressing client-side third-party browser extensions (`share-modal.js`).

## Constraints and decisions
- Strictly preserve existing BullMQ job data contracts (`AiGenerationJobData`).
- Maintain backward compatibility for local development (in-memory mode if Redis not configured).

## Phases

- [x] [`phase-01-worker-circuit-breaker-and-backoff.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-26/0001-fix-ai-worker-redis-quota-and-runaway-loop/phase-01-worker-circuit-breaker-and-backoff.md) — Phase 1: Implement worker error circuit-breaking and backoff
- [x] [`phase-02-conservative-queue-polling-configuration.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-26/0001-fix-ai-worker-redis-quota-and-runaway-loop/phase-02-conservative-queue-polling-configuration.md) — Phase 2: Relax BullMQ polling intervals and ensure embedded worker isolation
- [x] [`phase-03-railway-redis-migration-and-verification.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-26/0001-fix-ai-worker-redis-quota-and-runaway-loop/phase-03-railway-redis-migration-and-verification.md) — Phase 3: Monorepo test suite verification and Railway Redis migration runbook

## Verification
- `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue` (PASS: 23/23 passed across 3 test suites)
- `pnpm --filter sentinel-api test src/tests/gemini` (PASS: 46/46 passed across 4 test suites)
- Monorepo runbook: `docs/operations/redis-railway-runbook.md` created and verified.

## Deviations
- None.

## Result
- All 3 phases complete.
  1. Worker circuit-breaking pauses consumption with exponential backoff on Redis error and throttles error logs.
  2. Idle polling tuned (drain delay increased to 30s, stalled interval increased to 120s) reducing idle Redis commands by >80%.
  3. Railway Redis migration runbook documented with step-by-step cutover and verification procedures.
