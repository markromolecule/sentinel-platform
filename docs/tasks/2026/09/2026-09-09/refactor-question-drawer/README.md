---
title: "Refactor QuestionDrawer Component"
type: task
status: complete
created: "2026-09-09"
tags: [task, refactor, mobile, session, ui, animation]
---

# Refactor QuestionDrawer Component

## Outcome

Refactor `QuestionDrawer` in `app/sentinel-mobile/features/exam/components/session/question-drawer.tsx` to:
1. Extract pure badge style resolution logic into `features/exam/lib/question-drawer-badge.ts`.
2. Extract Reanimated slide animation into `features/exam/hooks/use-drawer-animation.ts`.
3. Consolidate inline styles and legend markup into a maintainable, typed `StyleSheet.create` structure.
4. Maintain 100% test compatibility and behavioral equivalence.

## Pre-planning record

### Decision ledger

| ID | Decision | Rationale | Alternatives rejected |
|---|---|---|---|
| DEC-01 | Extract badge colors to pure function | Eliminates complex ternary calculations in JSX map loop | Keeping inline color variables |
| DEC-02 | Extract animation to `useDrawerAnimation` hook | Decouples animation timing/easing lifecycle from view layout | Leaving Reanimated logic inline |
| DEC-03 | Preserve exact JSX element types (`TouchableOpacity`, `Text`) | Guarantees existing test harnesses traversing shallow elements remain green | Wrapping in custom component tags that break shallow mocks |

## Acceptance criteria

| ID | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|
| AC-01 | `resolveQuestionBadgeStyle` accurately computes current, answered, and flagged colors | `question-drawer-badge.ts` | Unit tests in `question-drawer-badge.test.ts` | Verified |
| AC-02 | `useDrawerAnimation` handles slide in/out transition timing and styles | `use-drawer-animation.ts` | Unit tests in `use-drawer-animation.test.ts` | Verified |
| AC-03 | `QuestionDrawer` renders with consolidated styles and passes all 10 component tests | `question-drawer.tsx` | Unit tests in `question-drawer.test.tsx` | Verified |
| AC-04 | Full mobile test suite and TypeScript verification pass with zero regressions | Package check | `pnpm test` & `tsc --noEmit` | Verified |

## Phases

- [x] `phase-01-boundary-analysis.md` — Phase 1 — Boundary Analysis and Interface Contracts
- [x] `phase-02-vertical-slice-refactoring.md` — Phase 2 — Implementation of Helpers, Hook, and Drawer Refactor
- [x] `phase-03-integration-tests.md` — Phase 3 — Verification, Quality Gates, and Tests
