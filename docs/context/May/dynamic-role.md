# Dynamic Role Management — Feature Spec

> **Last updated:** 2026-06-01  
> **Status:** In design — decisions on Open Questions required before execution  
> **Owner:** Product / Engineering  
> **Related tasks:** `docs/task/` — look for entries tagged `dynamic-role`

---

## 1. Overview

Introduce a **Roles** management page under the Authorization section, enabling full CRUD for custom roles with domain-scoped access control. The existing hardcoded role list is replaced by a database-driven model. A **Role Matrix** page (renamed from the current "Roles" page) renders columns dynamically based on active roles and filters them by domain.

The Identity & Access section is updated to reflect the new flexible hierarchy — where who can assign a role is either governed centrally by `support` or defined per-role by an admin.

---

## 2. Navigation Changes

### Current Structure

```
Authorization
└── Roles          (acts as role matrix today)
└── Permission
```

### Proposed Structure

```
Authorization
└── Access Control
    ├── Roles          ← NEW: CRUD management for role definitions
    ├── Role Matrix    ← RENAMED from current "Roles"; columns become dynamic
    └── Permission     ← Unchanged
```

**Notes:**

- The `Access Control` grouping is a new sidebar section — not a redirect.
- The old `/roles` route should redirect to `/access-control/role-matrix` during the transition period.
- The `Permission` page remains untouched for now.

---

## 3. Data Model

### Role Entity

| Field          | Type       | Constraints        | Description                                             |
| -------------- | ---------- | ------------------ | ------------------------------------------------------- |
| `id`           | `uuid`     | PK, auto-generated | Unique role identifier                                  |
| `name`         | `string`   | unique, required   | Display name — e.g. `Instructor`, `Moderator`           |
| `slug`         | `string`   | unique, derived    | URL-safe identifier — e.g. `instructor`                 |
| `description`  | `string`   | optional           | Brief explanation of the role's purpose                 |
| `domainScope`  | `string[]` | min 1 domain       | Domains where this role is available                    |
| `isActive`     | `boolean`  | default `true`     | Controls visibility in Role Matrix and assignment flows |
| `assignableBy` | `string[]` | optional           | Role slugs allowed to assign this role (Option B only)  |
| `createdAt`    | `DateTime` | auto               | Creation timestamp                                      |
| `updatedAt`    | `DateTime` | auto               | Last modification timestamp                             |

### Domain Scope Values

| Domain                    | Constant         | Purpose                      |
| ------------------------- | ---------------- | ---------------------------- |
| `core.sentinelph.tech`    | `DOMAIN_CORE`    | Internal / core system users |
| `support.sentinelph.tech` | `DOMAIN_SUPPORT` | Support team operations      |
| `app.sentinelph.tech`     | `DOMAIN_APP`     | End-user-facing application  |

> A role scoped only to `app.sentinelph.tech` must not appear in `support.sentinelph.tech` user creation flows, and vice versa.

### Prisma Schema (proposed addition to `packages/db/prisma/schema.prisma`)

```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  domainScope String[]
  isActive    Boolean  @default(true)
  assignableBy String[]  // only used in Option B hierarchy
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignments AccessControlAssignment[]
  matrixRows  RoleMatrixEntry[]
}
```

**Migration required:** Yes — new `Role` table, and existing hardcoded role references must be migrated to foreign keys.

---

## 4. Roles Page (New)

Path: `/access-control/roles`  
App: `sentinel-support` (primary) — read-only summary view in `sentinel-core` (TBD)

### Capabilities

| Action                      | Description                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- |
| **Create Role**             | Opens a form/sheet to define a new role                                             |
| **Edit Role**               | Opens the same form pre-populated                                                   |
| **Deactivate / Reactivate** | Toggles `isActive`; deactivated roles hide from the Matrix and assignment dropdowns |
| **Delete Role**             | Soft-delete (sets `isActive = false` + hides) or hard-delete — see Open Questions   |

### Role Form Fields

| Field                           | UI Component                     | Validation                                   |
| ------------------------------- | -------------------------------- | -------------------------------------------- |
| Role Name                       | Text input                       | Required, max 64 chars, unique               |
| Slug                            | Auto-derived from name; editable | Alphanumeric + hyphens only                  |
| Description                     | Textarea                         | Optional, max 256 chars                      |
| Domain Scope                    | Multi-select (checkbox list)     | At least 1 domain required                   |
| Status                          | Toggle (Active / Inactive)       | Default: Active                              |
| Assignable By _(Option B only)_ | Multi-select of existing roles   | Optional; empty = inherits default hierarchy |

### Behavior on Role Creation

1. Role is persisted to DB with `isActive = true`.
2. Role Matrix automatically adds a new column for this role under the relevant domain filter.
3. Assignment dropdowns in user creation flows update to include the new role.
4. If `assignableBy` is empty (Option A mode), support controls all provisioning.

### Behavior on Role Deactivation / Deletion

