# Announcements Module — Implementation Spec

## Overview

Build a full-stack `announcements` module following the existing codebase conventions.
The module must be consistent in syntax, structure, and code quality with all other modules under `sentinel-api/src/modules/general/`.

---

## 1. File Structure

Create the following files. Do not deviate from this layout.

```
app/sentinel-api/src/modules/general/announcements/
├── controllers/
│   └── announcement.controller.ts
├── data/
│   └── announcement.repository.ts
├── services/
│   ├── announcement-crud.service.ts
│   ├── announcement-query.service.ts
│   └── announcement-notification.service.ts
├── announcement.service.ts          ← main entry only; delegates to /services/*
├── announcement.dto.ts
├── announcement.module.ts
└── announcement.routes.ts

packages/hooks/src/query/announcements/
├── useAnnouncements.ts
├── useAnnouncement.ts
├── useCreateAnnouncement.ts
├── useUpdateAnnouncement.ts
└── useDeleteAnnouncement.ts

packages/services/src/api/
└── announcements.ts
```

---

## 2. Data Model

### `announcements` Table

| Column           | Type                       | Constraints                     |
| ---------------- | -------------------------- | ------------------------------- |
| `id`             | `uuid`                     | PK, default `gen_random_uuid()` |
| `title`          | `varchar(255)`             | NOT NULL                        |
| `slug`           | `varchar(255)`             | NOT NULL, UNIQUE                |
| `content`        | `text`                     | NOT NULL                        |
| `published_at`   | `timestamp with time zone` | NULLABLE — null means draft     |
| `unpublished_at` | `timestamp with time zone` | NULLABLE                        |
| `created_at`     | `timestamp with time zone` | NOT NULL, default `now()`       |
| `updated_at`     | `timestamp with time zone` | NOT NULL, default `now()`       |
| `deleted_at`     | `timestamp with time zone` | NULLABLE — soft delete          |

- Auto-generate `slug` from `title` on create if not explicitly provided.
- Enforce uniqueness on `slug` at both DB and service levels.
- All queries must exclude rows where `deleted_at IS NOT NULL` by default.

---

## 3. Backend Module

### 3.1 `announcement.service.ts` — Main Entry

This file is the **public-facing service entry point only**. It must not contain business logic.
All logic lives inside `/services/*`. This file simply instantiates and delegates.

```ts
// Example shape — follow codebase conventions exactly
export class AnnouncementService {
    constructor(
        private readonly crud: AnnouncementCrudService,
        private readonly query: AnnouncementQueryService,
        private readonly notification: AnnouncementNotificationService,
    ) {}

    create = this.crud.create;
    update = this.crud.update;
    remove = this.crud.remove;
    findAll = this.query.findAll;
    findById = this.query.findById;
    findBySlug = this.query.findBySlug;
}
```

### 3.2 `/services/announcement-crud.service.ts`

Handles all write operations:

- `create(dto: CreateAnnouncementDto)` — auto-generate slug, trigger notification on publish
- `update(id: string, dto: UpdateAnnouncementDto)` — regenerate slug only if title changes and no custom slug is given
- `remove(id: string)` — soft delete (set `deleted_at`, do not hard-delete)

### 3.3 `/services/announcement-query.service.ts`

Handles all read operations:

- `findAll(params: AnnouncementQueryParams)` — paginated list with search, sort, filter
- `findById(id: string)` — throws `NotFoundException` if not found or soft-deleted
- `findBySlug(slug: string)` — same guard as above

**`AnnouncementQueryParams` shape:**

| Param       | Type                                               | Default        | Description                    |
| ----------- | -------------------------------------------------- | -------------- | ------------------------------ |
| `page`      | `number`                                           | `1`            |                                |
| `limit`     | `number`                                           | `20`           | Max `100`                      |
| `search`    | `string` (optional)                                | —              | Searches `title` and `content` |
| `sortBy`    | `'created_at' \| 'published_at' \| 'title'`        | `'created_at'` |                                |
| `sortOrder` | `'asc' \| 'desc'`                                  | `'desc'`       |                                |
| `status`    | `'draft' \| 'published' \| 'unpublished' \| 'all'` | `'all'`        | Filter by publish state        |

**Status filter logic:**

