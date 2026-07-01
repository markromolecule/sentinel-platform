# Execution Log: Permission Persistence and Dynamic Action Hiding

**Date:** 2026-06-23
**Scope:** `sentinel-support`
**Status:** Completed

---

## Summary

This task completed the support-portal RBAC cleanup in two parts:

1. Stabilized the role matrix save flow so confirmed permission selections do not snap back on refetch.
2. Hid create and bulk-action affordances across the support portal when the active role lacks the matching permission.

Core-portal parity remains a follow-up and was intentionally left out of scope for this delivery.

---

## Phase 1: RBAC Persistence Stabilization

**Goal:** Make role permission saves durable across reloads and refetches.

- [x] Update [`app/sentinel-support/src/app/(protected)/(support)/control/roles/_hooks/use-role-matrix.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/roles/_hooks/use-role-matrix.ts) to preserve confirmed permission selections during draft reconciliation.
- [x] Verify the save flow continues to support explicit revert behavior without reintroducing fallback values.
- [x] Add regression coverage where practical for the role-matrix persistence flow.

**Migration required:** No

---

## Phase 2: Support CRUD Action Hiding

**Goal:** Hide unsupported action buttons and menu items when the active role lacks the required permission.

- [x] Update [`app/sentinel-support/src/app/(protected)/announcements/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/page.tsx) and [`app/sentinel-support/src/app/(protected)/announcements/_components/add-announcement-dialog.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/_components/add-announcement-dialog.tsx) to hide the announcement create CTA when `announcements:create` is absent.
- [x] Update [`app/sentinel-support/src/app/(protected)/calendar/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/calendar/page.tsx), [`calendar-header.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/calendar/_components/calendar-header.tsx), [`event-details-sheet.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/calendar/_components/event-details-sheet.tsx), and [`event-dialog.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/calendar/_components/event-dialog.tsx) to gate event creation, editing, and deletion by permission.
- [x] Update [`app/sentinel-support/src/app/(protected)/messages/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/page.tsx) and [`message-list.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/messages/_components/message-list.tsx) to hide the new-message affordance when `messages:create` is absent.
- [x] Update [`app/sentinel-support/src/app/(protected)/(support)/institutions/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/institutions/page.tsx), [`departments/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/departments/page.tsx), [`rooms/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx), and [`semesters/page.tsx`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/semesters/page.tsx) to hide create CTAs when the active role lacks the corresponding permission.
- [x] Update the support table/action views for departments, rooms, semesters, and subjects so row or bulk actions are wrapped in permission guards.
- [x] Add permission-aware test coverage for the newly hidden controls.

**Migration required:** No

---

## Verification

- [x] Run focused Vitest coverage for the touched support components.
- [x] Confirm the targeted test set passes: `77` test files and `227` tests.
- [x] Run targeted ESLint checks for the touched files.
- [x] Record the repo-wide lint baseline as containing pre-existing unrelated failures outside the files changed for this task.

**Final validation:** Passed for the touched surfaces.

---

## Notes

- No Prisma or database migration was needed for this task.
- The support portal now fails closed for unsupported create actions instead of showing inert controls.
- Core parity is still deferred to a separate follow-up task.
