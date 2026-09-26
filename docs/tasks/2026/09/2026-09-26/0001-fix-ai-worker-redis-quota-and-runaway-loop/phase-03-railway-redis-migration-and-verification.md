---
title: "Phase 3: Monorepo test suite verification and Railway Redis migration runbook"
type: phase
parent: "0001-fix-ai-worker-redis-quota-and-runaway-loop"
phase: "3"
status: complete
created: "2026-09-26"
tags: [task, phase, verification, runbook]
---

# Phase 3: Monorepo test suite verification and Railway Redis migration runbook

## Objective
Verify the complete `sentinel-api` test suite and provide an operational runbook for provisioning and linking Railway Redis to `sentinel-api` and `sentinel-ai-worker`.

## Dependencies & Prerequisites
- Phase 1 & 2 completed and unit-tested.

## Impacted Files & Components
- `docs/operations/redis-railway-runbook.md`: Clear step-by-step instructions for provisioning Railway Redis, setting `REDIS_URL`, and verifying cutover.
- Monorepo test and typecheck scripts.

## Implementation Tasks
- [x] Run full queue test suite:
  `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue` (PASS: 23/23 tests)
- [x] Run Gemini module test suite:
  `pnpm --filter sentinel-api test src/tests/gemini` (PASS: 46/46 tests)
- [x] Create `docs/operations/redis-railway-runbook.md` detailing:
  - Adding Redis in Railway project.
  - Setting private `REDIS_URL` in `sentinel-api` and `sentinel-ai-worker`.
  - Verifying `[AiWorker]` clean startup and log output.

## Verification & Testing
- Vitest exit code 0 (69/69 queue & Gemini tests passed).
- `docs/operations/redis-railway-runbook.md` reviewed and created.

## Risks & Rollback
- Risk: None. Documentation and verification phase only.
