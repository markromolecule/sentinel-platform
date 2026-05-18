# Implementation Plan: Centralized Administrator Module Adjustments

## Phase 1: Database Schema & API Updates for Room Status

**Goal:** Update Prisma schema to add a `status` column to the `Room` table and expose it in the API.

- [ ] Modify `packages/db/prisma/schema.prisma` to add `enum room_status { AVAILABLE ASSIGNED MAINTENANCE }`.
- [ ] Add `status room_status @default(AVAILABLE)` to the `rooms` model in `schema.prisma`.
- [ ] Run `pnpm db:migrate` with the name `add_room_status` to create the migration file.
- [ ] Update `packages/shared/src/types/index.ts` to include the `status` field in the `Room` interface and create the `RoomStatus` type.
- [ ] Update `app/sentinel-api/src/modules/rooms/rooms.schema.ts` to include `status` validation in creation and update schemas.
- [ ] Update `app/sentinel-api/src/modules/rooms/rooms.repository.ts` and `rooms.service.ts` to handle the new `status` field for CRUD operations.
- [ ] Write tests for the `rooms.service.ts` updates in `app/sentinel-api/src/modules/rooms/rooms.service.test.ts`.
      **Migration required:** Yes — Adding a new `status` column to the `rooms` table to track availability.

## Phase 2: Superadmin Room Management Page

**Goal:** Replicate the Room management page from the support portal to the core portal and add the new status column across portals.

- [ ] Replicate `app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx` and its `_components` to `app/sentinel-core/src/app/(protected)/rooms/page.tsx`.
- [ ] Update `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx` to include the new Rooms page in the navigation.
- [ ] Add the `status` column to the DataTable in `app/sentinel-core/src/app/(protected)/rooms/_components/tables/columns.tsx`.
- [ ] Add the `status` column to the DataTable in `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/tables/columns.tsx`.
- [ ] Update `AddRoomDialog` and `EditRoomDialog` components in both workspaces to include a select field for `status`.
- [ ] Update `useAddRoomForm` and `useEditRoomForm` hooks in both workspaces to support the `status` field.
- [ ] Write tests for the new `useAddRoomForm` hook in `app/sentinel-core/src/app/(protected)/rooms/_hooks/use-add-room-form.test.ts`.
      **Migration required:** No — UI and component replication only.

## Phase 3: Instructor Exam Creation Room Availability

**Goal:** Ensure the instructor exam creation page correctly handles rooms based on their assigned/available status.

- [ ] Update `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.tsx` to display the room's `status` flag.
- [ ] Update `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.utils.ts` to mark rooms as unavailable or unselectable if their status is `ASSIGNED` or `MAINTENANCE`.
- [ ] Update `app/sentinel-web/src/features/exams/config/_hooks/use-exam-create-form.ts` and `use-exam-edit-form.ts` to validate the selected room's status on submission.
- [ ] Write tests for the updated room selection logic in `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.utils.test.ts`.
      **Migration required:** No — Client-side validation and rendering updates.

## Phase 4: Superadmin Department Auto-assignment

**Goal:** Automatically assign the superadmin's institution during Department CRUD operations.

- [ ] Update `app/sentinel-core/src/app/(protected)/departments/_hooks/use-add-department-form.ts` and `use-edit-department-form.ts` to fetch `profile.institution_id` via `useProfileQuery`.
- [ ] Set `profile.institution_id` as the default and locked value for `institution_id` in the department forms if it exists.
- [ ] Update `app/sentinel-core/src/app/(protected)/departments/_components/dialogs/add-department-dialog.tsx` to hide or disable the institution select field when `profile.institution_id` is present.
- [ ] Ensure `app/sentinel-api/src/modules/departments/departments.service.ts` enforces the institution assignment constraint based on the user's role and branch.
- [ ] Write tests for the `useAddDepartmentForm` hook in `app/sentinel-core/src/app/(protected)/departments/_hooks/use-add-department-form.test.ts`.
      **Migration required:** No — Form logic and payload adjustment.

## Phase 5: Superadmin Sidebar Fix

**Goal:** Fix the sidebar layout overlap issue in the sentinel-core portal using the support sidebar as a basis.

- [ ] Review the structural differences between `app/sentinel-support/src/components/sidebar/support/support-sidebar.tsx` and `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx`.
- [ ] Update `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx` to use the correct Radix/Tailwind CSS classes that prevent the left-side overlapping.
- [ ] Adjust `app/sentinel-core/src/app/(protected)/layout.tsx` if necessary to ensure the `SidebarProvider` and `SidebarInset` components wrap the sidebar correctly.
- [ ] Write visual/rendering tests for `CoreAdminSidebar` in `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx` if applicable.
      **Migration required:** No — CSS and layout structural changes only.
