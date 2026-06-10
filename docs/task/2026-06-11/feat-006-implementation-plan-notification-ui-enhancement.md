# feat-006 - Notification UI Enhancement Implementation Plan

**Date:** 2026-06-11  
**Type:** Feature  
**Summary:** Improve notification UX across `sentinel-core`, `sentinel-support`, and `sentinel-web`
by adding selectable notifications and a bulk remove action that only deletes the authenticated
user's own notifications.

## User Review Required

> [!IMPORTANT]
>
> - **Scope assumption:** `sentinel-core` and `sentinel-support` notification UX refers to the
>   existing bell dropdowns in `components/sidebar/common/*-notification-dropdown.tsx`, because
>   those apps do not currently expose a dedicated notifications page.
> - **Ownership rule:** Deletion must always be scoped by the authenticated recipient, so selected
>   notifications can be removed without affecting another user's records.

## 3 Viable Options

### Option A - Fastest path: duplicate the selection UI in each app

Add a bulk-delete API endpoint, then wire checkbox selection and a remove button directly into each
of the three existing notification surfaces with no shared abstraction.

- **Tradeoff:** Lowest implementation effort, but the selection and mutation logic will be duplicated
  in three places and will be harder to keep behaviorally identical.

### Option B - Shared notification hooks + app-specific views ✅ BEST

Add a bulk-delete API endpoint, then introduce shared notification query/mutation hooks in
`packages/hooks` so `sentinel-core`, `sentinel-support`, and `sentinel-web` all consume the same
data and deletion behavior while keeping their own layouts.

- **Tradeoff:** Slightly more up-front refactoring, but the behavior stays consistent, the delete
  rules live in one place, and the code fits the repo's existing hooks-first pattern.

### Option C - Build a reusable notification center component

Extract a new reusable notification list shell into `packages/ui` and render it from all three apps.

- **Tradeoff:** Maximum reuse, but it is the heaviest option for a small feature and would push
  domain-specific notification behavior into a generic UI package.

## Best Option

**Option B** is the best option. It keeps the backend ownership rules centralized, reduces duplicate
fetch/delete logic across the three apps, and still lets each surface keep its own layout
(`DropdownMenu` in core/support, `DataTable` in web).

## Concrete Next Steps

1. Add a bulk notification delete endpoint in `app/sentinel-api` that only deletes rows owned by the
   authenticated user.
2. Add shared notification query/mutation hooks in `packages/hooks` and export them from the hooks
   entrypoints.
3. Refactor the `sentinel-core` and `sentinel-support` bell dropdowns to support checkbox selection
   plus a bottom bulk remove action.
4. Refactor the `sentinel-web` student notifications page to replace the mock data with live API
   data and add checkbox selection plus a bulk remove footer action.
5. Add focused Vitest coverage for the new backend route, shared hooks, and the three UI surfaces.

## Pre-Planning Checklist

- [x] Read and summarized the task input in one sentence
- [x] Scanned relevant source files to understand existing patterns
- [x] Identified all files, services, and DB tables the task will touch
- [x] Determined if a Prisma migration is needed

## Task Summary

- [x] Add selectable notifications to the existing notification surfaces in all three apps
- [x] Add a remove action that only deletes the current user's own notifications
- [x] Preserve realtime refresh behavior after delete via the existing notification subscription

## Existing Findings

- `sentinel-core` and `sentinel-support` both use nearly identical notification dropdowns in
  `components/sidebar/common/`.
- `sentinel-web` still renders the student notification page from `MOCK_NOTIFICATIONS`.
- `packages/services/src/api/notifications.ts` already supports list/read/read-all operations, so a
  delete client call can be added without changing shared notification schemas.
- `packages/hooks/src/use-notification-realtime.ts` already subscribes to all notification table
  changes for the current recipient, so delete events should refresh existing queries without extra
  realtime work.
- The `notifications` table already stores the recipient owner, so no Prisma migration is required.

## Files, Services, and DB Tables in Scope

### Backend / API

- `app/sentinel-api/src/modules/general/notification/data/delete-notifications.ts`
- `app/sentinel-api/src/modules/general/notification/controllers/delete-notifications.controller.ts`
- `app/sentinel-api/src/modules/general/notification/notification.dto.ts`
- `app/sentinel-api/src/modules/general/notification/notification.service.ts`
- `app/sentinel-api/src/modules/general/notification/notification.routes.ts`
- `app/sentinel-api/src/modules/general/notification/data/delete-notifications.test.ts`
- `app/sentinel-api/src/modules/general/notification/controllers/delete-notifications.controller.test.ts`
- `app/sentinel-api/src/modules/general/notification/notification.service.test.ts`

