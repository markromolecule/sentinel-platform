# Assign To Instructor Implementation Plan

## Objective

Translate the feature brief in [docs/assign-to-instructor.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/assign-to-instructor.md) into a delivery-ready, phased implementation plan that matches the repo workflow and current code boundaries.

This plan covers four connected feature areas:

- exam assignment to another instructor with accept or reject handling
- classroom assignment to one or more instructors
- grading visibility and grouping updates for assigned exams
- institution-scoped notifications for assignment and workflow actions

This document is intentionally planning-only and follows the `to-do-workflow`: do not start coding from this file alone without an explicit go-ahead.

## Current Repo Findings

- `app/sentinel-api/src/modules/examination/assign/` does not exist yet, so exam assignment still needs a dedicated module.
- `packages/db/prisma/schema.prisma` already contains `proctor_assignments` with statuses `PENDING`, `ACCEPTED`, `DECLINED`, `ACTIVE`, `COMPLETED`, and `SCHEDULED`.
- Grading already partially accounts for creator or assigned-proctor visibility in:
    - `app/sentinel-api/src/modules/examination/grading/data/get-grading-exams.ts`
    - `app/sentinel-api/src/modules/examination/grading/data/get-grading-students.ts`
- Monitoring and reporting already consult `proctor_assignments`, which means exam assignment should extend an existing access concept instead of inventing a parallel one.
- Classroom access is currently based on `class_roles` plus `roles.role_name = 'instructor'`, but that table does not currently encode ownership, head-instructor status, or assignment response state.
- The notification module exists only as empty placeholders:
    - `app/sentinel-api/src/modules/general/notification/notification.dto.ts`
    - `app/sentinel-api/src/modules/general/notification/notification.routes.ts`
    - `app/sentinel-api/src/modules/general/notification/notification.service.ts`
- Shared permissions already include `classrooms:*`, `examinations:view`, and `proctoring:*`, but there is no explicit permission surface yet for assignment acceptance, reassignment, or notification management.

## Scope Interpretation

The source brief is not one isolated feature. It is a cross-module change with shared business rules:

- exam creator and accepted assignee both need proctor-capable access
- classroom ownership and classroom instructor membership need to support delegation
- grading must show a single exam across multiple sections and multiple instructor relationships
- notifications must be institution-scoped and reusable for request, approve, and decline workflows

Because of that, the safest implementation path is a backend-first rollout with shared contracts stabilized before UI integration.

## Options Considered (1-3-1 Rule)

### Option 1: Minimal exam-assignment patch

- Add exam assignment endpoints only.
- Reuse `proctor_assignments` as-is.
- Delay classroom delegation and notifications to later follow-ups.

Pros:

- fastest visible delivery for the exam assignment request
- lowest short-term code churn

Cons:

- leaves the brief only partially delivered
- risks inconsistent grading and monitor access rules
- creates a second pass later for notifications and classroom delegation

### Option 2: Coordinated backend-first feature slice across all four domains (Recommended)

- Build exam assignment as the anchor workflow first.
- Extend classroom delegation and grading around the same assignment model.
- introduce notifications as a shared platform service during the same rollout.
- align permissions and tests as part of each phase instead of as a cleanup step.

Pros:

- matches the real coupling in the current codebase
- keeps authorization and visibility rules server-authoritative
- avoids shipping exam assignment with broken downstream grading or missing notifications

Cons:

- touches more modules and likely requires at least one migration
- needs tighter phased validation

### Option 3: Full workflow platform before feature delivery

- Design a generalized assignment and workflow engine first.
- Create reusable request, approval, decline, and notification abstractions before wiring exams and classrooms.

Pros:

- highest long-term reuse
- cleanest abstraction if many future assignment workflows are expected

Cons:

- overbuilt for the current request
- delays user-facing delivery significantly
- adds architecture risk where current repo patterns already provide enough primitives

## Recommendation

Proceed with **Option 2**.

