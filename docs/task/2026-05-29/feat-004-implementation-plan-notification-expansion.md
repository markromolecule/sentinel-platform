# Feat-004 — Sentinel End-to-End Dynamic Notification Expansion

**One-sentence summary:** Build and instrument an end-to-end, hierarchy-aware notification system that hooks into all active backend CRUD operations and transactions across Sentinel's apps to broadcast real-time role-based notifications scoped to parent and child institutions.

---

## Viable Options (1-3-1 Rule)

### Option A — Inline Controller & Service Instrumentation via `ActivityNotificationService` _(chosen)_

Surgically update active controllers and services in `@app/sentinel-api` to trigger notifications via `ActivityNotificationService` alongside their existing audit log hooks. This leverages the dynamic parent-child hierarchy scoping from Phase 1 of telemetry and ensures rich contextual metadata (acting role, action type, institution level) is captured directly at the business logic boundary.

**Tradeoff:** Requires editing multiple controller and service files, but guarantees high safety, precise actor role context, and seamless real-time web-socket dispatches.

### Option B — Low-level Prisma/Kysely Query Interceptor Middleware

Hook into the database ORM query middleware layer to dynamically scan queries. Whenever an insert/update/delete operation is processed on specific tables (e.g. `exams`, `rooms`, `departments`), automatically synthesize a notification.

**Tradeoff:** Minimizes changes to individual service files, but completely lacks access to HTTP session details (such as actor roles, proctor overrides, or specific validation reasons).

### Option C — Client-side Dispatch Events

Instruct the Next.js and React Native frontends to trigger an API endpoint (`POST /notifications`) directly whenever they perform mutations on the client side.

**Tradeoff:** Decouples the notification triggers from the backend database, but is insecure, easy to bypass, and duplicates event-dispatching logic across five different client codebases.

### Why Option A

Option A is the only approach that complies with the strict multi-tenant boundary models and role-based access rules. A core tenant in Sentinel is that notification visibility must respect the institution hierarchy (e.g., Parent administrators can view notifications of local branch activities, but child branch proctors cannot see parent events). Option A allows us to resolve the correct hierarchy scopes inside the service layer using the validated session actor context.

---

## User Review Required

> [!IMPORTANT]
> **R1: Real-time Websocket Dispatching**
> We will configure `ActivityNotificationService` to automatically broadcast notifications over existing event-emitter queues. This will alert active connected users immediately.
>
> **R2: Notification Recipient Filtering**
> We enforce the role-based scoping rules specified in the requirements:
>
> - Support actions notify Admins and Superadmins.
> - Admin / Superadmin actions notify Support and Instructors.
> - Student overrides and lobby check-ins notify Instructors / Proctors.

---

## Open Questions

> [!NOTE]
> **Q1:** Should student-driven events, such as checking into the lobby or starting an exam, be classified as regular institution notifications, or should they be specifically scoped to the assigned proctor of the exam?
> _Assumption:_ Scoped to the institution of the exam, notifying all proctors assigned to that specific exam or classroom.

---

## Proposed Changes

---

### Phase 1 — Auditing and Enhancing `ActivityNotificationService`

**Goal:** Ensure the backend `ActivityNotificationService` has mapped handlers for all general CRUD activity actions, carrying role-based metadata, action types, and institution levels.

#### [MODIFY] [activity-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts)

- Add new helper wrappers to dispatch hierarchy-aware institution activities:
    - `notifyInstitutionActivityCreated`
    - `notifyInstitutionActivityUpdated`
    - `notifyInstitutionActivityDeleted`
    - `notifyInstitutionActivityTransaction`
    - `notifyInstitutionActivityOverride`
- Each handler must take an `actorRole` ('SUPPORT' | 'ADMIN' | 'SUPERADMIN' | 'INSTRUCTOR' | 'STUDENT') and resolve target recipients based on role mapping rules.

#### [NEW] [activity-notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts)

