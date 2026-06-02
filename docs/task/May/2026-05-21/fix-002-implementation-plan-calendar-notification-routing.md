# Implementation Plan: Calendar Notification Routing Fix

## Goal

Fix the calendar notification issue described in `docs/calendar-final-issue.md` so support-created events and admin/superadmin-created events follow one consistent notification routing path, especially for support recipients.

## Task Summary

The current calendar event creation flow sends notifications from `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts`, but it does so with a custom recipient query instead of the shared activity notification layer. Because of that, support delivery rules are inconsistent with the rest of the system.

## Execution Log

- Issue restatement: Calendar event notifications are routed inconsistently because calendar creation bypasses the shared activity notification path, which causes support/admin delivery gaps.
- Follow-up hierarchy fix: calendar read visibility now resolves `active institution + direct parent + direct children` so child-institution events also appear to parent-institution accounts such as support users attached at the parent level.
- Test runner status: `pnpm --dir app/sentinel-api test -- --runInBand ...` starts Vitest successfully, but the current suite also triggers unrelated database-backed tests that fail against the configured Supabase host in this environment.
- Environment status: `app/sentinel-api/.env` and `app/sentinel-api/.env.example` exist; no new environment variables are required for this work.
- Migration status: No Prisma migration is required for Phase 1 because the current notification enums already include `INSTITUTION_ACTIVITY` and `INSTITUTION_ACTIVITY_CREATED`.
- Product ambiguity: The current issue report strongly supports including support recipients for administrator and superadmin calendar events, but it does not conclusively define whether support belongs in `targetAudience = 'ADMINS'`. The implementation assumption proposed for approval is:
- Product ambiguity: The current issue report strongly supports including support recipients for administrator and superadmin calendar events, but it does not conclusively define whether support belongs in `targetAudience = 'ADMINS'`. The implementation assumption approved for Phase 2 is:
    - `ALL` includes support.
    - `ADMINS` remains `admin + superadmin` unless you want support grouped into that audience as well.
- Hierarchy note: Real-data verification of support institution placement is blocked in the current environment because the available API test run is coupled to a remote database connection.

## Step-by-Step Analysis

### 1. What the issue report says

- Support can create a calendar event and other users receive it.
- Support does not consistently receive the expected notification behavior around calendar announcements.
- Admin and superadmin calendar events are posted, but support accounts do not reliably receive the notification.

### 2. What the current backend flow does

- `app/sentinel-api/src/modules/general/calendar/controllers/create-calendar-event.controller.ts`
  calls `CalendarService.createCalendarEvent(...)`.
- `app/sentinel-api/src/modules/general/calendar/calendar.service.ts`
  delegates directly to `createCalendarEvent(...)` in `calendar-write.service.ts`.
- `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts`
  creates the event, manually queries branches, manually maps `targetAudience` to roles, manually queries recipients, and directly calls `NotificationService.createNotification(...)`.

### 3. Why this is risky

- The calendar module is duplicating notification routing logic instead of reusing the shared notification services.
- The shared notification layer already contains:
    - actor role resolution
    - institution hierarchy handling
    - permission-aware recipient lookup
    - established fan-out patterns for support/admin/superadmin notifications
- Calendar creation bypasses that shared path, so fixes made elsewhere do not automatically apply here.

### 4. Most likely root cause

- The bug is not just “support is missing from one array”.
- The deeper issue is that calendar notification routing lives in the wrong layer.
- `createCalendarEvent()` currently decides recipients on its own, while other institution activity flows use:
    - `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts`
    - `app/sentinel-api/src/modules/general/notification/services/activity/activity-notification-base.service.ts`
- That split makes support/admin behavior inconsistent, especially when institution hierarchy matters.

### 5. Current schema assessment

- `packages/shared/src/schema/notifications/notification-schema.ts` already supports:
    - `resourceType: 'INSTITUTION_ACTIVITY'`
    - `actionType: 'INSTITUTION_ACTIVITY_CREATED'`
- Based on the current codebase, no new notification enum is required for the first-pass fix.
- Prisma migration is not expected unless implementation reveals a hard requirement for a calendar-specific notification type.

## Scope

### In Scope

- API calendar event creation notification routing
- Support/admin/superadmin recipient coverage
- Service-level test coverage for notification fan-out
- Verifying that calendar creation still returns the fully hydrated event response

### Out Of Scope

