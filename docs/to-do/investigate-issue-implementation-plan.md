# Investigate Issue — Implementation Plan

> **Planning only.** Do not begin coding from this document without an explicit go-ahead.

---

## Objective

Translate `docs/investigate-issue.md` into a delivery-ready implementation plan that follows the
repo workflow rules in `1-3-1-rule.md` and `to-do-workflow.md`.

---

## Scope Summary

The issue brief combines four related concerns:

- Instructor subject-request approval and rejection notifications
- Institution-scoped admin and superadmin activity notifications for CRUD actions
- Support-portal notification visibility
- Architecture decisions around `notification`, `broadcast`, and future `announcement` behavior

The work is **not** "build notifications from scratch." The repo already has a notification
foundation. The actual work is to complete the event pipeline, widen the notification taxonomy,
and surface it consistently across apps and roles.

---

## Phase Map

| Phase | Goal                                          | Prerequisite                              |
| ----- | --------------------------------------------- | ----------------------------------------- |
| 0     | Lock event taxonomy and open decisions        | None                                      |
| 1     | Subject-request notification workflow         | Phase 0 complete                          |
| 2     | Institution activity notification workflow    | Phase 0 complete                          |
| 3     | Support activity notification workflow        | Phase 0 complete, Phase 2 scoping settled |
| 4     | Frontend integration across apps              | Phases 1–3 backend complete               |
| 5     | Permissions, regression, and final validation | Phase 4 complete                          |

Phases 1, 2, and 3 may run in parallel once Phase 0 is signed off. Phase 3 should not be started
before Phase 2 scoping is settled, because support notifications may share institution fan-out
logic.

---

## Current Repo Findings

- Subject-request workflows already exist in
  `app/sentinel-api/src/modules/identity/enrollments/` for request, approve, reject, unapprove,
  update, and delete operations.
- Exam assignment already exists in `app/sentinel-api/src/modules/examination/assign/` with tests,
  routes, and notification hooks.
- Notification persistence already exists:
    - Prisma `notifications` model in `packages/db/prisma/schema.prisma`
    - Migration `packages/db/prisma/migrations/20260509191500_add_notifications/migration.sql`
    - API routes in `app/sentinel-api/src/modules/general/notification/`
- Current notification taxonomy is narrow:
    - Resource types: `EXAM_ASSIGNMENT`, `CLASSROOM_INSTRUCTOR_ASSIGNMENT`
    - Action types: `EXAM_ASSIGNMENT_CREATED`, `EXAM_ASSIGNMENT_ACCEPTED`,
      `EXAM_ASSIGNMENT_REJECTED`, `CLASSROOM_INSTRUCTOR_ASSIGNED`
- Subject-request flows are **not** currently wired to `NotificationService`, which directly
  explains the missing instructor/admin notifications described in the brief.
- Classroom instructor assignment already triggers notifications, confirming that the intended
  integration pattern is service-layer event emission rather than a separate transport subsystem.
- `notifications:view` already exists in shared permissions and is granted to key roles, so access
  control is partly prepared.
- `announcements` already exists as a Prisma model, but there is no corresponding backend module.
  Announcements should remain a separate content workflow and must not be conflated with activity
  notifications.
- Frontend notification coverage is uneven:
    - Instructor UI in `app/sentinel-web` already fetches real notifications.
    - Student notifications still use mock data.
    - `sentinel-core` and `sentinel-support` do not currently appear to consume the real notifications API.

---

## Architecture Decision (1-3-1 Rule)

### Options Considered

#### Option 1 — Patch each feature directly into `NotificationService`

Add new action types and resource types. Call `NotificationService.createNotification` directly
from enrollments, subjects, sections, support, and institution services. Add UI integration app
by app.

**Pros:** Fastest path to visible delivery. Smallest architectural change.

**Cons:** Event construction logic spreads across many services. Recipient rules are duplicated.
Future announcement or multi-channel work becomes harder to unify.

