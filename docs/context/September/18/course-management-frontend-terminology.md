---
title: "Subject to Course Frontend Terminology Alignment"
type: context
status: ready
created: "2026-09-18"
tags: [context, frontend, terminology, course-management, ui-copy]
feature: "course-management-frontend-terminology"
---

# Subject to Course Frontend Terminology Alignment Context Specification

## 1. Overview & Objective

- **Problem Statement:** Across Sentinel's frontend applications—`sentinel-web` (instructor portal), `sentinel-core` (institutional admin portal), and `sentinel-support` (support portal)—academic curriculum courses are labeled as "Subject" (e.g., "Subject Management", "Subject List", "Offered Subjects", "Subject Classifications"). Academic terminology standards prefer "Course" (e.g., "Course Management", "Course List", "Offered Courses", "Course Classifications") to better align with institutional user expectations and academic catalog phrasing.
- **Business / User Value:**
  - Consistent and industry-standard academic terminology provides clarity for instructors, administrators, and support staff.
  - Aligns curriculum catalog terminology with modern higher education standards while cleanly preserving distinction from Degree Programs.
- **Success Criteria:**
  - All navigation labels, page headers, sub-navigation tabs, action buttons, table columns, search placeholders, empty states, and dialog titles in the Subject Management domain across `sentinel-web`, `sentinel-core`, and `sentinel-support` display "Course" instead of "Subject".
  - Main application sidebar navigation items display "Courses" instead of "Subjects".
  - Internal routing URLs (`/subjects`, `/subjects/offered`, etc.), API endpoints, database schemas, and permission keys (e.g., `subjects:view`, `subject_offerings:offer`) remain untouched to avoid regression or collision with the existing `/courses` (Degree Programs) domain.
  - All existing frontend unit and integration tests across the 3 applications are updated and pass green.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As an Instructor (`sentinel-web`), I want to see "Courses" in the sidebar and "Course Management" / "Course List" / "Offered Courses" in the workspace, so that I navigate my academic teaching assignments using familiar institutional terms.*
- *As an Institutional Administrator (`sentinel-core`), I want to manage "Course Management", "Course Classifications", and "Offered Courses", so that catalog administration matches academic terminology.*
- *As a Support Staff member (`sentinel-support`), I want the support portal to show "Course Management" with consistent actions ("Add Course", "Bulk Upload Courses", "Offered Courses"), so that support workflows mirror the administrative interface.*

### Functional Requirements

- [ ] **FR-01 (Main Navigation & Sidebars):**
  - `sentinel-web`: In instructor sidebar (`studentManagementItems` in `src/components/sidebar/instructor/constants/index.ts`), update `title: 'Subjects'` to `title: 'Courses'` (preserving `url: '/subjects'`).
  - `sentinel-core`: In admin & superadmin navigation (`core-admin-nav-config.ts`), update `title: 'Subjects'` to `title: 'Courses'` (preserving `url: '/subjects'`).
  - `sentinel-support`: In support sidebar (`supportItems` in `src/components/sidebar/support/constants/index.ts`), update `title: 'Subjects'` to `title: 'Courses'` (preserving `url: '/subjects'`).
- [ ] **FR-02 (Workspace Shell & Secondary Sub-Navigation):**
  - In `sentinel-web`, `sentinel-core`, and `sentinel-support`:
    - `SubjectWorkspaceShell`: Update desktop sidebar header title from `"Subject Management"` to `"Course Management"`.
    - `SubjectNav`: Update grouped items:
      - `"Subject List"` -> `"Course List"`
      - `"Subject Classifications"` -> `"Course Classifications"` (core & support)
      - `"Offered Subjects"` -> `"Offered Courses"` (web, core, & support)
      - `"Enrollment Requests"` -> remains `"Enrollment Requests"`
      - In `sentinel-web`, group title `"My Subjects"` -> `"My Courses"`.
    - Update unit tests (`subject-nav.test.tsx`) across all 3 applications to assert the new link text.