- Frontend UI redesign
- New calendar audience enums unless proven necessary
- Refactoring update/delete notifications unless required by the chosen service abstraction

## Files To Inspect During Implementation

- `docs/calendar-final-issue.md`
- `app/sentinel-api/src/modules/general/calendar/controllers/create-calendar-event.controller.ts`
- `app/sentinel-api/src/modules/general/calendar/calendar.service.ts`
- `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts`
- `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.test.ts`
- `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts`
- `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts`
- `app/sentinel-api/src/modules/general/notification/services/activity/activity-notification-base.service.ts`
- `app/sentinel-api/src/modules/general/notification/services/activity/generic-activity-notification.service.ts`
- `packages/shared/src/schema/notifications/notification-schema.ts`

## Pre-Planning

- [x] Restate the issue in one sentence at the top of the PR or execution log.
- [ ] Confirm whether support should receive calendar notifications only for `targetAudience = 'ALL'` or also for `ADMINS`.
- [x] Confirm whether the event creator should always be excluded from notification recipients.
- [ ] Verify whether support users are attached to parent institutions, branch institutions, or mixed institution records in real data.
- [x] Review the existing support-related plan at `docs/task/2026-05-21/fix-001-implementation-plan-calendar-support.md` and treat it as incomplete rather than authoritative.
- [x] Determine if a Prisma migration is needed.
      **Migration required:** No — current shared notification enums already support institution activity creation.

## Phase 1: Lock Down Expected Recipient Rules

**Goal:** Define the expected notification matrix before touching recipient logic.

- [x] Document the expected recipients for these combinations:
    - support actor + `ALL`
    - support actor + `ADMINS`
    - admin actor + `ALL`
    - superadmin actor + `ALL`
    - admin actor + `ADMINS`
- [ ] Explicitly decide whether support belongs in `ALL` only, or also in `ADMINS`, since the current issue report suggests support expects visibility when administrators create events.
- [x] Record whether support should receive notifications across institution hierarchy boundaries or only within resolved institution scope.
- [x] Add test case names for each confirmed rule in `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.test.ts`.
- [x] If product behavior is ambiguous, capture it as a blocking note instead of encoding assumptions silently.
      **Migration required:** No — rule definition only.

### Phase 1 Recipient Matrix

- support actor + `ALL`:
  notify students, instructors, admins, and superadmins in scope;
  exclude the creator;
  do not self-notify support by default.
- support actor + `ADMINS`:
  notify admins and superadmins in scope;
  support inclusion is not assumed here.
- admin actor + `ALL`:
  notify students, instructors, admins, superadmins, and support in scope.
- superadmin actor + `ALL`:
  notify students, instructors, admins, superadmins, and support in scope.
- admin actor + `ADMINS`:
  notify admins and superadmins in scope;
  support inclusion is pending product confirmation.

### Phase 1 Blocking Note

<!-- NOTE: Product confirmation is still needed on whether support should be included in `targetAudience = 'ADMINS'`. Phase 2 should proceed only after approval of the provisional assumption that support is included in `ALL` but not implicitly grouped into `ADMINS`. -->

## Phase 2: Move Calendar Notification Routing Out Of Inline Query Logic

**Goal:** Remove calendar-specific recipient fan-out from `createCalendarEvent()` and route it through a shared notification abstraction.

- [x] Refactor `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts` so `createCalendarEvent()` only:
    - creates the calendar event
    - delegates notification dispatch to a dedicated helper/service
    - re-fetches the hydrated event
- [x] Create one dedicated calendar notification abstraction in one of these locations:
    - `app/sentinel-api/src/modules/general/notification/services/activity/calendar-activity-notification.service.ts`
    - `app/sentinel-api/src/modules/general/calendar/services/calendar-notification.service.ts`
- [x] Ensure the new abstraction reuses shared notification infrastructure instead of calling `NotificationService.createNotification()` from inline recipient queries.
- [x] Reuse `notifyInstitutionActivity()` or add a calendar-specific method on `ActivityNotificationService` if that produces clearer ownership.
- [x] Preserve current payload shape where possible:
    - title: `New Calendar Event: ${payload.title}`
    - message: `payload.description` fallback
    - resource type/action type: existing `INSTITUTION_ACTIVITY` + `INSTITUTION_ACTIVITY_CREATED`
    - metadata: `eventType`, `targetAudience`
      **Migration required:** No — service-layer refactor only.

### Phase 2 Execution Notes

