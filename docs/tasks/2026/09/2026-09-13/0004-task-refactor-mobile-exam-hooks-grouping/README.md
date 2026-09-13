---
title: "Refactor Mobile Exam Hooks into Domain Group Folders"
type: task
status: completed
created: "2026-09-13"
tags: [task, refactor, sentinel-mobile, exam, hooks]
---

# Refactor Mobile Exam Hooks into Domain Group Folders

## Outcome

Successfully decomposed the 30 flat hook and test files in `app/sentinel-mobile/features/exam/hooks` into 7 cohesive domain group folders (`checkup`, `consent`, `detail`, `lobby`, `monitoring`, `result`, `session`), with individual group barrel exports and a central root barrel export, improving code discovery and maintainability while preserving 100% behavioral equivalence and passing all 49 existing tests with 0 TypeScript compiler errors.

## Pre-planning record

### Context Specification

- Canonical context: `docs/context/September/13/refactor-mobile-exam-hooks-grouping.md`

### Actors and goals

- **Mobile Developer:** Wants exam hooks modularized into clear domain folders matching student workflow and feature components, reducing cognitive friction and file sprawl.
- **Consumer Components & Screens:** Import hooks cleanly without broken path references or brittle deep imports.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- |
| SC-01 | Engineer searches for checkup hooks | Hooks refactored | Finds all hardware/calibration hooks and tests inside `hooks/checkup/` | N/A | Verified |
| SC-02 | Screen routes import hooks | Route files (`app/exam/[id]/*`) load | Import from group barrels or specific hooks cleanly | Relative path alias fallback | Verified |
| SC-03 | Component imports live inspection or mediapipe | `mobile-live-inspection-bridge` mounts | Imports resolve from `hooks/monitoring/` without circular dependency | Direct sub-module resolution | Verified |
| SC-04 | Vitest runs hook test suites | Vitest executed with path aliases | All 49 tests in 10 test files execute and pass | Fix import references | Verified |
| SC-05 | TypeScript compiler checks mobile project | `tsc --noEmit` executed | 0 type errors across whole mobile app | Type check gates | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
| --- | --- | --- | --- | --- | --- |
| D-01 | How many domain subfolders should be created? | 7 folders: `checkup`, `lobby`, `session`, `monitoring`, `detail`, `consent`, `result` | Mirrors exam lifecycle stages, matching `components/` subdirectories and routes | 1 monolithic or 2 huge folders (keeps file sprawl) | `hooks/` |
| D-02 | Should `monitoring` hooks be separated from `session`? | Yes, create `hooks/monitoring/` for live inspection and MediaPipe hooks | Monitoring hooks interact with heavy external systems (LiveKit WebRTC, MediaPipe vision), have distinct lifecycle from exam session questions/timer | Nesting inside `session/` (inflates session folder) | `hooks/monitoring/` |
| D-03 | How to ensure backward compatibility and ergonomic imports? | Export group barrels (`index.ts`) in each folder and a top-level `features/exam/hooks/index.ts` | Allows existing and new callers to import either from `@/features/exam/hooks` or deep from `@/features/exam/hooks/<group>` | Requiring deep imports only (causes churn) | `hooks/index.ts` |
| D-04 | How to handle internal relative imports in relocated hooks? | Replace relative `../lib/` and `../components/` with `@/features/exam/...` aliases | Prevents broken relative import depth issues when files are moved 1 level deeper | Fragile `../../lib/...` relative chains | Relocated hook files |

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| AC-01 | SC-01, D-01 | All 30 flat hook files organized into 7 group directories | Move files into `checkup`, `lobby`, `session`, `monitoring`, `detail`, `consent`, `result` | Directory structure inspection | Verified |
| AC-02 | D-03 | Each group folder provides an `index.ts` barrel file | Create `index.ts` in each of the 7 group folders | Unit tests and export validation | Verified |
| AC-03 | D-03 | Root `hooks/index.ts` provides complete public API | Create `app/sentinel-mobile/features/exam/hooks/index.ts` | Import tests | Verified |
| AC-04 | SC-02, SC-03 | All consumer components and routes updated | Update imports in routes and `features/exam/components/session/*` | TypeScript `tsc --noEmit` | Verified |
| AC-05 | SC-04, SC-05 | 100% test pass and clean typecheck | Run `vitest` on `features/exam/hooks` and `tsc --noEmit` | `pnpm --filter sentinel-mobile test` & `tsc` | Verified |

## Phased Execution Record

- [x] [Phase 1: Discovery, Mapping and Contracts](./phase-01-discovery-and-scenarios.md) — Completed
- [x] [Phase 2: Target Directory Scaffolding & Barrel Design](./phase-02-architecture-and-contracts.md) — Completed
- [x] [Phase 3: File Relocation, Import Updates & Unit Tests](./phase-03-implementation-and-tests.md) — Completed
- [x] [Phase 4: Full Verification and Type Safety Audit](./phase-04-verification-and-release.md) — Completed
