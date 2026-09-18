---
title: "Phase 3 — Course Catalog & Classification Views Implementation"
type: phase
parent: "0001-task-course-management-frontend-terminology"
phase: "03"
status: completed
created: "2026-09-19"
tags: [task, phase, catalog, classifications]
---

# Phase 3 — Course Catalog & Classification Views Implementation

## Objective

Update the primary catalog pages (`/subjects`), course classifications pages (`/subjects/classifications`), table columns, search inputs, dialogs, empty states, and permission guards across `sentinel-web`, `sentinel-core`, and `sentinel-support`.

## Dependencies & Prerequisites

- Phase 2 layout shells and sub-navigation completed.

## Impacted Files & Components

- **`sentinel-support`:**
  - `src/app/(protected)/(support)/subjects/page.tsx`
  - `src/app/(protected)/(support)/subjects/_components/views/subjects-view.tsx`
  - `src/app/(protected)/(support)/subjects/_components/tables/subject-columns.tsx`
  - `src/app/(protected)/(support)/subjects/_components/forms/subject-form-dialog.tsx`
  - `src/app/(protected)/(support)/subjects/_components/dialogs/delete-subject-dialog.tsx`
  - `src/app/(protected)/(support)/subjects/_components/dialogs/bulk-upload-dialog.tsx`
  - `src/app/(protected)/(support)/subjects/classifications/_components/views/subject-classifications-view.tsx`
- **`sentinel-core`:**
  - `src/app/(protected)/subjects/page.tsx`
  - `src/app/(protected)/subjects/page.test.tsx`
  - `src/app/(protected)/subjects/_components/views/subjects-view.tsx`
  - `src/app/(protected)/subjects/classifications/page.tsx`
- **`sentinel-web`:**
  - `src/app/(protected)/(instructor)/subjects/page.tsx`
  - `src/app/(protected)/(instructor)/subjects/_components/views/subjects-list.tsx`
  - `src/app/(protected)/(instructor)/subjects/_components/views/subjects-empty-state.tsx`
  - `src/app/(protected)/(instructor)/subjects/_components/dialogs/request-subject-dialog.tsx`

## Implementation Tasks

- [x] Task 3.1 — In `sentinel-support`:
  - `subjects-view.tsx`: Header title `"Course List"`, description `"Browse and manage the institutional course catalog."`, button `"+ Add Course"`, search `"Search courses..."`, delete dialog `"Delete Selected Courses?"`.
  - `subject-columns.tsx`: Header title `"Course"`.
  - `subject-form-dialog.tsx`: Titles `"Add Course"` / `"Edit Course"`, descriptions referencing course.
  - `delete-subject-dialog.tsx`: `"Delete this course?"`, `"from the course catalog"`, button `"Delete Course"`.
  - `bulk-upload-dialog.tsx`: `"Bulk Upload Courses"`, descriptions referencing courses.
  - `subject-classifications-view.tsx`: Header title `"Course Classifications"`, description `"Manage institution-level course groupings..."`, empty state `"Create course classifications..."`.
- [x] Task 3.2 — In `sentinel-core`:
  - `page.tsx`: Header title `"Course List"`, description `"Manage the shared institutional course catalog used for term offerings."` / `"Browse the shared institutional course catalog and offer courses..."`.
  - `subjects-view.tsx`: Table headers and modal copy updated to Course.
  - `page.test.tsx`: Update assertions to check `"Course List"`.
  - `classifications/page.tsx`: Header title `"Course Classifications"`, description `"Create shared grouping cards for the institutional course catalog, then assign courses into each classification."`.
- [x] Task 3.3 — In `sentinel-web`:
  - `page.tsx`: Header title `"Course List"`, description `"Manage the offered courses you have requested or are currently teaching."`, button `"Request Course"`.
  - `subjects-list.tsx`: Placeholder `"Search courses..."`, table header `"Course"`.
  - `subjects-empty-state.tsx`: `"No courses found"`, `"No courses requested"`.

## Verification & Testing

- `pnpm --filter sentinel-core test page.test.tsx`
- Manual visual verification against screenshots.

## Risks & Rollback

- Risk: Mismatched keys in translation or test queries.
- Mitigation: Verify tests and run all unit tests for the updated components.
