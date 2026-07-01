# Fix 001 Implementation Plan: Student Exam Flow Visibility And Responsive UX

**Status:** In Progress  
**Date:** 2026-06-25  
**Type:** fix  
**Scope:** `sentinel-api`, `sentinel-web`, `packages/shared`, `packages/services`

## Pre-Planning

- **Task Summary:** Ensure assigned student exams are visible only when published and in the correct schedule state, then redesign the student exam flow pages so Instruction, Privacy, Checkup, and Lobby work well on laptops, mobile, and desktop.
- **Source Files Scanned:**
    - `docs/context/June/June 25/issue-and-enhancement-for-exam-flow.md`
    - `.agents/rules/implementation-plan.md`
    - `.agents/rules/global/1-3-1-rule.md`
    - `.agents/workflows/to-do-workflow.md`
    - `docs/task/2026-06-23/fix-002-implementation-plan-student-exam-visibility-and-availability.md`
    - `docs/task/2026-06-24/fix-003-implementation-plan-exam-assign-not-showing.md`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/privacy/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/_components/*`
    - `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx`
    - `packages/shared/src/exams/resolve-exam-status.ts`
    - `packages/services/src/api/exams/mappers.ts`
    - `packages/services/src/api/exams/types.ts`
- **Files, Services, And DB Tables Touched:**
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/privacy/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/exam/_components/`
    - `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx`
    - `packages/shared/src/exams/resolve-exam-status.ts`
    - `packages/services/src/api/exams/mappers.ts`
    - `packages/services/src/api/exams/types.ts`
    - DB tables: `exams`, `exam_attempts`, `exam_admissions`, `exam_section_assignments`, `exam_assigned_sections`, `students`, `class_groups`
- **Prisma Migration Needed:** No new migration is planned. The work is query, mapper, and UI behavior alignment on top of the current schema.

## 1-3-1 Options

### Option 1: Page-Level Fixes Only

Patch the student pages individually so Instruction, Privacy, Checkup, and Lobby look better on smaller screens and rely on the current API behavior.

- **Tradeoff:** Fastest to ship, but the visibility contract would remain split across list filtering and schedule interpretation, so stale or inconsistent exam states can still leak through.

### Option 2: Shared Student Exam Flow Contract

Centralize visibility and status resolution in shared API and client helpers, then refactor the student exam pages to consume a single responsive component set for the flow.

- **Tradeoff:** More files change, but it fixes the actual behavior gap and gives Instruction, Privacy, Checkup, and Lobby a consistent cross-device structure.

### Option 3: Dedicated Student Flow Endpoint

Add a new endpoint that returns pre-shaped data for the exam flow pages and have the student UI render directly from that specialized contract.

- **Tradeoff:** Cleaner boundary in theory, but it is the largest change and would duplicate a contract that already exists in the current API shape.

## Best Option

Choose **Option 2**.

It best matches the current repository because the visibility problem is already close to being solved by existing student exam data paths, and the UI work benefits from shared components rather than isolated page edits. This option keeps the current API surface stable while making the student flow consistent, responsive, and easier to maintain.

**Concrete next steps:**

1. Make student exam visibility authoritative for `published_at`, draft exclusion, and schedule-aware status resolution.
2. Update the shared student exam normalization so `available`, `upcoming`, `in-progress`, and `past_due` are derived consistently across student pages.
3. Refactor the four student flow pages into a shared responsive component set so desktop and mobile layouts stay aligned.
4. Adjust lobby count and reconnect UI so the displayed count reflects the actual admission/reconnect state instead of an inflated fallback.
5. Add targeted tests for visibility, status transitions, and the redesigned student flow layout behavior.

## Phase 1: Lock Student Visibility And Status Resolution

**Goal:** Make published exam visibility and schedule state consistent across student list, detail, classroom, and history surfaces.

- [x] Update `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` so student-facing queries require `published_at` and exclude `DRAFT` rows while preserving other lifecycle states.
- [x] Update `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts` with the same student visibility rules so detail access cannot diverge from the list query.
- [x] Review `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` and keep the assignment/published predicates aligned with the list and detail filters.
- [x] Update `packages/shared/src/exams/resolve-exam-status.ts` if the current status resolver still allows stale `available` values after the end cutoff or fails to map schedule-aware states deterministically.
- [x] Update `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts` so the student client trusts the schedule-aware status output instead of stale raw statuses.
- [x] Add or update tests in `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts`, `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts`, and `packages/shared/src/exams/resolve-exam-status.test.ts` for draft, published, upcoming, active, and past-due transitions.

**Migration required:** No - this phase changes read logic and status normalization only.
**Migration applied:** No - query and client status logic only.
**Breaking changes:** No.

<!-- NOTE: Added `buildPublishedStudentExamPredicate()` in `build-student-exam-scope-predicates.ts` so student list and detail queries share the same published-plus-not-draft gate. -->
<!-- NOTE: `resolveStudentExamStatus()` already handled schedule transitions correctly, so the Phase 1 behavioral fix was applied in `normalize-student-exam.ts` by re-resolving student-facing statuses instead of trusting stale upstream `available` or `upcoming` values. -->
<!-- NOTE: Phase 1 validation passed with `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/exams/data/get-exams.test.ts src/modules/examination/exams/data/get-exam-by-id.test.ts --reporter=verbose` and `pnpm --dir packages/shared exec vitest run src/exams/resolve-exam-status.test.ts --reporter=verbose`. -->

## Phase 2: Make Classroom And History Surfaces Use One Filter Contract

**Goal:** Keep classroom and history pages aligned with the same active, upcoming, and past-due exam definitions.

- [x] Update `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` to use one shared predicate for active classroom/history statuses.
- [x] Update `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx` so the classroom page respects the same published and schedule-aware filtering rules as the history view.
- [x] Review `packages/services/src/api/exams/mappers.ts` and `packages/services/src/api/exams/types.ts` so the client mapping preserves the fields needed for schedule-aware filtering.
- [x] Add or update tests in `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts` and `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.test.tsx` for upcoming, active, and past-due exam states.

**Migration required:** No - this phase is presentation and query filtering only.
**Migration applied:** No - client filtering and test coverage only.
**Breaking changes:** No.

<!-- NOTE: Exported `isActiveStudentExamStatus()` from `normalize-student-exam.ts` and reused it in both the available history hook and the classroom page so the active-feed contract is defined in one place. -->
<!-- NOTE: `packages/services/src/api/exams/mappers.ts` and `packages/services/src/api/exams/types.ts` already preserved `scheduledDate`, `endDateTime`, and assignment ids needed by the student-side status normalizer, so Phase 2 only added regression coverage in `packages/services/src/api/exams/mappers.test.ts`. -->
<!-- NOTE: Tightened `normalizeStudentExam()` to preserve explicit `archived` and `past_due` statuses while still re-resolving stale `available` or `upcoming` values from schedule state. -->
<!-- NOTE: Phase 2 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts' 'src/app/(protected)/student/classroom/[id]/page.test.tsx' --reporter=verbose` and `pnpm --dir packages/services exec vitest run src/api/exams/mappers.test.ts --reporter=verbose`. -->

## Phase 3: Extract A Shared Responsive Exam Flow Shell

**Goal:** Move the exam flow pages onto reusable responsive components so the layout and copy structure stay consistent across Instruction, Privacy, Checkup, and Lobby.

- [x] Extract shared student flow primitives from `app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction/page.tsx`, `privacy/page.tsx`, `checkup/page.tsx`, and `lobby/page.tsx` into `app/sentinel-web/src/app/(protected)/student/exam/_components/`.
- [x] Split the current instructor-preview-aligned pieces into reusable presentation components that can be consumed by both the student pages and the instructor preview route.
- [x] Keep route-specific behavior in the page files and move only repeated layout, card, and stepper logic into shared components.
- [x] Add or update JSDoc on exported shared components and helper functions if the extraction introduces new exported APIs.
- [x] Add component tests for the shared flow primitives in `app/sentinel-web/src/app/(protected)/student/exam/_components/*.test.tsx`.

**Migration required:** No - this phase only reorganizes client UI code.
**Migration applied:** No - shared component extraction only.
**Breaking changes:** No.

<!-- NOTE: Added `student-flow-primitives.tsx` under `app/sentinel-web/src/app/(protected)/student/exam/_components/` to centralize shared headers, highlights, panels, footer actions, readiness lists, disclosure lists, privacy policy sections, and checkup primitives for student flow screens. -->
<!-- NOTE: Instruction, Privacy, Checkup, and Lobby student flow files now import from the shared student component surface instead of reaching directly into instructor preview component paths. Preview-route constants remain the single source of truth for static policy/readiness copy. -->
<!-- NOTE: Kept route-specific data fetching, redirect checks, lobby state handling, and checkup calibration behavior inside the page or lobby-specific files while moving only layout and presentation concerns into shared primitives. -->
<!-- NOTE: Phase 3 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/_components/student-flow-primitives.test.tsx' 'src/app/(protected)/student/exam/[id]/checkup/page.test.tsx' --reporter=verbose`. -->

## Phase 4: Redesign Instruction And Privacy

**Goal:** Replace the text-heavy introductory screens with concise, mobile-friendly, minimalist screens that still preserve required exam policy details.

- [x] Redesign `app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction/page.tsx` to emphasize exam summary, start requirements, and primary actions with shorter copy blocks.
- [x] Redesign `app/sentinel-web/src/app/(protected)/student/exam/[id]/privacy/page.tsx` so the privacy disclosures are easier to scan on mobile and desktop while keeping the consent state persistent.
- [x] Preserve the existing privacy consent storage behavior and only change presentation, spacing, and hierarchy unless a test reveals a logic gap.
- [x] Add or update tests for instruction and privacy rendering in `app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction/page.test.tsx` and `app/sentinel-web/src/app/(protected)/student/exam/[id]/privacy/page.test.tsx`.

**Migration required:** No - this phase is UI-only.
**Migration applied:** No - page redesign only.
**Breaking changes:** No.

<!-- NOTE: Instruction now uses a concise step-based layout with an exam snapshot, quick-step cards, and a shortened readiness section so the screen is easier to scan on mobile and desktop. -->
<!-- NOTE: Privacy now groups disclosures into shorter monitoring summaries, adds a compact “What this means” section, and keeps the existing `readStoredStudentExamFlow()` / `patchStoredStudentExamFlow()` consent persistence path unchanged. -->
<!-- NOTE: Added direct page-level coverage in `instruction/page.test.tsx` and `privacy/page.test.tsx` so Phase 4 validates both the redesign content and the consent gating behavior. -->
<!-- NOTE: Phase 4 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/instruction/page.test.tsx' 'src/app/(protected)/student/exam/[id]/privacy/page.test.tsx' --reporter=verbose`. -->

## Phase 5: Redesign Checkup For Mobile-First Use

**Goal:** Make the readiness checks easier to complete on laptops and phones while preserving camera, mic, and calibration behavior.

- [x] Redesign `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.tsx` so the camera preview and readiness checklist adapt cleanly to narrow viewports.
- [x] Keep existing permissions, detection, and calibration logic intact while simplifying the visual hierarchy and step flow.
- [x] Reorder or regroup the checkup sections so the primary readiness action is always visible without excessive scrolling.
- [x] Add or update tests in `app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.test.tsx` for success, permission failure, and calibration states.

**Migration required:** No - this phase does not change persisted data.
**Migration applied:** No - page redesign only.
**Breaking changes:** No.

<!-- NOTE: Reworked the Checkup screen into a mobile-first two-column layout with a primary status-and-preview stack, compact readiness summary cards, and a separate requirements/status rail for larger screens. -->
<!-- NOTE: Preserved the existing device permission manager, MediaPipe sandbox resolution, calibration gating, and `patchStoredStudentExamFlow()` persistence behavior; only the presentation hierarchy and grouping changed. -->
<!-- NOTE: Phase 5 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/checkup/page.test.tsx' --reporter=verbose`. -->

## Phase 6: Correct Lobby Count And Reconnect Feedback

**Goal:** Ensure the lobby reflects the real queue/admission state and clearly shows reconnect attempts and progress.

- [x] Update `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx` so the displayed count prefers the API admission count and only falls back to presence when the API value is unavailable.
- [x] Review the reconnect display in `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx` so used attempts are derived from `totalReconnectAttempts - reconnectAttemptsRemaining`.
- [x] Keep polling and admission checks intact while simplifying the status card and lobby messaging.
- [x] Add or update tests in `app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.test.tsx` for waiting, admitted, reconnecting, and count-fallback states.

**Migration required:** No - this phase changes display logic only.
**Migration applied:** No - lobby UI logic only.
**Breaking changes:** No.

<!-- NOTE: Updated the lobby page to treat the API admission count as authoritative and use presence only as a fallback when the API count is unavailable. -->
<!-- NOTE: Reconnect messaging now derives the used count from `totalReconnectAttempts - reconnectAttemptsRemaining` and surfaces both the highlight summary and a clearer status paragraph in `lobby-status-info.tsx`. -->
<!-- NOTE: Preserved the existing lobby polling and admission refresh flow in `use-lobby-state.ts`; Phase 6 only changed display logic and added direct lobby page coverage. -->
<!-- NOTE: Phase 6 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/exam/[id]/lobby/page.test.tsx' 'src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.test.tsx' --reporter=verbose`. -->

## Phase 7: Validation And Release Notes

**Goal:** Prove the student exam flow works end-to-end on the touched routes and document any operational notes.

- [x] Run focused API coverage for `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts`, `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts`, and any co-located scope predicate tests added in Phase 1.
- [x] Run focused web coverage for `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts`, `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.test.tsx`, and the new flow page tests added in Phases 3 through 6.
- [ ] Manually validate the flow at mobile, tablet, and desktop widths for Instruction, Privacy, Checkup, and Lobby.
- [x] Confirm the instructor preview route still matches the redesigned student flow after the shared component extraction.
- [x] Record any rollout notes for support or QA if the visual redesign changes the expected sequence of the exam start flow.

**Migration required:** No - validation only.
**Migration applied:** No - validation only.
**Breaking changes:** No.
<!-- NOTE: Phase 7 automated validation passed with `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/exams/data/get-exams.test.ts src/modules/examination/exams/data/get-exam-by-id.test.ts --reporter=verbose`, `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts' 'src/app/(protected)/student/classroom/[id]/page.test.tsx' 'src/app/(protected)/student/exam/_components/student-flow-primitives.test.tsx' 'src/app/(protected)/student/exam/[id]/instruction/page.test.tsx' 'src/app/(protected)/student/exam/[id]/privacy/page.test.tsx' 'src/app/(protected)/student/exam/[id]/checkup/page.test.tsx' 'src/app/(protected)/student/exam/[id]/lobby/page.test.tsx' 'src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.test.tsx' --reporter=verbose`, `pnpm --dir packages/shared exec vitest run src/exams/resolve-exam-status.test.ts --reporter=verbose`, and `pnpm --dir packages/services exec vitest run src/api/exams/mappers.test.ts --reporter=verbose`. -->
<!-- NOTE: Instructor preview alignment was verified by source review of `instruction-view.tsx` and `privacy-view.tsx`; both still use the same readiness and privacy constants that back the student flow. -->
<!-- NOTE: Manual browser QA across 320 / 375 / 768 / 1024 / 1440 viewports is still pending because it was not executed in this terminal-only validation pass. -->
<!-- NOTE: Support / QA rollout focus: confirm the student journey now reads as Instruction -> Privacy -> Checkup -> Lobby, and verify that support scripts/screenshots reflect the shorter copy and updated readiness messaging on those four screens. -->

## Breaking API Changes

- None planned. The work should stay backward-compatible with the current exam DTOs and route structure.

## Environment Variables

- No new `.env` variables are expected.

## Rollback Note

- Roll back the UI and query changes first. No Prisma migration is planned, so reverting this work should not require database changes.

## Done Criteria

- [ ] Student exam surfaces only show exams when they are published and in the correct schedule state.
- [ ] Draft exams do not appear in student list, classroom, or detail flows.
- [ ] Instruction, Privacy, Checkup, and Lobby render cleanly on laptop, mobile, and desktop sizes.
- [ ] The lobby count and reconnect indicator reflect the real admission/reconnect state.
- [ ] Focused API and web tests pass for the touched visibility and flow components.
- [ ] The instructor preview remains visually aligned with the redesigned student flow.
