---
title: "Refactor Mobile Exam Hooks into Domain Group Folders"
type: context
status: draft
created: "2026-09-13"
tags: [context, refactor, sentinel-mobile, exam, hooks]
feature: "refactor-mobile-exam-hooks-grouping"
---

# Refactor Mobile Exam Hooks into Domain Group Folders Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  Currently, `app/sentinel-mobile/features/exam/hooks` contains 30 flat files (19 hook files and 11 related unit test files). All lifecycle stages—pre-exam details, privacy consent, hardware checkup, lobby synchronization, in-exam session management, AI/MediaPipe monitoring, and post-exam results—are mixed into a single flat directory. This introduces cognitive overhead, makes navigation and file discovery difficult, increases risk of accidental coupling, and violates modular architecture standards (`rules/typescript/common/next-react-project-structure.md`).

- **Business / User Value:**
  - Improves maintainability and developer velocity for mobile exam engineering.
  - Aligns hook directory structure directly with feature components (`features/exam/components/`) and student exam route phases (`app/exam/[id]/*`).
  - Ensures clean encapsulation where related sub-hooks and their unit tests are co-located in cohesive group folders.
  - Maintains strict backwards compatibility and zero behavioral regression through group-level and root barrel exports.

- **Success Criteria:**
  - All 30 hook and test files in `app/sentinel-mobile/features/exam/hooks/` are categorized into logical domain group folders.
  - Each group folder contains a cohesive `index.ts` barrel export.
  - A root `features/exam/hooks/index.ts` re-exports public hooks across all groups for ergonomic consumption.
  - All consumer routes (`app/exam/[id]/*`) and components (`features/exam/components/session/*`) update imports to the new structure cleanly.
  - 100% of existing unit tests (all 49 tests across 10 test suites) pass without modification or errors.
  - Full TypeScript typecheck (`tsc --noEmit`) passes cleanly with zero errors.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a mobile frontend engineer, I want exam hooks to be grouped into cohesive domain folders (checkup, lobby, session, monitoring, detail, consent, result), so that I can easily locate and maintain lifecycle-specific logic without wading through 30 flat files.*
- *As a test author, I want unit tests to be co-located with their target hooks in the group folders, so that test isolation and refactoring are straightforward.*
- *As a consumer component or screen route, I want clean barrel exports and typed entry points, so that importing hooks is intuitive and refactoring does not cause broken imports.*

### Functional Requirements

- [ ] **FR-1: Group Taxonomy Definition:** Group the 30 hook files into 7 domain subfolders:
  1. `checkup/`: `use-checkup-audio.ts`, `use-checkup-calibration.ts`, `use-checkup-camera.ts`, `use-exam-checkup.ts`, `use-exam-checkup.test.ts`.
  2. `lobby/`: `use-exam-lobby.ts`, `use-exam-lobby-sync.ts`, `use-lobby-readiness.ts`, `use-exam-lobby.test.ts`.
  3. `session/`: `use-exam-session.ts`, `use-exam-session-lifecycle.ts`, `use-exam-session-navigation.ts`, `use-exam-session-security.ts`, `use-exam-session-submission.ts`, `use-exam-session-sync.ts`, `use-exam-session-timer.ts`, `use-drawer-animation.ts`, and their test suites (`use-exam-session.test.ts`, `use-exam-session-navigation.test.ts`, `use-exam-session-sync.test.ts`, `use-exam-session-timer.test.ts`, `use-drawer-animation.test.ts`).
  4. `monitoring/`: `use-mobile-live-inspection.ts`, `use-mobile-mediapipe-monitoring.ts`, and their test suites (`use-mobile-live-inspection.test.ts`, `use-mobile-mediapipe-monitoring.test.ts`).
  5. `detail/`: `use-exam-details.ts`.
  6. `consent/`: `use-exam-consent.ts`.
  7. `result/`: `use-exam-result.ts`, `use-exam-result.test.ts`.
- [ ] **FR-2: Internal Relative Import Integrity:** Fix relative imports within moved hooks (e.g. `use-mobile-live-inspection.ts` referencing `../lib/` or `../components/`) to use project path aliases (`@/features/exam/...`) to prevent broken paths.
- [ ] **FR-3: Group Barrel Exports (`index.ts`):** Provide an `index.ts` in each group folder re-exporting the primary and sub-hooks.
- [ ] **FR-4: Root Barrel Export (`features/exam/hooks/index.ts`):** Provide a top-level barrel export so consumers can import either from specific domain folders or the central hooks module.
- [ ] **FR-5: Consumer Import Updates:** Update all consumer screens and components to import from the structured group paths.

### Edge Cases & Failure Modes

- **Circular Dependencies:** Ensure no circular imports between sub-hooks (e.g., `use-exam-session` importing sub-hooks vs sub-hooks importing parent).
- **Test Runner Module Resolution:** Vitest / Jest test runner must resolve path aliases (`@/*`) and co-located relative imports properly inside subfolders.
- **Transitive Re-exports:** Maintain existing re-exports in compound hooks like `useExamCheckup` and `useExamSession` so callers relying on them do not encounter undefined symbols.

---

## 3. Technical & Architectural Context

- **Affected Domains / Layers:** Mobile (`app/sentinel-mobile/features/exam/hooks/`).
- **Target Files to Relocate:**
  - `checkup/`: 5 files
  - `lobby/`: 4 files
  - `session/`: 13 files
  - `monitoring/`: 4 files
  - `detail/`: 1 file
  - `consent/`: 1 file
  - `result/`: 2 files
- **Consumer Files to Update:**
  - `app/sentinel-mobile/app/exam/[id]/checkup/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/instruction/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/privacy/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/lobby/index.tsx`
  - `app/sentinel-mobile/app/exam/[id]/result/index.tsx`
  - `app/sentinel-mobile/features/exam/components/session/question-drawer.tsx`
  - `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`
  - `app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx`
- **Data Model & Schema Changes:** None (pure architectural refactoring).
- **Security & Authorization:** No impact on security policies or tokens.

---

## 4. UI/UX & Interaction Guidelines

- No UI/UX visual changes; purely structural refactoring.
- Retains 100% identical runtime behavior and test fidelity.

---

## 5. Scope & Boundaries

- **In Scope:**
  - Relocating all 30 hook files into 7 domain subdirectories under `app/sentinel-mobile/features/exam/hooks/`.
  - Creating `index.ts` barrel files for each subfolder and the root `hooks/` directory.
  - Updating all 9 consumer file import declarations across `sentinel-mobile`.
  - Verifying all 49 vitest tests and TypeScript typechecks.
- **Out of Scope / Non-Goals:**
  - Altering the business logic, state machines, or signatures of any hooks.
  - Refactoring unrelated hooks outside `features/exam/hooks/` (e.g. auth hooks).
  - Changing UI component implementations.

---

## 6. References & External Context

- `rules/typescript/common/next-react-project-structure.md` (Feature slice and hook organization standards)
- `rules/solid/single-responsibility.md`
- `context-factory/skills/engineering/refactor/SKILL.md`
- Related tasks: `docs/tasks/2026/09/2026-09-13/0003-task-fix-mobile-exam-rendering-telemetry-turned-in-tabs/`