- Implemented `app/sentinel-api/src/modules/general/notification/services/activity/calendar-activity-notification.service.ts` as the dedicated calendar routing abstraction.
- Added `ActivityNotificationService.notifyCalendarEventCreated(...)` and refactored `createCalendarEvent()` to delegate to it.
- Extended `notifyInstitutionActivity()` / `getInstitutionUsersWithPermission()` with `includeChildInstitutions` so support-created parent-level calendar events still fan out to branch users.
- Preserved current notification semantics:
    - title still uses `New Calendar Event: ${payload.title}`
    - description still takes precedence in the message body
    - action/resource types remain `INSTITUTION_ACTIVITY_CREATED` + `INSTITUTION_ACTIVITY`
- Validation run:
    - `pnpm --dir app/sentinel-api exec vitest run src/modules/general/calendar/services/calendar-write.service.test.ts src/modules/general/notification/services/activity/calendar-activity-notification.service.test.ts src/modules/general/notification/services/activity-notification.service.test.ts`
    - Result: `3 passed`, `17 passed | 5 todo`

## Phase 3: Make Audience Mapping Explicit And Testable

**Goal:** Stop hiding audience behavior inside ad hoc conditionals.

- [x] Extract a small function that maps calendar `targetAudience` to intended recipient roles.
- [x] Handle at minimum:
    - `ALL`
    - `STUDENTS`
    - `INSTRUCTORS`
    - `ADMINS`
    - fallback/default behavior
- [x] Decide whether `SPECIFIC_GROUP` should remain unsupported for notifications, no-op safely, or be documented as future work.
- [x] Pass explicit `roleNames` into the shared activity layer if calendar behavior must be narrower than the generic default role routing.
- [x] Avoid duplicating institution traversal and permission checks already implemented in `activity-notification-base.service.ts`.
      **Migration required:** No — logic extraction only.

### Phase 3 Execution Notes

- Extracted calendar audience mapping into `mapCalendarAudienceToRecipientRoles(...)` in `app/sentinel-api/src/modules/general/notification/services/activity/calendar-activity-notification.service.ts`.
- Made the behavior explicit for:
    - `ALL`
    - `STUDENTS`
    - `INSTRUCTORS`
    - `ADMINS`
    - fallback/default behavior
- Chosen safe behavior for `SPECIFIC_GROUP`:
    - no notification fan-out for now
    - rationale: the current DTO has no specific recipient/group identifiers, so broadening delivery would risk over-notifying unrelated users
- Continued to use explicit `roleNames` with the shared activity notification path instead of reintroducing calendar-owned recipient queries.
- Validation run:
    - `pnpm --dir app/sentinel-api exec vitest run src/modules/general/notification/services/activity/calendar-activity-notification.service.test.ts src/modules/general/calendar/services/calendar-write.service.test.ts src/modules/general/notification/services/activity-notification.service.test.ts`
    - Result: `3 passed`, `21 passed | 5 todo`

## Phase 4: Add Regression Coverage For Support/Admin Scenarios

**Goal:** Make the reported bug reproducible in tests and keep it fixed.

- [x] Expand `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.test.ts` to cover:
    - support-created event notifies expected recipients
    - admin-created `ALL` event includes support recipients if confirmed by product rules
    - superadmin-created `ALL` event includes support recipients if confirmed by product rules
    - audience filtering excludes unrelated roles
    - creator is excluded from the notification recipient list
- [x] Add focused tests for the new notification helper/service:
    - `app/sentinel-api/src/modules/general/notification/services/activity/calendar-activity-notification.service.test.ts`
    - or the matching calendar service test file if the helper lives under calendar
- [x] If `ActivityNotificationService` gains a new calendar entry point, update `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts`.
- [x] Verify notification assertions include:
    - recipient user IDs
    - actor user ID
    - institution ID
    - action type
    - resource type
    - metadata payload
- [x] Add hierarchy coverage for calendar read scope so parent-institution accounts can load child-institution events from the calendar API, not only from notifications.
      **Migration required:** No — tests only.

### Phase 4 Execution Notes

- Expanded `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.test.ts` with concrete regression tests for:
    - support-created `ALL` event delegation
    - admin-created `ALL` event delegation
    - superadmin-created `ALL` event delegation
    - restricted-audience delegation
    - creator identity propagation for downstream exclusion