| Status        | Condition                                                                      |
| ------------- | ------------------------------------------------------------------------------ |
| `draft`       | `published_at IS NULL`                                                         |
| `published`   | `published_at <= now() AND (unpublished_at IS NULL OR unpublished_at > now())` |
| `unpublished` | `unpublished_at IS NOT NULL AND unpublished_at <= now()`                       |
| `all`         | No filter (excluding soft-deleted)                                             |

### 3.4 `/services/announcement-notification.service.ts`

Integrates with the existing `notification` module. Call this service from `crud` on relevant events:

- `onPublish(announcement)` — notify all users when an announcement is published
- `onUpdate(announcement)` — optionally notify when a published announcement is updated (make this configurable)
- `onDelete(announcement)` — optionally notify affected users on deletion

Follow the existing `NotificationService` interface. Do not duplicate notification logic here — only call into the existing module.

### 3.5 `announcement.dto.ts`

```ts
CreateAnnouncementDto {
  title: string           // required
  slug?: string           // optional; auto-generated from title if absent
  content: string         // required
  published_at?: Date     // optional; set to schedule publish
  unpublished_at?: Date   // optional
}

UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}
```

Apply the same validation decorators used in other modules (`@IsString`, `@IsOptional`, `@IsDateString`, etc.).

### 3.6 `announcement.routes.ts`

| Method   | Path                        | Handler      | Description             |
| -------- | --------------------------- | ------------ | ----------------------- |
| `GET`    | `/announcements`            | `findAll`    | Paginated list          |
| `GET`    | `/announcements/:id`        | `findById`   | Single record by UUID   |
| `GET`    | `/announcements/slug/:slug` | `findBySlug` | Single record by slug   |
| `POST`   | `/announcements`            | `create`     | Create new announcement |
| `PATCH`  | `/announcements/:id`        | `update`     | Partial update          |
| `DELETE` | `/announcements/:id`        | `remove`     | Soft delete             |

Apply the same auth guards, roles, and middleware used on equivalent routes in other modules.

### 3.7 `data/announcement.repository.ts`

Wrap all raw DB access here. The service layer must never write raw queries — always go through the repository. Follow the repository pattern used in other modules exactly.

---

## 4. Notification Module Integration

Update the existing `notification` module to support announcement-originated notifications.

- Add `ANNOUNCEMENT_PUBLISHED` and `ANNOUNCEMENT_UPDATED` to the notification type/event enum.
- The notification payload must include: `announcement_id`, `title`, `slug` (so the frontend can deep-link).
- Do not modify existing notification logic — extend it only.
- Ensure the notification read/unread state works for announcement notifications the same way it does for other notification types.

---

## 5. Frontend Preparation

### `packages/services/src/api/announcements.ts`

Define typed API call functions for each endpoint:

```ts
getAnnouncements(params: AnnouncementQueryParams): Promise<PaginatedResponse<Announcement>>
getAnnouncementById(id: string): Promise<Announcement>
getAnnouncementBySlug(slug: string): Promise<Announcement>
createAnnouncement(data: CreateAnnouncementDto): Promise<Announcement>
updateAnnouncement(id: string, data: UpdateAnnouncementDto): Promise<Announcement>
deleteAnnouncement(id: string): Promise<void>
```

### `packages/hooks/src/query/announcements/`

Create one hook file per operation. Follow the naming convention and query key structure of existing hooks.

| File                       | Type     | Query Key                                                   |
| -------------------------- | -------- | ----------------------------------------------------------- |
| `useAnnouncements.ts`      | Query    | `['announcements', params]`                                 |
| `useAnnouncement.ts`       | Query    | `['announcements', id]` / `['announcements', 'slug', slug]` |
| `useCreateAnnouncement.ts` | Mutation | Invalidates `['announcements']` on success                  |
| `useUpdateAnnouncement.ts` | Mutation | Invalidates `['announcements']` and `['announcements', id]` |
| `useDeleteAnnouncement.ts` | Mutation | Invalidates `['announcements']` on success                  |

---

## 6. Code Quality Requirements

- Match the exact style, import order, and formatting of existing modules — no exceptions.
- All public methods must have JSDoc or equivalent inline documentation.
- Errors must use the same custom exception classes used elsewhere in the codebase.
- No raw `console.log` — use the existing logger.
- All new code must be covered by unit tests following the existing test file conventions.
