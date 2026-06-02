# feat-001 — Calendar Module Implementation Plan

**Date:** 2026-05-19  
**Type:** Feature  
**Summary:** Build a fully connected Calendar module — backend API (`sentinel-api`) + shared package updates + frontend wiring for `sentinel-web` (instructor & student), `sentinel-core` (admin/superadmin), and `sentinel-support`.

---

## 3 Viable Options

### Option A — Event-Sourced from Existing Data (Exams Only, No New Table)

Expose a `/calendar/events` endpoint that aggregates scheduled exams per role. No new DB table. Fastest to ship, but limited to exam events — cannot support custom admin announcements, notes, or maintenance windows.

### Option B — New `calendar_events` Table with Full CRUD ✅ _(Recommended)_

Add a dedicated `calendar_events` table scoped to an `institution_id` with `target_audience`, `type`, and `created_by`. Expose CRUD endpoints. Both exam-derived events (read-only, aggregated) and custom events can co-exist. This mirrors how `announcements` works and is consistent with the codebase pattern.

### Option C — Embed Events in Announcements

Reuse the `announcements` table with a `type = 'event'` discriminator. Saves a migration but mixes concerns, breaks existing announcement semantics, and complicates filtering. Not recommended.

---

## Why Option B?

- Consistent with the `announcements` model pattern already in the schema.
- Allows full CRUD for admin-created events visible to students/instructors.
- Instructor and student views can layer on top: exams (from existing API) + calendar events.
- Cleanly fits the layered service architecture already in use.
- Permission keys follow the `calendar:view`, `calendar:create`, `calendar:update`, `calendar:delete` pattern established by `classrooms:view`.

---

## Pre-Planning Checklist

- [x] Task summarized: Build a Calendar module API with CRUD, wire it to all frontends replacing mock data.
- [x] Scanned existing calendar stub files (all empty).
- [x] Scanned classroom module for architectural pattern reference.
- [x] Identified all frontend calendar pages across sentinel-web (instructor + student), sentinel-core, sentinel-support.
- [x] Confirmed no `calendar_events` model in Prisma schema — **migration required**.
- [x] Confirmed `rbac_permissions` uses `permission_key` format like `classrooms:view`.
- [x] Confirmed `requireActivePermission` helper is in `app/sentinel-api/src/lib/permissions.ts`.
- [x] Confirmed route is not yet registered in `app.ts` — needs `app.route('/calendar', calendarRouter)`.
- [x] Confirmed frontend uses `MOCK_ADMIN_EVENTS`, `MOCK_PROCTOR_EXAMS`, `MOCK_EXAMS` — all need replacing.

---

## Files & Modules Affected

### Backend (`app/sentinel-api`)

| File                                                                           | Action                              |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| `src/modules/general/calendar/calendar.dto.ts`                                 | Create                              |
| `src/modules/general/calendar/calendar.routes.ts`                              | Create                              |
| `src/modules/general/calendar/calendar.service.ts`                             | Create (facade only)                |
| `src/modules/general/calendar/services/calendar-query.service.ts`              | Create                              |
| `src/modules/general/calendar/services/calendar-write.service.ts`              | Create                              |
| `src/modules/general/calendar/data/get-calendar-events.ts`                     | Create                              |
| `src/modules/general/calendar/data/create-calendar-event.ts`                   | Create                              |
| `src/modules/general/calendar/data/update-calendar-event.ts`                   | Create                              |
| `src/modules/general/calendar/data/delete-calendar-event.ts`                   | Create                              |
| `src/modules/general/calendar/controllers/get-calendar-events.controller.ts`   | Create                              |
| `src/modules/general/calendar/controllers/get-calendar-event.controller.ts`    | Create                              |
| `src/modules/general/calendar/controllers/create-calendar-event.controller.ts` | Create                              |
| `src/modules/general/calendar/controllers/update-calendar-event.controller.ts` | Create                              |
| `src/modules/general/calendar/controllers/delete-calendar-event.controller.ts` | Create                              |
| `src/app.ts`                                                                   | Modify — register `/calendar` route |