- Write tests confirming:
    - Role mapping rules: Support mutations successfully notify admins/superadmins.
    - Scoping rules: Admin mutations notify instructors/support.
    - Dynamic institution level tags ('PARENT' | 'BRANCH' | 'ADMIN_OVERRIDE') are embedded in the notification metadata.

**Migration required:** No

---

### Phase 2 — Identity & Access Control Domain Notifications

**Goal:** Instrument the registration, whitelist, onboarding, and user management services with notification dispatches.

#### [MODIFY] [user-crud.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/services/user-crud.service.ts)

- Trigger `notifyInstitutionActivityCreated` when a user is invited or created.
- Trigger `notifyInstitutionActivityUpdated` on profile changes.
- Trigger `notifyInstitutionActivityDeleted` on profile purges.

#### [MODIFY] [student-whitelist.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/student-whitelist/student-whitelist.service.ts)

- Dispatch notifications on single whitelist creation, bulk imports, updates, and whitelist purges.

#### [MODIFY] [complete-student-onboarding.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/onboarding/services/complete-student-onboarding.ts)

- Dispatch a notification upon successful student onboarding completion.

#### [NEW] [identity-notifications.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/tests/identity-notifications.test.ts)

- Co-locate tests to assert whitelist imports, user creation, and onboarding steps trigger the expected database notifications.

**Migration required:** No

---

### Phase 3 — Core Academic Domain Notifications

**Goal:** Instrument classrooms, courses, departments, rooms, sections, semesters, and offerings setup with CRUD notifications.

#### [MODIFY] [classroom-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts)

- Trigger section-based and instructor notifications on classroom setups and instructor assignments.

#### [MODIFY] [departments.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/departments/departments.service.ts)

- Add notifications to `createDepartment`, `updateDepartment`, `deleteDepartment`, and bulk imports.

#### [MODIFY] [create-room.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/create-room.service.ts)

- Instrument `createRoom`, `updateRoom`, `deleteRoom`, and bulk creation controllers to broadcast facility changes.

#### [MODIFY] [sections.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/sections/sections.service.ts)

- Audit and ensure `notifySectionCreated`, `notifySectionUpdated`, and `notifySectionDeleted` are triggered correctly.

#### [MODIFY] [semesters.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/semesters.service.ts)

- Dispatch notifications on semesters creation, updates, and deactivations.

#### [NEW] [academic-notifications.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/tests/academic-notifications.test.ts)

- Co-locate testing files to ensure academic CRUD operations emit notifications.

**Migration required:** No

---

### Phase 4 — Examination & Assessment Domain Notifications

**Goal:** Wire notifications for eligibility checks, lobby admittance, proctor feedback, overrides, exam schedules, and grading.

#### [MODIFY] [access-gatekeeper.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts)

- Trigger a notification if eligibility fails under security blockades.

#### [MODIFY] [create-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts)

- Audit proctor dispatching events and confirm that `notifyExamAssignmentCreated` triggers successfully.

#### [MODIFY] [respond-to-exam-assignment.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/assign/services/respond-to-exam-assignment.ts)

- Audit proctor responses to trigger `notifyExamAssignmentAccepted` or `notifyExamAssignmentRejected`.

#### [MODIFY] [builder.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/builder/services/builder.service.ts)

- Trigger notifications upon publishing an exam to let students and assigned proctors know.

#### [MODIFY] [session-manager.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts)

- Dispatch notifications when a student starts or completes/submits an exam session.

#### [MODIFY] [student-overrides.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/student-overrides/student-overrides.service.ts)

- Dispatch notifications when a proctor grants extra time or adjusts reconnect boundaries (`override.time_granted`, `override.reconnect_adjusted`).

#### [MODIFY] [check-in-lobby.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/check-in-lobby.ts)

- Dispatch notifications to instructors when a student checks into the lobby queue.

#### [MODIFY] [update-admissions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/update-admissions.ts)