It best fits the current repo state. The database already has `proctor_assignments`, grading already recognizes assigned proctors, and classroom membership already uses `class_roles`. We should complete those existing pathways end to end, then introduce notifications as the shared infrastructure that makes the workflow visible across roles.

## Likely Migration Needs

### Required

- notification persistence is very likely a new database addition because no notification table or API contract exists today

### Probably Required

- classroom delegation likely needs additional persistence because `class_roles` alone does not identify:
    - the head instructor
    - who assigned whom
    - whether assignment acceptance is needed
    - when an assignment was accepted or declined

### Possibly Avoidable

- exam assignment may be able to reuse `proctor_assignments` without structural changes if the accepted design only needs:
    - exam to instructor link
    - assignment status
    - creator retained through `exams.created_by`

### Validate Before Coding

- whether `proctor_assignments.scheduled_at` and `status` are enough for the required workflow history
- whether classroom head ownership can be derived safely from existing records or must be stored explicitly
- whether notifications are read-once only, or also need archival, priority, or target-resource links

## Phase Progress

- [x] Phase 0: Domain Decisions And Contract Mapping
- [x] Phase 1: Exam Assignment Backend Foundation
- [x] Phase 2: Exam Assignment Response Flow And Access Integration
- [x] Phase 3: Classroom Assignment Expansion
- [x] Phase 4: Grading Update For Multi-Instructor Multi-Section Exams
- [x] Phase 5: Notification System Foundation And Triggers
- [ ] Phase 6: Permissions, Integration, And Final Validation

## Recommended Execution Order

1. Lock down the domain rules and persistence decisions first.
2. Build the new exam assignment module in `app/sentinel-api`.
3. Wire access control so accepted assignees and exam creators both resolve correctly in monitor, lobby, reporting, and grading.
4. Extend classroom delegation using the same acceptance and notification patterns where appropriate.
5. Add the notification platform once the assignment events are stable.
6. Finish with permission alignment, shared contracts, frontend integration, and regression coverage.

## Phase 0: Domain Decisions And Contract Mapping

**Goal:** Remove ambiguity before implementation starts.

**Context:** The brief mixes ownership, delegation, workflow state, and visibility rules. Several of those rules are only partially represented in the current schema.

### Tasks

- [x] Confirm whether exam assignment is single-assignee-per-exam or supports multiple assignees over time with only one active proctor.
- [x] Confirm whether the creator is always treated as a proctor even after the assignee declines.
- [x] Confirm whether classroom assignment requires explicit accept or reject behavior, or whether it is an immediate delegated membership change.
- [x] Confirm whether the classroom head instructor is immutable, transferable, or derived from creator history.
- [x] Confirm whether notifications are in-app only or if later email hooks must be anticipated in the contract.
- [x] Define canonical state transitions for:
    - [x] exam assignment
    - [x] classroom delegation
    - [x] notification read or unread state
- [x] Map the source of truth for each workflow event and who is allowed to trigger it.

### Phase 0 Decisions

- Exam assignment will support multiple assignment records over time for audit history, but only one non-creator accepted assignee should be active for an exam at once. This fits the current `proctor_assignments` uniqueness on `(exam_id, instructor_id)` while still allowing reassignment history across different instructors.
- The exam creator always retains proctor-capable access. If an assignee declines, creator access remains unchanged and no assignee-level runtime access is granted.
- Classroom assignment will be implemented as an immediate delegated membership change in v1. The source brief describes adding instructors to manage a classroom, but it does not require an accept or reject step the way exam assignment does.
- Classroom head ownership should be persisted, not derived. The current classroom model has `class_roles` membership and `class_groups.updated_by`, but it does not reliably preserve original ownership or head-instructor semantics, so Phase 3 should plan for explicit ownership metadata.
- Notifications will start as in-app only. The service contract should stay extensible enough for future channels, but email delivery is out of scope for the first rollout.
- Canonical exam-assignment transitions for v1:
    - create request: `PENDING`
    - assignee accepts: `ACCEPTED`
    - assignee declines: `DECLINED`
    - optional lifecycle close after exam completion: `COMPLETED`
      `ACTIVE` and `SCHEDULED` already exist in the schema, but they should not be required to deliver the first accept or reject workflow unless a downstream runtime check proves they are necessary.