### Database (`packages/db`)

| File                    | Action                                       |
| ----------------------- | -------------------------------------------- |
| `prisma/schema.prisma`  | Modify — add `calendar_events` model + enums |
| `prisma/migrations/...` | Auto-generated                               |

### Shared Package (`packages/shared`)

| File                                | Action                                        |
| ----------------------------------- | --------------------------------------------- |
| `src/types/admin/calendar/index.ts` | Modify — add `CalendarEventResponse` API type |
| `src/types/index.ts`                | Modify — export new type                      |

### Frontend — sentinel-web (Instructor)

| File                                                    | Action                  |
| ------------------------------------------------------- | ----------------------- |
| `src/data/api/calendar/get-calendar-events.ts`          | Create                  |
| `src/hooks/query/calendar/use-calendar-events-query.ts` | Create                  |
| `src/app/(protected)/(instructor)/calendar/page.tsx`    | Modify — wire real data |

### Frontend — sentinel-web (Student)

| File                                                            | Action                                 |
| --------------------------------------------------------------- | -------------------------------------- |
| `src/data/api/calendar/create-calendar-note.ts`                 | Create                                 |
| `src/data/api/calendar/delete-calendar-event.ts`                | Create                                 |
| `src/hooks/query/calendar/use-create-calendar-note-mutation.ts` | Create                                 |
| `src/hooks/query/calendar/use-delete-calendar-note-mutation.ts` | Create                                 |
| `src/app/(protected)/student/calendar/page.tsx`                 | Modify — wire real data, persist notes |

### Frontend — sentinel-core (Admin)

| File                                                                 | Action                                 |
| -------------------------------------------------------------------- | -------------------------------------- |
| `src/data/api/calendar/get-calendar-events.ts`                       | Create                                 |
| `src/data/api/calendar/create-calendar-event.ts`                     | Create                                 |
| `src/data/api/calendar/update-calendar-event.ts`                     | Create                                 |
| `src/data/api/calendar/delete-calendar-event.ts`                     | Create                                 |
| `src/hooks/query/calendar/use-calendar-events-query.ts`              | Create                                 |
| `src/hooks/mutations/calendar/use-create-calendar-event-mutation.ts` | Create                                 |
| `src/hooks/mutations/calendar/use-update-calendar-event-mutation.ts` | Create                                 |
| `src/hooks/mutations/calendar/use-delete-calendar-event-mutation.ts` | Create                                 |
| `src/app/(protected)/calendar/_hooks/use-admin-calendar.ts`          | Modify — replace mock with query hooks |
| `src/app/(protected)/calendar/page.tsx`                              | Modify — wire mutations                |

### Frontend — sentinel-support

| File                                                        | Action                                 |
| ----------------------------------------------------------- | -------------------------------------- |
| `src/data/api/calendar/get-calendar-events.ts`              | Create                                 |
| `src/hooks/query/calendar/use-calendar-events-query.ts`     | Create                                 |
| `src/app/(protected)/calendar/_hooks/use-admin-calendar.ts` | Modify — replace mock with query hooks |

---

## Phase 1: Prisma Schema Migration

**Goal:** Add the `calendar_events` table, enums, and relations to the Prisma schema, then run a migration.