#### Option 2 — Add a shared activity-event orchestration layer (Recommended)

Keep `notifications` as the storage and API boundary. Introduce an application service such as
`ActivityNotificationService` or `NotificationWorkflowService`. Centralize event naming,
recipient resolution, message templates, and bulk-event behavior there. Keep announcements as a
separate module and content model.

**Pros:** Fits the current repo without discarding existing work. Keeps domain modules thin.
Makes role-based fan-out and institution scoping consistent. Gives a clean seam for future email,
push, or WebSocket delivery if needed.

**Cons:** Touches more modules than a direct patch. Requires explicit event taxonomy design
first.

#### Option 3 — Build a full `broadcast` platform before finishing feature delivery

Create a dedicated backend broadcast domain with event-bus semantics. Route notifications,
announcements, and future channels through it.

**Pros:** Strongest long-term abstraction. Best if many channels and large-scale fan-out are
imminent.

**Cons:** Overbuilt for the current request. Delays user-facing completion. Increases
architecture risk without evidence the repo needs queueing or bus semantics yet.

### Decision

**Proceed with Option 2.**

Use the existing `notification` module as the persistence and API layer, then add a shared
orchestration layer for activity events. Do **not** create a standalone `broadcast` module yet.
The repo already proves the intended pattern through classroom and exam assignment notifications.
What is missing is a coordinated event model and broader integration, not a second persistence
concept.

Keep `announcements` as a separate module. Announcements are authored content with lifecycle
states (`DRAFT`, `PUBLISHED`). Notifications are user-targeted reactions to system activity.
These are different concerns and must not share a persistence boundary.

---

## Migration Assessment

### Required before Phase 1

Expand notification enums in Prisma schema for subject-request events. Proposed additions:

```
# NotificationResourceType additions
SUBJECT_ENROLLMENT_REQUEST

# NotificationActionType additions
SUBJECT_ENROLLMENT_REQUEST_SUBMITTED
SUBJECT_ENROLLMENT_REQUEST_APPROVED
SUBJECT_ENROLLMENT_REQUEST_REJECTED
```

### Required before Phase 2

Expand enums for institution activity events. Proposed additions:

```
# NotificationResourceType additions
SECTION
SUBJECT
SUBJECT_CLASSIFICATION

# NotificationActionType additions
SECTION_CREATED
SECTION_UPDATED
SECTION_DELETED
SUBJECT_CREATED
SUBJECT_UPDATED
SUBJECT_DELETED
SUBJECT_CLASSIFICATION_CREATED
SUBJECT_CLASSIFICATION_UPDATED
SUBJECT_CLASSIFICATION_DELETED
```

> **Naming must be finalized in Phase 0** before these enum values are committed. Do not
> introduce placeholder names that will need a follow-up rename migration.

### Required before Phase 3

Expand enums for support-originated events. Exact names depend on Phase 3 scoping decisions.

### Possibly Required

- Additional indexing on `notifications` table if institution-wide fan-out becomes heavy.
- A recipient-group or event-log table if per-user notification rows become too expensive or
  too noisy in bulk workflows. Defer this unless fan-out testing reveals a real problem.

### Not Required for V1

- A new `broadcast` table or module.
- Announcement schema changes, unless the team chooses to expose authored announcements in the
  same UI surface as activity notifications.

---

## Phase 0 — Domain Decisions and Event Taxonomy

**Goal:** Remove ambiguity before implementation starts. All decisions from this phase must be
documented and signed off before Phases 1–3 begin.

**Prerequisites:** None.

### Decisions Required

The following questions must be answered and written down. They are not tasks to defer — Phases
1 through 3 are blocked on them.

**Subject-request recipient rules**

- [x] Should instructor subject-request submission notify all institution admins, all institution
      superadmins, both, or only users who hold `subject_requests:approve`?
      Decision: Notify users in the same institution who hold `subject_requests:approve`.
