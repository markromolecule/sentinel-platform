# Implementation Plan: Student Whitelist Branch Filtering & Origin Column

## Goal

- Ensure the student whitelist on the administrator page shows only the student whitelist from the specific branch/institution only.
- Add an "Origin" column (representing the specific branch/institution name) to the student whitelist table, enabled by default.
- Hide the "Claimed By" column by default, but keep it available and toggleable via the table's column visibility toggle.

---

## Viable Options (1-3-1 Rule)

### Option 1: Full Scoping and Table Configuration Adjustments (RECOMMENDED)

- **Scoping**: Retrieve `lockedInstitutionId` and `isSuperadmin` via the existing `useStudentWhitelistScope()` hook within `StudentWhitelistManagementView`. If the user is an administrator (`!isSuperadmin`), pass `lockedInstitutionId` as the `institution_id` to `useStudentWhitelistQuery`.
- **Columns**: Update `columns.tsx` to set the title of the `institutionId` column to "Origin". Modify `StudentWhitelistList`'s `initialColumnVisibility` to set `institutionId: true` (show Origin by default) and `claimedName: false` (hide Claimed By by default).
- **Why it's best**: This is non-disruptive, highly performant, leverages existing React hooks and TanStack Table visibility configurations, and perfectly meets the requirements.

### Option 2: Query-only Filtering

- **Scoping**: Filter whitelist records purely in the query hook without using the hook `useStudentWhitelistScope()`, and rename the column header inline in the table component.
- **Why it's sub-optimal**: Bypasses the standardized scoping hook (`useStudentWhitelistScope`) which is already used by dialogs and forms on the same page, leading to inconsistent state representation.

### Option 3: Backend Schema Restructuring

- **Scoping**: Add a new database column `origin` specifically to the `student_whitelist` table and perform a database migration.
- **Why it's sub-optimal**: Introduces unnecessary database schema complexity and migration overhead, as the branch name is already resolved perfectly via the `institutionId` and its relation `institutionName`.

---

## Phase 1: Retrieve Scope & Enforce Branch Filter

**Goal:** Lock the whitelist view to the specific branch/institution for regular branch administrators on the frontend.

- [x] Modify `app/sentinel-core/src/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-management-view.tsx`:
    - Import `useStudentWhitelistScope` from `@/app/(protected)/(admin)/users/whitelist/_hooks/use-student-whitelist-scope`.
    - Retrieve `isSuperadmin` and `lockedInstitutionId` inside `StudentWhitelistManagementView`.
    - Adjust the `institutionQuery` logic so that if the user is not a superadmin, it uses `lockedInstitutionId` (or `undefined` if not set yet). If they are a superadmin, it uses the selected dropdown filter if enabled.
- [x] Add basic test coverage or visual verification.
- [x] Run `pnpm test` and confirm all tests pass.
- [x] Mark phase complete.

---

## Phase 2: Add Origin Column & Hide Claimed By by Default

**Goal:** Configure the TanStack Table columns and default visibility settings as requested.

- [x] Modify `app/sentinel-core/src/app/(protected)/(admin)/users/whitelist/_components/tables/columns.tsx`:
    - Update the `institutionId` column header title from `"Institution"` to `"Origin"`.
- [x] Modify `app/sentinel-core/src/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-list.tsx`:
    - Update the `initialColumnVisibility` object inside the `DataTable` render config:
        ```typescript
        initialColumnVisibility={{
            institutionId: true, // Show "Origin" by default
            claimedName: false,   // Hide "Claimed By" by default, keeping it toggleable
        }}
        ```
- [x] Run `pnpm test` and confirm all tests pass.
- [x] Mark phase complete.

---

## Done Criteria

- [x] regular administrators (`!isSuperadmin`) can only see records belonging to their specific branch (`lockedInstitutionId`).
- [x] Whitelist table renders the `"Origin"` column by default showing the institution/branch name.
- [x] Whitelist table hides the `"Claimed By"` column by default, but it can be toggled on/off via the column toggle menu.
- [x] All Vitest tests pass with no errors or regressions.