- Canonical classroom-delegation transitions for v1:
    - head instructor creates classroom ownership
    - head instructor adds instructor membership
    - head instructor removes instructor membership
      Because acceptance is out of scope for classroom delegation, membership state is represented by presence or absence of the instructor assignment plus future ownership metadata if added.
- Canonical notification transitions for v1:
    - created as `UNREAD`
    - user marks as `READ`
- Workflow source of truth and trigger map:
    - exam assignment: `proctor_assignments`, triggered by an instructor who can manage the exam
    - exam assignment response: `proctor_assignments`, triggered only by the target assignee
    - classroom delegation: `class_roles` plus planned ownership metadata, triggered by a head instructor or equivalent classroom manager
    - notifications: new notification persistence, created by service-layer workflow events and marked read by the recipient only

### Testing Expectations

- [x] Add or update planning notes for state-transition tests before implementation starts.
- [x] List the final API contracts that need request and response coverage.

### Phase 0 Test Planning Notes

- State-transition coverage must verify `PENDING -> ACCEPTED`, `PENDING -> DECLINED`, duplicate pending-request rejection, and reassignment behavior when a different assignee is chosen later.
- Access-resolution coverage must prove the creator always keeps monitor, lobby, reporting, and grading visibility while pending or declined assignees do not gain those permissions.
- Classroom coverage must verify ownership-preserving delegation once Phase 3 introduces the ownership model, especially for add and remove flows across multiple instructors.
- Notification coverage must verify institution scoping, recipient resolution, unread defaults, and mark-as-read transitions.

### Phase 0 Target API Contracts

- `POST /examination/assign` to create an exam assignment request
- `GET /examination/assign` to list inbound and outbound exam assignments for the current instructor
- `POST /examination/assign/{assignmentId}/accept` to accept an exam assignment
- `POST /examination/assign/{assignmentId}/reject` to reject an exam assignment
- `GET /classrooms/{classGroupId}/instructors` to list classroom instructors
- `POST /classrooms/{classGroupId}/instructors` to assign an instructor to a classroom
- `DELETE /classrooms/{classGroupId}/instructors/{userId}` to remove an instructor from a classroom
- `GET /notifications` to list notifications for the current user and institution scope
- `POST /notifications/{notificationId}/read` to mark a notification as read

## Phase 1: Exam Assignment Backend Foundation

**Goal:** Create the dedicated `examination/assign` module and make assignment persistence server-authoritative.

**Context:** The brief explicitly requests a new module at `app/sentinel-api/src/modules/examination/assign`. The existing `proctor_assignments` table gives us a starting point, but the API surface and service breakdown do not exist yet.

### Backend Scope

- [x] Create `app/sentinel-api/src/modules/examination/assign/`.
- [x] Add module files aligned to repo patterns:
    - [x] `assign.dto.ts`
    - [x] `assign.routes.ts`
    - [x] `assign.service.ts` or a thin orchestration layer only
    - [x] focused service files under `services/`
    - [x] supporting data helpers under `data/` if needed
- [x] Keep services granular instead of building one monolithic `assign.service.ts`.
- [x] Reuse the `DbClient` import pattern from the exams module.

### Core Behavior

- [x] Add an endpoint to create an exam assignment request from Instructor A to Instructor B.
- [x] Validate that the assigner can manage the target exam.
- [x] Validate that the assignee belongs to the same institution and is an instructor.
- [x] Prevent duplicate active assignments for the same exam and instructor.
- [x] Decide whether reassignment replaces prior pending records or appends new history.
- [x] Return assignment payloads that expose:
    - [x] exam summary
    - [x] assigner summary
    - [x] assignee summary
    - [x] current status
    - [x] timestamps needed by the client