### Shared Packages

- `packages/services/src/api/notifications.ts`
- `packages/services/src/api/index.ts`
- `packages/hooks/src/query/notifications/use-notifications-query.ts`
- `packages/hooks/src/query/notifications/use-notifications-query.test.ts`
- `packages/hooks/src/query/notifications/use-delete-notifications-mutation.ts`
- `packages/hooks/src/query/notifications/use-delete-notifications-mutation.test.ts`
- `packages/hooks/src/query/index.ts`
- `packages/hooks/src/index.ts`

### Frontend - sentinel-core

- `app/sentinel-core/src/components/sidebar/common/core-notification-dropdown.tsx`
- `app/sentinel-core/src/components/sidebar/common/core-notification-dropdown.test.tsx`

### Frontend - sentinel-support

- `app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.tsx`
- `app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.test.tsx`

### Frontend - sentinel-web

- `app/sentinel-web/src/app/(protected)/student/notifications/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/notifications/_components/notification-list.tsx`
- `app/sentinel-web/src/app/(protected)/student/notifications/_components/columns.tsx`
- `app/sentinel-web/src/app/(protected)/student/notifications/_components/notification-list.test.tsx`
- `app/sentinel-web/src/app/(protected)/student/notifications/_components/columns.test.tsx`

### Database

- `public.notifications`

## Assumptions and Scope Guards

- The bulk remove action is for the authenticated user's own notifications only.
- The delete endpoint will accept a list of notification IDs and ignore any rows outside the
  current user's ownership scope.
- No new environment variables are needed.
- No Prisma migration or rollback plan is required because the feature uses existing notification
  columns and relations.

## Additional Considerations

- **Breaking API changes:** No. The delete endpoint is additive.
- **Audit trail:** If the API already logs notification reads, consider logging bulk deletes with the
  deleted count and selected IDs for traceability.
- **Realtime behavior:** The existing notification realtime hook should continue to invalidate list
  queries after delete because it listens to all table changes for the current recipient.

## Proposed Changes

### Phase 1: Add Bulk Delete Support to the Notification API

**Goal:** Add a safe bulk-delete route that only removes the authenticated user's notifications and
returns a count of deleted rows.

- [x] Create `app/sentinel-api/src/modules/general/notification/data/delete-notifications.ts`
  - Delete rows from `notifications` where `recipient_user_id` matches the current user and
    `notification_id` is in the submitted ID list.
  - Return the number of rows deleted so the UI can confirm the action.
- [x] Update `app/sentinel-api/src/modules/general/notification/notification.dto.ts`
  - Add a `deleteNotificationsSchema` with a JSON body that accepts `notificationIds: string[]`.
  - Add a response schema that returns `message` plus a deletion `count`.
- [x] Create `app/sentinel-api/src/modules/general/notification/controllers/delete-notifications.controller.ts`
  - Expose a `DELETE /bulk` route under `/notifications`.
  - Reuse `notifications:view` permission because the route is still scoped to the authenticated
    user's own records.
  - Call the new notification service method and return the deleted count.
- [x] Update `app/sentinel-api/src/modules/general/notification/notification.service.ts`
  - Add `deleteNotifications({ dbClient, recipientUserId, notificationIds })`.
  - Keep the delete logic owned by the service layer so the route stays thin.
- [x] Update `app/sentinel-api/src/modules/general/notification/notification.routes.ts`
  - Register the new delete route alongside `get`, `mark-read`, and `mark-all-read`.
- [x] Update `packages/services/src/api/notifications.ts`
  - Add `deleteNotifications(apiClient, notificationIds)` to call the new route.
- [x] Update `packages/services/src/api/index.ts`
  - Existing `export * from './notifications'` already re-exports the new helper, so no code change
    was needed.
- [x] Write tests for the backend route and service
  - Add `delete-notifications.test.ts` for the data layer to verify only the current user's rows are
    deleted.
  - Add `delete-notifications.controller.test.ts` to verify the route shape, permission check, and
    response payload.
  - Extend `notification.service.test.ts` to cover the new `deleteNotifications` service method.
- [x] Write a client test for the new API helper
  - Add a `packages/services/src/api/notifications.test.ts` if needed to validate the delete helper
    builds the correct request.

**Migration required:** No - the `notifications` table already has the ownership columns needed for
scoped delete behavior.

### Phase 2: Add Shared Notification Query and Delete Hooks

**Goal:** Centralize notification fetching and bulk-delete mutations so the three apps share the
same behavior and invalidation logic.