- [x] Add `calendar_event_type` enum (`EVENT`, `ANNOUNCEMENT`, `MAINTENANCE`, `HOLIDAY`, `NOTE`) to `packages/db/prisma/schema.prisma`
- [x] Add `calendar_event_audience` enum (`ALL`, `STUDENTS`, `INSTRUCTORS`, `ADMINS`, `SPECIFIC_GROUP`) to `packages/db/prisma/schema.prisma`
- [x] Add `calendar_events` model to `packages/db/prisma/schema.prisma`:
    - `event_id UUID PK @default(dbgenerated("gen_random_uuid()")) @db.Uuid`
    - `institution_id UUID FK -> institutions @db.Uuid`
    - `title VARCHAR(255)`
    - `description TEXT nullable`
    - `event_type calendar_event_type @default(EVENT)`
    - `target_audience calendar_event_audience @default(ALL)`
    - `start_date TIMESTAMPTZ`
    - `end_date TIMESTAMPTZ nullable`
    - `start_time VARCHAR(10) nullable`
    - `end_time VARCHAR(10) nullable`
    - `created_by UUID FK -> auth.users nullable @db.Uuid`
    - `updated_by UUID FK -> auth.users nullable @db.Uuid`
    - `created_at TIMESTAMPTZ @default(now())`
    - `updated_at TIMESTAMPTZ nullable`
    - `@@index([institution_id, start_date])`
    - `@@schema("public")`
- [x] Add reverse relation `calendar_events` array to `institutions` model
- [x] Add reverse relations `created_calendar_events` and `updated_calendar_events` to auth `users` model
- [x] Run migration: manually written SQL + `prisma migrate deploy` (shadow DB not compatible with Supabase)
- [x] Run `pnpm --dir packages/db exec prisma generate` to regenerate Prisma + Kysely clients
- [x] Verify migration file at `packages/db/prisma/migrations/20260520001200_add_calendar_events_table/migration.sql` ✅

**Migration required:** YES  
**Rollback note:** `DROP TABLE public.calendar_events; DROP TYPE public.calendar_event_type; DROP TYPE public.calendar_event_audience;`

---

## Phase 2: Backend — DTO, Routes, and Service Facade

**Goal:** Define the Zod/OpenAPI DTOs, route declarations, and the `CalendarService` facade in `sentinel-api`.

- [x] Implement `app/sentinel-api/src/modules/general/calendar/calendar.dto.ts`:
    - `calendarEventSummarySchemaOpenApi` — list item shape (eventId, institutionId, title, description, eventType, targetAudience, startDate, endDate, startTime, endTime, createdBy, createdByName, createdAt, updatedAt)
    - `getCalendarEventsSchema` — query: `{ month?: string, year?: string }`
    - `getCalendarEventSchema` — params: `{ id: UUID }`
    - `createCalendarEventSchema` — body: `{ title, description?, eventType, targetAudience, startDate, endDate?, startTime?, endTime? }`
    - `updateCalendarEventSchema` — params `{ id: UUID }` + partial body
    - `deleteCalendarEventSchema` — params: `{ id: UUID }`
    - Export inferred types: `CreateCalendarEventBody`, `UpdateCalendarEventBody`
- [x] Implement `app/sentinel-api/src/modules/general/calendar/calendar.service.ts` (static facade class `CalendarService`):
    - `static async getCalendarEvents(dbClient, { institutionId, month?, year? })`
    - `static async getCalendarEventById(dbClient, { eventId, institutionId })`
    - `static async createCalendarEvent(dbClient, { payload: CreateCalendarEventBody, userId, institutionId })`
    - `static async updateCalendarEvent(dbClient, { eventId, payload: UpdateCalendarEventBody, userId, institutionId })`
    - `static async deleteCalendarEvent(dbClient, { eventId, institutionId })`
    - Each method delegates to the corresponding service in `services/`
- [x] Implement `app/sentinel-api/src/modules/general/calendar/calendar.routes.ts`:
    - `const calendarRoutes = new OpenAPIHono<HonoEnv>()`
    - `calendarRoutes.use('*', authMiddleware)`
    - Wire `.openapi(route, handler)` for all 5 controllers
    - `export default calendarRoutes`
- [x] Write `calendar.service.test.ts` — mock the `services/` functions, assert delegation for each static method

**Migration required:** No

---

## Phase 3: Backend — Data Layer (Kysely Queries)

**Goal:** Implement pure DB access functions in `data/` and domain-logic services in `services/`.