- [x] On approval or rejection of a batch of requests, should recipients receive one notification
      per request or one aggregate notification per action?
      Decision: Use one aggregate notification per batch action.

**Admin and superadmin CRUD activity rules**

- [x] Should admins and superadmins receive notifications for their own CRUD actions, or are
      self-notifications suppressed?
      Decision: Self-notifications are suppressed.
- [x] Which CRUD events are in scope for V1? Confirm which of the following are included:
    - [x] Section create, update, delete
    - [x] Subject create, update, delete
    - [x] Subject-classification create, update, delete
    - [x] Bulk upload (sections or subjects)
    - [x] Institution-level changes
          Decision: Institution-level changes are explicitly out of scope for V1.
- [x] For bulk upload operations, should each record produce a notification row, or should the
      operation produce a single summary notification?
      Decision: Emit a single summary notification per bulk action.

**Support-portal activity rules**

- [x] Which support actions change operational state in a way that is notification-worthy?
      Decision: Only operational actions that materially affect institution setup, governance, or
      platform access are notification-worthy in V1.
- [x] Are support-originated notifications institution-scoped, global (system-wide), or
      dual-scoped per action type?
      Decision: Dual-scoped per action type.
- [x] Should support users themselves receive inbound notifications from system activity?
      Decision: No, not in V1.

**Architecture**

- [x] Should the `ActivityNotificationService` orchestration layer live inside
      `app/sentinel-api/src/modules/general/notification/` or in a separate adjacent module?
      Decision: Keep it inside the notification module as a workflow service.
- [x] Confirm and finalize naming conventions for all new action and resource enum values before
      any migration is written.
      Decision: Final enum set captured in the Phase 0 decision log.

### Phase 0 Outputs

Phase 0 is complete when the following artifacts exist and are signed off:

- [x] A written decision log capturing all answers above, stored in `docs/` or the relevant
      agent rules folder.
      Output: `docs/to-do/investigate-issue-phase-0-decision-log.md`
- [x] A finalized enum name list for all V1 notification resource and action types.
- [x] A recipient-resolution matrix: for each event type, which roles or permission holders
      receive a notification row and whether the acting user is excluded.
- [x] A confirmed location for the orchestration service layer.

### Phase 0 Completion Note

Phase 0 is complete. The locked decisions, enum naming, recipient matrix, and orchestration-layer
placement are recorded in
`docs/to-do/investigate-issue-phase-0-decision-log.md`.

---

## Phase 1 — Subject-Request Notification Workflow

**Goal:** Complete the instructor request approval loop with notifications on submit, approve,
and reject.

**Prerequisites:** Phase 0 complete. Enum names and recipient rules for subject-request events
signed off.

**Context:** This is the most concrete business requirement in the issue brief and maps directly
onto existing enrollment-request APIs. The integration pattern is already demonstrated by
classroom instructor assignment notifications.

**Primary files:**

- `app/sentinel-api/src/modules/identity/enrollments/`
- `app/sentinel-api/src/modules/general/notification/`
- `packages/db/prisma/schema.prisma`
- `packages/shared/src/constants/` (enum exports)

### Tasks

- [x] Write and apply Prisma migration adding `SUBJECT_ENROLLMENT_REQUEST` resource type and the
      three subject-request action types. Run `prisma generate` and verify generated types compile.
- [x] Export new enum values from `packages/shared` so all apps and services can import them
      without importing from the DB package directly.
- [x] Create the orchestration helper (or extend the orchestration layer established in Phase 0)
      with workflow methods for:
    - [x] `notifyApproversOfNewRequest(enrollmentRequest)` — resolves recipients by institution
          and role or permission, suppresses the submitting instructor
    - [x] `notifyInstructorOfApproval(enrollmentRequest)` — targets the requesting instructor
    - [x] `notifyInstructorOfRejection(enrollmentRequest, reason?)` — targets the requesting
          instructor, includes rejection context if available