- **Deactivate:** Column is hidden in Role Matrix; role is removed from assignment dropdowns; existing assignments are preserved but flagged as inactive.
- **Delete (hard):** Blocked if active assignments exist. Requires confirmation dialog listing affected users.

---

## 5. Role Matrix Page (Renamed & Updated)

Path: `/access-control/role-matrix`  
Previously: `/roles` (redirect this old path)

### Column Generation

- Columns are **dynamically generated** from active roles filtered by the selected domain.
- Each column = one role. Each row = one permission.
- Checking a cell grants that permission to that role (writes a `RolePermission` record).

### Domain Filtering

- A **Domain Selector** at the top of the page controls which roles appear as columns.
- Default: the domain of the currently logged-in user's context.
- Roles without the selected domain in their `domainScope` are hidden.

### UX Suggestions

- "No roles found" empty state when no active roles exist for the selected domain.
- Show a badge or tooltip on each column header with the role's `domainScope` list.
- Locked (read-only) columns for system roles like `superadmin` and `support`.
- Optimistic UI for permission toggles with a rollback on API error.

---

## 6. API Contracts

> API lives in `sentinel-api`. Routes are registered under `/access-control/roles`.

### Endpoints

| Method   | Path                                 | Description                                                   |
| -------- | ------------------------------------ | ------------------------------------------------------------- |
| `GET`    | `/access-control/roles`              | List all roles (supports `?domain=` and `?isActive=` filters) |
| `POST`   | `/access-control/roles`              | Create a new role                                             |
| `GET`    | `/access-control/roles/:id`          | Get a single role by ID                                       |
| `PATCH`  | `/access-control/roles/:id`          | Update role fields                                            |
| `DELETE` | `/access-control/roles/:id`          | Deactivate or hard-delete a role                              |
| `GET`    | `/access-control/role-matrix`        | Fetch matrix data (permissions × roles) for a domain          |
| `PUT`    | `/access-control/role-matrix/grant`  | Grant a permission to a role                                  |
| `PUT`    | `/access-control/role-matrix/revoke` | Revoke a permission from a role                               |

### Request / Response Shapes (Zod schemas — to be created in `packages/shared`)

```ts
// CreateRoleSchema
z.object({
    name: z.string().min(1).max(64),
    description: z.string().max(256).optional(),
    domainScope: z
        .array(z.enum(['core.sentinelph.tech', 'support.sentinelph.tech', 'app.sentinelph.tech']))
        .min(1),
    isActive: z.boolean().default(true),
    assignableBy: z.array(z.string()).optional(), // Option B only
});

// RoleResponse
z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    domainScope: z.array(z.string()),
    isActive: z.boolean(),
    assignableBy: z.array(z.string()),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
```

---

## 7. Frontend Architecture

### Files to Create / Modify

#### `sentinel-support` (primary management UI)

| File                                                        | Action        | Purpose                                                       |
| ----------------------------------------------------------- | ------------- | ------------------------------------------------------------- |
| `(support)/access-control/roles/page.tsx`                   | NEW           | Role list + create/edit/delete UI                             |
| `(support)/access-control/roles/_components/role-form.tsx`  | NEW           | Reusable role create/edit form                                |
| `(support)/access-control/roles/_components/role-table.tsx` | NEW           | Data table with actions                                       |
| `(support)/access-control/role-matrix/page.tsx`             | RENAME/MODIFY | Dynamic column matrix                                         |
| `(support)/roles/page.tsx`                                  | MODIFY        | Redirect to `/access-control/role-matrix`                     |
| `_hooks/use-roles.ts`                                       | NEW           | React Query hook — list/get roles                             |
| `_hooks/use-role-mutations.ts`                              | NEW           | React Query mutations — create/edit/delete                    |
| `_hooks/use-role-matrix.ts`                                 | NEW           | React Query hook for matrix data                              |
| `sidebar/support/constants/index.ts`                        | MODIFY        | Add `Access Control` group; add `Roles` + `Role Matrix` items |

#### `packages/shared`

| File                         | Action | Purpose                                     |
| ---------------------------- | ------ | ------------------------------------------- |
| `src/schemas/role.schema.ts` | NEW    | Zod schemas shared between API and frontend |
| `src/types/role.types.ts`    | NEW    | TypeScript types derived from schemas       |

#### `sentinel-api`

| File                                                     | Action     | Purpose                        |
| -------------------------------------------------------- | ---------- | ------------------------------ |
| `src/modules/access-control/roles/roles.route.ts`        | NEW        | Hono OpenAPI route definitions |
| `src/modules/access-control/roles/roles.controller.ts`   | NEW        | Request handling               |
| `src/modules/access-control/roles/roles.service.ts`      | NEW        | Business logic                 |
| `src/modules/access-control/roles/roles.repository.ts`   | NEW        | Prisma data access             |
| `src/modules/access-control/role-matrix/matrix.route.ts` | NEW/MODIFY | Matrix grant/revoke routes     |
| `packages/db/prisma/schema.prisma`                       | MODIFY     | Add `Role` model               |
| `packages/db/prisma/migrations/`                         | NEW        | Generated migration            |

---

