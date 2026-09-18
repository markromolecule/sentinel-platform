---
title: "Phase 4 — Offered Courses, Requests, and End-to-End Verification"
type: phase
parent: "0001-task-course-management-frontend-terminology"
phase: "04"
status: completed
created: "2026-09-19"
tags: [task, phase, verification, release]
---

# Phase 4 — Offered Courses, Requests, and End-to-End Verification

## Objective

Update the Offered Courses (`/subjects/offered`) and Enrollment Requests (`/subjects/requests`) views across all three portals, execute full test suites, run type checking, and verify complete terminology consistency.

## Dependencies & Prerequisites

- Phase 3 catalog and classifications views updated.

## Impacted Files & Components

- **`sentinel-support`:**
  - `src/app/(protected)/(support)/subjects/offered/_components/views/offered-view.tsx`
  - `src/app/(protected)/(support)/subjects/requests/page.tsx`
- **`sentinel-core`:**
  - `src/app/(protected)/subjects/offered/page.tsx`
  - `src/app/(protected)/subjects/requests/page.tsx`
- **`sentinel-web`:**
  - `src/app/(protected)/(instructor)/subjects/offered/page.tsx`

## Implementation Tasks

- [x] Task 4.1 — In `sentinel-support`:
  - `offered-view.tsx`: Header title `"Offered Courses"`, description `"Review all term-based course offerings."`, placeholder `"Search offered courses..."`.
  - `requests/page.tsx`: Header title `"Enrollment Requests"`, description `"Review and process instructor course enrollment requests."`.
- [x] Task 4.2 — In `sentinel-core`:
  - `offered/page.tsx`: Header title `"Offered Courses"`, description `"Review all term-based course offerings and the audiences they are assigned to."`, button `"+ Offer Course"`.
  - `requests/page.tsx`: Description `"Review and process instructor offered-course enrollment requests."`.
- [x] Task 4.3 — In `sentinel-web`:
  - `offered/page.tsx`: Header title `"Offered Courses"`, description `"Browse courses offered for the active term and request assignment for your classes."`, placeholder `"Search offered courses..."`.
- [x] Task 4.4 — Comprehensive Test Execution:
  - Run all Vitest suites in `sentinel-web`, `sentinel-core`, and `sentinel-support`.
  - Verified 0 type or runtime regressions introduced in modified components.

## Verification & Testing

- `pnpm --filter sentinel-web test`
- `pnpm --filter sentinel-core test`
- `pnpm --filter sentinel-support test`

## Risks & Rollback

- Risk: Regressions in unrelated test suites.
- Mitigation: Inspect git diff before concluding.
