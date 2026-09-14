---
status: completed
phase: "Phase 3"
title: "File Relocation, Import Updates & Unit Tests"
completed: "2026-09-13"
---

# Phase 3: File Relocation, Import Updates & Unit Tests

## Overview

Move files into their respective subfolders, update relative import paths within hooks, generate barrel exports, and update consumer import statements.

## Tasks

- [x] Relocate all 30 hook and test files into the 7 domain subdirectories:
  - `checkup/` (5 files)
  - `consent/` (1 file)
  - `detail/` (1 file)
  - `lobby/` (4 files)
  - `monitoring/` (4 files)
  - `result/` (2 files)
  - `session/` (13 files)
- [x] Update internal imports in `use-mobile-live-inspection.ts` from `../lib/` and `../components/` to path aliases `@/features/exam/...`.
- [x] Create `index.ts` barrel files in each of the 7 group folders with full type and function exports.
- [x] Create root `features/exam/hooks/index.ts` re-exporting all groups.
- [x] Update import statements in all 9 consumer screens and components:
  - `app/sentinel-mobile/app/exam/[id]/checkup/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/instruction/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/privacy/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/lobby/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/result/index.tsx`
  - `app/sentinel-mobile/features/exam/components/session/question-drawer.tsx`
  - `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`
  - `app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx`
- [x] Verify that all 49 hook tests pass across the 10 test suites.
- [x] Verify that `tsc --noEmit` passes with 0 type errors.

## Verification Evidence

- `pnpm --filter sentinel-mobile test features/exam/hooks`: PASS (10/10 test files, 49/49 tests passed)
- `pnpm --filter sentinel-mobile exec tsc --noEmit`: PASS (0 type errors)
