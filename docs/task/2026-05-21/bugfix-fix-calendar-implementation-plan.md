# Implementation Plan - Calendar Bug Fixes and Enhancements

Detailed technical design and phased implementation plan to resolve permissions/delete issues, polish UI sheets spacing, enforce role-based audience filtering, support branch cascading announcements, and integrate notifications on event creation.

## Goal Description

Enhance the Calendar module across both the `sentinel-api` and the frontend apps (`sentinel-web`, `sentinel-core`, `sentinel-support`) to resolve multiple bugs and implement new architectural features:

- [x] **1. Fix the Event Deletion [401/403] Authorization Bugs**:
    - [x] Correctly retrieve user ID from `c.get('user').id` in Hono context (instead of `c.get('userId')`).
    - [x] Allow authors to delete their own `NOTE` events without needing global `calendar:delete` permission.
    - [x] Fix casing checks in ownership checks (using `event.eventType` instead of `event.type`, `event.createdBy` instead of `event.created_by`, and checking against `'NOTE'` instead of `'note'`).
- [x] **2. Improve Spacing inside Dialog Sheets**:
    - [x] Provide premium typography and generous padding margins within calendar sheets for a cleaner, modern look.
- [x] **3. Enforce Role-based Audience Filtering & Cascading**:
    - [x] Filter events so that students and instructors see only relevant target audiences (`ALL` / role-specific).
    - [x] Allow parent branches to announce calendar events "all-around" so they automatically cascade down and are visible in child branches.
- [x] **4. Post to Notification Module on Event Creation**:
    - [x] Automatically notify all matching users when a calendar event is created, supporting hierarchy traversal (parent to all children) and role constraints.

---

## User Review Required

> [!NOTE]
> **No Database Migrations Required**: All necessary columns (`parent_institution_id`, `institution_kind`, `target_audience`, etc.) are already in the database and fully configured.

> [!IMPORTANT]
> **Signature Changes**: Internal API methods for listing events now take the requester's `role` to filter correct audiences, and deletion methods take the `userId` and `hasDeletePermission` to authorize personal note deletion.

---

## Open Questions

> [!NOTE]
> **None**. The requirements are fully detailed, technical roots have been identified, and solutions have been designed to fit seamlessly into the existing structure.

---

## Proposed Changes

### ─── Backend Services & Queries (sentinel-api) ───

#### [MODIFY] [delete-calendar-event.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/controllers/delete-calendar-event.controller.ts)

- [x] Retrieve `userId` using `c.get('user').id` to fix the 401 error.
- [x] Check global deletion permission using `hasActivePermission(c, 'calendar:delete')`.
- [x] Remove the strict `requireActivePermission` from the top of the handler, delegating the decision to the service layer so creators can delete their own personal `NOTE` events.

#### [MODIFY] [calendar.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/calendar.service.ts)

- [x] Update `deleteCalendarEvent` signature to accept `userId` and `hasDeletePermission`, forwarding them to `services/calendar-write.service.ts`.
- [x] Update `getCalendarEvents` signature to accept `role`, forwarding it to `services/calendar-query.service.ts`.

#### [MODIFY] [calendar-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts)

- [x] Update `deleteCalendarEvent` to accept `userId` and `hasDeletePermission`.
- [x] Enforce deletion rules:
    - [x] If `event.eventType === 'NOTE'`, require `event.createdBy === userId`.
    - [x] If `event.eventType !== 'NOTE'`, require `hasDeletePermission === true`.
- [x] In `createCalendarEvent`, query all matching recipient users based on the event's `targetAudience` and the institution's branch hierarchy:
    - [x] If the institution is a parent, retrieve its child branch IDs and include them in the target list of institutions.
    - [x] Map target audience (`ALL`, `STUDENTS`, `INSTRUCTORS`, `ADMINS`) to respective recipient roles.
    - [x] Create and dispatch activities using `NotificationService.createNotification` for all matching users (excluding the creator).

#### [MODIFY] [calendar-query.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/services/calendar-query.service.ts)

- [x] Update `getCalendarEvents` to accept `role` and pass it down to `getCalendarEventsData`.

#### [MODIFY] [get-calendar-events.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/data/get-calendar-events.ts)

- [x] Update `getCalendarEventsData` to fetch parent institution ID for cascading checks.
- [x] Add an `IN` clause for querying events belonging to `[institutionId, parentInstitutionId]`.
- [x] Add conditional filtering on `ce.target_audience` based on the requester's `role`.

#### [MODIFY] [get-calendar-events.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/controllers/get-calendar-events.controller.ts)

- [x] Retrieve `role` using `c.get('role')` and forward it to `CalendarService.getCalendarEvents`.

#### [MODIFY] [calendar.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/calendar.service.test.ts)

- [x] Update mock assertions to match the new signature changes of `deleteCalendarEvent` and `getCalendarEvents`.

#### [MODIFY] [calendar.controller.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/controllers/calendar.controller.test.ts)

- [x] Fix the mocked route context bindings to correctly match `user` payload and verify note deletion permissions.

---

### ─── Frontend UI (sentinel-core, sentinel-support, sentinel-web) ───

#### [MODIFY] [event-details-sheet.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/calendar/_components/event-details-sheet.tsx>)

- [x] Increase margin-bottom of `SheetHeader` to `mb-8`.
- [x] Increase outer container vertical gap to `space-y-8`.
- [x] Change calendar event card padding to `p-6` and card gaps to `space-y-5`.
- [x] Enhance inner card tag spacing to `mb-3`.

#### [MODIFY] [event-details-sheet.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/calendar/_components/event-details-sheet.tsx>)

- [x] Apply identical spacing and margin polish as the `sentinel-core` sheet.

#### [MODIFY] [day-details-sheet.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx)

- [x] Polish spacing inside the student/instructor detail sheet.
- [x] Increase header margin to `mb-8` and child spacing to `space-y-8`.
- [x] Increase card internal padding to `p-6` to make layout breathing-room modern and premium.

---

## Verification Plan

### Automated Tests

- [x] Execute Vitest suites for calendar services and controllers:
    ```bash
    pnpm --dir app/sentinel-api test calendar.service.test.ts
    pnpm --dir app/sentinel-api test calendar.controller.test.ts
    ```
- [x] Run formatting and linting:
    ```bash
    pnpm format:check
    pnpm lint
    ```

### Manual Verification

- [x]   1. Login as standard Instructor/Student. Try deleting a personal NOTE card. It succeeds.
- [x]   2. Try deleting a global admin-created EVENT card as Instructor/Student. It returns a 403 Forbidden.
- [x]   3. Login as Admin under a Parent Institution. Create a calendar event targeting all branches.
- [x]   4. Verify that child branch users can view that event in their calendars and receive a system activity notification.