## 8. Identity & Access — Role Hierarchy Update

### Current Hierarchy (Hardcoded)

```
support     → can create → superadmin
superadmin  → can create → admin
admin       → can create → instructor
```

### Problem

With dynamic roles, this hardcoded chain breaks. New roles have no defined "parent" so no one knows who can assign them.

---

### Option A — Support Manages All Account Creation _(Recommended for now)_

Keep `support` as the top-level account creator for all new roles and users.

```
support
├── creates superadmin
├── creates [any role scoped to core or support domains]
│
superadmin
├── creates admin
│
admin
├── creates instructor
├── creates [any role scoped to app domain]
```

**Pros:** Simple, auditable, one team controls all provisioning.  
**Cons:** Support becomes a bottleneck when many custom roles are created.  
**Implementation impact:** Minimal — the assignment API simply gates creation by the caller's role + the target role's `domainScope`. No schema change for `assignableBy`.

---

### Option B — Per-Role Assignable-By Config _(More Flexible, More Complex)_

When creating a role, an admin defines which parent roles can assign it.

```
Role: Moderator
Domain: app.sentinelph.tech
Assignable by: admin, superadmin
```

**Pros:** Scalable, self-documenting per role.  
**Cons:** Complex governance; risk of misconfiguration.  
**Implementation impact:** Requires `assignableBy: string[]` on the `Role` model and assignment-time validation in `roles.service.ts`.

> **Current recommendation:** Ship Option A, design the schema to support Option B (`assignableBy` column, nullable/empty), so it can be activated later without a migration.

---

## 9. Permission Model — Who Can Manage Roles?

| Action                          | `support` | `superadmin` | `admin` |
| ------------------------------- | --------- | ------------ | ------- |
| Create role (any domain)        | ✅        | ❌           | ❌      |
| Create role (`app` domain only) | ✅        | ✅           | ❌      |
| Edit role                       | ✅        | scoped       | ❌      |
| Deactivate role                 | ✅        | scoped       | ❌      |
| Delete role (hard)              | ✅        | ❌           | ❌      |
| View Role Matrix                | ✅        | ✅           | ✅      |
| Toggle matrix permissions       | ✅        | scoped       | ❌      |

> `scoped` = limited to roles within that user's domain. Confirm with product.

---

## 10. Open Questions

| #   | Question                                                                               | Priority  | Decision Needed From  |
| --- | -------------------------------------------------------------------------------------- | --------- | --------------------- |
| 1   | Option A or B for account creation hierarchy?                                          | 🔴 High   | Product / Engineering |
| 2   | Can a role span multiple domains, or strictly one?                                     | 🔴 High   | Product               |
| 3   | Deactivated roles in the matrix — read-only column or fully hidden?                    | 🟡 Medium | Product / UX          |
| 4   | Who can create/edit roles — only `support`, or also `superadmin`?                      | 🟡 Medium | Product               |
| 5   | Domain filter in Role Matrix — per-domain tabs or a single dropdown?                   | 🟡 Medium | UX                    |
| 6   | Hard-delete vs. soft-delete for roles with existing assignments?                       | 🟡 Medium | Product               |
| 7   | Should the old `/roles` route redirect permanently (301) or temporarily (302)?         | 🟢 Low    | Engineering           |
| 8   | Does `sentinel-core` get a read-only role listing view, or is management support-only? | 🟢 Low    | Product               |

---

## 11. Edge Cases & Constraints

- **System roles** (`support`, `superadmin`, `admin`, `instructor`) must be seeded and locked — they cannot be edited or deleted through the Roles UI.
- **Circular assignableBy** (Option B) must be validated at the API level before persisting.
- **Role name conflicts** — the slug must be unique even if the display name changes later.
- **Empty domain** — a role with no `domainScope` must be rejected at schema validation (Zod + DB constraint).
- **Matrix column ordering** — define a stable sort order (e.g., by `createdAt ASC`) to prevent column shifting on refresh.
- **Concurrent edits** — if two admins toggle the same matrix cell simultaneously, the last write wins; no optimistic locking required at MVP.

---

## 12. Summary of Changes by Area

| Area              | Change Type     | Description                                                                            |
| ----------------- | --------------- | -------------------------------------------------------------------------------------- |
| Navigation        | Update          | Add `Access Control` grouping under Authorization; add `Roles` and `Role Matrix` items |
| Roles Page        | New Page        | Full CRUD for roles with domain scoping and status toggle                              |
| Role Matrix       | Rename + Update | Dynamic columns from DB; domain filter at top; redirect from old `/roles` path         |
| API               | New Module      | `/access-control/roles` CRUD + `/access-control/role-matrix` grant/revoke endpoints    |
| Database          | Migration       | New `Role` model in Prisma; migrate existing hardcoded references                      |
| Permission        | No change       | Unchanged for now                                                                      |
| Identity & Access | Update          | Reflect new role hierarchy; gated by `support` or per-role `assignableBy` (Option B)   |
| Shared Package    | New             | Zod schemas + TS types for `Role` shared across API and frontend                       |
