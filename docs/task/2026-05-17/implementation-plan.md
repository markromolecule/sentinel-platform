# Implementation Plan - Fix Student Whitelist Visibility

The goal is to resolve the issue where student whitelist records are not being displayed in the Support portal. This involves refining backend authorization logic, refactoring database joins, and ensuring correct frontend filter propagation.

## Pre-Planning

- **Task Summary**: Fix student whitelist visibility in the Support portal by updating backend scoping, authorization, and data access logic.
- **Relevant Files**:
    - `app/sentinel-api/src/modules/identity/student-whitelist/helpers/verify-requester-permissions.ts`
    - `app/sentinel-api/src/modules/identity/student-whitelist/helpers/resolve-student-whitelist-scope.ts`
    - `app/sentinel-api/src/modules/identity/student-whitelist/data/build-student-whitelist-query.ts`
    - `app/sentinel-api/src/modules/identity/student-whitelist/controllers/get-student-whitelist.controller.ts`
    - `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-management-view.tsx`
- **DB Tables**: `student_whitelist`, `institutions`, `departments`, `courses`.
- **Prisma Migration**: No (logic and query changes only).

## Phase 1: Backend Authorization & Scoping

**Goal**: Ensure `superadmin` and `support` users can access records across institutions without being blocked by strict ownership checks.

- [ ] Modify `verifyRequesterPermissions` in `app/sentinel-api/src/modules/identity/student-whitelist/helpers/verify-requester-permissions.ts` to skip the mandatory `requesterInstitutionId` check for `superadmin` roles.
- [ ] Update `resolveStudentWhitelistInstitutionId` in `app/sentinel-api/src/modules/identity/student-whitelist/helpers/resolve-student-whitelist-scope.ts` to explicitly allow cross-institution access for `support` and `superadmin` when no specific institution is requested.
- [ ] Write Vitest tests for `verifyRequesterPermissions` and `resolveStudentWhitelistScope` covering all role combinations.
    - **Migration required**: No

## Phase 2: Backend Data Access Refinement

**Goal**: Prevent record filtering due to missing or mismatched academic associations.

- [ ] Refactor `buildStudentWhitelistQuery` in `app/sentinel-api/src/modules/identity/student-whitelist/data/build-student-whitelist-query.ts` to change the `innerJoin` on `institutions` to a `leftJoin`.
- [ ] Ensure all academic joins (`departments`, `courses`) remain `leftJoin` to accommodate records that might not have these associations yet.
- [ ] Update `getStudentWhitelistData` to ensure that `undefined` filters for institution/department/course are correctly handled (skipped) instead of being interpreted as null checks.
- [ ] Write Vitest tests for `getStudentWhitelistData` verifying that it returns records even when associations are missing or filters are empty.
    - **Migration required**: No

## Phase 3: Frontend Filter Propagation

**Goal**: Ensure the Support portal correctly passes filters to the API and handles the "All" selection state.

- [ ] Update `WhitelistManagementView.tsx` to ensure that when "All Institutions", "All Departments", or "All Courses" is selected, the corresponding parameter is sent as `undefined` (or omitted) to the API.
- [ ] Verify that `useStudentWhitelistQuery` correctly propagates the `institution_id`, `department_id`, and `course_id` parameters (snake_case) as expected by the backend schema.
- [ ] Add a loading indicator check to ensure that the user receives feedback if the query is hanging or failing silently.
- [ ] Test the filtering flow manually across different roles (support vs superadmin).
    - **Migration required**: No

## Done Criteria

- [ ] `superadmin` users can see whitelist records without being blocked by "Forbidden" errors.
- [ ] `support` users can see records across all institutions when no institution filter is applied.
- [ ] Filtering by institution, department, and course works correctly and returns the expected subsets.
- [ ] All new tests pass (`pnpm test`).
- [ ] The Support Whitelist Management page displays data correctly as verified in the browser.