- [x] Implement `app/sentinel-api/src/modules/general/calendar/data/get-calendar-events.ts`:
    - `getCalendarEventsData(dbClient: DbClient, { institutionId, month?, year? })`
    - Queries `calendar_events` joined with `users` for `created_by_name`
    - Filters by `institution_id`; if `month` and `year` provided, filter `EXTRACT(MONTH/YEAR FROM start_date)`
    - Orders by `start_date ASC`
- [x] Implement `app/sentinel-api/src/modules/general/calendar/data/create-calendar-event.ts`:
    - `createCalendarEventData(dbClient, { payload, createdBy, institutionId })`
    - Inserts into `calendar_events`, returns the inserted row
- [x] Implement `app/sentinel-api/src/modules/general/calendar/data/update-calendar-event.ts`:
    - `updateCalendarEventData(dbClient, { eventId, payload, updatedBy })`
    - Updates `calendar_events` where `event_id = eventId`, returns updated row
- [x] Implement `app/sentinel-api/src/modules/general/calendar/data/delete-calendar-event.ts`:
    - `deleteCalendarEventData(dbClient, { eventId, institutionId })`
    - Deletes from `calendar_events` where `event_id = eventId AND institution_id = institutionId`
- [x] Implement `app/sentinel-api/src/modules/general/calendar/services/calendar-query.service.ts`:
    - `getCalendarEvents(dbClient, args)` — calls `getCalendarEventsData`, maps to response shape
    - `getCalendarEventById(dbClient, { eventId, institutionId })` — fetches single event, throws `HTTPException(404)` if not found
- [x] Implement `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts`:
    - `createCalendarEvent({ dbClient, payload, userId, institutionId })` — calls `createCalendarEventData`
    - `updateCalendarEvent({ dbClient, eventId, payload, userId, institutionId })` — verifies event exists and belongs to institution, then calls `updateCalendarEventData`; throws `HTTPException(404)` if not found
    - `deleteCalendarEvent({ dbClient, eventId, institutionId })` — verifies event exists, then calls `deleteCalendarEventData`; throws `HTTPException(404)` if not found
- [x] Write `services/calendar-query.service.test.ts` — mock `getCalendarEventsData`, assert mapping and 404 throw
- [x] Write `services/calendar-write.service.test.ts` — mock data fns, assert 404 throw and success paths

**Migration required:** No

---

## Phase 4: Backend — Controllers

**Goal:** Implement 5 Hono OpenAPI controllers, each with a route definition and handler.

- [x] Implement `controllers/get-calendar-events.controller.ts`:
    - `requireActivePermission(c, 'calendar:view')`
    - Parse `{ month, year }` from `c.req.valid('query')`
    - Call `CalendarService.getCalendarEvents` with `institutionId` from `c.get('institutionId')`
    - Return `200 { message: 'Calendar events fetched successfully', data }`
- [x] Implement `controllers/get-calendar-event.controller.ts`:
    - `requireActivePermission(c, 'calendar:view')`
    - Parse `id` from params
    - Call `CalendarService.getCalendarEventById`
    - Return `200 { message, data }`
- [x] Implement `controllers/create-calendar-event.controller.ts`:
    - `requireActivePermission(c, 'calendar:create')`
    - Parse body via `c.req.valid('json')`
    - Call `CalendarService.createCalendarEvent`
    - Return `201 { message: 'Calendar event created', data }`
- [x] Implement `controllers/update-calendar-event.controller.ts`:
    - `requireActivePermission(c, 'calendar:update')`
    - Parse params + body
    - Call `CalendarService.updateCalendarEvent`
    - Return `200 { message: 'Calendar event updated', data }`
- [x] Implement `controllers/delete-calendar-event.controller.ts`:
    - `requireActivePermission(c, 'calendar:delete')`
    - Parse `id` from params
    - Call `CalendarService.deleteCalendarEvent`
    - Return `200 { message: 'Calendar event deleted', data: null }`
- [x] Register in `app/sentinel-api/src/app.ts`: `app.route('/calendar', calendarRouter);`
- [x] Write `controllers/get-calendar-events.controller.test.ts` — use Hono test client, assert 200/401/403

