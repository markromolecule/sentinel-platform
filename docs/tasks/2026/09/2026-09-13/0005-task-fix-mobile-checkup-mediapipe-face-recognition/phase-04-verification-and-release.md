---
title: "Phase 4 — Verification, Quality Gates, and Release"
type: phase
parent: "0005-task-fix-mobile-checkup-mediapipe-face-recognition"
phase: "04"
status: planned
created: "2026-09-13"
tags: [task, phase, verification, release]
---

# Phase 4 — Verification, Quality Gates, and Release

## Objective

Execute the full verification suite, validate TypeScript contracts, perform end-to-end checkup flow tests in the mobile application, and verify acceptance criteria before release.

## Dependencies & Prerequisites

- Phase 3 Implementation: `docs/tasks/2026/09/2026-09-13/0005-task-fix-mobile-checkup-mediapipe-face-recognition/phase-03-implementation-and-tests.md`

## Impacted Files & Components

- Full `app/sentinel-mobile` workspace
- Documentation artifacts

## Implementation Tasks

- [ ] Task 1 — Run automated unit tests across `app/sentinel-mobile`.
- [ ] Task 2 — Run TypeScript type checking (`pnpm typecheck`) across the workspace.
- [ ] Task 3 — Manual end-to-end verification of the checkup page flow in Expo:
  - Verify camera stream renders in preview.
  - Verify loading indicator while model loads.
  - Verify guide ellipse turns green when face is aligned.
  - Verify calibration progress bar fills from 0% to 100% over 6 frames.
  - Verify profile is saved and "Start Exam" CTA unlocks.
- [ ] Task 4 — Update task plan, record verification evidence, and mark all phases complete.

## Verification & Testing

- `pnpm vitest run features/exam/components/checkup/mobile-mediapipe-bridge.test.tsx`
- `pnpm vitest run features/exam/hooks/checkup/use-exam-checkup.test.ts`
- `pnpm vitest run features/exam/lib/mobile-mediapipe-calibration.test.ts`
- `pnpm typecheck`

## Risks & Rollback

- Clean git working tree allows immediate rollback via `git checkout` if any unexpected regression occurs.
