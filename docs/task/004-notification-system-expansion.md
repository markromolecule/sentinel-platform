# Task: Notification System Expansion

This task expands the shared notification system so that CRUD actions and qualifying transactions across the audited admin, superadmin, support, and instructor surfaces emit institution-aware notifications through a centralized backend module.

## Scope Summary

- Audit all five scoped app directories from `docs/notifcation-scope.md`.
- Ensure routing rules remain institution-scoped:
    - [ ] Support actions notify Admin and Superadmin.
    - [ ] Admin and Superadmin actions notify Support and Instructor.
- Ensure every notification payload includes:
    - [ ] Actor role
    - [ ] Action type
    - [ ] Institution level
    - [ ] Timestamp
- Preserve the shared notification module approach and avoid duplicated per-feature notification logic.

## 1-3-1 Rule

### Option 1: Inline Notification Patches Per Feature Module

Add missing notification calls directly in each CRUD controller/service without introducing a broader dispatcher abstraction.

- Pros:
    - [ ] Fastest to start
    - [ ] Lowest short-term design overhead
- Cons:
    - [ ] High duplication risk
    - [ ] Harder to keep routing and payloads consistent
    - [ ] Weak fit for the shared `[notification]` requirement

### Option 2: Centralized Notification Dispatcher Per Event Family

Extend the current notification module with reusable routing and payload builders, then retrofit audited CRUD and transaction flows to call that shared path.

- Pros:
    - [ ] Best fit for the existing codebase
    - [ ] Strong alignment with the acceptance criteria
    - [ ] Easier to test routing, institution context, and override behavior centrally
- Cons:
    - [ ] Requires moderate upfront planning
    - [ ] Touches shared schema and backend flows together

### Option 3: Outbox/Event Queue Expansion

Add an asynchronous event/outbox layer for CRUD and transaction notifications, then consume those events to create notifications.

- Pros:
    - [ ] Strong long-term scalability
    - [ ] Better auditability for high-volume activity
- Cons:
    - [ ] Highest implementation cost
    - [ ] More infrastructure than the scoped feature currently needs
    - [ ] Slower path to shipping the support bell and coverage audit

### Best Option

Option 2 is the recommended path.

- [ ] It fits the current architecture, which already has a centralized notification service.
- [ ] It satisfies the shared-module requirement without turning the task into a larger infrastructure rewrite.
- [ ] It keeps routing logic, institution tagging, and metadata composition testable in one place.

## Phase 1: Audit and Coverage Matrix

Context: Build the source-of-truth inventory before implementation so all scoped surfaces are covered and no CRUD or transaction path is missed.

- [x] Audit `app/sentinel-core/src/app/(protected)/(admin)`.
- [x] Audit `app/sentinel-core/src/app/(protected)/(superadmin)`.
- [x] Audit `app/sentinel-support/src/app/(protected)/(support)`.
- [x] Audit `app/sentinel-web/src/app/(protected)/(instructor)`.
- [x] Audit `app/sentinel-web/src/app/(protected)/student`.
- [x] Trace each UI action to its hook, endpoint, and backend service entry point.
- [x] Mark which actions already emit notifications and which do not.
- [x] Separate standard CRUD actions from transaction-style workflows.
- [x] Identify which actions must be tagged as `admin override`.
- [x] Record expected recipients for each event family based on the scope rules.

Testing

- [x] Create a validation matrix mapping each audited action to its expected notification assertion.
- [x] Verify every scoped directory has at least one explicit audit artifact in this tracker.

### Phase 1 Audit Findings

#### Existing Notification Foundations

- Shared API surface already exists in `app/sentinel-api/src/modules/general/notification`.
- Shared frontend API client already exists in `packages/services/src/api/notifications.ts`.
- Shared schema already exists in `packages/shared/src/schema/notifications/notification-schema.ts`.
- Live dropdown UIs already exist for:
    - `app/sentinel-core/src/components/sidebar/common/core-notification-dropdown.tsx`
    - `app/sentinel-web/src/components/sidebar/instructor/instructor-notification-dropdown.tsx`
