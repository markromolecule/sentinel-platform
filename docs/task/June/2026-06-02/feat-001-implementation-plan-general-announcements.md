# Implementation Plan - General Announcements Module

Implement a full-stack `announcements` module that matches `docs/context/general-announcement.md`: migrate the legacy announcement table to the new slug-based soft-delete shape, wire announcement notifications into the existing notification system, and expose typed API helpers plus React Query hooks for frontend consumers.

## User Review Required

> [!NOTE]
> This work touches the Prisma schema, notification enums, API routes, and shared client packages. The migration and the code updates should land together so the API contract does not drift from the database shape.

## Proposed Changes

### Sentinel API

#### [MODIFY] [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)

- Reshape the existing `announcements` model to the spec's columns and constraints.
- Add the slug uniqueness rule and the soft-delete columns.
- Extend the notification enums needed for announcement events.

#### [NEW] [announcement.repository.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/data/announcement.repository.ts)

- Add the only raw-data-access layer for announcement CRUD and list queries.

#### [NEW] [announcement-query.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/services/announcement-query.service.ts)

- Add list/detail lookups with pagination, search, sort, status filters, and soft-delete filtering.

#### [NEW] [announcement-crud.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/services/announcement-crud.service.ts)

- Add create/update/remove behavior, slug generation, and soft delete.

#### [NEW] [announcement-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/services/announcement-notification.service.ts)

- Bridge announcement publish/update/delete events into the existing notification module.

#### [MODIFY] [announcement.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/announcement.service.ts)

- Keep this file as the thin public facade only.

#### [NEW] [announcement.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/announcement.dto.ts)

- Define the create/update DTO validation used by the routes and service layer.

#### [NEW] [announcement.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/controllers/announcement.controller.ts)

- Add OpenAPI route handlers for list/detail/create/update/delete.

#### [MODIFY] [announcement.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/announcement.routes.ts)

- Register the handlers with auth and role/permission guards that match neighboring modules.
- Ensure the slug route is declared before the UUID route so it does not get shadowed.

#### [NEW] [announcement.module.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/announcements/announcement.module.ts)

- Add the composition root for the announcement domain wiring if the module structure needs one.

#### [MODIFY] [app.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/app.ts)

- Mount the announcements router under `/announcements`.

### Shared Notification Contract

#### [MODIFY] [notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/notification.service.ts)

- Add announcement-aware notification entry points or routing.

#### [MODIFY] [create-notification.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/data/create-notification.ts)

- Persist announcement notifications with the required metadata payload.

#### [MODIFY] [map-notification.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/map-notification.ts)

- Keep the API response mapping compatible with announcement notifications.

#### [MODIFY] [notification-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/notifications/notification-schema.ts)

- Add the new announcement action enum values and any resource enum additions needed for deep links.

### Shared Client Packages

#### [MODIFY] [announcements.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/announcements.ts)

- Add typed API helpers for list/detail/create/update/delete operations.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/index.ts)

- Export the new announcements API helpers.

#### [NEW] [announcements/](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/announcements/)

- Add list, single-item, create, update, and delete React Query hooks using the repo's existing query-key patterns.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/index.ts)

- Export the announcements hook folder.

## Phases of Implementation

### Phase 1: Data Model and Contract Alignment

**Goal:** Make the persisted announcement shape, notification enums, and shared schemas match the requested API contract before writing behavior on top of them.

- [x] Update `packages/db/prisma/schema.prisma` so `announcements` matches the requested columns and uniqueness rules
- [x] Add the Prisma migration that reshapes the legacy announcement rows into the new model
- [x] Extend the notification enums in both the Prisma schema and `packages/shared/src/schema/notifications/notification-schema.ts`
- [x] Add or update schema-level tests for slug rules and announcement notification enum coverage

**Migration required:** Yes - the announcement table shape and notification enum contract both change.

### Phase 2: Backend Domain Implementation

**Goal:** Implement the repository, services, DTOs, controller, route wiring, and app registration for the announcement module.

