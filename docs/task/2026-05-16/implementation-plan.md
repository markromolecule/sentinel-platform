# Implementation Plan - Support Page Improvements & Admin UI Refactoring

## Goal

Standardize filtering on Support portal Course/Subject pages, refactor the Administrator Management header/sidebar, and integrate Whitelist management into the Support portal.

## Pre-Planning

- [x] Read and summarize the task input: Fix immediate filtering on Support Course/Subject pages, move Superadmin/Support header buttons to sidebar in Admin portal, and add Whitelist management to Support portal.
- [x] Scan relevant source files: Checked `sentinel-support` views and hooks, `sentinel-core` sidebar/header components.
- [x] Identify all files: `use-courses-page-state`, `use-subjects-page-state`, `AdminHeader`, `AdminSidebar`, `constants/index.ts`.
- [x] Determine if a Prisma migration is needed: **No** - logic and UI changes only.

## Deliverables

### Plan File

- Path: `docs/task/2026-05-16/implementation-plan.md`

## Phase 1: Support Portal Filtering Fix

**Goal:** Ensure Course and Subject pages show all data by default and handle empty filters correctly.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index.ts`
    - Change initial `selectedInstitutionId` from `''` to `undefined`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/_hooks/use-subjects-page-state/index.ts`
    - Change initial `selectedInstitutionId` from `''` to `undefined`.
- [x] Update `CoursesView.tsx` and `SubjectsView.tsx` in `sentinel-support`
    - Ensure `columnFilters` is handled correctly when `selectedInstitutionId` is `undefined`.
- [x] Write Vitest tests for `use-courses-page-state` and `use-subjects-page-state`.
      **Migration required:** No

## Phase 2: Administrator Management UI Refactoring

**Goal:** Move "Superadmin" and "Support" access from the header to the sidebar.

- [x] Locate and remove "Superadmin" and "Support" buttons from `app/sentinel-core/src/components/sidebar/admin/admin-header.tsx` (or related sub-components).
- [x] Update `MANAGEMENT_ITEMS` in `app/sentinel-core/src/components/sidebar/admin/constants/index.ts`
    - Add "Superadmin" (pointing to `/dashboard` or superadmin specific routes) and "Support" (pointing to Support portal URL) as sub-items or main items.
- [x] Verify sidebar navigation works as expected for different roles.
      **Migration required:** No

## Phase 3: Support Whitelist Integration

**Goal:** Implement Whitelist management in the Support portal with Institution/Department/Course selection.

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/page.tsx` and related components.
- [x] Implement `WhitelistManagementView` and `WhitelistForm` in `sentinel-support`.
    - Reference `app/sentinel-core/src/app/(protected)/(admin)/users/whitelist` for the flow.
    - Ensure Institution, Department, and Course selectors are functional and properly filtered.
- [x] Update `app/sentinel-support/src/app/(protected)/(support)/_components/sidebar/constants/index.ts` (or equivalent) to include the "Whitelist" item.
- [x] Write Vitest tests for the new whitelist logic.
      **Migration required:** No

## Done Criteria

- Course and Subject pages in Support portal show all data when no institution is selected.
- Header in Admin portal is cleaner; Superadmin/Support links are in the sidebar.
- Whitelist management is accessible and functional in the Support portal.
- All new logic is covered by Vitest tests.
- UI follows established Sentinel design patterns.

## Progress Tracking

- [x] **Phase 1: Support Portal Filtering Fix** (Status: Complete)
- [x] **Phase 2: Admin UI Refactoring** (Status: Complete)
- [x] **Phase 3: Support Whitelist Integration** (Status: Complete)

---

**Plan Status:** Completed
