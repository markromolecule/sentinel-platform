# Room Management - Add Room Type To-Do

## Phase 1: Database & Schema
- [ ] Create migration `docs/migrations/05_add_room_type.sql`
    - Define `room_type` enum (LECTURE, LABORATORY)
    - Add `room_type` column to `rooms` table with default 'LECTURE'
- [ ] Update `packages/db/prisma/schema.prisma`
    - Add `room_type` enum
    - Update `rooms` model
- [ ] Regenerate Kysely types (`pnpm generate` in `packages/db`)
- [ ] Update `packages/shared/src/schema/superadmin/rooms/room-schema.ts`
    - Add `room_type` to Zod schema (with validation)
- [ ] Update `packages/shared/src/types/admin/index.ts`
    - Ensure `Room` and `RoomInput` reflect the new field

## Phase 2: Backend API
- [ ] Update `app/sentinel-api/src/modules/core/rooms/room.dto.ts`
    - Add `room_type` to `CreateRoomBody` and `UpdateRoomBody`
- [ ] Update DAL files in `app/sentinel-api/src/modules/core/rooms/data/`
    - `get-rooms.ts`: Include `room_type` in selection
    - `create-room.ts`: Handle `room_type` insertion
    - `update-room.ts`: Handle `room_type` updates
- [ ] Update `app/sentinel-api/src/modules/core/rooms/room.service.ts`
    - Pass `room_type` from DTO to DAL

## Phase 3: Frontend Services & Hooks
- [ ] Update `packages/services/src/api/room.ts`
    - Ensure field is mapped if necessary (it should be automatic via shared types)
- [ ] Update React Query hooks if needed (usually just property updates)

## Phase 4: Frontend UI
- [ ] Update `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/dialogs/add-room-dialog.tsx`
    - Add Select field for Room Type
- [ ] Update `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/dialogs/edit-room-dialog.tsx`
    - Add Select field for Room Type
- [ ] Update `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/tables/columns.tsx`
    - Add "Type" column to the data table
- [ ] Update `app/sentinel-support/src/app/(protected)/(support)/rooms/_hooks/use-add-room-form.ts`
    - Add default value for `room_type`
- [ ] Update `app/sentinel-support/src/app/(protected)/(support)/rooms/_hooks/use-edit-room-form.ts`
    - Map `room_type` from room to form

## Phase 5: Verification
- [ ] Run migration
- [ ] Verify creation through UI
- [ ] Verify update through UI
- [ ] Verify table display