### Phase 1 Notes

- The backend foundation now includes `POST /examination/assign` and `GET /examination/assign`, with the route registered in the API app bootstrap.
- Reassignment behavior for the same exam and same instructor currently reuses an existing `DECLINED` or `COMPLETED` row by resetting it to `PENDING`, which works within the existing `(exam_id, instructor_id)` uniqueness constraint.
- The service also blocks creating a new active request when another active assignee already exists for the same exam, keeping the v1 workflow aligned with the single-active-assignee decision from Phase 0.

### Likely Files

- `app/sentinel-api/src/modules/examination/assign/*`
- `app/sentinel-api/src/modules/examination/exams/*`
- `packages/shared/src/schema/*`
- `packages/services/src/api/*`

### Testing

- [x] Add service tests for valid assignment creation.
- [x] Add service tests for cross-institution rejection.
- [x] Add service tests for duplicate-assignment rejection.
- [x] Add route or contract tests for request validation and response shape.

## Phase 2: Exam Assignment Response Flow And Access Integration

**Goal:** Let the assignee accept or reject the assignment and unify downstream access checks.

**Context:** The brief requires the assignee to accept or reject the assignment and grants both the creator and the accepted assignee access to monitor and lobby pages.

### Backend Scope

- [x] Add accept-assignment endpoint.
- [x] Add reject-assignment endpoint.
- [x] Define side effects for each transition:
    - [x] accepted assignment updates active proctor visibility
    - [x] rejected assignment keeps creator access intact
    - [x] prior pending records are closed consistently
- [x] Normalize visibility checks used by:
    - [x] monitor
    - [x] lobby
    - [x] reporting
    - [x] grading
- [x] Extract a shared helper for "creator or accepted proctor can access this exam" if the logic is duplicated across modules.

### Access Rules

- [x] Creator keeps proctor-capable access to the exam.
- [x] Accepted assignee gains proctor-capable access to the exam.
- [x] Pending or declined assignees do not get monitor or lobby access.
- [x] Non-institution instructors remain blocked.

### Frontend And Service Client Scope

- [x] Add service client methods for list, assign, accept, and reject flows.
- [x] Identify where the instructor UI should surface:
    - [x] outbound assignments created by the current user
    - [x] inbound assignments awaiting response
- [x] Define whether the response UI belongs in `sentinel-web`, `sentinel-core`, or both, based on where instructor exam workflows currently live.

### Phase 2 Notes

- The response flow now includes `POST /examination/assign/{assignmentId}/accept` and `POST /examination/assign/{assignmentId}/reject`.
- Accepting an assignment updates the assignment to `ACCEPTED` and closes any other stale `PENDING` rows for the same exam by setting them to `DECLINED`, which keeps single-active-assignee behavior consistent even if legacy pending rows exist.
- Rejecting an assignment updates only the targeted row to `DECLINED`; creator visibility remains unchanged because all downstream access checks still allow `e.created_by = currentUserId`.
- Shared instructor exam visibility now routes through one helper that grants access to:
    - exam creators
    - assignees with `ACCEPTED` status only
- Monitoring, reporting, grading, and instructor-side lobby actions now use that shared visibility rule.
- The first instructor-facing response UI should live in `sentinel-web`, because current instructor exam workflows such as grading and exam management already live there. The initial surfaces should show:
    - outbound assignment requests in the instructor exam management area
    - inbound pending requests in an instructor task or assignment inbox surface

### Testing

- [x] Add tests for accept flow success.
- [x] Add tests for reject flow success.
- [x] Add tests proving monitor and lobby access works for creator plus accepted assignee.
- [x] Add tests proving pending or declined assignees cannot access protected exam views.

## Phase 3: Classroom Assignment Expansion