**Migration required:** No

---

## Phase 5: RBAC — Permissions Seeding

**Goal:** Seed `rbac_permissions` rows for the calendar module and assign them to the correct roles.

- [x] Create or update seed file `app/sentinel-api/src/seeds/calendar-permissions.seed.ts`:
    - Insert into `rbac_permissions` (using `upsert` / `ON CONFLICT DO NOTHING`):
        - `{ permission_key: 'calendar:view', module_key: 'calendar', action_key: 'view', name: 'View Calendar Events' }`
        - `{ permission_key: 'calendar:create', module_key: 'calendar', action_key: 'create', name: 'Create Calendar Events' }`
        - `{ permission_key: 'calendar:update', module_key: 'calendar', action_key: 'update', name: 'Update Calendar Events' }`
        - `{ permission_key: 'calendar:delete', module_key: 'calendar', action_key: 'delete', name: 'Delete Calendar Events' }`
    - Assign `calendar:view` to roles: `instructor`, `student`, `admin`, `superadmin`, `support`
    - Assign `calendar:create`, `calendar:update`, `calendar:delete` to roles: `admin`, `superadmin`, `support`
    - Insert into `rbac_role_permissions` with `ON CONFLICT DO NOTHING`
- [x] Run the seed: `pnpm --dir app/sentinel-api exec tsx src/seeds/calendar-permissions.seed.ts`
- [x] Verify permissions exist in DB

**Migration required:** No — data seeding only

---

## Phase 6: Shared Package — API Type Definitions

**Goal:** Export real API response types for calendar events from `@sentinel/shared`.

- [x] Update `packages/shared/src/types/admin/calendar/index.ts`:
    - Keep existing `AdminEvent` and `CalendarDay` (mark `AdminEvent` as `@deprecated`)
    - Add:
        ```ts
        export type CalendarEventType =
            | 'EVENT'
            | 'ANNOUNCEMENT'
            | 'MAINTENANCE'
            | 'HOLIDAY'
            | 'NOTE';
        export type CalendarEventAudience =
            | 'ALL'
            | 'STUDENTS'
            | 'INSTRUCTORS'
            | 'ADMINS'
            | 'SPECIFIC_GROUP';
        export interface CalendarEventResponse {
            eventId: string;
            institutionId: string;
            title: string;
            description: string | null;
            eventType: CalendarEventType;
            targetAudience: CalendarEventAudience;
            startDate: string;
            endDate: string | null;
            startTime: string | null;
            endTime: string | null;
            createdBy: string | null;
            createdByName: string | null;
            createdAt: string;
            updatedAt: string | null;
        }
        ```
- [x] Export `CalendarEventResponse`, `CalendarEventType`, `CalendarEventAudience` from `packages/shared/src/types/index.ts`

**Migration required:** No

---

## Phase 7: Frontend — sentinel-web (Instructor Calendar)

**Goal:** Replace mock exam data in the instructor calendar with real API data.

- [x] Create `app/sentinel-web/src/data/api/calendar/get-calendar-events.ts`:
    - `getCalendarEventsData({ month, year }: GetCalendarEventsParams): Promise<CalendarEventResponse[]>`
    - Calls `apiClient.get('/calendar', { query: { month, year } })`