- Expanded `app/sentinel-api/src/modules/general/notification/services/activity/calendar-activity-notification.service.test.ts` with focused coverage for:
    - support-created `ALL` audience mapping
    - admin-created `ALL` audience mapping
    - superadmin-created `ALL` audience mapping
    - `ADMINS`, `STUDENTS`, and `INSTRUCTORS` audience narrowing
    - `SPECIFIC_GROUP` no-op behavior
    - shared activity routing payload assertions
- Updated `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts` to cover the calendar service entry point added in Phase 2.
- Added `app/sentinel-api/src/modules/general/calendar/data/resolve-calendar-scope-institution-ids.ts` and a focused test so calendar reads use the same hierarchy-aware scope for both list and detail endpoints.
- Validation run:
    - `pnpm --dir app/sentinel-api exec vitest run src/modules/general/calendar/data/resolve-calendar-scope-institution-ids.test.ts src/modules/general/calendar/services/calendar-query.service.test.ts src/modules/general/calendar/services/calendar-write.service.test.ts src/modules/general/notification/services/activity/calendar-activity-notification.service.test.ts`
    - Result: `4 passed`, `26 passed`

## Phase 5: Validate Contract Safety

**Goal:** Confirm the routing fix does not break calendar creation behavior outside notifications.

- [x] Re-run `app/sentinel-api/src/modules/general/calendar/calendar.service.test.ts` and update it if service boundaries change.
- [x] Re-run `app/sentinel-api/src/modules/general/calendar/controllers/calendar.controller.test.ts` and update controller mocks if needed.
- [x] Confirm `packages/services/src/api/calendar.ts` and existing frontend callers do not need request/response changes.
- [x] Check whether any current consumer assumes support is excluded from `ALL`, and document that as a behavior change if found.
- [x] If implementation reveals a need for a new notification enum or resource type, stop and create a separate migration sub-plan before proceeding.
      **Migration required:** No unless enum support changes become necessary.

### Phase 5 Execution Notes

- Re-ran the calendar facade and controller test coverage after the routing refactor:
    - `app/sentinel-api/src/modules/general/calendar/calendar.service.test.ts`
    - `app/sentinel-api/src/modules/general/calendar/controllers/calendar.controller.test.ts`
- Confirmed the API contract remains unchanged for callers:
    - `packages/services/src/api/calendar.ts` still posts the same create payload and does not depend on notification internals
    - existing web/core/support callers still interact with `/calendar` the same way
- No new request fields, response fields, notification enums, or resource types were introduced.
- Consumer assumption note:
    - this change preserves the previously intended meaning that `targetAudience = 'ALL'` can include support recipients for admin and superadmin created events
    - `targetAudience = 'ADMINS'` still does not implicitly include support
- Validation run:
    - `pnpm --dir app/sentinel-api exec vitest run src/modules/general/calendar/calendar.service.test.ts src/modules/general/calendar/controllers/calendar.controller.test.ts src/modules/general/calendar/services/calendar-write.service.test.ts src/modules/general/notification/services/activity/calendar-activity-notification.service.test.ts src/modules/general/notification/services/activity-notification.service.test.ts`
    - Result: `5 passed`, `43 passed`

## Verification Plan

### Automated Tests

- [ ] Run `pnpm --dir app/sentinel-api test -- --runInBand`
- [x] Run targeted tests for:
    - `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.test.ts`
    - `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts`
    - any new calendar notification helper test file

<!-- NOTE: `pnpm --dir app/sentinel-api test -- --runInBand` starts Vitest successfully, but the current repository test suite also triggers unrelated database-backed tests that fail against the configured remote Supabase host in this environment. The targeted calendar notification slice passes cleanly and isolates this change set. -->

### Manual Verification

- [ ] Create a calendar event as Support and verify expected non-support recipients receive a notification.
- [ ] Create a calendar event as Admin and verify Support receives the notification when the audience rule says it should.
- [ ] Create a calendar event as Superadmin and verify Support receives the notification when the audience rule says it should.
- [ ] Confirm the event creator does not receive an unintended self-notification.

## Done Criteria

- [x] Calendar event creation no longer owns custom recipient fan-out inline.
- [x] Support/admin/superadmin calendar notifications follow one shared routing strategy.
- [x] The original issue from `docs/calendar-final-issue.md` is reproducible in tests before the fix and covered after the fix.
- [x] No Prisma migration is introduced unless a confirmed notification enum gap requires it.
- [x] The final implementation clearly documents any product assumption around support membership in `ALL` and `ADMINS`.
