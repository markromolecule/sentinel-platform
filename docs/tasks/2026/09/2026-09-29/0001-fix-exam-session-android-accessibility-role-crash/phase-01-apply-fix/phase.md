---
title: "Phase 01 – Apply accessibilityRole Fix and Update Test"
type: phase
parent: "0001-fix-exam-session-android-accessibility-role-crash"
phase: "01"
phase_branch: "task/0001/phase-01"
status: completed
created: "2026-09-29"
tags: [task, phase, fix, mobile, android]
---

# Phase 01 – Apply `accessibilityRole` Fix and Update Test

## Objective

Replace the invalid `accessibilityRole={"article" as any}` in `PassageCard` with the valid React Native value `"none"`, remove the TypeScript `as any` suppression cast, and update the companion unit test assertion to match the corrected value — in a single atomic commit that never leaves the suite in a broken state.

## Dependencies & Prerequisites

- Git worktree provisioned at `.worktrees/0001/phase-01/unit-01-apply-fix/` on branch `task/0001/phase-01/unit-01-apply-fix`, cut from task base branch `task/0001-fix-exam-session-android-accessibility-role-crash`.
- No prior phases — this is the first and only phase.

## Unit Index & Worktree Allocation

| Unit ID | Title | Artifact File | Branch | Worktree Directory | Depends On | Parallelizable With | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **1.01** | Apply fix and update test | `unit-01-apply-fix.md` | `task/0001/phase-01/unit-01-apply-fix` | `.worktrees/0001/phase-01/unit-01-apply-fix/` | none | none | planned |

## Impacted Files & Components

| File | Change Type | Description |
|---|---|---|
| `app/sentinel-mobile/features/exam/components/session/passage-card.tsx` | Modify | Line 63: change `{"article" as any}` → `"none"` |
| `app/sentinel-mobile/features/exam/components/session/passage-card.test.tsx` | Modify | Line 115: change `.toBe('article')` → `.toBe('none')` |

## Implementation Tasks

- [ ] Unit 1.01 — Apply `accessibilityRole` fix in `passage-card.tsx` and update `passage-card.test.tsx` assertion

## Verification & Testing

```bash
# From the unit worktree root (sentinel-mobile package):
cd app/sentinel-mobile

# 1. TypeScript compilation — must exit 0
pnpm exec tsc --noEmit

# 2. Unit test suite — passage-card tests must all pass
pnpm vitest run features/exam/components/session/passage-card.test.tsx

# 3. Full mobile test suite (smoke)
pnpm vitest run
```

## Risks, Worktree Teardown & Rollback

- **Risk:** Committing source fix without test update would leave the suite with a failing assertion. Mitigated by the unit scope fence — both files are in scope and must be committed together.
- **iOS regression risk:** Negligible. iOS silently ignored `"article"`; `"none"` is equivalently passive.
- **Rollback:** `git revert <commit-sha>` on the unit branch. No data migrations or API contracts involved.
- **Teardown:** After unit merges to `task/0001/phase-01`:
  ```bash
  git worktree remove --force .worktrees/0001/phase-01/unit-01-apply-fix
  git worktree prune
  rmdir .worktrees/0001/phase-01 .worktrees/0001 2>/dev/null || true
  ```