- [ ] **FR-03 (Course Catalog / List Page):**
  - **`sentinel-support` (`subjects/page.tsx` & `_components/views/subjects-view.tsx`):**
    - Header title: `"Course List"`
    - Header description: `"Browse and manage the institutional course catalog."`
    - Action button: `"+ Add Course"`
    - Bulk upload button / dialog: `"Bulk Upload Courses"`
    - Search placeholder: `"Search courses..."`
    - Table column: `"Course"` (instead of `"Subject"`)
    - Empty states & error banners: `"Error loading courses. Contact support if this continues."`
    - Bulk delete modal: `"Delete Selected Courses?"`, `"Are you sure you want to delete {count} selected course(s)?"`
    - Delete dialog (`delete-subject-dialog.tsx`): `"Delete this course?"`, `"from the course catalog"`, button `"Delete Course"`.
    - Form dialog (`subject-form-dialog.tsx`): `"Add Course"` / `"Edit Course"`, `"Create a course and assign it to an institution."`, `"Course changes are scoped..."`.
    - Permission guard resource name: `"courses"`.
  - **`sentinel-core` (`subjects/page.tsx` & `_components/views/subjects-view.tsx`):**
    - Header title: `"Course List"`
    - Header description: `"Manage the shared institutional course catalog used for term offerings."` / `"Browse the shared institutional course catalog and offer courses to your assigned department."`
    - Action buttons: `"+ Add Course"`, `"Bulk Upload Courses"`
    - Table columns: `"Course"`
    - Form dialogs & delete dialogs: updated to "Course" copy.
    - Associated unit tests (`page.test.tsx`): updated to assert `"Course List"`.
  - **`sentinel-web` (`subjects/page.tsx` & `_components/views/subjects-list.tsx`):**
    - Header title: `"Course List"`
    - Header description: `"Manage the offered courses you have requested or are currently teaching."`
    - Action button: `"Request Course"`
    - Search placeholder: `"Search courses..."`
    - Table columns & cards: `"Course"` header
    - Empty state: `"No courses found"`, `"No courses requested"`
    - Permission guard resource name: `"course requests"`.
- [ ] **FR-04 (Course Classifications Page):**
  - **`sentinel-support` (`subjects/classifications/page.tsx` & view):**
    - Header title: `"Course Classifications"`
    - Header description: `"Manage institution-level course groupings that can be inherited by branches."`
    - Action button: `"Create Classification"`
    - Empty state description: `"Create course classifications so institution-level groupings can be inherited by branches."`
    - Search placeholder: `"Search classifications..."`
    - Permission guard resource name: `"course classifications"`.
  - **`sentinel-core` (`subjects/classifications/page.tsx` & view):**
    - Header title: `"Course Classifications"`
    - Header description: `"Create shared grouping cards for the institutional course catalog, then assign courses into each classification."`
    - Error message: `"Error loading course classifications. Contact support if this continues."`
    - Permission guard resource name: `"course classifications"`.
- [ ] **FR-05 (Offered Courses Page):**
  - **`sentinel-support` (`subjects/offered/page.tsx` & view):**
    - Header title: `"Offered Courses"`
    - Header description: `"Review all term-based course offerings."`
    - Search placeholder: `"Search offered courses..."`
    - Permission guard resource name: `"course offerings"`.
  - **`sentinel-core` (`subjects/offered/page.tsx` & view):**
    - Header title: `"Offered Courses"`
    - Header description: `"Review all term-based course offerings and the audiences they are assigned to."`
    - Action button: `"+ Offer Course"`
    - Search placeholder: `"Search offered courses..."`
    - Table columns & detail drawer: `"Course"`
    - Permission guard resource name: `"course offerings"`.
  - **`sentinel-web` (`subjects/offered/page.tsx` & view):**
    - Header title: `"Offered Courses"`
    - Header description: `"Browse courses offered for the active term and request assignment for your classes."`
    - Search placeholder: `"Search offered courses..."`
    - Error message: `"Error loading offered courses. Contact support if this continues."`
    - Permission guard resource name: `"course offerings"`.
