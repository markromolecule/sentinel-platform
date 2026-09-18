---
title: "Phase 2 — Navigation, Layout Shells, & Sub-Navigation Alignment"
type: phase
parent: "0001-task-course-management-frontend-terminology"
phase: "02"
status: completed
created: "2026-09-19"
tags: [task, phase, navigation, layout]
---

# Phase 2 — Navigation, Layout Shells, & Sub-Navigation Alignment

## Objective

Update the main navigation sidebars, workspace layout shell headers, and secondary sub-navigation links across `sentinel-web`, `sentinel-core`, and `sentinel-support`, ensuring consistent terminology from the outer shell inward, and update the associated test suites.

## Dependencies & Prerequisites

- Phase 1 baseline inventory confirmed.

## Impacted Files & Components

- **`sentinel-web`:**
  - `src/components/sidebar/instructor/constants/index.ts`
  - `src/components/sidebar/instructor/instructor-sidebar.tsx`
  - `src/app/(protected)/(instructor)/subjects/_components/layout/subject-workspace-shell.tsx`
  - `src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.tsx`
  - `src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.test.tsx`
- **`sentinel-core`:**
  - `src/components/sidebar/common/core-admin-nav-config.ts`
  - `src/app/(protected)/subjects/_components/layout/subject-workspace-shell.tsx`
  - `src/app/(protected)/subjects/_components/layout/subject-nav.tsx`
  - `src/app/(protected)/subjects/_components/layout/subject-nav.test.tsx`
- **`sentinel-support`:**
  - `src/components/sidebar/support/constants/index.ts`
  - `src/app/(protected)/(support)/subjects/_components/layout/subject-workspace-shell.tsx`
  - `src/app/(protected)/(support)/subjects/_components/layout/subject-nav.tsx`
  - `src/app/(protected)/(support)/subjects/_components/layout/subject-nav.test.tsx`

## Implementation Tasks

- [x] Task 2.1 — In `sentinel-web`:
  - Rename `title: 'Subjects'` to `title: 'Courses'` in `studentManagementItems`.
  - In `instructor-sidebar.tsx`, support `item.title === 'Courses'` in `isActive` check.
  - In `SubjectWorkspaceShell`, change header to `"Course Management"`.
  - In `SubjectNav`, update group `'My Subjects'` -> `'My Courses'`, item `'Subject List'` -> `'Course List'`, `'Offered Subjects'` -> `'Offered Courses'`.
  - In `subject-nav.test.tsx`, update test assertions to match `'Course List'` and `'Offered Courses'`.
- [x] Task 2.2 — In `sentinel-core`:
  - Rename `title: 'Subjects'` to `title: 'Courses'` in `core-admin-nav-config.ts`.
  - In `SubjectWorkspaceShell`, change header to `"Course Management"`.
  - In `SubjectNav`, update items: `'Course List'`, `'Course Classifications'`, `'Offered Courses'`.
  - In `subject-nav.test.tsx`, update test assertions for the 4 nav items.
- [x] Task 2.3 — In `sentinel-support`:
  - Rename `title: 'Subjects'` to `title: 'Courses'` in `supportItems`.
  - In `SubjectWorkspaceShell`, change header to `"Course Management"`.
  - In `SubjectNav`, update items: `'Course List'`, `'Course Classifications'`, `'Offered Courses'`.
  - In `subject-nav.test.tsx`, update test assertions for the 4 nav items.

## Verification & Testing

- `pnpm --filter sentinel-web test src/app/\(protected\)/\(instructor\)/subjects/_components/layout/subject-nav.test.tsx --run` (PASS: 3/3 passed)
- `pnpm --filter sentinel-core test src/app/\(protected\)/subjects/_components/layout/subject-nav.test.tsx --run` (PASS: 5/5 passed)
- `pnpm --filter sentinel-support test src/app/\(protected\)/\(support\)/subjects/_components/layout/subject-nav.test.tsx --run` (PASS: 5/5 passed)

## Risks & Rollback

- Risk: Active tab matching breaks if route `href` is altered.
- Mitigation: Kept all `href` values identical (`/subjects`, `/subjects/offered`, etc.); only changed display `label` and header text.
