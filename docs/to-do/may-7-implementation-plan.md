# May 7 Implementation Plan

## Objective

Implement the May 7 requests as a coordinated end-to-end update across exam room assignment, support administrator management, enrollment request editing, and the support control permission registry.

The delivered behavior should ensure that:

- exam rooms cannot be double-booked across overlapping exam windows
- room assignment remains reserved until the assigned exam has ended
- the exam create dialog offers a scalable room-selection experience for large room inventories
- Sentinel Support can create institution-scoped `support` accounts from Administrator Management
- Administrator Management separates `superadmin` and `support` accounts into clear sub-tabs
- admin, superadmin, and instructor users can update enrollment requests through dedicated dialogs with role-appropriate permissions
- the support `control` module reflects the final permission changes for rooms and enrollment requests

## Current Repo State

- The instructor exam flow already supports `classroomIds` and `roomId` in shared schemas and frontend form state:
    - `packages/shared/src/schema/exams/exam-schema.ts`
    - `packages/shared/src/schema/exams/exam-create-schema.ts`
    - `app/sentinel-web/src/features/exams/config/_hooks/use-exam-create-form.ts`
- The room selector already uses a searchable command popover rather than a plain select:
    - `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.tsx`
- The instructor classroom create flow still uses simple selects for approved offering and section:
    - `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/_components/create-classroom-dialog.tsx`
- Sentinel Support Administrator Management currently loads only `superadmin` users and exposes a single invite dialog:
    - `app/sentinel-support/src/app/(protected)/(support)/users/page.tsx`
    - `app/sentinel-support/src/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog.tsx`
    - `app/sentinel-support/src/app/(protected)/(support)/users/_hooks/use-administrator-form.ts`
- Enrollment request review currently supports detail, approve, reject, and unapprove actions, but not an explicit update/edit flow:
    - `app/sentinel-core/src/app/(protected)/subjects/_components/requests/request-actions.tsx`
    - `app/sentinel-core/src/app/(protected)/subjects/_components/requests/request-detail-dialog.tsx`
    - `app/sentinel-api/src/modules/identity/enrollments/enrollments.routes.ts`
- Permission definitions for rooms, classrooms, and subject requests already exist in:
    - `packages/shared/src/constants/permissions.ts`
- The support access-control UI already has a role matrix and permission registry under:
    - `app/sentinel-support/src/app/(protected)/(support)/control/`

## Options Considered (1-3-1 Rule)

### Option 1: Patch each request in place with minimal backend changes

- Add frontend guards for room availability, duplicate the admin invite dialog for support users, and reuse approve/reject endpoints for pseudo-update behavior.
- Pros: Fastest visible delivery.
- Cons: Room locking would be unreliable, support-account creation would drift from API policy, and enrollment request "update" would stay semantically incomplete.

### Option 2: End-to-end feature pass per domain with shared contracts first (Recommended)

- Update backend rules, shared contracts, hooks, and UI together for rooms, support-account management, enrollment request editing, and permission exposure.
- Pros: Matches current repo architecture, keeps business rules server-authoritative, and produces cleaner long-term contracts.
- Cons: Touches multiple workspaces and requires tighter phased validation.

### Option 3: Introduce a new scheduling and request-workflow subsystem

- Build separate reservation tables, workflow states, and dedicated support-admin modules for maximum explicitness.
- Pros: Most extensible design.
- Cons: Overbuilt for the current ask and likely too wide for a single delivery slice.

## Recommendation

Proceed with **Option 2**.

It fits the repo's current patterns best: the exam flow already carries `roomId`, the support user-management flow already has invite/update primitives, and enrollment requests already have centralized API routes. We should harden those existing paths instead of creating parallel ones.

## Phase Progress

- [x] Phase 1: Room Reservation Rules
- [x] Phase 2: Exam Room Selection UX
- [x] Phase 3: Sentinel Support Administrator Management Expansion
- [x] Phase 4: Enrollment Request Update Flow
- [ ] Phase 5: Permission And Control Module Alignment

## Recommended Execution Order

1. Lock down room availability rules in the API first.
2. Upgrade the exam room-selection UX once the availability contract is stable.
3. Expand Sentinel Support Administrator Management to include `support` accounts.
4. Add enrollment request update dialogs and backend mutation support.
5. Reflect the final permission set in the support `control` module and role matrix.

## Phase 1: Room Reservation Rules

**Goal:** Make exam room assignment exclusive for overlapping schedules and keep the room reserved until the exam ends.