- [ ] **FR-06 (Enrollment Requests Page):**
  - **`sentinel-support` (`subjects/requests/page.tsx`):**
    - Header title: `"Enrollment Requests"`
    - Header description: `"Review and process instructor course enrollment requests."`
    - Permission guard resource name: `"course requests"`.
  - **`sentinel-core` (`subjects/requests/page.tsx`):**
    - Header title: `"Enrollment Requests"`
    - Header description: `"Review and process instructor offered-course enrollment requests."`
    - Permission guard resource name: `"course requests"`.

### Edge Cases & Failure Modes

- **Preservation of Existing Degree Programs (`/courses`):** In Sentinel, the route `/courses` and related Prisma/Kysely models represent Academic Degree Programs (e.g., BS Computer Science, BS Information Technology), displayed as "Programs" in the UI sidebars. Renaming the display labels of the `/subjects` module to "Courses" must NOT touch the Programs route (`/courses`) or its components to avoid naming ambiguity.
- **URL Route & Bookmark Stability:** All browser routes remain `/subjects`, `/subjects/classifications`, `/subjects/offered`, and `/subjects/requests`. This guarantees zero broken bookmarks, zero reverse proxy / Nginx rewrite updates, and zero route handler refactoring.
- **API & Hook Parity:** Hooks (`useSubjectsList`, `useSubjectClassificationsQuery`, `useSubjectOfferingsQuery`, `useEnrollmentRequestsQuery`) and API endpoints (`GET /subjects`, `POST /subjects`, etc.) remain unchanged.
- **RBAC Permission Keys:** Permission strings (`subjects:view`, `subjects:create`, `subjects:update`, `subjects:delete`, `subject_offerings:offer`, etc.) remain identical so existing user roles and JWT claims function without database migration.
- **User-Facing Fallback & Error Copy:** Error states and permission denied messages reflect the new "course" terminology (e.g., "Error loading courses", "Access Denied: courses").

---

## 3. Technical & Architectural Context

- **Affected Domains / Layers:**
  - Frontend User Interface: `app/sentinel-web`, `app/sentinel-core`, `app/sentinel-support`
  - Component layers: Sidebar navigation configs, workspace layout shells, sub-navs, views, data tables, dialogs, form dialogs, empty states, and test specs.
- **Existing Files & Reference Symbols:**
  - `sentinel-web`:
    - [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/components/sidebar/instructor/constants/index.ts) (`studentManagementItems`)
    - [subject-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-workspace-shell.tsx)
    - [subject-nav.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.tsx)
    - [subject-nav.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.test.tsx)
    - [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/page.tsx)
    - [subjects-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/views/subjects-list.tsx)
    - [subjects-empty-state.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/views/subjects-empty-state.tsx)
    - [request-subject-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/dialogs/request-subject-dialog.tsx)
    - [page.tsx (offered)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/offered/page.tsx)
  - `sentinel-core`:
    - [core-admin-nav-config.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts)
    - [subject-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-workspace-shell.tsx)
    - [subject-nav.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-nav.tsx)
    - [subject-nav.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-nav.test.tsx)
    - [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/page.tsx)
    - [page.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/page.test.tsx)
    - [subjects-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/subjects-view.tsx)
    - [page.tsx (classifications)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx)
    - [page.tsx (offered)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx)
    - [page.tsx (requests)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/requests/page.tsx)
  - `sentinel-support`:
    - [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/constants/index.ts) (`supportItems`)
    - [subject-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-workspace-shell.tsx)
    - [subject-nav.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-nav.tsx)
    - [subject-nav.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-nav.test.tsx)
    - [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/page.tsx)
    - [subjects-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/views/subjects-view.tsx)
    - [subject-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/tables/subject-columns.tsx)
    - [subject-form-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/forms/subject-form-dialog.tsx)
    - [delete-subject-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/dialogs/delete-subject-dialog.tsx)
    - [bulk-upload-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/dialogs/bulk-upload-dialog.tsx)
    - [page.tsx (classifications)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/page.tsx)
    - [subject-classifications-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/_components/views/subject-classifications-view.tsx)
    - [page.tsx (offered)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/offered/page.tsx)
    - [offered-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/offered/_components/views/offered-view.tsx)
    - [page.tsx (requests)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/requests/page.tsx)