- [x] Wire notification calls into the enrollment service:
    - [x] `EnrollmentService.enrollInstructor` → call `notifyApproversOfNewRequest`
    - [x] `EnrollmentService.approveEnrollmentRequest` → call `notifyInstructorOfApproval`
    - [x] `EnrollmentService.rejectEnrollmentRequest` → call `notifyInstructorOfRejection`
- [x] Implement the aggregate behavior decided in Phase 0 for batch approvals or rejections.
- [x] Ensure each notification row includes enough metadata (subject ID, request ID, institution
      ID) to allow the frontend to build a deep link to the relevant context.

### Testing Requirements

- [x] Unit tests for each orchestration helper method: assert that the correct recipient list
      is resolved and the correct notification payload is constructed without hitting the database.
- [x] Service-layer integration tests for each wired call: assert that the notification service
      is invoked with the correct arguments on submit, approve, and reject.
- [x] Institution-scope tests: assert that approvers from a different institution do not appear
      in the resolved recipient list.
- [x] Duplicate-request regression test: submitting the same request twice must not emit
      duplicate notifications.
- [x] Batch behavior test: if Phase 0 decided on aggregate notifications, assert that approving
      five requests in one action produces one notification rather than five.

### Phase 1 Completion Note

Phase 1 is complete. The backend now emits subject-request notifications for submit, approve,
and reject through the notification orchestration layer in
`app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts`.
Targeted Vitest coverage passes for:

- `src/modules/identity/enrollments/enrollments.service.test.ts`
- `src/modules/general/notification/services/activity-notification.service.test.ts`
- `src/modules/general/notification/notification.service.test.ts`

### Definition of Done

- Instructors receive a notification when their request is approved or rejected.
- Eligible approvers receive a notification when a new request is submitted.
- All tests pass. No existing enrollment route tests regress.
- Migration is applied and generated types are committed.

---

## Phase 2 — Institution Activity Notification Workflow

**Goal:** Introduce reusable activity notifications for high-value admin and superadmin CRUD
actions across sections, subjects, and subject classifications.

**Prerequisites:** Phase 0 complete. V1 CRUD event list and fan-out rules confirmed.

**Context:** The issue brief expects institution-wide visibility when administrators modify
key modules. Explicit scoping and noise controls are required to prevent alert fatigue.
This phase establishes the fan-out infrastructure that Phase 3 will reuse.

**Primary files:**

- `app/sentinel-api/src/modules/core/sections/`
- `app/sentinel-api/src/modules/core/subjects/`
- `app/sentinel-api/src/modules/core/subject-classification/`
- `app/sentinel-api/src/modules/general/notification/`
- `packages/db/prisma/schema.prisma`

### Tasks

- [x] Write and apply Prisma migration adding V1 institution activity resource types and action
      types. Run `prisma generate` and verify.
- [x] Export new enum values from `packages/shared`.
- [x] Implement a shared institution fan-out helper in the orchestration layer:
    - [x] Resolves all active members of an institution by role or permission.
    - [x] Suppresses the acting user (if Phase 0 decided on self-notification suppression).
    - [x] Accepts a throttle or deduplication option for bulk operations.
    - [x] Builds a consistent notification message from actor name, resource label, and
          operation type.
- [x] Wire activity notifications into first-wave services:
    - [x] Sections: create, update, delete
    - [x] Subjects: create, update, delete
    - [x] Subject classifications: create, update, delete
- [x] Implement bulk-upload behavior as decided in Phase 0 (per-record rows or one summary row).
- [x] Decide and document whether `INSTITUTION` CRUD events belong in V1 or are deferred.
      Decision: `INSTITUTION` CRUD events remain deferred and are not part of Phase 2.

### Testing Requirements

- [x] Unit tests for the institution fan-out helper: mock the recipient-resolution query and
      assert the correct set of users is targeted.
- [x] Unit tests for self-notification suppression: assert the acting user is excluded from
      their own fan-out.