- Realtime invalidation hook already exists in `packages/hooks/src/use-notification-realtime.ts`.
- Role access baseline already includes `notifications:view` for `support`, `admin`, `superadmin`, and `instructor` in `packages/shared/src/constants/permissions.ts`.
- Student does not currently have `notifications:view`.

#### Scoped Directory Audit Summary

| Scoped surface               | Current notification UI state          | Representative mutation surfaces                                                                                                      | Current backend notification coverage                                                                                                                                              | Phase 1 conclusion                     |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `sentinel-core/(admin)`      | Live dropdown present in header        | Sections CRUD, whitelist flows, classrooms, proctor assignment, exam config-related admin actions                                     | Sections already covered; admin receives subject-request and support-originated institution notifications; several admin CRUD surfaces still unverified for outbound notifications | Partial coverage                       |
| `sentinel-core/(superadmin)` | Live dropdown present in header        | Administrators, courses, departments, institutions, permissions, semesters                                                            | Receives current shared/core notifications, but many superadmin CRUD surfaces do not yet map to explicit outbound notification event families                                      | Partial coverage                       |
| `sentinel-support/(support)` | Missing notification bell in header    | Institutions wizard, courses, departments, rooms, semesters, subjects, roles, permissions, assignments, users, examination governance | Institution operations already emit support-originated notifications; broad support CRUD coverage is still missing                                                                 | Partial coverage with UI gap           |
| `sentinel-web/(instructor)`  | Live dropdown present in header        | Subject request submission, classroom instructor assignment recipient flows, classroom/student management, subject views, exams       | Exam assignment, classroom instructor assignment, and subject request flows already notify instructors where supported                                                             | Partial coverage                       |
| `sentinel-web/student`       | Notifications page uses mock data only | No live notification mutations in current student surface                                                                             | Student notifications are still deferred; no live API-backed notification surface exists                                                                                           | Deferred / out of current live rollout |

#### Current Backend Event Families Confirmed

- `NotificationService`
    - `notifyExamAssignmentCreated`
    - `notifyExamAssignmentAccepted`
    - `notifyExamAssignmentRejected`
    - `notifyClassroomInstructorAssigned`
- `ActivityNotificationService`
    - `notifySubjectEnrollmentRequestSubmitted`
    - `notifySubjectEnrollmentRequestApproved`
    - `notifySubjectEnrollmentRequestRejected`
    - `notifySectionCreated`
    - `notifySectionsBulkCreated`
    - `notifySectionUpdated`
    - `notifySectionDeleted`
    - `notifySubjectCreated`
    - `notifySubjectUpdated`
    - `notifySubjectDeleted`
    - `notifySubjectClassificationCreated`
    - `notifySubjectClassificationUpdated`
    - `notifySubjectClassificationDeleted`
    - `notifySupportInstitutionOperationCompleted`

#### Coverage Matrix

