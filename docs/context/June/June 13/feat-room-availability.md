# Feature: Room Availability & Exam/Question Bank Access for Administrators

**Date:** 2026-06-13
**Apps Affected:** `sentinel-web` (instructor UI), `sentinel-core` (admin UI)
**API:** `sentinel-api` — `core/rooms`, `examination/exams`

---

## 1. Goals

This feature covers three distinct but related improvements:

### 1.1 Dynamic Room Status

The `rooms` table (Prisma model: `rooms`) already carries a `status` field with enum values:

- `AVAILABLE` — room is free
- `ASSIGNED` — room is currently in use by a scheduled exam
- `MAINTENANCE` — room is offline

Currently, this status is **manually managed** by admins via `PATCH /rooms/:id`. The goal is to make the Room page on `sentinel-core` **automatically reflect** whether a room is occupied by an active exam, so administrators see real-time availability without manual intervention.

### 1.2 Room Assignment — Exam Type Awareness

Currently, when an instructor creates an exam, they may optionally supply a `roomId`. The new flow removes room selection from the instructor creation form entirely and introduces **exam-type-based routing**:

| Exam Scope                  | Who Assigns Room?                   | When?                             |
| --------------------------- | ----------------------------------- | --------------------------------- |
| Quiz / Activity / Long Quiz | Nobody — no room required           | Room is classroom-based only      |
| Midterm Exam / Final Exam   | Administrator (via `sentinel-core`) | After instructor creates the exam |

> **Note:** The `exams` table does **not** have an explicit `exam_type` or `exam_category` column yet. The intent is to introduce this concept (likely via a new enum or label field) so the system can distinguish "classroom exams" from "major examinations". This will require a schema migration.

### 1.3 Replicate Exam & Question Bank Pages in `sentinel-core`

The full Exam and Question Bank experience that exists in `sentinel-web` (instructor view) must be replicated in `sentinel-core` (admin view) with an **expanded scope**:

- Admins see **all** exams and question banks created by all instructors under their department — not just their own
- Feature parity must be maintained: layout, components, styling, sub-pages, functionality, and data models must be identical except for the scope filter

---

## 2. Current Architecture

### 2.1 Database Schema

**`rooms` table** (`packages/db/prisma/schema.prisma` — line 650):

```prisma
model rooms {
  room_id            String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  room_name          String             @db.VarChar(100)
  room_code          String?            @db.VarChar(50)
  room_number        String             @db.VarChar(50)
  room_type          room_type          @default(LECTURE)   // LECTURE | LABORATORY | VIRTUAL
  status             room_status        @default(AVAILABLE) // AVAILABLE | ASSIGNED | MAINTENANCE
  institution_id     String?            @db.Uuid
  exams              exams[]
  ...
}
```

**`exams` table** (`schema.prisma` — line 1258):

```prisma
model exams {
  exam_id         String       @id ...
  room_id         String?      @db.Uuid      // nullable — not all exams need a room
  room            rooms?       @relation(...)
  scheduled_date  DateTime?    @db.Timestamptz(6)
  end_date_time   DateTime?    @db.Timestamptz(6)
  duration_minutes Int         @default(60)
  status          exam_status? @default(DRAFT)
  class_group_id  String?      @db.Uuid
  institution_id  String?      @db.Uuid
  ...
}
```

**`exam_status` enum:**
`DRAFT | PUBLISHED | ARCHIVED | SCHEDULED | AVAILABLE | COMPLETED | IN_PROGRESS | UPCOMING | ACTIVE`

**`room_status` enum:**
`AVAILABLE | ASSIGNED | MAINTENANCE`

### 2.2 Existing Room Availability Check (API)

`sentinel-api/src/modules/examination/exams/services/assert-exam-room-availability.ts`

- Uses a Kysely query to detect **time-window conflicts** for a given `room_id`
- Conflict = another exam on the same room where time intervals overlap:
    ```
    existing.end_date_time > new.start AND existing.start < new.end
    ```
