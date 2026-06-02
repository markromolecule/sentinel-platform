# Feat-003 — Sentinel End-to-End Telemetry, Audit, and Event-Tracking System

**One-sentence summary:** Build and instrument a comprehensive, hierarchy-aware telemetry system that hooks into all backend operations to record audit logs and broadcast real-time notifications scoped to parent institutions and child branches.

---

## Viable Options (1-3-1 Rule)

### Option A — Surgical Inline Instrumentation _(chosen)_

Update the controllers and services of all active domains to explicitly invoke `LogsService.createLog` or broadcast notifications via `ActivityNotificationService` during state changes. Enhance `getNotificationsData` to dynamically resolve child branch and parent school hierarchies so notifications can be queried seamlessly across scoping levels.

**Tradeoff:** Requires editing multiple controller/service entry points, but guarantees capturing rich, custom metadata (e.g. `gazeDirection`, `extraMinutes`, `rejectionReasons`, `importCount`) and maintains strict schema integrity.

### Option B — Global Controller/Middleware Interceptor

Implement a global HTTP middleware that intercepts all POST/PATCH/DELETE endpoints, extracts the payload/metadata, and automatically logs the mutations.

**Tradeoff:** Minimal effort to set up, but fails to capture granular internal events (e.g. background job heartbeats, AI parsing results, failed eligibility rejections) and easily leaks secure user credentials.

### Option C — PostgreSQL Database Mutation Triggers

Set up low-level PostgreSQL database triggers that auto-write to the `audit_logs` and `notifications` tables on any CRUD mutation.

**Tradeoff:** Database-centric and impossible to bypass, but cannot resolve session actors easily, lacks context of Hono application scopes, and fails to handle real-time notification socket dispatches cleanly.

### Why Option A

Option A is the only viable path to deliver a credible, high-integrity telemetry audit system. Modern web analytics and surveillance require precise details (like facial landmark parameters and security overrides) that exist only at the core service logic layer. Surgical inline instrumentation ensures that every log is context-rich, secure, and adheres strictly to the tenant boundary models of the platform.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should system events that happen on the client-side (e.g. candidate closes browser window, copies/pastes) be logged directly via a client-side telemetry endpoint, or should they be ingested via `/telemetry/ingestion` and translated to system logs?
> _Assumption:_ Ingest them via the `/telemetry/ingestion` endpoint, which then triggers `LogsService.createLog` with `resourceType: 'telemetry'`.

> [!NOTE]
> **Q2:** How should background worker queues (like LiveKit streams or Gemini scanning jobs) authenticate themselves when creating logs?
> _Assumption:_ Use a dedicated system actor UUID (`00000000-0000-0000-0000-000000000000`) for non-user-driven background system actions.

---

## Proposed Changes

---

### Phase 1 — Hierarchy-Aware Notification & Log Scoping Queries

**Goal:** Enhance the notification query repository and the controller to fetch events matching the parent/child institution boundary.

- [x] Create a utility helper `resolveRelatedInstitutions` inside a new helper file `app/sentinel-api/src/modules/general/notification/helper/resolve-related-institutions.ts` to resolve parent/child institution ids:
    - If parent, return parent ID + all child branch IDs.
    - If child branch, return child ID + parent ID.
    - If standalone, return its own ID.
- [x] Modify `app/sentinel-api/src/modules/general/notification/data/get-notifications.ts` to use Kysely `in` array scoping for the resolved related institutions instead of a single strict equality check.
- [x] Modify `app/sentinel-api/src/modules/general/notification/notification.service.ts` to wire this hierarchy scoping.
- [x] Write Vitest tests in `app/sentinel-api/src/modules/general/notification/tests/get-notifications-scoping.test.ts` asserting:
    - Parent institution queries yield child branch notifications.
    - Child branch queries yield parent institution alerts.
    - No database leaks occur across unrelated scopes.

**Migration required:** No

---

### Phase 2 — Identity & Access Domain Telemetry Instrumentation

**Goal:** Instrument the authentication, user CRUD, enrollment actions, onboarding eligibility, and whitelist workflows.

- [x] Modify `app/sentinel-api/src/modules/identity/auth/auth.service.ts` to record success, failed oauth/credentials logins, and registration actions via `LogsService.createLog`.
- [x] Modify `app/sentinel-api/src/modules/identity/users/services/user-crud.service.ts` to log profiles creations, updates, invitations, and deletions.
- [x] Modify `app/sentinel-api/src/modules/identity/enrollments/services/enrollments.service.ts` to dispatch notifications and logs on request, approval, rejection, instructor assignments, and unenrollments.
- [x] Modify `app/sentinel-api/src/modules/identity/onboarding/services/complete-student-onboarding.ts` to record completed student onboardings.
- [x] Write tests co-located under `app/sentinel-api/src/modules/identity/tests/identity-telemetry.test.ts` to verify log payloads.

