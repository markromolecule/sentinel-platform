# Execution Log - Fix Student Whitelist Visibility

Fix student whitelist visibility in the Support portal by updating backend scoping, authorization, and data access logic.

## Phase 1: Backend Authorization & Scoping

**Goal**: Ensure `superadmin` and `support` users can access records across institutions without being blocked by strict ownership checks.

- [x] Modify `verifyRequesterPermissions` in `app/sentinel-api/src/modules/identity/student-whitelist/helpers/verify-requester-permissions.ts` — Allow superadmin without institutionId
- [x] Update `resolveStudentWhitelistInstitutionId` in `app/sentinel-api/src/modules/identity/student-whitelist/helpers/resolve-student-whitelist-scope.ts` — Allow cross-institution access for support/superadmin
- [x] Write Vitest tests for helpers
- [x] Run `pnpm test` and confirm all tests pass

**Migration applied**: No
**Breaking changes**: No

## Phase 2: Backend Data Access Refinement

**Goal**: Prevent record filtering due to missing or mismatched academic associations.

- [x] Refactor `buildStudentWhitelistQuery` in `app/sentinel-api/src/modules/identity/student-whitelist/data/build-student-whitelist-query.ts` — Use leftJoin for institutions
- [x] Update `getStudentWhitelistData` in `app/sentinel-api/src/modules/identity/student-whitelist/data/get-student-whitelist.ts` — Handle undefined filters correctly
- [x] Write Vitest tests for data access
- [x] Run `pnpm test` and confirm all tests pass

**Migration applied**: No
**Breaking changes**: No

## Phase 3: Frontend Filter Propagation

**Goal**: Ensure the Support portal correctly passes filters to the API and handles the "All" selection state.

- [x] Update `WhitelistManagementView.tsx` in `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-management-view.tsx` — Fix filter state mapping
- [x] Verify `useStudentWhitelistQuery` parameter mapping
- [x] Add loading indicator improvements
- [x] Manual verification in browser

**Migration applied**: No
**Breaking changes**: No

## Done Criteria

- [x] `superadmin` users can see whitelist records without being blocked by "Forbidden" errors.
- [x] `support` users can see records across all institutions when no institution filter is applied.
- [x] Filtering by institution, department, and course works correctly and returns the expected subsets.
- [x] All new tests pass (`pnpm test`).
- [x] The Support Whitelist Management page displays data correctly as verified in the browser.