- [x] Implement `app/sentinel-api/src/modules/general/announcements/data/announcement.repository.ts`
- [x] Implement `app/sentinel-api/src/modules/general/announcements/services/announcement-query.service.ts`
- [x] Implement `app/sentinel-api/src/modules/general/announcements/services/announcement-crud.service.ts`
- [x] Implement `app/sentinel-api/src/modules/general/announcements/services/announcement-notification.service.ts`
- [x] Keep `app/sentinel-api/src/modules/general/announcements/announcement.service.ts` as a facade only
- [x] Implement `app/sentinel-api/src/modules/general/announcements/announcement.dto.ts`
- [x] Implement `app/sentinel-api/src/modules/general/announcements/controllers/announcement.controller.ts`
- [x] Wire `app/sentinel-api/src/modules/general/announcements/announcement.routes.ts` with auth/role guards and the slug-before-id route order
- [x] Add `app/sentinel-api/src/modules/general/announcements/announcement.module.ts` if needed for domain composition
- [x] Mount the router in `app/sentinel-api/src/app.ts`
- [x] Add Vitest coverage for repository filters, slug generation, soft delete, and controller route behavior

**Migration required:** No additional migration beyond Phase 1, but the backend must target the migrated schema.

### Phase 3: Notification Integration

**Goal:** Make announcement publish/update/delete events create the right notifications without changing how notifications are read.

- [x] Update `app/sentinel-api/src/modules/general/notification/notification.service.ts` to recognize announcement events
- [x] Update `app/sentinel-api/src/modules/general/notification/data/create-notification.ts` to persist the announcement metadata payload
- [x] Update `app/sentinel-api/src/modules/general/notification/services/map-notification.ts` so announcement notifications serialize correctly
- [x] Make update/delete announcement notifications configurable in the announcement notification service so the behavior is centralized
- [x] Add tests for publish fan-out, optional update/delete fan-out, and notification payload mapping

**Migration required:** Yes if the notification enum is persisted or shared in a generated contract; otherwise this phase is code-only after Phase 1.

### Phase 4: Client API and React Query Hooks

**Goal:** Expose typed client helpers and cache-aware hooks so frontend consumers can read and mutate announcements consistently.

- [x] Implement `packages/services/src/api/announcements.ts` with the typed API helper functions from the spec
- [x] Export those helpers from `packages/services/src/api/index.ts`
- [x] Create the announcements hook folder under `packages/hooks/src/query/announcements/` using the repo-standard kebab-case filenames
- [x] Implement query hooks with the required keys: `['announcements', params]`, `['announcements', id]`, and `['announcements', 'slug', slug]`
- [x] Implement create/update/delete mutation hooks and the required invalidation behavior
- [x] Export the hook folder from `packages/hooks/src/query/index.ts`
- [x] Add unit tests for the API wrapper and hook invalidation/query-key behavior

**Migration required:** No.

### Phase 5: Consumer Audit and Verification

**Goal:** Make sure the new announcement contract does not leave stale consumers or broken imports behind.

- [x] Audit the existing announcement-facing UI in `app/sentinel-core`, `app/sentinel-web`, and `app/sentinel-support` for any compile-time dependency on the old announcement shape
- [x] Update `packages/shared/src/schema/announcements/AnnouncementSchema.ts` and `packages/shared/src/schema/admin/announcements/announcement-schema.ts` only if a live consumer must submit or display the new API-backed shape
- [x] Run the focused Vitest suites for the API, notification, and hook changes
- [x] Run lint and format on the touched files and confirm the app still compiles after the schema migration

**Migration required:** No.

## Verification Plan

### Automated Checks

- Run the backend Vitest suites that cover the announcement repository, services, and controller routes.
- Run the package-level tests for `packages/services` and `packages/hooks` if the new announcement tests are added there.
- Run lint and formatting on all touched files.

### Manual Checks

- Confirm `GET /announcements`, `GET /announcements/:id`, and `GET /announcements/slug/:slug` all respond correctly.
- Confirm `POST`, `PATCH`, and `DELETE` use slug generation, soft delete, and publish notification behavior as expected.
- Confirm announcement notifications still show up in the existing notification UI with unread/read state intact.

## Done Criteria

- The Prisma model and notification contract match the announcement spec.
- The announcement API is mounted and exercised by tests.
- Soft delete, slug generation, and publish-state filtering all work.
- Announcement notifications are emitted through the existing notification system.
- Typed API helpers and React Query hooks are exported and tested.