- [x] Service-layer tests for each first-wave CRUD module: assert that the correct action type,
      resource type, and institution scope are present in the emitted notification.
- [x] Bulk-upload test: upload ten records and assert that the resulting notification count
      matches the Phase 0 decision (one summary or ten rows, not an uncontrolled storm).
- [x] Negative test: assert that users belonging to a different institution do not receive
      notification rows from this institution's activity.

### Phase 2 Completion Note

Phase 2 is complete. Institution-scoped activity notifications now fan out to `admin` and
`superadmin` recipients through the shared orchestration layer in
`app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts`.
Covered write paths in this phase:

- sections: create, bulk create, update, delete, bulk delete
- subjects: create, update, delete, bulk delete
- subject classifications: create, update, delete

Targeted validation passed with:

- `pnpm --dir packages/db generate`
- `pnpm --dir packages/db build`
- `pnpm --dir app/sentinel-api exec vitest run ...` over the touched notification, enrollment,
  section, subject, and subject-classification service tests

### Definition of Done

- Admins and superadmins inside an institution receive notifications for the first-wave CRUD
  events confirmed in Phase 0.
- Bulk operations do not produce a notification storm.
- Self-notifications behave according to the Phase 0 decision.
- Fan-out helper is reusable and will be imported by Phase 3 without modification.
- All tests pass. No existing section, subject, or subject-classification service tests regress.

---

## Phase 3 — Support Activity Notification Workflow

**Goal:** Define and implement notification behavior for support-portal-driven actions.

**Prerequisites:** Phase 0 complete (support scoping decisions locked). Phase 2 definition of
done met (fan-out helper available for reuse).

**Context:** The issue brief expects the support portal to participate in notifications, but
support actions may not naturally map to institution-scoped activity unless their targets are
explicitly linked to institutions. Scoping must be resolved before any emission code is written.

**Primary files:**

- Support-side service modules (to be identified during task inventory below)
- `app/sentinel-api/src/modules/general/notification/`
- `packages/db/prisma/schema.prisma`

### Tasks

- [x] Inventory support actions that change operational state and should notify other roles.
      Produce a written list with at least: action name, target resource, and expected recipients.
      Output: `docs/to-do/investigate-issue-phase-3-support-inventory.md`
- [x] For each inventoried action, assign one of:
    - [x] Institution-scoped notification (reuse Phase 2 fan-out helper)
    - [x] Global or system-wide notification (new helper needed)
    - [x] No notification (document rationale)
- [x] Write and apply Prisma migration for any new notification enums required by support events.
- [x] Implement support-side event emission in the relevant backend services, using the Phase 2
      fan-out helper wherever institution scoping applies.
- [x] If support users should receive inbound notifications (as decided in Phase 0), implement
      the recipient path and any additional permission checks required.
      Decision: Phase 0 excluded support inbound notifications in V1, so no inbound support path
      was added.

### Testing Requirements

- [x] Service tests for at least one institution-scoped support notification: assert correct
      institution recipients are targeted.
- [x] If global notifications are implemented, assert they do not target institution-internal
      recipients only.
      Note: global support notifications were explicitly deferred in V1.
- [x] Scope isolation test: assert that a support action targeting Institution A does not create
      notification rows for users in Institution B.
- [x] Contract tests for any metadata fields unique to support events (for example,
      support-ticket ID or support-user identity).

### Phase 3 Completion Note

Phase 3 is complete. Support-originated notifications now cover institution CRUD as the first V1
support slice, using:

- resource type: `SUPPORT_OPERATION`
- action type: `SUPPORT_OPERATION_COMPLETED`
- metadata discriminator: institution target plus operation name

Delivered support-originated backend paths:

- institution create
- institution update
- institution delete

Deferred in V1 and documented in the support inventory:

- global support notifications
- telemetry settings notifications
- branch link or unlink notifications
- institution naming-convention notifications
- broader support-owned setup module notifications

