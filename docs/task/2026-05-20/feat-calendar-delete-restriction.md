# Implementation Plan — Calendar Delete Restriction & UI Enhancement

Restrict calendar event deletion to the original poster and enhance the UI to display the poster's name.

## Pre-Planning

- [x] Read and summarize the task input in one sentence: Restrict calendar event deletion to the owner and display the poster's name in the UI.
- [x] Scan relevant source files to understand existing patterns:
    - Backend: `calendar-write.service.ts`, `delete-calendar-event.controller.ts`
    - Shared: `CalendarEventResponse` already has `createdBy` and `createdByName`.
    - Frontend: `CalendarEvent` type, `page.tsx` mapping, `DayDetailsSheet.tsx` UI.
- [x] Identify all files, services, and DB tables the task will touch:
    - `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts`
    - `app/sentinel-api/src/modules/general/calendar/controllers/delete-calendar-event.controller.ts`
    - `app/sentinel-web/src/features/calendar/types/index.ts`
    - `app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/calendar/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/calendar/page.tsx`
- [x] Determine if a Prisma migration is needed: **No** (schema already supports `created_by`).

## Phase 1: Backend Restriction

**Goal:** Prevent deletion of calendar events by users other than the creator.

- [ ] Update `deleteCalendarEvent` in `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts` to check if the current user is the creator.
- [ ] Update `deleteCalendarEventRouteHandler` in `app/sentinel-api/src/modules/general/calendar/controllers/delete-calendar-event.controller.ts` to pass `userId` to the service.
- [ ] Add unit tests in `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.test.ts` for the ownership check.
      **Migration required:** No — `created_by` field already exists.

## Phase 2: Frontend Type & Mapping Update

**Goal:** Ensure the UI has access to event ownership and poster name.

- [ ] Add `createdBy` and `createdByName` to `CalendarEvent` type in `app/sentinel-web/src/features/calendar/types/index.ts`.
- [ ] Update mapping logic in `app/sentinel-web/src/app/(protected)/(instructor)/calendar/page.tsx` to include `createdBy` and `createdByName`.
- [ ] Update mapping logic in `app/sentinel-web/src/app/(protected)/student/calendar/page.tsx` to include `createdBy` and `createdByName`.
- [ ] Update `use-calendar-events-query.test.tsx` to include new fields in mock data.

## Phase 3: UI Enhancement

**Goal:** Display poster name and conditionally show delete button.

- [ ] Update `DayDetailsSheet` in `app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx` to:
    - Receive `currentUserId` as a prop (or use `useAuth` internally).
    - Display "Posted by: {createdByName}" for each event.
    - Restrict the delete button visibility: `event.type === 'note' && event.createdBy === currentUserId`.
- [ ] Update `DayDetailsSheet` props and usage in both instructor and student calendar pages.
- [ ] Verify UI changes visually and through manual testing.

## Done Criteria

- [ ] Users can only delete calendar notes they created.
- [ ] Poster's name is displayed in the event details sheet.
- [ ] Backend returns 403 Forbidden if a user tries to delete an event they don't own.
- [ ] All updated files have proper JSDoc and follow code standards.