**Goal:** Support assigning one classroom to one or more instructors while preserving a clear head instructor.

**Context:** Classroom access today is based on `class_roles`, which can already represent multiple instructors, but it does not fully describe delegation semantics from the brief.

### Domain Decisions To Implement

- [x] Decide whether classroom delegation is immediate or approval-based.
- [x] Decide whether "head of subject" is:
    - [x] a persisted role
    - [x] an ownership field
    - [ ] a derived first-assignment rule
- [x] Decide whether additional instructors share equal classroom edit rights or have constrained rights.

### Backend Scope

- [x] Extend `app/sentinel-api/src/modules/core/classroom` contracts for instructor assignment management.
- [x] Add read models that expose classroom instructor membership clearly.
- [x] Add mutation endpoints for:
    - [x] assign instructor to classroom
    - [x] remove instructor from classroom
    - [x] list classroom instructors
- [x] Preserve institution scoping and role checks.
- [x] Reuse existing classroom access helpers where possible.

### Migration Check

- [x] Confirm whether `class_roles` is enough.
- [x] If not, add a migration for classroom instructor assignment metadata.
- [x] Document backfill strategy for existing classrooms and instructor memberships.

### Phase 3 Notes

- Classroom delegation remains immediate in v1. No accept or reject step was added for classroom instructor assignment.
- Head-instructor ownership is now persisted through a dedicated metadata table instead of being inferred from `class_roles` alone.
- Additional instructors have constrained rights in v1:
    - all assigned instructors keep classroom access through `class_roles`
    - only the head instructor can add or remove classroom instructors
- `class_roles` remains the classroom access layer, but `classroom_instructor_assignments` is now the ownership and instructor-management source of truth.
- New backend endpoints:
    - `GET /classrooms/{id}/instructors`
    - `POST /classrooms/{id}/instructors`
    - `DELETE /classrooms/{id}/instructors/{userId}`
- New classroom creation now ensures the configuring instructor is recorded as the head instructor for that classroom.
- Migration result:
    - `class_roles` was confirmed to be insufficient because it cannot represent head ownership or assignment provenance
    - Phase 3 adds `classroom_instructor_assignments`
- Backfill strategy:
    - existing instructor `class_roles` rows are copied into `classroom_instructor_assignments`
    - the earliest instructor assignment in each class group becomes the initial head instructor
    - backfilled delegated rows use that resolved head instructor as `assigned_by_user_id`

### Testing

- [x] Add tests for classroom instructor assignment success.
- [x] Add tests for unauthorized classroom assignment mutation rejection.
- [x] Add tests for multiple instructors accessing the same classroom correctly.
- [x] Add tests for head-instructor ownership behavior once finalized.

## Phase 4: Grading Update For Multi-Instructor Multi-Section Exams

**Goal:** Make grading accurately reflect assigned-instructor visibility and section-grouped students for a single exam.

**Context:** Grading already queries by creator or proctor assignment, and already returns `sectionId` and `sectionName`. The remaining work is to harden the visibility rules and produce a response shape the UI can render as grouped sections inside one grading view.

### Backend Scope

- [x] Audit `get-grading-exams.ts` and `get-grading-students.ts` for all assignment states.
- [x] Restrict grading visibility to creator plus accepted assignment states only.
- [x] Confirm whether pending assignments should be invisible in grading lists.
- [x] Add grouped section metadata if the current flat response is not enough for the intended UI.
- [x] Ensure all sections tied to one exam remain visible in one cohesive grading context.

### Frontend Scope

- [x] Update the grading UI to group students by section under the same exam.
- [x] Preserve existing score, status, and attempt information.
- [x] Avoid splitting one exam into fragmented per-section pages unless product confirms that behavior.

### Testing

- [x] Add tests for grading exam list visibility for creators and accepted assignees.
- [x] Add tests for section-grouped student results.
- [x] Add tests for section filtering when a specific section is requested.
- [x] Add UI tests for grouped rendering if the frontend changes are substantial.