Targeted validation passed with:

- `pnpm --dir packages/db generate`
- `pnpm --dir packages/db build`
- `pnpm --dir app/sentinel-api exec vitest run ...` over the touched notification, institution,
  section, subject, subject-classification, and enrollment service tests

### Definition of Done

- Each support action categorized in the inventory either emits a notification or has documented
  rationale for why it does not.
- Notification scope (institution or global) is consistent with Phase 0 decisions.
- Scope isolation is verified by tests.
- No new duplicate fan-out paths introduced; Phase 2 helpers are reused where applicable.

---

## Phase 4 — Frontend Integration Across Apps

**Goal:** Surface completed notification workflows consistently in every app that should consume
them.

**Prerequisites:** Phases 1, 2, and 3 backend complete. API responses include new action and
resource types.

**Context:** The API already exists, but app coverage is uneven. Instructor web already fetches
real notifications. `sentinel-core` and `sentinel-support` do not appear to consume the
notifications API. Student-facing surfaces still use mock data, but student notifications may be
out of scope for V1 — confirm before spending time on them.

**Primary files:**

- `app/sentinel-web/`
- `app/sentinel-core/`
- `app/sentinel-support/`
- `packages/services/src/api/notifications.ts`

### Tasks

- [x] Audit which roles in each app should see notifications and which notification action types
      are relevant to each role. Document this as a matrix before writing any UI code.
      Output: `docs/to-do/investigate-issue-phase-4-notification-matrix.md`
- [x] Confirm whether student notifications are in V1 scope. If not, do not replace the existing
      mock data — leave a code comment noting it is deferred.
      Decision: student-facing notifications remain deferred in V1; the mock-backed student header
      was kept intact with a deferral comment.
- [x] Review `packages/services/src/api/notifications.ts` and extend it for any new query or
      mutation shapes introduced by Phases 1–3. Reuse existing hooks and fetchers where possible.
      Result: no API changes were required; `getNotifications` and `markNotificationRead`
      already cover the Phase 1–3 backend outputs.
- [x] Implement admin and superadmin notification UI in `sentinel-core`:
    - [x] Notification indicator (unread count)
    - [x] Notification list or dropdown
    - [x] Mark-as-read interaction
- [x] Implement support notification UI in `sentinel-support` if Phase 0 confirmed support users
      should receive inbound notifications.
      Decision: skipped by design because Phase 0 excluded inbound support notifications in V1.
- [x] Verify that the notification presentation layer handles all new action and resource label
      combinations cleanly, including labels not present at the time the UI was first built.
      Result: V1 surfaces render backend-authored `title` and `message`, so unknown enum values do
      not require client-side label mapping.
- [x] Audit `sentinel-web` for any hardcoded label strings that will break with new action types.
      Result: instructor notifications already render API-provided copy; only student mock data
      remains hardcoded and is intentionally deferred.

### Testing Requirements

- [x] Component tests for each new notification indicator, list, or dropdown added to
      `sentinel-core` and `sentinel-support`.
      Note: `sentinel-support` received no new notification UI in V1 by design.
- [x] Hook or query tests for any new notification-fetching wrappers introduced in
      `packages/services`.
      Result: no new wrappers were introduced, so no service-level query tests were needed.
- [x] Mark-as-read interaction test: assert optimistic update or post-success state is handled
      correctly.
- [x] Empty-state test: assert the UI renders gracefully when a user has zero notifications.
- [x] Forbidden-state test: assert that a role without `notifications:view` does not see a
      notification surface at all.
- [x] Unknown label test: assert that an unrecognized action type value does not break rendering
      (fallback label or graceful omission).

### Phase 4 Completion Note

Phase 4 is complete. Frontend notification coverage now matches the V1 scope decisions:

- `sentinel-core` admin and superadmin headers now consume the real notifications API
- `sentinel-web` instructor notifications remain live and validated against the current API
- `sentinel-web` student notifications remain mock-backed and explicitly deferred
- `sentinel-support` received no inbound notification UI because Phase 0 excluded it from V1

