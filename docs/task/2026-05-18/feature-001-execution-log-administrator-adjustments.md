# Execution Log: Centralized Administrator Module Adjustments

## Phase 1: Database Schema & API Updates for Room Status

**Goal:** Update Prisma schema to add a `status` column to the `Room` table and expose it in the API.

- [x] Modify `packages/db/prisma/schema.prisma` to add `enum room_status { AVAILABLE ASSIGNED MAINTENANCE }`.
- [x] Add `status room_status @default(AVAILABLE)` to the `rooms` model in `schema.prisma`.
- [x] Run `pnpm db:migrate` with the name `add_room_status` to create the migration file.
- [x] Update `packages/shared/src/types/index.ts` to include the `status` field in the `Room` interface and create the `RoomStatus` type.
- [x] Update `app/sentinel-api/src/modules/rooms/rooms.schema.ts` to include `status` validation in creation and update schemas.
- [x] Update `app/sentinel-api/src/modules/rooms/rooms.repository.ts` and `rooms.service.ts` to handle the new `status` field for CRUD operations.
- [x] Write tests for the `rooms.service.ts` updates in `app/sentinel-api/src/modules/rooms/rooms.service.test.ts`.

**Migration applied:** Yes — Added a new `status` column to the `rooms` table to track availability.
**Breaking changes:** No

---

## Phase 2: Superadmin Room Management Page

**Goal:** Replicate the Room management page from the support portal to the core portal and add the new status column across portals.

- [x] Replicate `app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx` and its `_components` to `app/sentinel-core/src/app/(protected)/rooms/page.tsx`.
- [x] Update `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx` to include the new Rooms page in the navigation.
- [x] Add the `status` column to the DataTable in `app/sentinel-core/src/app/(protected)/rooms/_components/tables/columns.tsx`.
- [x] Add the `status` column to the DataTable in `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/tables/columns.tsx`.
- [x] Update `AddRoomDialog` and `EditRoomDialog` components in both workspaces to include a select field for `status`.
- [x] Update `useAddRoomForm` and `useEditRoomForm` hooks in both workspaces to support the `status` field.
- [x] Write tests for the new `useAddRoomForm` hook in `app/sentinel-core/src/app/(protected)/rooms/_hooks/use-add-room-form.test.ts`.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 3: Instructor Exam Creation Room Availability

**Goal:** Ensure the instructor exam creation page correctly handles rooms based on their assigned/available status.

- [x] Update `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.tsx` to display the room's `status` flag.
- [x] Update `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.utils.ts` to mark rooms as unavailable or unselectable if their status is `ASSIGNED` or `MAINTENANCE`.
- [x] Update `app/sentinel-web/src/features/exams/config/_hooks/use-exam-create-form.ts` and `use-exam-edit-form.ts` to validate the selected room's status on submission.
- [x] Write tests for the updated room selection logic in `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.utils.test.ts`.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 4: Superadmin Department Auto-assignment

**Goal:** Automatically assign the superadmin's institution during Department CRUD operations.

- [x] Update `app/sentinel-core/src/app/(protected)/departments/_hooks/use-add-department-form.ts` and `use-edit-department-form.ts` to fetch `profile.institution_id` via `useProfileQuery`.
- [x] Set `profile.institution_id` as the default and locked value for `institution_id` in the department forms if it exists.
- [x] Update `app/sentinel-core/src/app/(protected)/departments/_components/dialogs/add-department-dialog.tsx` to hide or disable the institution select field when `profile.institution_id` is present.
- [x] Ensure `app/sentinel-api/src/modules/departments/departments.service.ts` enforces the institution assignment constraint based on the user's role and branch.
- [x] Write tests for the `useAddDepartmentForm` hook in `app/sentinel-core/src/app/(protected)/departments/_hooks/use-add-department-form.test.ts`.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 5: Superadmin Sidebar Fix

**Goal:** Fix the sidebar layout overlap issue in the sentinel-core portal using the support sidebar as a basis.

- [x] Review the structural differences between `app/sentinel-support/src/components/sidebar/support/support-sidebar.tsx` and `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx`.
- [x] Update `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx` to use the correct Radix/Tailwind CSS classes that prevent the left-side overlapping.
- [x] Adjust `app/sentinel-core/src/app/(protected)/layout.tsx` if necessary to ensure the `SidebarProvider` and `SidebarInset` components wrap the sidebar correctly.
- [x] Write visual/rendering tests for `CoreAdminSidebar` in `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx` if applicable.

**Migration applied:** No
**Breaking changes:** No