**Migration required:** No

---

### Phase 3 — Core Academic Domain Telemetry Instrumentation

**Goal:** Instrument the core academic setup entities, including classroom configurations, instructor routing, program courses, department divisions, inheritance mappings, child branches linking, physical room configurations, and catalog mappings.

- [x] Modify `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts` to log classroom configurations.
- [x] Modify `app/sentinel-api/src/modules/core/classroom/services/classroom-instructor-management.service.ts` to trigger proctor roster assignments telemetry.
- [x] Modify internal course CRUD service maps to write `course.created`, `course.updated`, and `course.deleted` audit events.
- [x] Modify `app/sentinel-api/src/modules/core/departments/departments.service.ts` to record single and bulk faculty division creations/imports/deletes.
- [x] Modify `app/sentinel-api/src/modules/core/inheritance/services/effective-row-loader.ts` to trace recursive configuration scoping resolutions (`inheritance.resolved`).
- [x] Modify `app/sentinel-api/src/modules/core/institutions/services/institution-hierarchy.service.ts` to log linked branches and saving naming configurations.
- [x] Modify `app/sentinel-api/src/modules/core/rooms/services/create-room.service.ts` (and sibling update/delete/bulk services) to audit room setups.
- [x] Modify `app/sentinel-api/src/modules/core/sections/sections.service.ts` and `app/sentinel-api/src/modules/core/semesters/semesters.service.ts` to trace boundary updates.
- [x] Modify `app/sentinel-api/src/modules/core/subject-classification/controllers/create-subject-classification.controller.ts` (or mapped seeder scripts) to record subject classification updates (`classification.saved`).
- [x] Modify `app/sentinel-api/src/modules/core/subject-offerings/services/subject-offering-assignments.service.ts` and `app/sentinel-api/src/modules/core/subjects/services/subject-crud.service.ts` to capture catalog linkages.
- [x] Write automated tests in `app/sentinel-api/src/modules/core/tests/academic-telemetry.test.ts` to assert Kysely audit log inserts.

**Migration required:** No

---

### Phase 4 — Examination & Assessment Telemetry Ingestion

**Goal:** Wire access gatekeepers, waiting queue lobbies admissions, session heartbeat answers syncs, manual/timeout completions, dynamic score auto-grading evaluations, runtime tokens bypass, and exceptions overrides.

- [ ] Modify `app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts` to log verification results and candidate rejections.
- [ ] Modify `app/sentinel-api/src/modules/examination/assessment/services/assessment-access.ts` to trace test structures queries.
- [ ] Modify `app/sentinel-api/src/modules/examination/assign/services/create-exam-assignment.ts` to track proctor assignments and their response feedbacks.
- [ ] Modify `app/sentinel-api/src/modules/examination/builder/services/builder.service.ts` to trace workspace draft saves and publications.
- [ ] Modify `app/sentinel-api/src/modules/examination/configuration/services/save-exam-configuration.ts` to log secure configuration adjustments.
- [ ] Modify `app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts` to capture session starts, sync coordinates, and manual/timeout completes.
- [ ] Modify `app/sentinel-api/src/modules/examination/grading/services/grading.service.ts` to audit automated evaluations and manual score overrides.
- [ ] Modify `app/sentinel-api/src/modules/examination/history/controllers/get-exam-history-detail.controller.ts` to log proctor/student audit logs when reading answer sheet details (`history.viewed`).
- [ ] Modify lobby handlers (`check-in-lobby.ts`, `update-admissions.ts`) to log queue lobby check-ins and proctor admittance decisions.
- [ ] Modify `app/sentinel-api/src/modules/examination/runtime-access/controllers/update-exam-runtime-access.controller.ts` to log proctor overrides for runtime sessions bypass tokens (`exam_runtime.access_updated`).
- [ ] Modify overrides handler `student-overrides.service.ts` to track extra time and reconnect limits exceptions.
- [ ] Write integration test assertions in `app/sentinel-api/src/modules/examination/tests/exam-telemetry.test.ts` for all flows.

**Migration required:** No

---

### Phase 5 — Content, Infrastructure, Telemetry, Security & General platform Hooks

**Goal:** Inject logs in question banking collections, AI processing jobs, incident metrics reviews, LiveKit media, permission overrides, direct messaging conversations, and notifications read status.