- [x] Create `packages/hooks/src/query/notifications/use-notifications-query.ts`
  - Wrap `getNotifications(apiClient, params)` in `useQuery`.
  - Accept a query key and notification params so each app can keep its own scope string.
- [x] Create `packages/hooks/src/query/notifications/use-delete-notifications-mutation.ts`
  - Wrap `deleteNotifications(apiClient, notificationIds)` in `useMutation`.
  - Invalidate the caller-provided notification query key on success.
- [x] Update `packages/hooks/src/query/index.ts`
  - Export the new notifications query and mutation hooks.
- [x] Update `packages/hooks/src/index.ts`
  - Re-export the notifications hook module so app code can import from `@sentinel/hooks`.
- [x] Write hook tests
  - Verify `useNotificationsQuery` passes the correct API params and query key.
  - Verify `useDeleteNotificationsMutation` calls the delete API and invalidates the supplied query
    key.

**Migration required:** No - this is a client-side refactor only.

### Phase 3: Add Checkbox Selection and Bulk Remove to sentinel-core and sentinel-support

**Goal:** Let users select one or more notifications from the existing bell dropdown and remove only
the selected items from their own inbox.

- [x] Update `app/sentinel-core/src/components/sidebar/common/core-notification-dropdown.tsx`
    - Replace the inline `useQuery`/`useMutation` delete logic with the shared hooks from
      `@sentinel/hooks`.
    - Track selected notification IDs in local state.
    - Render checkbox affordances beside each dropdown notification row.
    - Add a bottom bulk remove action that is disabled until at least one notification is selected.
    - Clear the selection after a successful delete and keep the existing mark-as-read behaviors.
- [x] Update `app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.tsx`
    - Mirror the same selection, delete, and state-reset behavior used in core.
    - Keep the unread count badge, empty state, and forbidden-state behavior unchanged.
- [x] Update `app/sentinel-core/src/components/sidebar/common/core-notification-dropdown.test.tsx`
    - Verify checkbox selection, disabled/enabled remove state, delete mutation calls, and query
      invalidation.
- [x] Update `app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.test.tsx`
    - Mirror the core coverage to ensure both apps behave the same way.

**Migration required:** No - only frontend behavior changes.

### Phase 4: Replace sentinel-web Mock Data With a Live Selectable Notification Center

**Goal:** Swap the student notifications page from mock data to live API data and add checkbox-based
bulk delete with a bottom remove action.

- [x] Update `app/sentinel-web/src/app/(protected)/student/notifications/page.tsx`
    - Remove `MOCK_NOTIFICATIONS`.
    - Render a client-side container that fetches live notifications and owns selection state.
- [x] Update `app/sentinel-web/src/app/(protected)/student/notifications/_components/notification-list.tsx`
    - Accept row-selection state and selection callbacks from the page/container.
    - Keep the `DataTable` search experience intact.
    - Add a bottom action bar below the table with a remove button for selected notifications.
- [x] Update `app/sentinel-web/src/app/(protected)/student/notifications/_components/columns.tsx`
    - Add a leading checkbox column for row selection.
    - Keep the title, type, priority, date, and actions columns intact.
    - Leave the existing "Mark as read" and "View Details" actions in place.
- [x] Add a new client container if needed
    - Not needed; `page.tsx` owns the live query, selection state, and delete flow directly.
    - If the page becomes too large, create a dedicated container component that owns `useNotificationsQuery`,
      `useDeleteNotificationsMutation`, realtime invalidation, and selection state.
- [x] Write tests for the web notifications page
    - Add a page/container test that verifies loading, empty, populated, and delete-selected states.
    - Add a columns test that verifies the selection checkbox column is rendered and the action cells
      still render correctly.

**Migration required:** No - the page change is frontend-only.

## Verification Plan

### Automated Tests

```bash
pnpm --dir app/sentinel-api test
pnpm --dir packages/hooks test
pnpm --dir app/sentinel-core test
pnpm --dir app/sentinel-support test
pnpm --dir app/sentinel-web test
```

### Manual Verification

1. Open the core and support apps and confirm the bell dropdown shows checkboxes, a selected-count
   state, and a remove button.
2. Open the student notifications page in web and confirm the table uses live API data instead of
   the mock constant.
3. Delete a notification and verify it disappears only for the current user, while another user's
   notifications remain intact.
4. Confirm the unread badge and realtime refresh still work after delete and mark-read actions.

## Done Criteria

- Every selected notification delete request is scoped to the current authenticated user.
- `sentinel-core`, `sentinel-support`, and `sentinel-web` each expose a working selectable
  notification UX.
- Bulk delete is covered by backend, hook, and UI tests.
- No Prisma migration is introduced.