- [x] Create `app/sentinel-web/src/hooks/query/calendar/use-calendar-events-query.ts`:
    - `useCalendarEventsQuery({ month, year }: UseCalendarEventsQueryArgs)`
    - Query key: `['/calendar', 'search', { month, year }]`
    - `queryFn: () => getCalendarEventsData({ month, year })`
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/calendar/page.tsx`:
    - Remove `MOCK_PROCTOR_EXAMS` import
    - Use `useCalendarEventsQuery` with the current month/year from `useCalendar` state
    - Map `CalendarEventResponse[]` to `CalendarEvent[]` (adapt `eventId -> id`, `startDate -> date`, `eventType -> type`)
    - Show loading skeleton while query is fetching
- [x] Write `hooks/query/calendar/use-calendar-events-query.test.ts` — mock `getCalendarEventsData`, assert loading/success/error states

**Migration required:** No

---

## Phase 8: Frontend — sentinel-web (Student Calendar)

**Goal:** Replace mock exam data with real events and persist notes to the API.

- [x] Reuse `get-calendar-events.ts` and `use-calendar-events-query.ts` from Phase 7 (same `data/api/calendar/` directory)
- [x] Create `app/sentinel-web/src/data/api/calendar/create-calendar-note.ts`:
    - `createCalendarNoteData(payload: CreateCalendarNotePayload): Promise<CalendarEventResponse>`
    - Calls `apiClient.post('/calendar', { ...payload, eventType: 'NOTE', targetAudience: 'STUDENTS' })`
- [x] Create `app/sentinel-web/src/data/api/calendar/delete-calendar-event.ts`:
    - `deleteCalendarEventData({ eventId }: { eventId: string }): Promise<void>`
    - Calls `apiClient.delete('/calendar/:eventId')`
- [x] Create `app/sentinel-web/src/hooks/query/calendar/use-create-calendar-note-mutation.ts`:
    - `useCreateCalendarNoteMutation(args?)`
    - `mutationFn: createCalendarNoteData`
    - `onSuccess`: `await queryClient.invalidateQueries({ queryKey: ['/calendar'] })`
- [x] Create `app/sentinel-web/src/hooks/query/calendar/use-delete-calendar-note-mutation.ts`:
    - `useDeleteCalendarNoteMutation(args?)`
    - `mutationFn: deleteCalendarEventData`
    - `onSuccess`: `await queryClient.invalidateQueries({ queryKey: ['/calendar'] })`
- [x] Update `app/sentinel-web/src/app/(protected)/student/calendar/page.tsx`:
    - Remove `MOCK_EXAMS` import and in-memory `notes` state
    - Use `useCalendarEventsQuery` for all events
    - Use `useCreateCalendarNoteMutation` in `handleSaveNote` (call `mutate`, close dialog on success)
    - Use `useDeleteCalendarNoteMutation` in `handleDeleteNote`
    - Show loading state when query is loading; disable Add Note button while mutation is pending
- [x] Write tests for both mutation hooks

**Migration required:** No

---

## Phase 9: Frontend — sentinel-core (Admin Calendar)

**Goal:** Replace mock admin events with real API CRUD operations in sentinel-core.

- [x] Create `app/sentinel-core/src/data/api/calendar/get-calendar-events.ts` — same pattern as sentinel-web
- [x] Create `app/sentinel-core/src/data/api/calendar/create-calendar-event.ts`
- [x] Create `app/sentinel-core/src/data/api/calendar/update-calendar-event.ts`
- [x] Create `app/sentinel-core/src/data/api/calendar/delete-calendar-event.ts`
- [x] Create `app/sentinel-core/src/hooks/query/calendar/use-calendar-events-query.ts`
- [x] Create `app/sentinel-core/src/hooks/mutations/calendar/use-create-calendar-event-mutation.ts`:
    - `onSuccess`: invalidate `['/calendar']`
- [x] Create `app/sentinel-core/src/hooks/mutations/calendar/use-update-calendar-event-mutation.ts`:
    - `onSuccess`: invalidate `['/calendar']` and `['/calendar', eventId]`
- [x] Create `app/sentinel-core/src/hooks/mutations/calendar/use-delete-calendar-event-mutation.ts`:
    - `onSuccess`: invalidate `['/calendar']`
- [x] Update `app/sentinel-core/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts`:
    - Remove `MOCK_ADMIN_EVENTS` and local `events` state
    - Integrate `useCalendarEventsQuery` for fetching; expose `isLoading`
    - Replace `handleAddEvent` to call `useCreateCalendarEventMutation.mutate`
    - Replace `handleDeleteEvent` to call `useDeleteCalendarEventMutation.mutate`
- [x] Update `app/sentinel-core/src/app/(protected)/calendar/page.tsx`:
    - Pass `isLoading` down to `CalendarGrid` for loading state display
- [x] Write tests for mutation hooks

**Migration required:** No

---

## Phase 10: Frontend — sentinel-support (Support Calendar)

**Goal:** Wire the support calendar to real API data.

- [x] Create `app/sentinel-support/src/data/api/calendar/get-calendar-events.ts`
- [x] Create `app/sentinel-support/src/data/api/calendar/create-calendar-event.ts`
- [x] Create `app/sentinel-support/src/data/api/calendar/delete-calendar-event.ts`
- [x] Create `app/sentinel-support/src/hooks/query/calendar/use-calendar-events-query.ts`
- [x] Create `app/sentinel-support/src/hooks/mutations/calendar/use-create-calendar-event-mutation.ts`
- [x] Create `app/sentinel-support/src/hooks/mutations/calendar/use-delete-calendar-event-mutation.ts`
- [x] Update `app/sentinel-support/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts`:
    - Remove mock data
    - Use `useCalendarEventsQuery` for data
    - Wire create/delete mutations (support role has these permissions per Phase 5)
- [x] Verify UI parity with `sentinel-core` calendar — both use same component structure

**Migration required:** No

---

## Phase 11: UI Polish & Responsive Design Verification

**Goal:** Ensure all calendar UIs have consistent, responsive, and polished design.

- [x] **sentinel-web (instructor)**: Add loading skeleton to `CalendarGrid`; add empty state when no events exist for current month
- [x] **sentinel-web (student)**: Disable "Save Note" button while mutation is pending; show success/error feedback
- [x] **sentinel-core**: Disable "Add Event" button while create mutation is pending; show error messages in `EventDialog`
- [x] **sentinel-support**: Mirror core's polish
- [x] Cross-check margins/padding against other pages in each app (consistent `space-y-6`, `px-0` on `PageHeader`)
- [x] Verify responsive layout at 375px, 768px breakpoints for all `CalendarGrid` components

**Migration required:** No

---

## Done Criteria

- [x] `calendar_events` table exists in the database with correct columns, enums, and indexes
- [x] All 5 API endpoints respond correctly: `GET /calendar`, `GET /calendar/:id`, `POST /calendar`, `PUT /calendar/:id`, `DELETE /calendar/:id`
- [x] `requireActivePermission` guards enforce `calendar:view/create/update/delete` per endpoint
- [x] Permission keys seeded and linked to roles in `rbac_permissions` + `rbac_role_permissions`
- [x] Mock data (`MOCK_ADMIN_EVENTS`, `MOCK_PROCTOR_EXAMS`, `MOCK_EXAMS`) fully removed from all 4 frontends
- [x] `CalendarEventResponse` type exported from `@sentinel/shared`
- [x] All mutation hooks invalidate `['/calendar']` on success
- [x] Vitest tests pass for all new services, controllers, and hooks
- [x] Loading and empty states implemented in all calendar pages
- [x] `pnpm lint` and `pnpm build` clean with no TypeScript errors

---

## Additional Notes

- **Breaking API change:** None — `/calendar` is a brand-new route, no existing consumers.
- **New env variables:** None.
- **Migration rollback:** `DROP TABLE public.calendar_events; DROP TYPE public.calendar_event_type; DROP TYPE public.calendar_event_audience;`
- **NOTE type for students:** The `NOTE` enum value in `calendar_event_type` allows student-created personal notes scoped to their user. Ensure the query service filters notes by `created_by = userId` when fetching for student role, so notes are private.
- **Kysely type regeneration:** After running migration, run `pnpm db:generate` before writing any data layer code to get updated Kysely type definitions.
- **Existing calendar components** (`CalendarGrid`, `CalendarHeader`, `EventDialog`, `EventDetailsSheet`) are already built in `sentinel-core` — they only need their data source updated.