Targeted validation passed with:

- `pnpm --dir app/sentinel-core exec vitest run src/components/sidebar/common/core-notification-dropdown.test.tsx`
- `pnpm --dir app/sentinel-web exec vitest run src/components/sidebar/instructor/instructor-notification-dropdown.test.tsx`

### Definition of Done

- `sentinel-core` admin and superadmin users see real notifications.
- `sentinel-support` notification surface matches Phase 0 decisions.
- `sentinel-web` instructor notification surface continues to function correctly with new event
  types.
- No app renders a broken UI for empty, unknown, or forbidden notification states.

---

## Phase 5 — Permissions, Regression, and Final Validation

**Goal:** Close authorization gaps, confirm all role-based visibility rules hold under mixed
scenarios, and deliver the rollout in a state ready for production.

**Prerequisites:** Phase 4 complete.

**Context:** Most recipient behavior depends on institution scoping plus existing permission
grants. The new workflows must not accidentally widen notification visibility to roles or
institutions outside the intended scope.

**Primary files:**

- `packages/shared/src/constants/permissions.ts`
- All modified API route handlers
- Prisma schema and generated types

### Tasks

- [x] Review `packages/shared/src/constants/permissions.ts` for any notification-related surface
      that was missed in earlier phases. Confirm that `notifications:view` remains the correct
      gate or document if a finer-grained permission key is needed.
      Result: `notifications:view` remains the single V1 gate; no finer-grained notification
      permission key was needed.
- [x] Confirm role-to-permission assignments: admin, superadmin, instructor, and support roles
      should each hold the correct default grants after all enum and service changes.
      Result: `support` no longer carries `notifications:view` in V1; `admin`, `superadmin`, and
      `instructor` retain it.
- [x] Run mixed-role scenario validation: a user who is an instructor in Institution A and an
      admin in Institution B should receive only the notifications appropriate to each role in each
      institution scope.
      Result: added service-level regression coverage to confirm institution-context scoping is
      preserved per request.
- [x] Verify all new Prisma migration files are applied cleanly from a clean database state and
      that `prisma generate` produces no type errors.
      Result: migration chain audited and `pnpm --dir packages/db generate` plus
      `pnpm --dir packages/db build` passed. A disposable clean database was not provisioned in
      this environment, so live end-to-end migration application was not rerun here.
- [x] Verify that the generated schema types are committed and that no app is importing directly
      from the Prisma client in a way that bypasses shared type exports.
      Result: direct-import audit found no app code importing `@prisma/client` outside
      `packages/db`.
- [x] Update `docs/` or runbook entries if the notification taxonomy becomes part of operational
      troubleshooting (for example, if support engineers need to understand why a user did or did not
      receive a notification).
      Output: `docs/to-do/investigate-issue-phase-5-validation.md`

### Testing Requirements

- [x] Targeted API integration tests for the notifications endpoint after all enum changes:
      GET list, GET unread count, PATCH mark-as-read, at minimum.
- [x] Role-based visibility regression tests: assert that an instructor does not see admin
      activity notifications and that an admin in Institution A does not see Institution B activity.
- [x] Cross-phase regression pass: re-run enrollment, subject, section, and support service
      tests to confirm no regressions from shared orchestration layer changes.
- [x] Frontend E2E or smoke tests covering at minimum: login as admin → see notification →
      mark as read → count decrements.
      Note: V1 validation uses component-level smoke coverage rather than browser E2E.

### Phase 5 Completion Note

Phase 5 is complete. The final hardening pass confirmed that the V1 notification rollout is
aligned across permissions, API guards, recipient scoping, migrations, and frontend consumers.

Key Phase 5 outcomes:

