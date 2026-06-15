# User Management - Show Institution/Dept & Hide Superadmin

## Phase 1: Planning

- [x] Create implementation plan and get approval.
- [x] Update to-do list periodically.

## Phase 2: Backend Implementation (app/sentinel-api)

- [x] **Data Layer**: Update `getUsersData` in `app/sentinel-api/src/modules/users/data/get-users.ts` to filter out users with the `superadmin` role.
- [x] **DTO**: Verify if `superadmin` should be added to the `role` enum in `app/sentinel-api/src/modules/users/user.dto.ts` for completeness (even if filtered out).
- [x] **Security**: Hardened `getUserById`, `updateUser`, and `deleteUser` to prevent unauthorized access/actions on `superadmin` accounts.

## Phase 3: Frontend Implementation (app/sentinel-core)

- [x] **Columns**: Add `institution` and `department` columns to `app/sentinel-core/src/app/(protected)/(admin)/users/_components/columns.tsx`.
- [x] **Table**: Verify `UserManagementTable` correctly renders the new columns (via `DataTable`).

## Phase 4: Verification

- [x] Verify that superadmins are no longer visible in the user list.
- [x] Verify that `Institution` and `Department` columns are visible and populated correctly.
- [/] Create walkthrough.md and record demo.