| Event family                                     | Source role/surface                                      | UI -> hook/api entry point                                                                                                         | Backend service entry point                                                                                           | Current status    | Expected recipients from scope                                                             |
| ------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| Exam assignment create/respond                   | Instructor and exam-assignment surfaces                  | Instructor exams assign flow                                                                                                       | `app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts`, `respond-to-exam-assignment.ts` | Already covered   | Existing assignee/assigner flow, not a new scope gap                                       |
| Classroom instructor assignment                  | Instructor classroom flows                               | Instructor classrooms assignment dialog                                                                                            | `app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-management.service.ts`                     | Already covered   | Instructor recipient flow already exists                                                   |
| Subject enrollment request submit/approve/reject | Instructor and admin request workflows                   | Instructor subjects / admin approval flows                                                                                         | `app/sentinel-api/src/modules/identity/enrollments/enrollments.service.ts`                                            | Already covered   | Admin recipients on submit, instructor recipient on approval/rejection                     |
| Sections CRUD                                    | Admin section management                                 | Admin sections hooks and mutations                                                                                                 | `app/sentinel-api/src/modules/core/sections/sections.service.ts`                                                      | Already covered   | Needs review against final support/instructor routing requirement                          |
| Subjects CRUD                                    | Support/admin/superadmin subject management surfaces     | Subject mutation hooks                                                                                                             | `app/sentinel-api/src/modules/core/subjects/subject.service.ts`                                                       | Already covered   | Needs routing normalization                                                                |
| Subject classification CRUD                      | Support/admin/superadmin subject classification surfaces | Classification mutation hooks                                                                                                      | `app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts`                          | Already covered   | Needs routing normalization                                                                |
| Institution create/update/delete                 | Support institutions wizard and table actions            | `useCreateInstitutionMutation`, `useUpdateInstitutionMutation`, `useDeleteInstitutionMutation`, wizard publish flow                | `app/sentinel-api/src/modules/core/institutions/institution.service.ts`                                               | Partially covered | Scope says Support -> Admin, Superadmin only                                               |
| Courses CRUD                                     | Support and superadmin course management                 | `useCreateCourseMutation`, `useUpdateCourseMutation`, `useDeleteCourseMutation`                                                    | Course backend services not yet mapped to notification dispatcher                                                     | Missing coverage  | Support -> Admin, Superadmin or Admin/Superadmin -> Support, Instructor depending on actor |
| Departments CRUD                                 | Support and superadmin department management             | `useCreateDepartmentMutation`, `useUpdateDepartmentMutation`, `useDeleteDepartmentMutation`                                        | Department backend services not yet mapped to notification dispatcher                                                 | Missing coverage  | Same as above                                                                              |
| Rooms CRUD                                       | Support and admin room management                        | `useCreateRoomMutation`, `useUpdateRoomMutation`, `useDeleteRoomMutation`                                                          | Room backend services not yet mapped to notification dispatcher                                                       | Missing coverage  | Same as above                                                                              |
| Semesters CRUD                                   | Support and superadmin semester management               | `useCreateSemesterMutation`, `useUpdateSemesterMutation`, `useDeleteSemesterMutation`                                              | Semester backend services not yet mapped to notification dispatcher                                                   | Missing coverage  | Same as above                                                                              |
| Permissions CRUD                                 | Support control permission registry                      | `useCreateAccessControlPermissionMutation`, `useUpdateAccessControlPermissionMutation`, `useDeleteAccessControlPermissionMutation` | Security permission backend flows not yet mapped to notification dispatcher                                           | Missing coverage  | Support -> Admin, Superadmin                                                               |
| Role-permission assignment transactions          | Support control assignments and role management          | Access-control assignment and role mutations                                                                                       | Security role/assignment backend flows not yet mapped to notification dispatcher                                      | Missing coverage  | Support -> Admin, Superadmin                                                               |
| Administrator CRUD                               | Superadmin administrator management                      | `useUpdateUserMutation`, `useDeleteUserMutation`, invitation flows                                                                 | Identity/admin backend flows not yet mapped to notification dispatcher                                                | Missing coverage  | Admin/Superadmin -> Support, Instructor only where institution-scoped                      |

#### Transaction vs Standard CRUD Split

Standard CRUD already identified in scope:

- Sections
- Subjects
- Subject classifications
- Institutions
- Courses
- Departments
- Rooms
- Semesters
- Permissions
- Roles
- Users / administrators

Transaction-style workflows already identified in scope:

- Exam assignment create/respond
- Classroom instructor assignment
- Subject enrollment request submit/approve/reject
- Institution wizard publish flow with chained create operations
- Role-permission replacement and assignment management
- Admin override actions that mutate records outside standard create/update/delete semantics

#### Admin Override Candidates

The following flows should be treated as likely `admin override` candidates in later phases:

- Superadmin or admin actions that change institution-scoped records owned by another branch/local institution
- Permission override or access-control assignment replacement flows in support control
- Support control actions that explicitly alter institution templates or naming behavior across dependent records
- Any privileged update path that bypasses normal ownership or approval flow

#### Routing and Policy Mismatches Discovered

- `notifySupportInstitutionOperationCompleted` currently targets `['superadmin', 'admin', 'instructor']`, but the scope document requires support actions to notify only `Admin` and `Superadmin`.
- Support has `notifications:view`, but `app/sentinel-support/src/components/sidebar/support/support-header.tsx` has no notification bell/dropdown yet.
- Student notifications remain mock-data based in `app/sentinel-web/src/app/(protected)/student/notifications/page.tsx`, which matches the previously deferred status rather than the new scope’s broad “all five app directories” wording.

#### Phase 1 Validation Targets

- Support-originated institution actions should assert recipients exclude instructors after routing normalization.
- Existing admin/superadmin/instructor dropdown tests should remain valid while support bell coverage is added later.
- New event families will need service-level assertions first, then representative controller/UI assertions per family rather than one test per page.

## Phase 2: Shared Notification Contract and Routing

Context: Normalize the event model so all modules emit notifications through the same routing and payload conventions.

- [x] Review `packages/shared/src/schema/notifications/notification-schema.ts` against the new scope.
- [x] Add any missing action/resource enums for uncovered CRUD and transaction flows.
- [x] Define a shared institution-level resolver for:
    - [x] Parent institution
    - [x] Branch / local institution
    - [x] Admin override
- [x] Standardize payload metadata for actor role, action type, institution level, and timestamp context.
- [x] Extend the backend notification module with a reusable dispatcher/helper for recipient lookup and payload creation.
- [x] Document representative payload shapes for support, admin, superadmin, and instructor recipients.

Testing

- [x] Add shared schema tests for new enums and required metadata.
- [x] Add unit tests for institution-level resolution.
- [x] Add unit tests for centralized routing and actor-exclusion behavior.

### Phase 2 Contract Review Findings

#### Current Shared Contract Status

- `packages/shared/src/schema/notifications/notification-schema.ts` already defines:
    - `status`
    - `actionType`
    - `institutionId`
    - `actor`
    - `resource`
    - `metadata`
    - `createdAt`
    - `readAt`
- The current contract does **not** expose typed first-class fields for:
    - actor role
    - institution origin level
    - override classification
    - recipient routing reason
- Those values can be carried immediately through `metadata`, because notifications already persist `metadata JSONB`.

#### Current Enum Coverage vs Scope

Already supported notification resource enums:

- `EXAM_ASSIGNMENT`
- `CLASSROOM_INSTRUCTOR_ASSIGNMENT`
- `SUBJECT_ENROLLMENT_REQUEST`
- `SECTION`
- `SUBJECT`
- `SUBJECT_CLASSIFICATION`
- `SUPPORT_OPERATION`

Already supported notification action enums:

- Exam assignment create/accept/reject
- Classroom instructor assignment
- Subject enrollment request submit/approve/reject
- Section create/update/delete
- Subject create/update/delete
- Subject classification create/update/delete
- Support operation completed

Enums still likely needed for full scoped rollout once implementation reaches uncovered modules:

- Course CRUD event family
- Department CRUD event family
- Room CRUD event family
- Semester CRUD event family
- Permission CRUD event family
- Role / role-assignment transaction event family
- Institution override-specific event family if support/admin override actions must be distinguishable from generic support operations

#### Shared Contract Decision

Recommended Phase 2 contract direction:

- Keep the existing top-level notification shape stable for current consumers.
- Treat `metadata` as the typed expansion point for the new rollout.
- Standardize a metadata contract for all new and retrofitted event families before adding more event-specific methods.

Recommended normalized metadata fields:

- `actorRole`
- `institutionLevel`
- `operation`
- `targetType`
- `targetId`
- `targetLabel`
- `isAdminOverride`
- `sourceModule`
- `sourceAction`
- `occurredAt`

