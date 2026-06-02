# Implementation Plan: Calendar Module Code Consolidation

## Goal

Consolidate duplicate calendar queries, mutations, and API client functions from the three frontend application spaces (`app/sentinel-web`, `app/sentinel-core`, and `app/sentinel-support`) into the central, shared monorepo packages (`@sentinel/services` and `@sentinel/hooks`). This maximizes package reuse, ensures unified caching key structures, and simplifies future maintenance.

---

## Pre-Planning

- [x] Read and summarize the task input in one sentence: Consolidate calendar API functions and query/mutation hooks from individual client applications into the shared `@sentinel/services` and `@sentinel/hooks` packages.
- [x] Scan relevant source files to understand existing patterns: Verified `packages/services/src/api/courses.ts`, `packages/hooks/src/query/courses/use-courses-query.ts`, and the current calendar implementations in `sentinel-web`, `sentinel-core`, and `sentinel-support`.
- [x] Identify all files, services, and DB tables the task will touch: Touches `packages/services`, `packages/hooks`, `packages/shared`, `app/sentinel-web`, `app/sentinel-core`, and `app/sentinel-support`. No DB tables are affected directly.
- [x] Determine if a Prisma migration is needed: No, this is a pure code refactor/consolidation effort.

---

### Phase 1: Shared API Client Service Consolidation

**Goal:** Centralize the calendar API client requests in `@sentinel/services` to avoid duplicate fetch and response parsing logic.

- [x] Create `packages/services/src/api/calendar.ts` to implement the following shared API calls:
    - `getCalendarEvents(apiClient, params)`: fetches events based on optional `month` and `year`.
    - `createCalendarEvent(apiClient, payload)`: handles POST `/calendar` with unified event and audience types.
    - `updateCalendarEvent(apiClient, payload)`: handles PUT `/calendar/:eventId` for editing events.
    - `deleteCalendarEvent(apiClient, { eventId })`: handles DELETE `/calendar/:eventId`.
- [x] Export calendar services in `packages/services/src/api/index.ts`
- [x] Define and export `CALENDAR_QUERY_KEYS` in `packages/shared/src/constants/admin/calendar/index.ts`:
    ```typescript
    export const CALENDAR_QUERY_KEYS = {
        all: ['/calendar'] as const,
        search: (payload: any) => ['/calendar', 'search', payload] as const,
    };
    ```
- [x] Re-export `CALENDAR_QUERY_KEYS` in `packages/shared/src/constants/index.ts`
- [x] Implement unit tests for the shared API functions if a service testing utility exists.
      **Migration required:** No

---

### Phase 2: Shared React Query & Mutation Hooks Consolidation

**Goal:** Centralize React Query hook logic under `@sentinel/hooks/src/query/calendar` to unify cached query keys, states, error handling, and onSuccess cache invalidations.

- [x] Create directory `packages/hooks/src/query/calendar/`
- [x] Create `packages/hooks/src/query/calendar/use-calendar-events-query.ts` implementing `useCalendarEventsQuery` using the shared `getCalendarEvents` service.
- [x] Create `packages/hooks/src/query/calendar/use-create-calendar-event-mutation.ts` implementing `useCreateCalendarEventMutation` using the shared `createCalendarEvent` service.
- [x] Create `packages/hooks/src/query/calendar/use-update-calendar-event-mutation.ts` implementing `useUpdateCalendarEventMutation` using the shared `updateCalendarEvent` service.
- [x] Create `packages/hooks/src/query/calendar/use-delete-calendar-event-mutation.ts` implementing `useDeleteCalendarEventMutation` using the shared `deleteCalendarEvent` service.
- [x] Create `packages/hooks/src/query/calendar/index.ts` to export all hooks from this folder.
- [x] Export the calendar folder in `packages/hooks/src/query/index.ts`
- [x] Export the calendar folder in `packages/hooks/src/index.ts`
      **Migration required:** No

---

### Phase 3: Client Applications Clean-up & Migration

**Goal:** Refactor the individual Next.js client applications to import all calendar features from the shared monorepo packages, and completely delete duplicate local code files.

#### App 1: `sentinel-web` (Student/Instructor UI)

- [ ] Update `app/sentinel-web/src/app/(protected)/(instructor)/calendar/page.tsx` and `app/sentinel-web/src/app/(protected)/student/calendar/page.tsx` to use the new shared hooks from `@sentinel/hooks` instead of the local hooks.
- [ ] Delete `app/sentinel-web/src/data/api/calendar` folder.
- [ ] Delete `app/sentinel-web/src/hooks/query/calendar` folder.

#### App 2: `sentinel-core` (Admin/Superadmin UI)

- [ ] Update `app/sentinel-core/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts` to import `useCalendarEventsQuery`, `useCreateCalendarEventMutation`, `useUpdateCalendarEventMutation`, and `useDeleteCalendarEventMutation` from `@sentinel/hooks` instead of local files.
- [ ] Delete `app/sentinel-core/src/data/api/calendar` folder.
- [ ] Delete `app/sentinel-core/src/hooks/query/calendar` and `app/sentinel-core/src/hooks/mutations/calendar` folders.

#### App 3: `sentinel-support` (Support Portal)

- [ ] Update `app/sentinel-support/src/app/(protected)/calendar/_hooks/use-admin-calendar.ts` to import `useCalendarEventsQuery`, `useCreateCalendarEventMutation`, `useUpdateCalendarEventMutation`, and `useDeleteCalendarEventMutation` from `@sentinel/hooks` instead of local files.
- [ ] Delete `app/sentinel-support/src/data/api/calendar` folder.
- [ ] Delete `app/sentinel-support/src/hooks/query/calendar` and `app/sentinel-support/src/hooks/mutations/calendar` folders.
      **Migration required:** No

---

### Phase 4: Test Suite Migration & Validation

**Goal:** Adapt the application test suites to verify that the integrated shared hooks function correctly under each frontend application's environment.

- [ ] Recreate or rewrite hook integration tests in `app/sentinel-web` to verify that the components render correctly and properly trigger queries/mutations using `@sentinel/hooks` while mocking the backend responses.
- [ ] Run `pnpm test` across all app spaces to ensure that the calendar components still render and behave exactly as before.
- [ ] Verify that all typescript checks pass with `pnpm build` or `pnpm tsc` globally.
      **Migration required:** No

---

## Done Criteria

- [ ] All calendar-related API calls in `packages/services` are exported and unified.
- [ ] All calendar-related `useQuery` and `useMutation` hooks in `packages/hooks` are exported and unified.
- [ ] Redundant `data/api/calendar` and `hooks/query/calendar` folders in all client apps (`web`, `core`, `support`) are fully deleted.
- [ ] Frontend calendar pages (`sentinel-web`, `sentinel-core`, `sentinel-support`) run seamlessly with no runtime or build errors.
- [ ] All Vitest unit and integration tests run and pass without failures.
- [ ] Typescript compiles successfully across the entire Turborepo monorepo.
