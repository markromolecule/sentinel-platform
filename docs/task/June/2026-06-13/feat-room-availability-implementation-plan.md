# Implementation Plan: Room Availability & Exam/Question Bank Access for Administrators

Implement dynamic room status transitions, exam-category-based room assignment routing (Quiz/Activity vs Midterm/Final), replication of Exam & Question Bank portals in the Administrator app (`sentinel-core`), and toggleable sharing of question collections between instructors in `sentinel-web`.

## Pre-Planning

- **Task Summary:** Add dynamic room status recalculation, major-exam room routing, admin views for exams and questions, and sharing of question collections.
- **Relevant Files:**
    - `packages/db/prisma/schema.prisma`
    - `app/sentinel-api/src/modules/examination/exams/services/create-exam.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/update-exam.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/update-exam-status.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/delete-exam.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
    - `app/sentinel-api/src/modules/content/question-bank/data/get-question-bank-collections.ts`
- **Database Tables:** `rooms`, `exams`, `question_bank_collections`, `user_profiles`
- **Migration Required:** Yes (`add-exam-category`)

---

## 1-3-1 Solution Options

### Option 1: Manual/Reactive Event-Driven Sync (Recommended)

- **Description:** Automatically recalculate `rooms.status` using a shared service handler invoked inside exam mutations (`create`, `update`, `delete`, `updateStatus`). Store `exam_category` as a Prisma Enum (`CLASSROOM`, `MAJOR`). Replicate Exams/Questions in `sentinel-core` by adding role-based/department-based internal filtering directly to existing endpoints, utilizing existing frontend hooks.
- **Tradeoff:** Cleanest fit with existing codebase architecture and fast to implement, but relies on API-level execution to prevent status drift.

### Option 2: Fully Derived Dynamic Room Availability (Query-Time)

- **Description:** Remove the `status` enum column from the `rooms` table (or make it derived) and compute room occupancy on the fly via a `LEFT JOIN` on active/scheduled exams during the current/requested time window.
- **Tradeoff:** 100% accurate with no risk of drift, but increases query complexity, requires database schema changes, and degrades API search/filter performance.

### Option 3: Database Trigger Sync + Separate Admin Endpoints

- **Description:** Enforce room status synchronization using PostgreSQL database triggers on the `exams` table. Keep `exam_category` as a string column to avoid schema migrations. Build a separate, standalone API controller for administrator-only exam and question bank access.
- **Tradeoff:** Guarantees database-level state integrity and separates concerns, but makes local testing, migrations, and code maintenance much more complex.

### Chosen Option

We select **Option 1**. It is the most maintainable and idiomatic choice for this monorepo, avoiding database triggers (Option 3) and avoiding high-overhead dynamic query joins (Option 2). It leverages the existing database transaction wrappers (`executeExamTransaction`) and keeps routing type-safe.

---

## Proposed Changes

### Phase 1: Database Schema Migration

**Goal:** Add the new `exam_category` enum and field to the `exams` model.

- [x] Modify [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma) to add `exam_category` enum and the corresponding field to the `exams` model:

    ```prisma
    enum exam_category {
      CLASSROOM
      MAJOR

      @@schema("public")
    }

    model exams {
      ...
      exam_category  exam_category?  @default(CLASSROOM)
    }
    ```

- [x] Run `npx prisma migrate dev --name add-exam-category --schema=packages/db/prisma/schema.prisma` to generate the migration and update client/Kysely interfaces.
- [x] Write unit tests for the schema compatibility helpers.

**Migration required:** Yes
**Rollback Note:** To roll back, delete the generated migration folder, remove the `exam_category` enum and field from `schema.prisma`, and run `npx prisma migrate dev --name remove-exam-category --create-only` followed by applying the migration.

### Phase 2: API Modifications for Exam Category & Scoping

**Goal:** Update backend services and DTOs to support `examCategory` and role-based department/instructor scoping.

- [x] Update [exam-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/exam-schema.ts) and [exam.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/exam.dto.ts) to define `examCategory` as `z.enum(['CLASSROOM', 'MAJOR'])` and include it in `examSummarySchema`, `createExamBodySchema`, and `updateExamBodySchema`.
- [x] Modify [build-exam-write-values.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/build-exam-write-values.ts) to map `examCategory` to `exam_category` in `buildCreateExamValues` and `buildUpdateExamValues`.
- [x] Modify [map-exam-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts) to include `examCategory: record.exam_category ?? null` in `mapExamSummaryResponse`.
- [x] Update [get-exams.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exams.ts) to select `e.exam_category` and support filtering by `departmentId` if provided.
- [x] Update [get-exams.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts) to automatically detect the user's role and filter by their profile `departmentId` if they are an `admin`.
- [x] Write Vitest unit tests in `app/sentinel-api/src/modules/examination/exams/services/get-exams.test.ts` to verify the department-based scoping logic.

**Migration required:** No

### Phase 3: Automatic Room Status Synchronization

**Goal:** Create a service function that recalculates the room status dynamically on exam creation, update, and deletion, and call it.

- [x] Create a new service file [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts) to perform room status updates based on outstanding non-completed/non-archived exams:

    ```ts
    import { type DbClient } from '@sentinel/db';

    export async function recalculateRoomStatus(dbClient: DbClient, roomId: string) {
        const room = await dbClient
            .selectFrom('rooms')
            .select(['status'])
            .where('room_id', '=', roomId)
            .executeTakeFirst();
        if (!room || room.status === 'MAINTENANCE') return;

        const activeExam = await dbClient
            .selectFrom('exams')
            .select(['exam_id'])
            .where('room_id', '=', roomId)
            .where('status', 'not in', ['COMPLETED', 'ARCHIVED'])
            .executeTakeFirst();

        const nextStatus = activeExam ? 'ASSIGNED' : 'AVAILABLE';
        if (room.status !== nextStatus) {
            await dbClient
                .updateTable('rooms')
                .set({ status: nextStatus })
                .where('room_id', '=', roomId)
                .execute();
        }
    }
    ```

- [x] Integrate room status recalculation into [create-exam.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/create-exam.ts) inside `executeExamTransaction`.
- [x] Integrate room status recalculation into [update-exam.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/update-exam.ts) and [update-exam-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/update-exam-status.ts).
- [x] Integrate room status recalculation into [delete-exam.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/delete-exam.ts) (fetching the record to find `room_id` prior to deletion).
- [x] Add unit tests in `app/sentinel-api/src/modules/core/rooms/room.service.test.ts` to verify status transitions.

**Migration required:** No

### Phase 4: Sharing Question Collections

**Goal:** Expose collection sharing capabilities via `is_public` and filter collections appropriately.

- [x] Update [get-question-bank-collections.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/get-question-bank-collections.ts) to filter collections by `createdBy` (supporting returning own collections OR public collections of the same institution).
- [x] Modify [get-question-bank-collections.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/controllers/get-question-bank-collections.controller.ts) to pass `createdBy: user.id` if the caller's role is `instructor`, or filter by `departmentId` if role is `admin`.
- [x] Re-expose the shared toggle component in the collections frontend view `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/page.tsx` allowing instructors to toggle public sharing (`isPublic` in `updateCollection`).

**Migration required:** No

### Phase 5: Replicating Exam & Question Bank in sentinel-core, Permissions Setup, & Updating Forms

**Goal:** Replicate Exam and Question Bank pages in `sentinel-core` (for Admin and Superadmin roles), configure dynamic RBAC permission-guards, and hide the room picker from instructors.

- [x] Update [core-admin-capability-map.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts) to define `exams` and `question-bank` capabilities:
    - Allowed roles: `['admin', 'superadmin']`
    - Required view permissions: `['assessments:view']`
    - Required action permissions: `['assessments:manage']`
- [x] Update [core-admin-nav-config.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts) to add sidebar items for `exams` and `question-bank` inside the `Management` section.
- [x] Modify API controllers (e.g., `get-exams.controller.ts`, `get-question-bank-collections.controller.ts`, etc.) to pass Hono Context `c` instead of static `role` to `assertAssessmentReadAccess` and `assertAssessmentAccess`, enabling dynamic database-driven RBAC checking.
- [x] Replicate route files from `app/sentinel-web/src/app/(protected)/(instructor)/exams/` to [sentinel-core route directory](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/exams/>).
- [x] Replicate route files from `app/sentinel-web/src/app/(protected)/(instructor)/question/` to [sentinel-core route directory](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/>).
- [x] Replicate feature folders `/exams` and `/questions` to `app/sentinel-core/src/features/`.
- [x] Update the instructor exam creation/edit forms in `sentinel-web` (`BasicInfoFields`) to hide the `RoomField` entirely, ensuring room selection is removed for instructors.
- [x] Add a Room Assignment popup/dialog action to the admin exam list in `sentinel-core` allowing admins to assign rooms to `MAJOR` exams.

---

## Verification Plan

### Automated Tests

- [x] Run `pnpm --dir app/sentinel-api test` to verify Kysely queries, service tests, and room availability logic.
- [x] Run `pnpm lint` and `pnpm format:check` to ensure code formatting complies.

### Manual Verification

- [x] Log in to `sentinel-web` as an instructor, create an exam, and verify that the Room Picker is not present, and that `exam_category` defaults to `CLASSROOM`.
- [x] Log in to `sentinel-core` as an administrator, navigate to the replicated Exams list, select a `MAJOR` exam without a room, and click "Assign Room" to choose an available room.
- [x] Verify that the assigned room's status dynamically transitions to `ASSIGNED` in the Room Management page.
