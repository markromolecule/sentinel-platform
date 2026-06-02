# Implementation Plan: Dynamic Administrator Permissions for UI Components

## Goal

Implement a dynamic way to handle permissions on administrator UI components (Buttons, Action Buttons) across Sections, Subjects, Subject List, Subject Classification, Enrollment Requests, Offered Subjects, and Courses, ensuring action buttons (Create, Update, Delete) are hidden when only View permission is granted.

### Phase 1: Sections Module Permissions

**Goal:** Ensure Sections UI accurately checks exact action permissions instead of relying on generic edit capability.

- [x] Update `app/sentinel-core/src/app/(protected)/sections/page.tsx` to pass explicit `hasPermission('sections:create')` to `<PermissionGate>` for `AddSectionDialog`.
- [x] Verify `app/sentinel-core/src/app/(protected)/sections/_components/tables/section-actions-cell.tsx` and `sections-list.tsx` are correctly evaluating `sections:update` and `sections:delete`.
- [x] Write tests for section permission components in `app/sentinel-core/src/app/(protected)/sections/page.test.tsx`.
      **Migration required:** No — schema and roles already support granular permissions.

### Phase 2: Subjects Module Permissions

**Goal:** Ensure Subjects List UI properly limits Create, Update, and Delete actions based on granular subject permissions.

- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/views/subjects-list.tsx` to conditionally render `AddSubjectDialog` and `BulkUploadDialog` using `hasPermission('subjects:create')`.
- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/tables/master-subject-actions-cell.tsx` to correctly gate edit/delete actions using `subjects:update` and `subjects:delete`.
- [x] Write tests in `app/sentinel-core/src/app/(protected)/subjects/page.test.tsx`.
      **Migration required:** No

### Phase 3: Subject Classification Module Permissions

**Goal:** Protect Subject Classification actions using exact permission keys.

- [x] Update `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx` and `subject-classifications-list.tsx` to ensure creation actions use `hasPermission('subjects:create')`.
- [x] Update any action cells for classifications to use `hasPermission('subjects:update')` and `hasPermission('subjects:delete')`.
- [x] Write tests for classification permission logic in `app/sentinel-core/src/app/(protected)/subjects/classifications/page.test.tsx`.
      **Migration required:** No

### Phase 4: Enrollment Requests Permissions

**Goal:** Ensure Enrollment Requests approval actions strictly evaluate approval permissions.

- [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/requests/request-actions.tsx` to gate approval/rejection features with `hasPermission('subject_offerings:approve')`.
- [x] Verify `app/sentinel-core/src/app/(protected)/subjects/requests/page.tsx` and bulk actions enforce the correct keys.
- [x] Write tests for enrollment request permission gating in `app/sentinel-core/src/app/(protected)/subjects/requests/page.test.tsx`.
      **Migration required:** No

### Phase 5: Offered Subjects Permissions

**Goal:** Ensure Offered Subjects capabilities strictly evaluate the correct permission keys.

- [x] Secure Offered Subjects list and columns to only show unoffer capabilities when `subject_offerings:delete` is true.
- [x] Verify creation and editing capabilities strictly use `subject_offerings:offer` and `subject_offerings:update`.
- [x] Write tests for offered subject permission gating in `app/sentinel-core/src/app/(protected)/subjects/offered/page.test.tsx`.
      **Migration required:** No

### Phase 6: Courses Module Permissions

**Goal:** Guarantee Courses UI properly restricts Create, Update, and Delete capabilities.

- [x] Update `app/sentinel-core/src/features/administration/courses/courses-page.tsx` to protect `AddCourseDialog` with `hasPermission('courses:create')`.
- [x] Update action cells in `app/sentinel-core/src/features/administration/courses/_components/tables/course-actions-cell.tsx` to evaluate `courses:update` and `courses:delete`.
- [x] Write tests in `app/sentinel-core/src/features/administration/courses/courses-page.test.tsx`.
      **Migration required:** No