- Dispatch notifications to the student when a proctor approves or rejects queue entry.

#### [NEW] [exam-notifications.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/tests/exam-notifications.test.ts)

- Write tests mapping waiting lobby admittance transitions and student overrides dispatches.

**Migration required:** No

---

### Phase 5 — Content, Telemetry, Security & General Utilities Notifications

**Goal:** Instrument question banking collections, telemetry incidents detection, access control mappings, calendar schedules, and messaging.

#### [MODIFY] [question.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/question.service.ts)

- Broadcast notification alerts when questions are updated or archived.

#### [MODIFY] [incident-persistence.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts)

- Dispatch high-priority proctoring incident notifications on security breaches.

#### [MODIFY] [access-control-assignment.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/security/access-control/services/access-control-assignment.service.ts)

- Audit security scoping overrides to notify affected target users.

#### [MODIFY] [calendar-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts)

- Ensure calendar events dispatch dynamic institution-wide notifications.

#### [NEW] [utility-notifications.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/tests/utility-notifications.test.ts)

- Assert that calendar events and proctoring incidents trigger correct notifications.

**Migration required:** No

---

### Phase 6 — Frontend Bell Verification & E2E Validation

**Goal:** Verify frontend application components, specifically checking the notification bell in the Support app header, and validate full suite compliance.

#### [MODIFY] [support-header.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/support/support-header.tsx)

- Ensure the `<SupportNotificationDropdown />` component is integrated perfectly and renders on the right side of the header.

#### [MODIFY] [support-notification-dropdown.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/components/sidebar/common/support-notification-dropdown.tsx)

- Resolve any TypeScript lint warnings or dependencies related to the query keys and the realtime websocket subscription hook (`useNotificationRealtime`).

**Verification to perform:**

- Run standard linting checks:
    ```bash
    pnpm lint
    pnpm format:check
    ```
- Run the full test suite:
    ```bash
    pnpm test
    ```

---

## Files Touched Summary

| File Path                                                                                     | Action       | Description                                   |
| :-------------------------------------------------------------------------------------------- | :----------- | :-------------------------------------------- |
| `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts` | **[MODIFY]** | Add multi-role dispatch helpers               |
| `app/sentinel-api/src/modules/identity/users/services/user-crud.service.ts`                   | **[MODIFY]** | User management notification dispatches       |
| `app/sentinel-api/src/modules/identity/student-whitelist/student-whitelist.service.ts`        | **[MODIFY]** | Whitelist changes notifications               |
| `app/sentinel-api/src/modules/core/departments/departments.service.ts`                        | **[MODIFY]** | Faculty division creation notifications       |
| `app/sentinel-api/src/modules/core/rooms/services/create-room.service.ts`                     | **[MODIFY]** | Physical rooms notification tracking          |
| `app/sentinel-examination/lobby/services/check-in-lobby.ts`                                   | **[MODIFY]** | Lobby entrance notifications                  |
| `app/sentinel-examination/student-overrides/student-overrides.service.ts`                     | **[MODIFY]** | Proctor adjustments telemetry overrides       |
| `app/sentinel-support/src/components/sidebar/support/support-header.tsx`                      | **[MODIFY]** | Confirm bell rendering integration            |
| `*/*.test.ts`                                                                                 | **[NEW]**    | Co-located unit and integration testing files |

---

## Verification Plan

### Automated Tests

Validate general notification backend systems:

```bash
pnpm --dir app/sentinel-api test src/modules/general/notification
```

### Manual Verification

1. Authenticate as a **Support Operator**. Create a new physical Testing Room in the support portal. Verify that a notification carries the actor role `SUPPORT`, resource type `SUPPORT_OPERATION`, and the correct institution level.
2. Authenticate as an **Institution Admin**. Adjust an exam configuration override. Verify that a notification triggers successfully for all mapped instructors within that institution scope.
3. Open the Support Portal app. Verify that the header displays the notification bell dropdown, showing recent operations in real-time.
