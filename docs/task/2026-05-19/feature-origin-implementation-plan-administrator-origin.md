---
trigger: always_on
---

# Implementation Plan: Administrator Origin Tag Removal

## Pre-Planning

- [x] Read and summarize the task input in one sentence: Modify the Origin column across administration tables to display the specific institution name instead of generic tags (Local, Inherited, Overridden).
- [x] Scan relevant source files to understand existing patterns: Analyzed `InheritanceStatusBadge` and `columns.tsx` for Sections, Subjects, and Courses.
- [x] Identify all files, services, and DB tables the task will touch: `inheritance-status-badge.tsx`, and multiple `columns.tsx` files.
- [x] Determine if a Prisma migration is needed: Not needed, `institutionName` is already populated correctly via `loadEffectiveRows`.

## Deliverables

### Plan File

- Path: `docs/task/2026-05-19/feature-origin-implementation-plan-administrator-origin.md`

### Tests

- Vitest files for hooks, services, controllers, and utils
- Co-locate as `*.test.ts` next to source files

### Code Quality

- JSDoc on all exported functions
- Inline comments only where logic is non-obvious

## Phase 1: Update Origin Status Badge

**Goal:** Update the `InheritanceStatusBadge` to render the specific `institutionName` instead of the generic inheritance status tag.

- [x] Modify `app/sentinel-core/src/components/common/inheritance-status-badge.tsx` to render the `record.institutionName` directly, completely removing the visual badges for "Local", "Inherited", or "Overridden". Ensure functions like `isParentOwnedRecord` remain intact as they are used in other components.
- [x] Write tests at `app/sentinel-core/src/components/common/inheritance-status-badge.test.tsx` to verify it renders the institution name correctly.
- [x] Run `pnpm test` and confirm all tests pass
- [x] Mark phase complete in execution log
      **Migration required:** No — UI change only.
      **Breaking changes:** No

## Phase 2: Update Origin Column Accessors

**Goal:** Update table column definitions to ensure data tables sort and filter based on the institution name rather than the internal inheritance status.

- [x] Update `app/sentinel-core/src/app/(protected)/sections/_components/tables/columns.tsx` to change the `accessorFn` for `inheritanceStatus` column to return `row.institutionName ?? 'Unknown'`.
- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/tables/master-columns.tsx` to change the `accessorFn` for `inheritanceStatus` column to return `row.institutionName ?? 'Unknown'`.
- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/tables/subject-offering-columns.tsx` to change the `accessorFn` for `inheritanceStatus` column to return `row.institutionName ?? 'Unknown'`.
- [x] Update `app/sentinel-core/src/features/administration/courses/_components/tables/columns.tsx` to change the `accessorFn` for `inheritanceStatus` column to return `row.institutionName ?? 'Unknown'`.
- [x] Write tests at corresponding test files if applicable, or rely on visual verification since these are standard data table configurations.
- [x] Run `pnpm test` and confirm all tests pass
- [x] Mark phase complete in execution log
      **Migration required:** No — UI data accessor change only.
      **Breaking changes:** No
