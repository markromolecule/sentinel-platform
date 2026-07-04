# Implementation Plan: Administrator Assign Subject to Instructor

Detail the requirements, database mappings, API contracts, frontend design, and permission configuration for enabling administrators and support roles in `sentinel-core` and `sentinel-support` to assign offered subjects directly to instructors.

---

## 1-3-1 Rule Options Analysis

### Viable Options to Solve the Problem

#### Option 1: Direct Section Enrollment & Approver Tracking (Recommended)

- **Description**: Re-use the `enrollment_requests` table by allowing admins/support to trigger a POST to a new backend endpoint (or an extension of the existing enroll service) that creates pre-approved enrollment requests and class roles for the sections of the offered subject. The `approved_by` field in `enrollment_requests` will store the admin's user ID.
- **Tradeoff**: Very robust as it maps directly to classroom teaching roles, but requires handling bulk sections creation/updates on the backend.

#### Option 2: Extended Subject Qualifications (Explicit Mappings)

- **Description**: Rely entirely on the `instructor_subjects` table (explicit qualifications) for assignments. Update the instructor's subject list query to union `instructor_subjects` with classroom-based enrolled subjects, selecting `assigned_by_user_id` as the approver name.
- **Tradeoff**: Extremely lightweight database writes, but doesn't automatically enroll the instructor into section classrooms for the active term, requiring separate section assignments.

#### Option 3: Staged Enrollment Proposal Flow

- **Description**: When an admin assigns a subject, it creates a pending enrollment request with a flag `created_by_admin = true`. The instructor must then accept/acknowledge it in their dashboard before they are enrolled in the sections.
- **Tradeoff**: High transparency and confirmation, but introduces extra UX friction and state complexity.

### Selected Best Option

We choose **Option 1** as the primary execution path. This fits best with Sentinel's academic module where teaching assignments are section-based (`class_groups` / `class_roles`). When an administrator assigns an offered subject, the instructor receives direct classroom role access to teach those sections for the active term, and their dashboard lists the subject with the administrator/support user's name as the approver.

---

## User Review Required

> [!IMPORTANT]
> The default permissions list in `packages/shared/src/constants/permissions.ts` will be updated to add `subjects:update` to the `support` and `admin` roles, granting them the capability to assign subjects to instructors.

---

## Open Questions

> [!NOTE]
> None. The requirements are fully aligned with the direct offered subject assignment flow.

---

## Proposed Changes

### 1. Shared Constants & Schema (`packages/shared`)

#### [MODIFY] [permissions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/permissions.ts)

- Add `'subjects:update'` and `'subject_requests:approve'` to the `support` role blueprint in `SYSTEM_ROLE_BLUEPRINTS.support.permissionKeys`.
- Add `'subjects:update'` and `'subject_requests:approve'` to the `admin` role blueprint in `SYSTEM_ROLE_BLUEPRINTS.admin.permissionKeys`.

### 2. Backend Services & Controllers (`app/sentinel-api`)

#### [NEW] [assign-offered-subject.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/controllers/assign-offered-subject.controller.ts)

- Create a new POST controller `/enrollments/assign` to handle direct admin-initiated assignments of offered subjects.
- Enforce the `subjects:update` permission check.
- Accept a request body containing `instructorId` and `subjectOfferingId`.

#### [MODIFY] [enrollments.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.routes.ts)

- Register the new `assignOfferedSubjectRoute` and its handler.

#### [MODIFY] [enrollments.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.dto.ts)

- Define `assignOfferedSubjectSchema` validating `instructorId` (UUID) and `subjectOfferingId` (UUID).

#### [MODIFY] [enroll-instructor.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/enroll-instructor.ts)

- Extend or create helper service function `assignOfferedSubjectData` to:
    - Fetch sections (`class_groups`) associated with the `subjectOfferingId`.
    - Insert `enrollment_requests` records with status = `APPROVED` and `approved_by` = current admin's user ID.
    - Insert `class_roles` records mapping the instructor's user ID to the class groups as `instructor`.

### 3. Frontend Packages & Hooks (`packages/services` and `packages/hooks`)

#### [MODIFY] [subjects.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subjects.ts)

- Add client request method `assignOfferedSubject(apiClient, payload: { instructorId: string, subjectOfferingId: string })`.

#### [NEW] [use-assign-offered-subject-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subjects/use-assign-offered-subject-mutation.ts)

- Implement a React Query mutation hook wrapping `assignOfferedSubject`.
- Invalidate `SUBJECT_QUERY_KEYS.all` and `SUBJECT_OFFERING_QUERY_KEYS.all` on success.

### 4. Admin UI Features (`sentinel-core` & `sentinel-support`)

#### [NEW] [assign-subject-to-instructor-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/dialogs/assign-subject-to-instructor-dialog.tsx>)

- Create a reusable dialog allowing the admin to search for institutional instructors and execute the assignment.

#### [MODIFY] [subject-offering-actions-cell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/tables/subject-offering-actions-cell.tsx>)

- Add the **Assign to Instructor** action option to the action cell and mount the `AssignSubjectToInstructorDialog`.

#### [MODIFY] [offered-subjects-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/offered-subjects-list.tsx>)

- Add an "Assign to Instructor" button in the `FloatingActionBar` for bulk selection.

---

## Verification Plan

### Automated Tests

- Run backend tests to verify permissions for `support`, `admin`, and `superadmin` roles:
    ```bash
    pnpm --dir app/sentinel-api test src/modules/security/permission/permission.test.ts
    ```
- Run query hook tests:
    ```bash
    pnpm --dir packages/hooks test src/query/subjects/use-assign-offered-subject-mutation.test.ts
    ```

### Manual Verification

1. Log in as an administrator or support account.
2. Navigate to **Offered Subjects**.
3. Select an offered subject offering and assign it to an instructor user.
4. Log in as that instructor and verify the subject is visible under **Subject List** with the administrator's name under "Approved By".