**Status:** Implemented and paused for manual review before Phase 2.

**Phase 1 decision:** Unpublished drafts with a `roomId`, `startDateTime`, and `endDateTime` reserve the room. The lock is enforced by overlap against the scheduled window itself, not by published status.

### Scope

- [x] Audit the exam create/update handlers and persistence path for room assignment in `app/sentinel-api`.
- [x] Identify the canonical overlap rule for exams sharing the same `room_id` and institution.
- [x] Add server-side validation that rejects assigning a room when another active exam already occupies the same time window.
- [x] Ensure edits also re-check conflicts when room or schedule changes.
- [x] Ensure the lock is based on `startDate`/`endDate` and remains effective until the exam has ended.
- [x] Decide and document whether unpublished drafts reserve rooms or only scheduled/published exams do.
- [x] Return a stable API error payload the instructor UI can present clearly.

### Likely Files

- `app/sentinel-api/src/modules/.../exams/*`
- `packages/services/src/api/exams/*`
- `packages/shared/src/schema/exams/*`

### Testing

- [x] Add API tests for room conflict rejection on create.
- [x] Add API tests for room conflict rejection on update.
- [x] Add API tests for non-overlapping exams reusing the same room successfully.
- [x] Add API tests for same-room reuse after the earlier exam has ended.

## Phase 2: Exam Room Selection UX

**Goal:** Replace the "hard to scan at scale" room assignment experience with a fast picker that still works well for dozens of rooms.

**Status:** Implemented and paused for manual review before Phase 3.

**Phase 2 note:** The classroom creation dialog was left unchanged. The requested room-selection improvement has been applied only to the shared exam create/edit room picker.

### Product Direction

- Use a searchable command-style picker as the base interaction, then improve scanability with grouped metadata instead of reverting to a plain dropdown.
- Include room name, room number/code, room type, and availability context in the option row.
- Keep selection optional only if product rules still allow room-less exams; otherwise enforce it after Phase 1 rules are finalized.

### Scope

- [x] Review the current room field in `app/sentinel-web/src/features/exams/_components/forms/fields/basic-info-fields/room-field.tsx`.
- [x] Add stronger option labels so large room lists are easier to scan.
- [x] Group or sort rooms by meaningful metadata such as building/type/naming pattern if that data already exists.
- [x] Show current conflict or unavailability state in the picker when the chosen schedule overlaps another exam.
- [x] Ensure the create and edit exam dialogs use the same room-picking behavior.
- [x] Confirm the classroom create dialog is not the requested target before changing `create-classroom-dialog.tsx`; if the request truly refers to exam creation, leave classroom creation alone.

### Testing

- [x] Add focused component tests for searching and selecting rooms.
- [x] Add tests for rendering unavailable/conflicting room states.
- [ ] Manually validate the create exam dialog with a seeded list of many rooms.

## Phase 3: Sentinel Support Administrator Management Expansion

**Goal:** Let support users create institution-scoped `support` accounts and separate support accounts from superadmin accounts in the UI.

**Status:** Implemented and paused for manual review before Phase 4.

### Scope

- [x] Extend `app/sentinel-support/src/app/(protected)/(support)/users/page.tsx` to support sub-tabs for `superadmin` and `support`.
- [x] Reuse the existing invite dialog pattern from `add-admin-dialog.tsx` for a new support-account dialog.
- [x] Update `use-administrator-form.ts` or extract a more general shared hook so role-specific form behavior is explicit.
- [x] Ensure support-account creation requires institution and email, but not department.
- [x] Verify the invite flow sends the expected email for `support` accounts through the existing user invite pipeline.
- [x] Update search placeholders, empty states, titles, and delete/edit actions to reflect the active tab.

### Likely Files

- `app/sentinel-support/src/app/(protected)/(support)/users/page.tsx`
- `app/sentinel-support/src/app/(protected)/(support)/users/_components/dialogs/*`
- `app/sentinel-support/src/app/(protected)/(support)/users/_components/views/*`
- `app/sentinel-support/src/app/(protected)/(support)/users/_hooks/*`
- `app/sentinel-api/src/modules/identity/users/controllers/*`
- `packages/shared/src/schema/*`

### Testing

- [x] Add tests for role-specific invite payload shaping for `superadmin` vs `support`.
- [x] Add UI tests for tab switching and empty/loading states.
- [x] Add API or hook-level coverage confirming support invites remain institution-scoped.

## Phase 4: Enrollment Request Update Flow