- [ ] Modify `app/sentinel-api/src/modules/content/question/question.service.ts` to log questions archives and diff changes.
- [ ] Modify difficulty calibrations (`calibrate-question-difficulty.ts`) and collection mappings (`add-questions-to-collection.ts`) to write audit trail events.
- [ ] Modify `app/sentinel-api/src/modules/content/question-type/controllers/validate-question-type-content.controller.ts` to log format validation audits (`question_type.validated`).
- [ ] Modify `app/sentinel-api/src/modules/telemetry/settings/services/telemetry-settings.service.ts` to audit active rule updates.
- [ ] Modify `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts` and `incident-review.service.ts` to audit proctor flagged reviews and severity scales.
- [ ] Modify infrastructure authorization handlers (`audio-authorization.service.ts`, `livekit.service.ts`, `mediapipe.service.ts`) to log streaming tokens dispatching.
- [ ] Modify integration wrappers (`gemini.route.ts`) to record diagnostic triggers, prompt latency rates, and usage parameters.
- [ ] Modify `app/sentinel-api/src/modules/security/access-control/services/access-control-assignment.service.ts` and `permission.service.ts` to log custom mappings adjustments.
- [ ] Modify `app/sentinel-api/src/modules/general/messages/services/message-write.service.ts` to log conversation creations and messaging dispatching triggers (`conversation.created`, `message.sent`).
- [ ] Modify `app/sentinel-api/src/modules/general/notification/controllers/mark-notification-read.controller.ts` (or `NotificationService.markNotificationRead`) to trace notification marked read audits (`notification.marked_read`).
- [ ] Modify `app/sentinel-api/src/modules/general/analytics/services/map-analytics-kpis.ts` to log exports.
- [ ] Modify `app/sentinel-api/src/modules/general/calendar/services/calendar-write.service.ts` to log calendar CRUD events.
- [ ] Write tests under `app/sentinel-api/src/modules/general/tests/cross-cutting-telemetry.test.ts` verifying event payloads.

**Migration required:** No

---

### Phase 6 — E2E Verification & Review

**Goal:** Validate Monorepo builds, execute complete testing suites, and guarantee absolute production compliance.

- [ ] Execute complete testing runs in Turborepo format:
    ```bash
    pnpm test
    ```
- [ ] Audit standard coding formatting guidelines:
    ```bash
    pnpm lint
    pnpm format:check
    ```
- [ ] Ensure Swagger/Scalar documentation compiles cleanly under the server:
    ```bash
    pnpm --dir app/sentinel-api build
    ```

---

## Files Touched Summary

| File Path                                                                                  | Action           | Description                                   |
| :----------------------------------------------------------------------------------------- | :--------------- | :-------------------------------------------- |
| `app/sentinel-api/src/modules/general/notification/helper/resolve-related-institutions.ts` | **[NEW]**        | Scoping resolver helper                       |
| `app/sentinel-api/src/modules/general/notification/data/get-notifications.ts`              | **[MODIFY]**     | Support parent-child dynamic arrays           |
| `app/sentinel-api/src/modules/general/notification/notification.service.ts`                | **[MODIFY]**     | Wire related institutions parameters          |
| `app/sentinel-api/src/modules/identity/auth/auth.service.ts`                               | **[MODIFY]**     | Login telemetry hooks                         |
| `app/sentinel-api/src/modules/identity/users/services/user-crud.service.ts`                | **[MODIFY]**     | User profiles CRUD logs                       |
| `app/sentinel-api/src/modules/identity/enrollments/services/enrollments.service.ts`        | **[MODIFY]**     | Roster mappings telemetry                     |
| `app/sentinel-api/src/modules/identity/onboarding/services/complete-student-onboarding.ts` | **[MODIFY]**     | Completing eligibility steps                  |
| `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts`          | **[MODIFY]**     | Classroom setup event logs                    |
| `app/sentinel-api/src/modules/core/departments/departments.service.ts`                     | **[MODIFY]**     | Division setups logging                       |
| `app/sentinel-api/src/modules/core/rooms/services/create-room.service.ts`                  | **[MODIFY]**     | Physical rooms adjustments telemetry          |
| `app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts`    | **[MODIFY]**     | Eligibility check failures logging            |
| `app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts`        | **[MODIFY]**     | Heartbeats and attempt sessions telemetry     |
| `app/sentinel-api/src/modules/telemetry/storage/services/incident-review.service.ts`       | **[MODIFY]**     | Incidents status checks                       |
| `*/*.test.ts`                                                                              | **[NEW/MODIFY]** | Co-located unit and integration testing files |

---

## Verification Plan

### Automated Tests

Execute absolute testing validations for general telemetry modules:

```bash
pnpm --dir app/sentinel-api test src/modules/general/notification
pnpm --dir app/sentinel-api test src/modules/general/logs
```

### Manual Verification

1. Call user profile onboarding mutations. Verify `audit_logs` record exists with scoping variables intact.
2. Authenticate as a **Parent School Administrator**. Fetch `GET /notifications` and verify that the feed aggregates notification alerts from all underlying child branch locations.
3. Query `/logs/activity` for a **Child Branch Proctor**. Verify it returns an empty set for logs generated outside their institution scope.
4. Verify complete system logs display in the administrative analytics dashboard.