- Falls back to `scheduled_date + duration_minutes` when `end_date_time` is null
- Throws `HTTP 409` with message: `"Selected room is unavailable for the chosen schedule because another exam is already assigned to it."`
- Called inside `update-exam.ts` when `roomId` changes, `institutionId` changes, or the schedule shifts

### 2.3 Room CRUD API

Module: `sentinel-api/src/modules/core/rooms/`

- `GET    /rooms` — list all rooms filtered by `institutionId` and optional `search`
- `POST   /rooms` — create room
- `PATCH  /rooms/:id` — update room (including `status`)
- `DELETE /rooms/:id` — delete single
- `DELETE /rooms` (bulk) — bulk delete by `ids[]`
- `POST   /rooms/bulk` — bulk create

The `updateRoomService` (file: `services/update-room.service.ts`) supports setting `status` directly:

```ts
...(data.status !== undefined ? { status: data.status } : {})
```

This is the hook point for automatic status transitions.

### 2.4 Exam Module (sentinel-web, instructor view)

Route root: `app/sentinel-web/src/app/(protected)/(instructor)/exams/`

Sub-pages:
| Route | Purpose |
|---|---|
| `/exams` (index) | Exam dashboard — list of exams |
| `/exams/dashboard` | Dashboard view |
| `/exams/assign` | Assign exams to classrooms |
| `/exams/config` | Exam configuration |
| `/exams/grading/[examId]` | Grading view |
| `/exams/logs` | Incident logs |
| `/exams/[id]` | Individual exam detail |

### 2.5 Question Bank Module (sentinel-web, instructor view)

Route root: `app/sentinel-web/src/app/(protected)/(instructor)/question/`

Sub-pages:
| Route | Purpose |
|---|---|
| `/question` (index) | All questions list |
| `/question/bank` | Question bank dashboard |
| `/question/bank/collections` | Collections |
| `/question/bank/tos` | TOS Matrix |
| `/question/bank/import` | Import questions |

Feature folder: `app/sentinel-web/src/features/questions/`

### 2.6 Admin App (`sentinel-core`)

Route root: `app/sentinel-core/src/app/(protected)/`

Currently the admin app **does not** have an Exam or Question Bank module. Existing modules:
`analytics`, `announcements`, `calendar`, `classrooms`, `courses`, `sections`, `subjects`, `logs`, `administrators`, `messages`, `profile`, `guides`, `dashboard`

Feature folder exists: `app/sentinel-core/src/features/administration/`

---

## 3. What Needs to Be Built

### 3.1 Automatic Room Status Updates

**Strategy:** Update `rooms.status` reactively whenever a room is assigned to or released from an exam.

**Where to hook:**

- `sentinel-api/src/modules/examination/exams/services/create-exam.ts` — set `ASSIGNED` when a room is linked with a scheduled exam
- `sentinel-api/src/modules/examination/exams/services/update-exam.ts` — re-evaluate status when `room_id` changes or exam is completed/cancelled
- A room becomes `AVAILABLE` again when: the linked exam's status is `COMPLETED`, `ARCHIVED`, or `room_id` is set to `null`

**Alternative strategy (scheduled/derived):** Run a background job or use a database view to compute dynamic availability. This avoids synchronization bugs but requires an architectural decision.

**API surface to expose for the Room page:**
The Room listing endpoint (`GET /rooms`) should optionally return the **currently assigned exam** (exam title, scheduled date, end time) so the UI can show meaningful context alongside the room status.

### 3.2 Schema Change: Exam Type / Exam Category

A new field is needed on the `exams` table to distinguish exam scope:

**Suggested approach:**

```prisma
enum exam_category {
  CLASSROOM   // Quiz, Activity, Long Quiz — no room needed
  MAJOR       // Midterm Exam, Final Exam — room assigned by Admin

  @@schema("public")
}

model exams {
  ...
  exam_category  exam_category?  @default(CLASSROOM)
}
```

