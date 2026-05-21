# Calendar Issue Fixes

This plan addresses three calendar-related issues: adding the Calendar page for Support, sending notifications to Support users when an administrator posts an event, and restricting event deletion to the event creator.

## User Review Required

- **Deletion Policy:** We are changing the deletion policy so that _only the creator_ of an event (or announcement) can delete it. This means even an administrator or superadmin cannot delete an event created by someone else. Is this the exact intended behavior, or should superadmins still have override delete permissions?

## Open Questions

- **Target Audience for Support:** When targeting notifications, should there be an explicit "SUPPORT" audience in the `calendar_event_audience` enum, or is it sufficient to just include Support users in the "ALL" audience notifications? (This plan assumes adding them to the "ALL" audience).

## Proposed Changes

### Sentinel Support

#### [MODIFY] [constants/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/constants/index.ts)

- Add the Calendar link under the `COMMUNICATION_ITEMS` array so it appears in the sidebar for Support staff.

### Sentinel API

#### [MODIFY] [calendar-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts)

- Update `createCalendarEvent` to include `'support'` in the list of `targetRoles` when `targetAudience === 'ALL'`.
- Update `deleteCalendarEvent` to throw a `403 Forbidden` error if `event.createdBy !== userId`, ensuring only the creator can delete their event or announcement.

#### [MODIFY] [calendar.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/calendar.service.test.ts)

- Write tests to verify that support users are notified when a calendar event is targeted to 'ALL'.
- Write tests to verify that non-creators cannot delete calendar events.

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-api test` to confirm the new deletion and notification logic works correctly.

### Manual Verification

- Log in to the Support portal and verify the Calendar page is accessible from the sidebar.
- Create an event as an Admin targeted to "ALL" and verify a Support user receives the notification.
- Attempt to delete another user's event and verify the action is blocked.

---

### Phase 1: Support Sidebar Update

**Goal:** Expose the Calendar page to the Support application.

- [x] Implement `app/sentinel-support/src/components/sidebar/support/constants/index.ts` — Add Calendar link to `COMMUNICATION_ITEMS`.
- [x] Run `pnpm dev` and verify Calendar appears on the support sidebar.
      **Migration required:** No — UI change only.

### Phase 2: Notification & Deletion Logic Fixes

**Goal:** Include support in notifications and restrict event deletion to the creator.

- [x] Implement `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts` — Add `'support'` role to `targetAudience === 'ALL'`, and strictly enforce `event.createdBy === userId` in `deleteCalendarEvent`.
- [x] Write tests at `app/sentinel-api/src/modules/general/calendar/calendar.service.test.ts`.
- [x] Run `pnpm --dir app/sentinel-api test` and confirm all tests pass.
- [x] Mark phase complete in execution log.
      **Migration required:** No — we are reusing the existing `ALL` audience enum.