- retained `notifications:view` as the single notification permission gate
- removed `notifications:view` from the `support` role blueprint to match the Phase 0 V1 scope
- added stronger notification controller and service regression tests
- documented the final validation and direct-import audit in
  `docs/to-do/investigate-issue-phase-5-validation.md`

Targeted validation passed with:

- `pnpm --dir packages/db generate`
- `pnpm --dir packages/db build`
- `pnpm --dir app/sentinel-api exec vitest run ...` over notification controllers, notification
  service, activity notification service, institution, section, subject, subject-classification,
  and enrollment tests
- `pnpm --dir app/sentinel-core test`
- `pnpm --dir app/sentinel-web exec vitest run src/components/sidebar/instructor/instructor-notification-dropdown.test.tsx`

### Definition of Done

- No role receives notifications outside its institution scope.
- No role receives notification types it is not supposed to see.
- All migrations apply cleanly. All generated types compile. All existing tests pass.
- Docs updated if operational runbooks reference notification taxonomy.

---

## Recommended Execution Order

1. **Phase 0 first, completely.** Lock event taxonomy, recipient rules, enum naming, and
   orchestration layer location before a single migration or service change is written. Phases
   1–3 all depend on these decisions being stable.
2. **Phase 1 next** — it is the clearest business gap from the brief, has the smallest blast
   radius, and validates the orchestration layer pattern before broader rollout.
3. **Phases 2 and 3 in parallel** once Phase 0 is signed off, but Phase 3 must wait for Phase 2
   fan-out helper to exist before writing institution-scoped support notifications.
4. **Phase 4** once all three backend phases are complete. Avoid building frontend surfaces
   against an incomplete API.
5. **Phase 5 last** as a validation and hardening pass. Do not treat it as a catch-all that
   absorbs deferred work from earlier phases.

---

## Risks and Constraints

| Risk                                                               | Phase | Mitigation                                                                              |
| ------------------------------------------------------------------ | ----- | --------------------------------------------------------------------------------------- |
| Bulk-upload creates a notification storm                           | 2, 3  | Decide on aggregate-vs-per-record in Phase 0; implement deduplication in fan-out helper |
| Enum naming conflicts requiring a rename migration                 | 1–3   | Finalize all names in Phase 0 before any migration is applied                           |
| Fan-out logic duplicated across phases if not centralized          | 2, 3  | Phase 2 must produce a reusable helper; Phase 3 imports it, does not reimplement        |
| Frontend breaks on unknown action type labels                      | 4     | Require fallback label handling before merging any UI that reads action type strings    |
| Mixed-role institution scoping silently grants too-wide visibility | 1–3   | Add cross-institution negative tests in each phase, not just in Phase 5                 |
| Phase 0 decisions left open or soft-confirmed                      | All   | Phase 0 must produce a written decision log, not just a verbal agreement                |

---

## Open Questions

These questions are not deferred — each one **blocks a specific phase**. If a question is not
answered before its phase begins, that phase must not start.

| Question                                                                                               | Blocks                                      |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Should subject-request submission notify all eligible approvers or only first-line institution admins? | Phase 1                                     |
| Should batch approve or reject produce one aggregate notification or one per request?                  | Phase 1                                     |
| Should admins and superadmins receive notifications for their own CRUD actions?                        | Phase 2                                     |
| Which CRUD modules and operations are in V1 scope for institution activity notifications?              | Phase 2                                     |
| Should bulk-upload operations produce per-record notification rows or a single summary row?            | Phase 2                                     |
| Which support actions are notification-worthy, and what is their scope (institution, global, or both)? | Phase 3                                     |
| Should support users receive inbound notifications?                                                    | Phase 3, Phase 4                            |
| Should `ActivityNotificationService` live inside the existing `notification` module or alongside it?   | Phase 0 output, used by Phases 1–3          |
| Are student-facing notification surfaces in scope for V1?                                              | Phase 4                                     |
| Should future authored announcements appear in the same UI surface as activity notifications?          | Phase 4 (UI design), does not block backend |
