# Goal: Classroom Archiving Feature

To add an "Archive" capability for classrooms (`class_groups`), update permissions in the support portal, think of how the system will handle archive, and prepare the backend architecture for archiving.

---

## 1-3-1 Rule Options

### 3 Viable Options

#### Option 1: Soft Delete with `archived_at` Timestamp (Recommended)

- **Approach:** Add an `archived_at` timestamp column to the `class_groups` table. Filter out archived records in default queries (where `archived_at IS NULL`), while allowing explicit retrieval via `includeArchived=true` or `status=archived` query parameters.
- **Tradeoff:** Standard, clean pattern that retains relationships and audit trails, but requires updating existing read query builders.

#### Option 2: State/Status Enum Column (`status: ACTIVE | ARCHIVED`)

- **Approach:** Add a `status` column to the `class_groups` table with an enum or text type.
- **Tradeoff:** Explicit state handling, but does not provide an audit timestamp of when the archive happened without adding a secondary column.

#### Option 3: Separate Archive Table (`archived_class_groups`)

- **Approach:** Create a separate database table for archived classrooms and move records into it.
- **Tradeoff:** Active table remains small and fast, but adds extreme schema complexity, breaks active foreign key relationships (enrollments, exams), and makes unarchiving difficult.

### 1 Recommended Best Option

We choose **Option 1** as the best option. It is the industry standard for archiving, preserves all historical relationships (exams, attempts, enrollments), captures the exact time of deactivation, and aligns with patterns already present in other models (like `question_bank_questions`).

---

## User Review Required

> [!IMPORTANT]
>
> - Archiving a classroom will hide it from the default list in both student and instructor dashboards.
> - We should restrict any modifications (enrollments, posting announcements, launching exams) within archived classrooms.

---

## Proposed Changes

### Phase 1: Database Migration & Schema Updates

**Goal:** Update the database model to support a classroom archiving timestamp.

- [x] Modify [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma) to add `archived_at DateTime? @db.Timestamptz(6)` to the `class_groups` model.
- [x] Run the migration:
    ```bash
    pnpm --dir packages/db prisma migrate dev --name add_archived_at_to_classrooms
    ```
- [x] Verify generated TypeScript client types in `packages/db/src/generated`.

**Migration required:** Yes — adding a new column to the `class_groups` table.
**Rollback step:** `ALTER TABLE public.class_groups DROP COLUMN archived_at;`

---

### Phase 2: RBAC & Permissions Updates

**Goal:** Register archiving permissions and update role matrices in `sentinel-support`.

- [x] Modify [permissions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/permissions.ts) to define the `classrooms:archive` permission and assign it to the default `support`, `superadmin`, `admin`, and `instructor` roles.
- [x] Modify [constants.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/control/_lib/presenters/constants.ts>) to add `archive` to the `ACTION_SORT_ORDER`.
- [x] Seed the new permissions to the database:
    ```bash
    pnpm db:seed:support
    ```
- [x] Write unit tests to verify role capability mapping.

**Migration required:** No (seeding only)

---

### Phase 3: Backend Inactivation Logic & API Endpoints

**Goal:** Update classroom queries to filter archives by default, and expose archive/unarchive endpoints.

- [x] Modify [classroom-access-query.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-access-query.service.ts) to filter out classrooms where `archived_at IS NOT NULL` by default.
- [x] Implement `archiveClassroom` and `unarchiveClassroom` methods in `classroom.service.ts` that set or clear `archived_at` respectively.
- [x] Register new routes in `classroom.routes.ts`:
    - `PATCH /classrooms/:id/archive` (requires `classrooms:archive`)
    - `PATCH /classrooms/:id/unarchive` (requires `classrooms:archive`)
- [x] Co-locate controller unit tests (e.g., `archive-classroom.controller.test.ts`).

**Migration required:** No

---

## Verification Plan

### Automated Tests

- `pnpm --dir app/sentinel-api test classroom`

### Manual Verification

1. Open the support portal and verify `classrooms:archive` is displayed in the role matrix permissions list.
2. In the core panel, archive a classroom. Verify that it disappears from the active classrooms list.
3. Fetch classrooms via the API with `includeArchived=true` and confirm the archived classroom is returned with a valid timestamp in `archived_at`.
