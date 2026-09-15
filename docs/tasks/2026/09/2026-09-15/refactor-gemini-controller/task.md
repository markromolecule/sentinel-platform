---
title: "Refactor Gemini Controller into Dedicated Sub-Controllers"
type: task
status: completed
created: "2026-09-15"
tags: [task, refactor, gemini, api]
---

# Refactor Gemini Controller into Dedicated Sub-Controllers

## Outcome
Decompose monolithic `gemini.controller.ts` into single-responsibility sub-controllers under `src/modules/integrations/gemini/controller/`, point all consumer imports directly to `./controller`, and remove `gemini.controller.ts` while preserving behavioral invariance.

## Pre-planning record

### Actors and goals
- API Developers / Maintainers: Navigate modular, focused controller files (<150 lines each) adhering to Single Responsibility Principle.
- Client Consumers & Test Suites: Uninterrupted API route behaviors, schemas, and import paths.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Synchronous generation request | Valid PDF payload <= 10 questions | Processed by `generate-preview.controller.ts` with telemetry | 400 if >10 questions or multi-file | Passed |
| SC-02 | Asynchronous job creation | Valid multipart PDF payload | Staged and queued by `create-preview-job.controller.ts` returning 202 | 413 if >15MB, 400 if empty | Passed |
| SC-03 | Async job status query | Valid jobId and authenticated caller | Retrieved by `get-preview-job-status.controller.ts` with tenant isolation | 404 if not found or unauthorized | Passed |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Where to extract sub-controllers? | `src/modules/integrations/gemini/controller/` | Matches existing directory conventions across sentinel-api modules (`auth/controller`, etc.) | Keeping in single file | This task |
| DEC-02 | Remove legacy `gemini.controller.ts`? | Yes; updated all consumers to import from `./controller` | Clean architecture without duplicate export layers; verified only 3 consumer files in codebase | Maintaining re-export wrapper | This task |

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | Single Responsibility | 3 distinct controllers created in `controller/` | `generate-preview.controller.ts`, `create-preview-job.controller.ts`, `get-preview-job-status.controller.ts` | Directory & file check | Verified |
| AC-02 | Import Synchronization | Barrel exports in `controller/index.ts` and all consumers updated | `index.ts` barrel export | Typecheck & import test | Verified |
| AC-03 | Zero Regressions | All existing Gemini and CORS tests pass | Route handlers preserved identically | `vitest run` on gemini test suites | Verified |

## Scope
- Extract `generate-preview.controller.ts`
- Extract `create-preview-job.controller.ts`
- Extract `get-preview-job-status.controller.ts`
- Create `controller/index.ts` barrel export
- Remove `gemini.controller.ts`
- Update `gemini.route.ts`, `cors.test.ts`, and `gemini-route.test.ts` imports to `./controller`

## Non-goals
- Modifying route logic, schemas, or service behaviors.
- Altering external client contract routes.

## Phases

- [x] `phase-01-extract-controllers.md` — Extract sub-controllers and create barrel export
- [x] `phase-02-sync-routes-and-verify.md` — Update route imports, verify type safety and test suites

## Verification

- `pnpm --filter sentinel-api test src/tests/gemini/ src/modules/integrations/gemini/` (54/54 passed)
- `pnpm --filter sentinel-api test src/tests/cors.test.ts` (11/11 passed)

## Deviations

Per developer instruction, removed `gemini.controller.ts` directly and migrated consumer import statements to `./controller` instead of maintaining the backward compatibility wrapper file.

## Result
Completed.