### Phase 4 Notes

- Grading visibility remains anchored on the shared instructor exam access helper, which means creators keep access and only `ACCEPTED` assignees inherit grading visibility. Pending and declined assignments stay invisible in grading lists and detail queries.
- `GET /grading/:examId/students` now returns both a flat `students` list and grouped `sections` metadata so the frontend can render one cohesive multi-section grading page without fragmenting the exam into separate views.
- The instructor grading detail page now groups students by section, keeps the existing student score and submission status data, and preserves export behavior by flattening the currently visible grouped rows for the spreadsheet export.

## Phase 5: Notification System Foundation And Triggers

**Goal:** Build the notification module and use it for assignment, approval, request, and decline events.

**Context:** The current notification module is empty, so this phase is greenfield. The brief asks for institution-scoped notifications shown in the header for support, superadmin, admin, and instructor roles.

### Backend Scope

- [x] Design notification persistence and schema.
- [x] Add Prisma schema updates and migration.
- [x] Create notification DTOs, routes, services, and supporting data helpers.
- [x] Define a reusable notification event contract with:
    - [x] actor
    - [x] recipient or audience
    - [x] institution scope
    - [x] branch scope if needed
    - [x] resource type
    - [x] resource id
    - [x] action type
    - [x] read or unread state
- [x] Add trigger wiring for at minimum:
    - [x] exam assignment created
    - [x] exam assignment accepted
    - [x] exam assignment rejected
    - [x] classroom assignment created
    - [x] classroom assignment accepted or rejected if applicable

### Product Direction

- [x] Start with in-app notifications only.
- [x] Make notification creation service-based so future CRUD-wide triggers can be added without duplicating route logic.
- [x] Keep the event catalog explicit instead of creating an unbounded "notify everything" side effect in phase one.

### Frontend Scope

- [x] Define shared notification list contract for header surfaces.
- [x] Identify which apps need the header integration first:
    - [x] `sentinel-web`
    - [x] `sentinel-core`
    - [x] `sentinel-support`
- [x] Add unread count and mark-as-read behavior if required for usability.

### Testing

- [x] Add service tests for institution-scoped notification delivery.
- [x] Add tests for assignment-triggered notification creation.
- [x] Add route tests for list and mark-as-read behavior.
- [x] Add UI tests for header rendering if the frontend surface is implemented in the same delivery.

### Phase 5 Notes

- Notifications now persist in a dedicated `notifications` table with recipient, actor, institution scope, resource type and id, action type, JSON metadata, and explicit `UNREAD` or `READ` state.
- The API now exposes `GET /notifications` and `POST /notifications/:id/read`, backed by a reusable notification service contract that workflow modules can call directly.
- Trigger wiring now covers exam assignment created, accepted, and rejected events, plus classroom instructor assignment creation. Delivery is in-app only for v1.
- The first header consumer is the instructor shell in `sentinel-web`, which now shows unread state and can mark notification items as read from the dropdown. `sentinel-core` and `sentinel-support` were identified as the next authenticated header surfaces, but were not wired in this phase because the touched files in those apps are currently public or marketing headers rather than the authenticated shells we need for workflow notifications.

## Phase 6: Permissions, Integration, And Final Validation

**Goal:** Finish the rollout safely by aligning permissions, shared contracts, and end-to-end regression coverage.

**Context:** The brief explicitly calls out access control updates, and this feature crosses instructor, admin, support, and possibly proctor role surfaces.

### Access Control Scope

- [x] Audit whether existing permissions are enough for:
    - [x] creating exam assignments
    - [x] responding to assigned exams
    - [x] managing classroom instructor membership
    - [x] viewing notifications
- [x] Add new permission keys only where existing ones are insufficient.
- [x] Sync new permissions through:
    - [x] `packages/shared/src/constants/permissions.ts`
    - [x] permission sync logic in `app/sentinel-api/src/modules/security/permission`
    - [x] role blueprints if the defaults must change
