# feat-02 - Notification Realtime Alignment Implementation Plan

**Date:** 2026-05-23  
**Type:** Feature / Optimization  
**Summary:** Verify and align the existing `notification` module with Supabase Realtime, audit the PostgreSQL RLS policy/publication settings, and expand generic institution activity notification triggers to cover missing `student_whitelist` CRUD flows.

---

## 3 Viable Options

### Option A - Audit & Verification Only (Low Effort)

Validate the existing realtime subscriptions, migration state, and coverage matrix. Run automated and manual tests to confirm everything matches expectation. Add missing documentation and regression tests.

- **Tradeoff:** Extremely fast and low risk, but does not address any uncovered CRUD/workflow gaps (e.g., student whitelist CRUD notifications).

### Option B - Realtime Hardening and Student Whitelist CRUD Expansion (Targeted & Practical) ✅ Recommended

Verify and audit all existing realtime subscriptions and database migration states. Expand coverage by integrating missing notification triggers for `student_whitelist` CRUD actions (create, update, delete, bulk import, and purge) using the centralized `ActivityNotificationService.notifyGenericInstitutionActivity`. Add unit and integration tests to verify both the whitelist notification triggers and the realtime subscription query invalidation.

- **Tradeoff:** Solves the gaps identified in the CRUD audit while ensuring the realtime notification pipeline remains stable and robust, without adding excessive infrastructure.

### Option C - Custom Outbox and Event Dispatcher Refactoring (High Robustness & Scope)

Implement an asynchronous outbox/event-queue table or model for notifications, separating database mutation transactions from direct notification dispatching. Use this outbox pattern to emit and sync notifications across the entire institution.

- **Tradeoff:** Extremely robust, scalable, and resilient for large-scale operations, but introduces unnecessary architectural complexity and significantly exceeds the current task's scope.

---

## Best Option

**Choose Option B.**

It focuses on concrete, high-value improvements (enabling missing notifications on the Student Whitelist CRUD flow under `student-whitelist` module). It verifies and aligns existing Supabase Realtime subscriptions and migrations without introducing structural rewrites. It is highly maintainable, type-safe, and fully adheres to the conventions used by the rest of the monorepo's notification services.

---

## Pre-Planning Checklist

- [x] Read and summarize the task input in one sentence.
- [x] Scan relevant source files to understand existing patterns in `notification`, `use-notification-realtime`, and core CRUD modules.
- [x] Identify likely touched files, services, and DB tables across `app/sentinel-api` and shared packages.
- [x] Determine if a Prisma migration is needed (No, existing migration covers it).

---

## Task Summary

- [ ] Audit existing `notifications` table RLS policies, replica identity, and Supabase realtime publication settings to confirm they are fully aligned with subscription needs.
- [ ] Incorporate missing notification triggers in the `student-whitelist` service layer so that create, update, delete, import, and purge operations emit real-time institution-aware notifications.
- [ ] Add Vitest unit and integration tests to verify both the whitelist notification triggers and subscription reliability.

---

## Existing Findings

- [x] `packages/db/prisma/migrations/20260510040000_enable_notifications_realtime` already enables RLS, sets replica identity to FULL, and adds `notifications` to the `supabase_realtime` publication.
- [x] `packages/hooks/src/use-notification-realtime.ts` is fully implemented and subscribed to Postgres changes on `notifications` table.
- [x] `ActivityNotificationService` has comprehensive trigger utilities but does not currently cover `student-whitelist` actions.
- [x] Existing core services (`departments`, `courses`, `semesters`, `sections`, `rooms`) already call `ActivityNotificationService.notifyGenericInstitutionActivity` on CRUD.

---

## Files, Services, and DB Tables in Scope

### Backend

- [ ] `app/sentinel-api/src/modules/identity/student-whitelist/controllers/create-student-whitelist.controller.ts`
- [ ] `app/sentinel-api/src/modules/identity/student-whitelist/controllers/update-student-whitelist.controller.ts`
- [ ] `app/sentinel-api/src/modules/identity/student-whitelist/controllers/delete-student-whitelist.controller.ts`
- [ ] `app/sentinel-api/src/modules/identity/student-whitelist/controllers/purge-student-whitelist.controller.ts`
- [ ] `app/sentinel-api/src/modules/identity/student-whitelist/controllers/bulk-import-student-whitelist.controller.ts`

