---
title: "course-management-frontend-terminology"
type: task
status: completed
created: "2026-09-19"
tags: [task, frontend, terminology, course-management]
---

# Subject to Course Frontend Terminology Alignment

## Outcome

Align all user-facing curriculum catalog terminology from "Subject" to "Course" across `sentinel-web`, `sentinel-core`, and `sentinel-support` without modifying URL route paths, backend APIs, or colliding with the existing Degree Programs (`/courses`) module.

## Pre-planning record

### Actors and goals

- **Instructor (`sentinel-web`):** Navigate assigned and offered teaching courses using intuitive "Courses" and "Course Management" navigation labels.
- **Institutional Administrator (`sentinel-core`):** Manage institutional course catalogs, course classifications, and term-based offerings under "Course Management".
- **Support Staff (`sentinel-support`):** Oversee multi-tenant course catalogs and master records under "Course Management".

### Domain language

- **Course (formerly Subject):** An individual academic instructional unit (e.g. *PSYRC06X - Abnormal Psychology*).
- **Program (formerly Course in legacy models):** An academic degree program (e.g. *BS Computer Science*), routed at `/courses` and labeled "Programs" in the UI sidebar.
- **Course Classification:** Grouping card for courses (e.g. *General Education*, *Major Subject*).
- **Offered Course:** Term-specific instance of a course available for class section assignment.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Instructor browses sidebar navigation | Logged into `sentinel-web` | Sidebar displays "Courses" pointing to `/subjects` | N/A | Completed |
| SC-02 | Admin opens course workspace | Logged into `sentinel-core` | Header displays "Course Management", tabs display "Course List", "Course Classifications", "Offered Courses" | N/A | Completed |
| SC-03 | Support staff searches catalog | Logged into `sentinel-support` | Placeholder reads "Search courses...", column reads "Course", header reads "Course List" | N/A | Completed |
| SC-04 | Admin creates/deletes a course | In `sentinel-core` or `sentinel-support` | Modals read "Add Course", "Delete this course?", "Delete Course" | N/A | Completed |
| SC-05 | User accesses `/courses` route | Navigates to Programs | Retains Degree Programs view without interference or conflict | N/A | Completed |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Scope of terminology update | Strictly Subject Management suite + main sidebars | User selected recommended option during grill discovery | Global sweep touching exam creation and classrooms rejected to prevent scope expansion | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/18/course-management-frontend-terminology.md) |
| DEC-02 | URL routes preservation | Retain `/subjects`, `/subjects/offered`, etc. | Route `/courses` already belongs to Degree Programs; changing URLs would break routing and bookmarks | Renaming routes to `/courses` rejected due to route collision | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/18/course-management-frontend-terminology.md) |
| DEC-03 | Backend/DB contracts | Keep `sentinel-api` and database untouched | Prompt specifies frontend display update | Renaming DB tables rejected as unnecessary risk | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/18/course-management-frontend-terminology.md) |

### Unknowns and blockers

None. All scope and architectural boundaries were resolved during `/context` grilling.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-01 | Main sidebars in all 3 apps display "Courses" | Update sidebar constants configs | Unit tests & visual inspection | Completed |
| AC-02 | SC-02, DEC-01 | Workspace shell headers display "Course Management" | Update `SubjectWorkspaceShell` in web, core, support | Unit tests & visual inspection | Completed |
| AC-03 | SC-02, DEC-01 | Sub-navigation links display "Course List", "Course Classifications", "Offered Courses" | Update `SubjectNav` in web, core, support | `subject-nav.test.tsx` pass | Completed |
| AC-04 | SC-03, SC-04 | Catalog pages, dialogs, empty states, and table columns display "Course" | Update views, dialogs, and table definitions | Component tests pass | Completed |
| AC-05 | SC-02 | Classification & Offered pages display "Course Classifications" & "Offered Courses" | Update classification and offered views | Component tests pass | Completed |
| AC-06 | DEC-02 | Degree Programs (`/courses`) remains unaffected | Keep `/courses` routes and components untouched | Regression test suite pass | Completed |

## Scope

- Main sidebars in `sentinel-web`, `sentinel-core`, and `sentinel-support`.
- Workspace layout shell (`SubjectWorkspaceShell`) and sub-navigation (`SubjectNav`) across all 3 apps.
- Course catalog list pages (`/subjects`), classifications (`/subjects/classifications`), offered courses (`/subjects/offered`), and enrollment requests (`/subjects/requests`).
- Add/Edit/Delete dialogs, bulk upload dialogs, empty states, search placeholders, and table columns.
- Updating all corresponding unit test suites (`*.test.tsx`).

## Non-goals

- No renaming of route paths (paths remain `/subjects*`).
- No modification of Degree Programs (`/courses`).
- No changes to `sentinel-api`, controllers, or routes.
- No database migrations or schema alterations.
- No changes to RBAC permissions (`subjects:*`, `subject_offerings:*`).

## Constraints and decisions

- Keep all changes strictly isolated to presentation and UI copy.
- Preserve all existing props, exports, component contracts, and test coverage.

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1 — Discovery, Scenarios, and Boundary Analysis
- [x] `phase-02-architecture-and-contracts.md` — Phase 2 — Navigation, Layout Shells, & Sub-Navigation Alignment
- [x] `phase-03-implementation-and-tests.md` — Phase 3 — Course Catalog & Classification Views Implementation
- [x] `phase-04-verification-and-release.md` — Phase 4 — Offered Courses, Requests, and End-to-End Verification

## Verification

- Automated: Run vitest across `sentinel-web`, `sentinel-core`, and `sentinel-support`.
- Type check: Run TypeScript checks across affected workspaces.

## Deviations

None.

## Result

Completed. All frontend subject management pages, sidebars, shells, sub-navs, catalog tables, dialogs, empty states, and offered course views updated to "Course" across `sentinel-web`, `sentinel-core`, and `sentinel-support` with 100% passing tests and zero route collisions with Degree Programs.