- [x] Keep all final authorization logic server-side first.

### Integration Scope

- [x] Update API clients in shared service packages.
- [x] Update shared schemas and generated or inferred types.
- [x] Register any new routes in the API app bootstrap.
- [x] Confirm monitor, lobby, grading, and classroom pages consume the final contracts consistently.

### Testing

- [x] Run targeted API tests for assignment, grading, classroom, and notification flows.
- [x] Add permission-focused tests for out-of-scope access rejection.
- [x] Run app-level tests for any touched frontend surfaces.
- [ ] Run lint and relevant workspace tests before merge.

### Phase 6 Notes

- Existing permission coverage was sufficient for exam assignment and classroom management once the routes explicitly enforced `examinations:view` and `classrooms:update` or `classrooms:view`. Notifications needed one new self-scoped permission: `notifications:view`.
- `notifications:view` is now part of the shared permission catalog and role blueprints for the roles in the feature scope, while the notification controllers now enforce that permission server-side.
- Shared clients, schemas, generated DB types, API bootstrap registration, and the instructor notification header integration are aligned with the final contracts from phases 1 through 5.
- Targeted validation is passing for the touched feature surfaces:
    - `pnpm exec vitest run` in `app/sentinel-api` for assignment, classroom, grading, lobby, and notification tests
    - `pnpm exec vitest run` in `app/sentinel-web` for instructor notification and grading UI tests
    - `pnpm exec eslint` in `app/sentinel-web` for the touched instructor assignment, grading, classroom, and notification files
- Phase 6 is not marked complete yet because merge-level validation still has pre-existing blockers outside this feature:
    - `pnpm lint` still fails in `packages/db` because the workspace `lint` script invokes `eslint`, but `eslint` is not currently resolvable there.
    - `pnpm exec vitest run "src/app/(protected)/(support)/telemetry/_components/telemetry-settings-form.test.tsx"` still fails in `app/sentinel-support` because the test imports a missing `./telemetry-settings-form` module.

## Test Matrix By Feature Area

### Business Logic And Utilities

- [ ] assignment state transition helpers
- [ ] creator-or-proctor access resolution helpers
- [ ] classroom delegation rule helpers
- [ ] notification audience resolution helpers

### API Handlers And Endpoints

- [ ] assign exam
- [ ] accept assigned exam
- [ ] reject assigned exam
- [ ] assign classroom instructor
- [ ] list classroom instructors
- [ ] list notifications
- [ ] mark notification as read
- [ ] grading visibility with assigned instructors

### UI Components And Hooks

- [ ] exam assignment dialog or panel
- [ ] incoming assignment inbox or notifications panel
- [ ] classroom instructor management UI
- [ ] grading section-grouped view
- [ ] header notifications

## Open Decisions To Confirm Before Implementation

- [ ] Should an exam have exactly one active assigned instructor at a time, or many accepted proctors?
- [ ] Does classroom delegation require assignee acceptance?
- [ ] Should rejected exam assignments remain in history for audit visibility?
- [ ] Should notifications be created for every CRUD event immediately, or should this rollout start with assignment and workflow events only?
- [ ] Which app owns the first instructor-facing response UI for accept or reject: `sentinel-web` only, or shared across another workspace?

## Suggested Validation Commands

- [ ] `pnpm --dir app/sentinel-api test`
- [ ] `pnpm --dir app/sentinel-web test`
- [ ] `pnpm --dir app/sentinel-core test`
- [ ] `pnpm --dir app/sentinel-support test`
- [ ] `pnpm lint`

## Summary

The deepest implementation risk is not the new route creation. It is the hidden domain coupling between assignment state, access control, grading visibility, and notifications. This plan treats exam assignment as the anchor workflow, then expands classroom delegation, grading, and notifications around that shared model so we do not ship a partially connected feature.