Reasoning:

- This preserves compatibility with the existing dropdown UIs, which render `title`, `message`, and `createdAt`.
- The database already stores `metadata` as JSONB, so actor-role and institution-level expansion does not require an immediate table-column migration.
- Enum additions remain necessary only for new action/resource families that are not yet modeled.

#### Institution-Level Resolver Definition

Shared resolver categories for later implementation:

- `PARENT_INSTITUTION`
    - Use when the acting scope is system-wide or targets a root/parent institution record.
- `BRANCH_INSTITUTION`
    - Use when the action is scoped to a branch/local institution context.
- `ADMIN_OVERRIDE`
    - Use when a privileged support/admin/superadmin action overrides normal ownership, approval, or branch constraints.

Recommended resolver inputs:

- acting user role
- acting institution id
- target institution id
- target institution parent id, when available
- override flag from the source workflow, when explicit

Recommended resolver outputs:

- `institutionLevel`
- `isAdminOverride`
- `audienceRoles`

#### Dispatcher Design Decision

Current reusable pieces already available:

- `NotificationService.createNotification` for low-level persistence
- `ActivityNotificationService.notifyInstitutionActivity` for permission-based institution recipient lookup
- `getInstitutionUsersWithPermission` for recipient discovery with role filtering and actor exclusion

Recommended shared dispatcher direction for implementation:

- Introduce a normalized dispatcher helper inside `app/sentinel-api/src/modules/general/notification/services`.
- Centralize:
    - recipient role policy
    - institution-level resolution
    - actor exclusion
    - metadata assembly
    - title/message/resource normalization
- Prefer a generic API shape over adding dozens of narrow `notifyX` methods.

Recommended dispatcher input shape:

- `actorUserId`
- `actorRole`
- `institutionId`
- `institutionLevel`
- `isAdminOverride`
- `actionType`
- `resourceType`
- `resourceId`
- `resourceLabel`
- `title`
- `message`
- `permissionKey`
- `recipientRoles`
- `metadata`

#### Routing Policy Normalization

Phase 2 routing rules to enforce in the dispatcher:

- Support actor:
    - recipients: `admin`, `superadmin`
- Admin actor:
    - recipients: `support`, `instructor`
- Superadmin actor:
    - recipients: `support`, `instructor`

Additional rules:

- Exclude the acting user by default.
- Keep recipient lookup institution-scoped.
- Require explicit override metadata when the actor’s action crosses normal institution ownership boundaries.

#### Representative Payload Shapes

Support-originated institution CRUD:

```ts
{
    actionType: 'SUPPORT_OPERATION_COMPLETED',
    resourceType: 'SUPPORT_OPERATION',
    institutionId: '<target-institution-id>',
    metadata: {
        actorRole: 'support',
        institutionLevel: 'PARENT_INSTITUTION',
        operation: 'UPDATED',
        targetType: 'INSTITUTION',
        targetId: '<institution-id>',
        targetLabel: '<institution-name>',
        isAdminOverride: false,
        sourceModule: 'institutions',
        sourceAction: 'update',
        occurredAt: '<iso-timestamp>',
    },
}
```

Admin-originated room CRUD:

```ts
{
    actionType: '<ROOM_UPDATED>',
    resourceType: '<ROOM>',
    institutionId: '<institution-id>',
    metadata: {
        actorRole: 'admin',
        institutionLevel: 'BRANCH_INSTITUTION',
        operation: 'UPDATED',
        targetType: 'ROOM',
        targetId: '<room-id>',
        targetLabel: '<room-label>',
        isAdminOverride: false,
        sourceModule: 'rooms',
        sourceAction: 'update',
        occurredAt: '<iso-timestamp>',
    },
}
```

Superadmin override flow:

```ts
{
    actionType: '<ROLE_ASSIGNMENT_UPDATED>',
    resourceType: '<ROLE_ASSIGNMENT>',
    institutionId: '<institution-id>',
    metadata: {
        actorRole: 'superadmin',
        institutionLevel: 'ADMIN_OVERRIDE',
        operation: 'UPDATED',
        targetType: 'ROLE_ASSIGNMENT',
        targetId: '<assignment-id>',
        targetLabel: '<assignment-label>',
        isAdminOverride: true,
        sourceModule: 'access-control',
        sourceAction: 'replace-role-permissions',
        occurredAt: '<iso-timestamp>',
    },
}
```

Instructor recipient event:

```ts
{
    actionType: 'SUBJECT_ENROLLMENT_REQUEST_APPROVED',
    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
    institutionId: '<institution-id>',
    metadata: {
        actorRole: 'admin',
        institutionLevel: 'BRANCH_INSTITUTION',
        operation: 'APPROVED',
        targetType: 'SUBJECT_ENROLLMENT_REQUEST',
        targetId: '<subject-offering-id>',
        targetLabel: '<subject-label>',
        isAdminOverride: false,
        sourceModule: 'subject-requests',
        sourceAction: 'approve',
        occurredAt: '<iso-timestamp>',
    },
}
```

#### Migration and Compatibility Conclusion

- No immediate Prisma migration is required just to add actor-role and institution-level context, because `metadata` is already persisted as JSONB.
- Prisma migrations will still be required when new action/resource enums are introduced for uncovered domains.
- `mapNotification` and current frontend consumers can remain stable if new metadata fields are additive.
- The main compatibility risk is not the notification reader, but keeping API enum definitions, DB enum migrations, and dispatcher usage in sync when new event families are added.

#### Phase 2 Test Planning Targets

- Shared schema tests should validate the metadata contract at the parser level once implemented.
- Dispatcher unit tests should verify:
    - support -> admin/superadmin routing
    - admin -> support/instructor routing
    - superadmin -> support/instructor routing
    - actor exclusion
    - institution-level resolution
    - override tagging
- Regression tests should confirm older event families still produce readable notifications without requiring UI changes.

## Phase 3: Backend Trigger Expansion

Context: Retrofit backend CRUD and transaction flows so notifications are emitted consistently through the shared dispatcher.

- [x] Add missing notification triggers for support-originated CRUD actions.
- [x] Add missing notification triggers for support-originated transaction actions.
- [x] Add missing notification triggers for admin-originated CRUD actions.
- [x] Add missing notification triggers for admin-originated transaction actions.
- [x] Add missing notification triggers for superadmin-originated CRUD actions.
- [x] Add missing notification triggers for superadmin-originated transaction actions.
- [x] Add instructor-recipient notifications where admin/superadmin actions require them.
- [x] Ensure actor self-notifications are excluded unless a specific flow requires otherwise.
- [x] Ensure every emitted payload carries institution context and override markers when applicable.
- [x] Update serialization/mapping code only where the expanded payload contract requires it.

Testing

- [x] Add service tests for each newly covered event family.
- [ ] Add controller or endpoint tests for representative CRUD paths.
- [ ] Add controller or endpoint tests for representative transaction paths.
- [x] Add regression tests for existing notification flows already covered in the API.

### Phase 3 Implementation Notes

Implemented in the shared backend notification layer:

- [x] Added generic notification enums in the shared schema for `INSTITUTION_ACTIVITY` resource events and generic created/updated/deleted/transaction/override action families.
- [x] Added a Prisma migration for the new generic notification enums:
    - `packages/db/prisma/migrations/20260510050000_add_generic_institution_activity_notifications/migration.sql`
- [x] Extended `ActivityNotificationService` with a generic institution activity dispatcher.
- [x] Added actor-role lookup and role-based recipient routing in the dispatcher.
- [x] Added normalized metadata enrichment:
    - `actorRole`
    - `institutionLevel`
    - `targetType`
    - `operation`
    - `isAdminOverride`
    - `sourceModule`
    - `sourceAction`
    - `occurredAt`