- Instructors set `exam_category` at creation time (defaulting to `CLASSROOM`)
- If `exam_category = CLASSROOM`, `room_id` is always null and the room assignment UI is hidden
- If `exam_category = MAJOR`, the instructor does not assign a room — the admin assigns it via `sentinel-core`

**Migration required:** `prisma migrate dev --name add-exam-category`

### 3.3 Admin Room Assignment Workflow (sentinel-core)

New admin capability:

1. Admin views a list of `MAJOR` exams that have no room assigned (`room_id IS NULL AND exam_category = MAJOR`)
2. Admin selects an available room and assigns it
3. On assignment: `exams.room_id` is set and `rooms.status` transitions to `ASSIGNED`
4. The API must call `assertExamRoomAvailability` to prevent double-booking

### 3.4 Replicate Exam & Question Bank in sentinel-core

**Files to create** (mirroring `sentinel-web`):

**Routes:**

- `app/sentinel-core/src/app/(protected)/exams/` — all exam sub-pages
- `app/sentinel-core/src/app/(protected)/question/` — question bank sub-pages

**Feature logic:**

- `app/sentinel-core/src/features/exams/` — exam feature module
- `app/sentinel-core/src/features/questions/` — question bank feature module

**Key scope difference:**

- `sentinel-web` instructor queries filter by `created_by = currentUserId`
- `sentinel-core` admin queries filter by `department_id = admin.departmentId` — spanning all instructors in the department

This means the API layer needs:

- Either a new admin-scoped query parameter on the existing exam/question endpoints
- Or dedicated admin endpoints in the exam module

### 3.5 Collection Sharing Between Instructors

The `question_bank_collections` table already has an `is_public` boolean:

```prisma
is_public  Boolean  @default(false)
```

**New feature:** Expose a "Share" action on a collection that:

1. Sets `is_public = true` on the collection (or a future `shared_with` many-to-many relation)
2. Other instructors can then see and use that collection in their question bank

**Minimal approach:** Toggle `is_public = true` — any instructor in the same institution can see it.
**Scoped approach:** Add a `question_bank_collection_shares` join table with `(collection_id, shared_with_user_id)`.

---

## 4. Data Models Involved

| Model                       | Table                              | Key Fields                                                                                            |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `rooms`                     | `public.rooms`                     | `room_id`, `status`, `room_type`, `institution_id`                                                    |
| `exams`                     | `public.exams`                     | `exam_id`, `room_id`, `status`, `scheduled_date`, `end_date_time`, `class_group_id`, `institution_id` |
| `question_bank_collections` | `public.question_bank_collections` | `collection_id`, `created_by`, `is_public`, `institution_id`                                          |
| `question_bank_questions`   | `public.question_bank_questions`   | `question_bank_question_id`, `created_by`, `institution_id`                                           |
| `exam_assigned_sections`    | `public.exam_assigned_sections`    | join: exam ↔ section                                                                                  |
| `departments`               | `public.departments`               | `department_id`, `institution_id`                                                                     |
| `instructors`               | `public.instructors`               | `instructor_id`, `user_id`, `department_id`                                                           |

---

## 5. Open Questions / Decisions Required

1. **Exam category label:** Should `exam_category` be a new enum or a simple string field? An enum is type-safe but requires a migration every time a new category is added.

2. **Room status sync strategy:** Reactive (trigger on exam mutation) vs. derived (computed at query time via LEFT JOIN)? Reactive is simpler at the API level but risks drift; derived is always accurate but slower.

3. **Admin exam/question scope:** Should admin access be added via a new `?scope=department` query param on existing endpoints, or should there be fully separate `admin/exams` and `admin/questions` routes?

4. **Collection sharing:** Simple `is_public` toggle (institution-wide visibility) or per-user sharing via a new join table?

5. **Rooms listing for exam assignment:** Should the room picker during admin exam assignment call `GET /rooms?status=AVAILABLE&startDateTime=...&endDateTime=...` (computed availability) or rely on the static `rooms.status` field?