**Goal:** Let admin, superadmin, and instructor users update an existing enrollment request through dedicated dialogs rather than only approving, rejecting, or deleting it.

**Status:** Implemented and paused for manual review before Phase 5.

**Phase 4 decision:** Updating a request rewrites the selected request set and re-submits it as `PENDING`. If the previous request had already been approved, the instructor class assignment is removed first so the updated request can go back through review cleanly.

### Product Direction

- Treat "update" as editing the request payload itself, not as a disguised approve/reject action.
- Keep role differences explicit:
    - admin/superadmin can revise instructor-submitted request targets within their allowed scope
    - instructor can revise their own submitted request before or after review only within the approved business rule

### Scope

- [x] Define the allowed editable fields for an existing enrollment request:
    - subject offering target
    - section targets
    - department/course targeting if applicable
    - request status transition side effects, if any
- [x] Add a dedicated update endpoint or mutation path in `app/sentinel-api/src/modules/identity/enrollments/`.
- [x] Extend DTOs in `enrollments.dto.ts` and register the route in `enrollments.routes.ts`.
- [x] Reuse the existing request detail flow in `request-actions.tsx` / `request-detail-dialog.tsx` and add an edit dialog for `sentinel-core`.
- [x] Add the instructor-facing update dialog in `app/sentinel-web/src/app/(protected)/(instructor)/subjects/...`.
- [x] Ensure request scope enforcement remains institution-aware and role-aware on the server.

### Testing

- [x] Add API tests for admin/superadmin update success within scope.
- [x] Add API tests for instructor self-update success within allowed rules.
- [x] Add API tests for cross-institution or out-of-scope update rejection.
- [x] Add UI tests for dialog field hydration from an existing request.

## Phase 5: Permission And Control Module Alignment

**Goal:** Reflect the final room and enrollment-request capabilities in the shared permission registry and the Sentinel Support `control` module.

### Scope

- [ ] Audit the existing permission keys for rooms and subject requests in `packages/shared/src/constants/permissions.ts`.
- [ ] Decide whether enrollment request update should reuse existing `subject_requests:*` permissions or introduce a new `subject_requests:update`.
- [ ] Confirm whether room assignment conflict visibility needs any new permission or remains covered by existing room/exam permissions.
- [ ] Update the support control registry, role matrix, and assignment views under `app/sentinel-support/src/app/(protected)/(support)/control/`.
- [ ] Ensure the affected roles expose the intended final permissions:
    - support
    - superadmin
    - admin
    - instructor

### Testing

- [ ] Add focused tests for any permission presenter or registry helpers touched by the change.
- [ ] Manually verify the support control permissions page shows the updated room and enrollment-request entries.

## Conditional Requirements

### Database Migrations

- [x] Only add a Prisma migration if room reservation or enrollment request editing requires new persisted fields.
- [x] If no migration is needed, explicitly record that the implementation reuses existing `exams.room_id`, exam schedule fields, and `enrollment_requests`.
- [ ] If a migration is needed, update `packages/db/prisma/schema.prisma`, add the migration, and document backfill behavior.
      No Prisma migration was needed for Phase 4. The update flow rewrites existing `enrollment_requests` records in place and continues to rely on the existing `class_groups` and request tables.

### Access Control

- [ ] Keep all final authorization rules server-side first, with frontend permission checks treated as UX only.
- [ ] Validate institution scope carefully for support-created accounts and enrollment request updates.

## Suggested Validation Pass

- [ ] `pnpm --dir app/sentinel-api test`
- [ ] `pnpm --dir app/sentinel-web test`
- [ ] `pnpm --dir app/sentinel-support test`
- [ ] `pnpm lint`
- [ ] Manual QA for exam room conflicts, support-account invite email flow, and enrollment request update dialogs

## Open Decisions To Confirm During Implementation

- [x] Do draft exams reserve rooms, or only published/scheduled exams?
      Drafts reserve rooms when they carry a room assignment and a valid schedule window.
- [x] Can instructors update requests after approval, or only while pending/rejected?
      Instructors can update requests after approval. Any saved change removes the existing instructor assignment for the affected request set and re-submits the updated request as `PENDING`.
- [ ] Should support-account creation live on the same backend invite endpoint with a different role payload, or does support require any special onboarding copy/template?
- [x] Does the exam room picker need grouping metadata beyond the current room name/code/type fields already available in the API?
      No additional backend metadata was required for this phase. The picker now groups by `room_type` and surfaces room name, room number, room code, and live schedule conflict context from existing data.