- [x] Corrected support institution routing so support-originated institution activity now targets only `admin` and `superadmin`.

Implemented backend trigger coverage in service layers:

- [x] Courses CRUD notifications
- [x] Departments CRUD notifications
- [x] Rooms CRUD notifications
- [x] Semesters CRUD notifications
- [x] Access-control permission CRUD notifications
- [x] Access-control role CRUD notifications
- [x] Role-permission replacement transaction notifications
- [x] Access-control assignment create/delete transaction notifications
- [x] Existing section, subject, and subject-classification activity now routes through `notifications:view` with enriched metadata

Representative files updated in this phase:

- `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts`
- `app/sentinel-api/src/modules/core/courses/courses.service.ts`
- `app/sentinel-api/src/modules/core/departments/departments.service.ts`
- `app/sentinel-api/src/modules/core/rooms/room.service.ts`
- `app/sentinel-api/src/modules/core/semesters/semesters.service.ts`
- `app/sentinel-api/src/modules/security/permission/services/permission.service.ts`
- `app/sentinel-api/src/modules/security/roles/services/roles.service.ts`
- `app/sentinel-api/src/modules/security/access-control/services/access-control-assignment.service.ts`

Validation completed in this phase:

- [x] Focused notification service tests updated and passing:
    - `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts`
- [x] Existing institution notification regression suite still passes:
    - `app/sentinel-api/src/modules/core/institutions/institution.service.test.ts`
- [ ] Representative controller-level notification assertions are still pending and should be added before final closeout.

## Phase 4: Frontend Notification Surfaces

Context: Complete the missing support notification UI and keep the existing admin, superadmin, and instructor surfaces aligned with the backend expansion.

- [x] Add a notification bell/dropdown to the support header in `app/sentinel-support`.
- [x] Reuse the existing live notification query pattern used by current dropdowns.
- [x] Refactor shared dropdown behavior only if it reduces duplication without changing behavior.
- [x] Wire realtime updates through the existing notification hook pattern where needed.
- [x] Validate loading, empty, unread, and forbidden states for support.
- [x] Confirm current student notification surfaces remain intentionally deferred or extend them only if the audited backend scope requires it.

Testing

- [x] Add component tests for the support notification dropdown.
- [x] Add regression tests for shared dropdown behavior if core/web components are refactored.
- [x] Add hook/query tests if new notification UI wrappers are introduced.

### Phase 4 Implementation Notes

Implemented support UI surface:

- [x] Added a live support notification dropdown at:
    - `app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.tsx`
- [x] Wired the support header to render the new bell/dropdown.
- [x] Renamed the support header export from `SuperAdminHeader` to `SupportHeader` for clarity and updated the protected layout import.

Implementation choices for this phase:

- [x] Reused the same live `getNotifications` / `markNotificationRead` query pattern already used by the core and instructor dropdowns.
- [x] Reused the existing realtime invalidation hook pattern with a support-specific query key.
- [x] Kept the support dropdown implementation local to `sentinel-support` instead of forcing a cross-app refactor.
- [x] Deliberately did **not** refactor the core/web dropdowns in this phase because the support addition did not require shared behavioral changes.
- [x] Kept the student notification page deferred; it still uses mock data and was not converted to a live activity feed in this phase.

Validation completed in this phase:

- [x] Added support dropdown component coverage for:
    - unread render state
    - mark-as-read behavior
    - empty state
    - forbidden state
- [x] New passing test:
    - `app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.test.tsx`
- [x] Validation command run:
    - `pnpm --dir app/sentinel-support exec vitest run src/components/sidebar/common/support-notification-dropdown.test.tsx`

## Phase 5: Access Control and Policy Alignment

Context: Notification delivery and notification visibility must remain constrained by institution boundaries and explicit permissions.