### Database

- `public.notifications`
- `public.student_whitelist`

---

## Assumptions and Scope Guards

- **Realtime Infrastructure:** We assume the Supabase Realtime replication mechanism is fully operational in the environment. We do not need to create any database migrations as they were already applied under migration `20260510040000_enable_notifications_realtime`.
- **Client Invalidation:** Real-time updates rely on the `useNotificationRealtime` hook, which invalidates cached React-Query endpoints when notifications occur. We assume the current frontends correctly mount this hook.

---

## Phase 1: Realtime Subscription & Migration Audit

**Goal:** Audit and verify the existing database migration state, RLS policies, and realtime publication on the `notifications` table to ensure 100% compatibility with client subscriptions.

- [x] Audit `packages/db/prisma/migrations/20260510040000_enable_notifications_realtime/migration.sql` against local DB state.
- [x] Verify that replica identity is `FULL` for `notifications` table in PostgreSQL.
- [x] Verify RLS is enabled and the `notifications_recipient_select` policy restricts access to `auth.uid() = recipient_user_id` safely.
- [x] Verify `notifications` is part of the `supabase_realtime` publication.
- [x] Write a verification test or manual script in `packages/hooks/src/use-notification-realtime.test.ts` (if applicable) to confirm subscription setup.
      **Migration required:** No — the migration has already been defined and applied.

---

## Phase 2: Student Whitelist CRUD Notification Integration

**Goal:** Add generic activity notifications to the Student Whitelist CRUD endpoints, matching the pattern established in the rest of the application.

- [x] Modify `app/sentinel-api/src/modules/identity/student-whitelist/controllers/create-student-whitelist.controller.ts` to trigger `ActivityNotificationService.notifyGenericInstitutionActivity` on successful creation.
- [x] Modify `app/sentinel-api/src/modules/identity/student-whitelist/controllers/update-student-whitelist.controller.ts` to trigger `ActivityNotificationService.notifyGenericInstitutionActivity` on successful update.
- [x] Modify `app/sentinel-api/src/modules/identity/student-whitelist/controllers/delete-student-whitelist.controller.ts` to trigger `ActivityNotificationService.notifyGenericInstitutionActivity` on successful deletion.
- [x] Modify `app/sentinel-api/src/modules/identity/student-whitelist/controllers/purge-student-whitelist.controller.ts` to trigger `ActivityNotificationService.notifyGenericInstitutionActivity` on successful database purging.
- [x] Modify `app/sentinel-api/src/modules/identity/student-whitelist/controllers/bulk-import-student-whitelist.controller.ts` to trigger a transaction-completed generic notification after a successful CSV/bulk import.
- [x] Write integration and controller tests in `app/sentinel-api/src/modules/identity/student-whitelist/controllers/student-whitelist.controller.test.ts` (or co-located test files) to assert that notifications are emitted correctly for each CRUD action.
      **Migration required:** No.

---

## Phase 3: Validation and Verification

**Goal:** Verify all automated test suites pass, verify real-time capabilities under active dev mode, and ensure robust delivery of CRUD notifications across institution scopes.

- [x] Run backend notification and whitelist test suites:
      `bash
  pnpm --dir app/sentinel-api test src/modules/general/notification
  pnpm --dir app/sentinel-api test src/modules/identity/student-whitelist
  `
- [x] Verify all global tests, linting, and formatting checks pass cleanly:
      `bash
  pnpm lint
  pnpm format:check
  `
      **Migration required:** No.

---

## Done Criteria

- [x] All RLS policies and Realtime publication mappings on `notifications` are verified as correct and operational.
- [x] Whitelist CRUD and import operations trigger generic institution notifications accurately.
- [x] All Vitest tests (unit and integration) pass with zero errors.