- **Data Model & Schema Changes:** None. This is strictly a frontend presentation and UI copy alignment.
- **Security & Authorization:** No changes to permission names (`subjects:*`, `subject_offerings:*`).

---

## 4. UI/UX & Terminology Mapping Reference

| Element / Context | Existing Copy | Updated Copy |
| :--- | :--- | :--- |
| **Main Sidebar Navigation** | `Subjects` | `Courses` |
| **Workspace Sidebar Header** | `Subject Management` | `Course Management` |
| **Workspace Sub-Nav (Web Group)** | `My Subjects` | `My Courses` |
| **Workspace Sub-Nav Link 1** | `Subject List` | `Course List` |
| **Workspace Sub-Nav Link 2** | `Subject Classifications` | `Course Classifications` |
| **Workspace Sub-Nav Link 3** | `Offered Subjects` | `Offered Courses` |
| **Workspace Sub-Nav Link 4** | `Enrollment Requests` | `Enrollment Requests` |
| **Catalog Page Header** | `Subject List` | `Course List` |
| **Catalog Description (Support)** | `Browse and manage the institutional subject catalog.` | `Browse and manage the institutional course catalog.` |
| **Catalog Description (Core Admin)** | `Manage the shared institutional subject catalog used for term offerings.` | `Manage the shared institutional course catalog used for term offerings.` |
| **Catalog Description (Core Assigned)** | `Browse the shared institutional subject catalog and offer subjects to your assigned course.` | `Browse the shared institutional course catalog and offer courses to your assigned department.` |
| **Catalog Description (Web)** | `Manage the offered subjects you have requested or are currently teaching.` | `Manage the offered courses you have requested or are currently teaching.` |
| **Catalog Action (Add)** | `+ Add Subject` | `+ Add Course` |
| **Catalog Action (Bulk Upload)** | `Bulk Upload Subjects` | `Bulk Upload Courses` |
| **Catalog Action (Web Request)** | `Request Subject` | `Request Course` |
| **Catalog Table Column** | `Subject` | `Course` |
| **Catalog Search Placeholder** | `Search subjects...` | `Search courses...` |
| **Classifications Page Header** | `Subject Classifications` | `Course Classifications` |
| **Classifications Description** | `Manage institution-level subject groupings...` | `Manage institution-level course groupings...` |
| **Classifications Empty State** | `Create subject classifications...` | `Create course classifications...` |
| **Offered Page Header** | `Offered Subjects` | `Offered Courses` |
| **Offered Action (Core)** | `Offer Subject` | `Offer Course` |
| **Offered Search Placeholder** | `Search offered subjects...` | `Search offered courses...` |
| **Delete Dialog Title** | `Delete this subject?` | `Delete this course?` |
| **Delete Dialog Action** | `Delete Subject` | `Delete Course` |

---

## 5. Scope & Boundaries

- **In Scope:**
  - Display text, headings, placeholders, tooltips, dialogs, table columns, empty states, and error alerts in the Subject Management domain across `sentinel-web`, `sentinel-core`, and `sentinel-support`.
  - Main app navigation sidebars in all 3 apps.
  - Updating associated frontend test suites (`*.test.tsx`).
- **Out of Scope / Non-Goals:**
  - Route URL slug renames (routes remain `/subjects/...` to avoid collision with `/courses` which is used for degree programs).
  - Secondary feature forms (e.g. Exam builder "Select Subject", Classroom assignment selectors).
  - Backend API endpoint renames (`sentinel-api` remains `/subjects`).
  - Database schema changes (Prisma schema and Kysely queries remain `subjects`, `subject_offerings`).
  - Permission names (RBAC permissions remain `subjects:create`, `subjects:view`, etc.).

---

## 6. References & External Context

- Screenshot: `support.sentinelph.tech` Subject List view.
- User confirmation: Scope strictly to Subject Management pages and navigation across all three applications.