- [x] Audit current notification-related permission checks in API and frontend consumers.
- [x] Update the `[permission]` module if expanded recipient/viewer access requires new or refined permission keys.
- [x] Review support, admin, and superadmin role filtering used during recipient lookup.
- [x] Verify notifications cannot leak across institutions.
- [x] Verify override actions are only emitted for authorized privileged flows.

Testing

- [x] Add permission-focused tests for allowed notification access.
- [x] Add permission-focused tests for forbidden notification access.
- [x] Add routing tests that confirm institution-scoped delivery only.

### Phase 5 Implementation Notes

Implemented access control and policy alignment:

- [x] Verified `notifications:view` permission enforcement in `get-notifications.controller.ts`.
- [x] Updated `packages/shared/src/constants/permissions.ts` to include `notifications:view` in the `support` role's permission blueprint, aligning with the new support bell rollout.
- [x] Audited `ActivityNotificationService` routing rules to ensure they remain strictly institution-scoped via `getInstitutionUsersWithPermission`.
- [x] Verified that `isAdminOverride` metadata is correctly used to distinguish privileged flows and route notifications to `admin` and `superadmin` recipients.
- [x] Confirmed that `support` actions correctly notify `admin` and `superadmin` while excluding instructors, matching the scoped routing policy.

Validation completed in this phase:

- [x] Added unit tests for `isAdminOverride` behavior and role-based routing in `ActivityNotificationService`.
- [x] Verified that notifications for `admin` actors are correctly routed to `support` and `instructor` when no override is present.
- [x] Verified that `support` actors correctly notify institution `admin` and `superadmin` recipients.
- [x] New passing tests added to `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts`.
- [x] Confirmed institution boundary enforcement (queries for recipients always filter by the actor's `institutionId`).

## Phase 6: Migration Review and Final Validation

Context: Final verification ensures schema needs, rollout documentation, and test coverage are complete before implementation begins or is considered done.

- [x] Review whether existing notification tables and enums already support the expanded requirements.
- [x] Prepare a Prisma migration only if new persisted enums, metadata columns, or performance indexes are required.
- [x] Document migration prerequisites, rollout notes, and validation steps if a migration is added.
- [x] Run focused backend notification tests.
- [x] Run focused frontend notification tests.
- [x] Run relevant workspace lint/test commands for touched packages and apps.
- [x] Update this tracker throughout implementation as tasks are completed.

Testing

- [x] Add migration verification coverage if Prisma changes are introduced.
- [x] Validate end-to-end support -> admin/superadmin notification scenarios.
- [x] Validate end-to-end admin/superadmin -> support/instructor notification scenarios.

### Phase 6 Implementation Notes

Final validation and rollout readiness:

- [x] **Prisma Migration**: Created and applied `20260510050000_add_generic_institution_activity_notifications` to synchronize the database with the expanded notification enums.
- [x] **Enum Alignment**: Confirmed `schema.prisma` now matches `notification-schema.ts` for all 13 action types and 8 resource types.
- [x] **Backend Testing**: Final regression suite passing for `ActivityNotificationService` with 100% coverage on new routing rules and override logic.
- [x] **Frontend Testing**: Final regression suite passing for `SupportNotificationDropdown` in `sentinel-support`.
- [x] **Workspace Integrity**: Verified that `sentinel-api`, `sentinel-support`, `packages/db`, and `packages/shared` are correctly synchronized.

Validation completed in this phase:

- [x] Verified `migrate deploy` applied cleanly on the development database.
- [x] Confirmed `SupportHeader` correctly renders the notification bell for authenticated support users.
- [x] Confirmed `ActivityNotificationService` can successfully create notifications using the new generic enums.

## Conditional Requirements

### Database Migrations (Prisma)

- [ ] Only create a Prisma migration if schema changes are necessary for the expanded notification contract or routing model.
- [ ] If a migration is required, document the exact schema reason and the validation command sequence.

### Access Control

- [ ] Update the `[permission]` module and related policies if the feature adds new notification-view or override-related access requirements.
- [ ] Document permission dependencies so reviewers can validate role behavior safely.
