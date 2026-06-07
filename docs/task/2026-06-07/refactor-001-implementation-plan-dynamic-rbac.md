# Refactor: Static Role Logic → Dynamic RBAC (`sentinel-api`)

---

## How to Use This Document (LLM Orientation)

This document is the **single source of truth** for refactoring hardcoded role
logic into the dynamic RBAC system. When working on any phase:

- **Read the phase's Behavioral Equivalence table first.** It tells you what the
  current code does and what the refactored code must do — your output must
  preserve the "After" behavior exactly.
- **Do not skip phases.** Each phase builds on the previous one. If a referenced
  utility (`requirePermission`, `hasActivePermission`) doesn't exist yet, check
  Phase 2 — it is defined there.
- **Do not modify DB schema.** No migrations are required. All schema references
  are read-only lookups against existing tables.
- **Do not rename existing permission keys** that are already seeded — only add
  new ones.
- **When in doubt about behavior**, the `rbac_role_permissions` seed is the
  authority. The code must match what the seed expresses, not the other way around.

---

## Problem Statement

The `sentinel-api` codebase contains **hardcoded role string comparisons**
scattered across middleware, route guards, and service-layer logic. Examples:

```ts
// ❌ Anti-pattern — what this refactor eliminates
if (user.role === 'admin' || user.role === 'superadmin') { ... }
roleAuthMiddleware(['admin', 'superadmin', 'support'])
const CORE_ROLES = ['admin', 'superadmin']
const ALLOWED = ['instructor', 'student', 'admin']
```

These patterns mean that **adding a new role requires locating and updating
every one of these checks manually** — a regression risk that grows with the
codebase. The dynamic RBAC infrastructure (`roles` → `rbac_role_permissions` →
`rbac_permissions`) already exists but is inconsistently used.

---

## Chosen Solution: Option B — Permission-Key Middleware

All role checks are replaced with a single `requirePermission(key)` call that
resolves against `activePermissionKeys` — a `Set<string>` already computed per
request by `authMiddleware`. Adding a new role requires only database rows; no
backend code changes.

---

## Key Types & Interfaces

These types are foundational. Every phase references them. Do not redefine them.

```ts
// The Hono context variable populated by authMiddleware — READ-ONLY during refactor
type AuthContext = {
    userId: string;
    roleId: string; // primary role ID
    roleSlug: string; // e.g. 'admin', 'instructor'
    activePermissionKeys: Set<string>; // effective permissions after overrides
};

// The central permission-check utility (defined in Phase 2)
// Single key form
function hasActivePermission(keys: Set<string>, key: string): boolean;

// Middleware factory (defined in Phase 2) — use this on routes
function requirePermission(key: string | string[]): MiddlewareHandler;

// Throws HTTP 403 if permission absent — use inside service functions
function requireActivePermission(c: Context, key: string | string[]): void;
```

**Important:** `activePermissionKeys` is already computed by `authMiddleware`
before any route handler or middleware runs. You do not need to query the DB
inside guards — just read from context.

---

## Permission Key Naming Convention

All permission keys follow the format: **`resource:action`**

| Segment    | Values                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `resource` | Noun, lowercase, kebab-case. E.g. `rooms`, `semesters`, `assessments`, `institutions`, `departments`, `permissions` |
| `action`   | `view` (read), `manage` (write/delete/create), `cross-tenant-view` (elevated read across institutions)              |

### Complete Permission Key Catalogue

| Permission Key                   | Replaces                                        | New? |
| -------------------------------- | ----------------------------------------------- | ---- |
| `rooms:view`                     | `roleAuthMiddleware(['admin', 'support', ...])` | ✅   |
| `rooms:manage`                   | `roleAuthMiddleware(['admin', 'support'])`      | ✅   |
| `semesters:view`                 | `getCoreAdminAllowedRoles()`                    | ✅   |
| `semesters:manage`               | `getCoreAdminAllowedRoles()`                    | ✅   |
| `departments:view`               | `getCoreAdminAllowedRoles()`                    | ✅   |
| `departments:manage`             | `getCoreAdminAllowedRoles()`                    | ✅   |
| `institutions:view`              | `getCoreAdminAllowedRoles()`                    | ✅   |
| `institutions:manage`            | `getCoreAdminAllowedRoles()`                    | ✅   |
| `institutions:cross-tenant-view` | `role === 'superadmin' \|\| role === 'support'` | ✅   |
| `permissions:view`               | `role === 'support' \|\| role === 'superadmin'` | ✅   |
| `permissions:manage`             | `role === 'admin' \|\| role === 'support'`      | ✅   |
| `assessments:view`               | `ASSESSMENT_READ_ALLOWED_ROLES`                 | ✅   |
| `assessments:manage`             | `ASSESSMENT_ALLOWED_ROLES`                      | ✅   |

---

## Invariants (Must Never Change During Refactor)

These rules are non-negotiable. If refactored code violates any of them, the
change is incorrect — revert and re-examine.

1. **Behavioral neutrality** — A user who could access a route before the
   refactor must still be able to access it after. A user who was blocked must
   remain blocked. Verify via the "After" column of each Behavioral Equivalence
   table.
2. **No schema migrations** — The `roles`, `rbac_role_permissions`,
   `rbac_permissions`, `user_roles`, and `rbac_user_permission_overrides` tables
   must not be altered structurally.
3. **HTTP contract unchanged** — Request/response shapes, route paths, and
   status codes (including `403` for permission denied) must remain identical.
4. **`authMiddleware` is read-only** — Do not modify `src/middleware/auth.ts`.
   It already correctly populates `activePermissionKeys`.
5. **System roles remain protected** — The `is_system` flag on the `roles` table
   is the authority for whether a role is system-protected. Do not re-introduce
   a hardcoded list of system role names.
6. **Seed-first** — Before any route check references a new permission key, that
   key must be added to `sync-system-permissions.ts` and mapped in the
   `rbac_role_permissions` seed. A missing key causes a silent 403 for all users.

---

## Phase Dependency Graph

```
Phase 1 (Audit)
    │
    ▼
Phase 2 (Harden lib/permissions.ts)  ← must complete before any route refactor
    │
    ├──▶ Phase 3 (Core Route Guards)
    │
    ├──▶ Phase 4 (Security Services)
    │
    └──▶ Phase 5 (Examination & Notification)
              │
              ▼
         Phase 6 (Retire roleAuthMiddleware)
              │
              ▼
         Phase 7 (Docs & Final Validation)
```

**Do not start Phase 3, 4, or 5 until Phase 2 is complete and its tests pass.**
**Do not start Phase 6 until Phases 3, 4, and 5 are complete.**

---

## Affected Files & DB Tables

### Files

| Layer                   | Files                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Middleware              | `src/middleware/role-auth.ts` _(retire in Phase 6)_                                                                                                    |
| Lib / Utils             | `src/lib/permissions.ts` _(primary change surface)_                                                                                                    |
| Auth bootstrap          | `src/middleware/auth.ts` _(read-only — do not modify)_                                                                                                 |
| Security: authorization | `src/modules/security/access-control/services/access-control-authorization.service.ts`                                                                 |
| Security: assignment    | `src/modules/security/access-control/services/access-control-assignment.service.ts`                                                                    |
| Examination             | `src/modules/examination/assessment/assessment-access.ts`                                                                                              |
| Notification            | `src/modules/general/notification/services/activity/activity-notification-base.service.ts`                                                             |
| Routes                  | `core/rooms/room.routes.ts`, `core/semesters/semesters.routes.ts`, `core/departments/departments.routes.ts`, `core/institutions/institution.routes.ts` |
| Seed                    | `src/modules/security/permission/data/sync-system-permissions.ts`                                                                                      |
| Shared constants        | `packages/shared/src/constants/access-control.ts`                                                                                                      |

### DB Tables (read-only — no migration)

| Table                            | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `roles`                          | Named roles; `is_system` flag protects core roles |
| `rbac_permissions`               | Canonical permission key registry                 |
| `rbac_role_permissions`          | Role → permission key mapping                     |
| `rbac_user_permission_overrides` | Per-user allow/deny overrides                     |
| `user_roles`                     | User → role assignment                            |

---

## Anti-Patterns to Avoid

The following patterns must not appear anywhere in the codebase after this
refactor. If you see yourself writing any of these, stop and use
`requirePermission` / `hasActivePermission` instead.

```ts
// ❌ Never — hardcoded role string comparison
if (ctx.roleSlug === 'admin') { ... }
if (['admin', 'superadmin'].includes(user.role)) { ... }

// ❌ Never — new hardcoded role array
const ALLOWED_ROLES = ['admin', 'support']
roleAuthMiddleware(ALLOWED_ROLES)

// ❌ Never — recreating getCoreAdminAllowedRoles pattern
getCoreAdminAllowedRoles('support')  // this function is being deleted

// ❌ Never — querying the DB inside a route guard for permission resolution
// (activePermissionKeys is already computed — just read from context)
const perms = await db.rbacPermission.findMany({ where: { roleId } })

// ❌ Never — using roleAuthMiddleware on new routes
// (the middleware is being retired; use requirePermission)
app.get('/resource', roleAuthMiddleware(['admin']), handler)
```

---

## Phase 1: Audit & Permission Key Catalogue

**Goal:** Produce an exhaustive catalogue of every hardcoded role check and
define the canonical `permission_key` that replaces each one.

**Output artifact:** `docs/task/2026-06-07/rbac-audit-log.md`

### Audit Log Schema

| File                           | Line | Pattern              | Current Role Check    | Proposed Permission Key |
| ------------------------------ | ---- | -------------------- | --------------------- | ----------------------- |
| `room.routes.ts`               | 12   | `roleAuthMiddleware` | `['admin','support']` | `rooms:manage`          |
| _(fill in from codebase scan)_ |      |                      |                       |                         |

### Tasks

- [x] Search `app/sentinel-api/src/` for: `roleAuthMiddleware`, `getCoreAdminAllowedRoles`,
      `ASSESSMENT_ALLOWED_ROLES`, `ASSESSMENT_READ_ALLOWED_ROLES`, `CORE_ROLES`,
      `SupportedActorRole`, and inline strings: `'admin'`, `'superadmin'`, `'support'`,
      `'instructor'`, `'student'` used inside conditionals or arrays
- [x] Populate the audit log with every match
- [x] Cross-reference `sync-system-permissions.ts` to identify which permission
      keys already exist in the DB seed
- [x] Add missing keys to `sync-system-permissions.ts` (see Permission Key
      Catalogue above for the full list)
- [x] Update `rbac_role_permissions` seed script to map correct roles to each new key
- [x] Write a Vitest test at `src/modules/security/permission/data/sync-system-permissions.test.ts`
      asserting every permission key referenced in the codebase is present in the
      sync catalogue

---

## Phase 2: Harden `lib/permissions.ts`

**Goal:** Delete role-aware helpers and expose a clean, permission-key-only API
surface. This phase produces the utilities all subsequent phases depend on.

### Target API Surface (after this phase)

```ts
// src/lib/permissions.ts

/**
 * Returns true if the given permission key (or any in an array) is present
 * in the user's active permission set.
 */
export function hasActivePermission(keys: Set<string>, required: string | string[]): boolean;

/**
 * Throws HTTP 403 if the user lacks the required permission key.
 * Use inside service functions where the Hono Context is available.
 */
export function requireActivePermission(c: Context, required: string | string[]): void;

/**
 * Hono middleware factory. Use on route definitions.
 * @example app.get('/rooms', requirePermission('rooms:view'), handler)
 */
export function requirePermission(key: string | string[]): MiddlewareHandler;
```

### Tasks

- [x] Remove `getCoreAdminAllowedRoles()` from `src/lib/permissions.ts`; add
      `@deprecated` JSDoc to it in this phase — deletion is Phase 6
- [x] Implement `requirePermission(key)` middleware factory as specified above
- [x] Add JSDoc to every exported function
- [x] Write unit tests at `src/lib/permissions.test.ts`:

```ts
// Test cases required
describe('hasActivePermission', () => {
    it('returns true when key is in the set');
    it('returns false when key is absent');
    it('returns true when any key in an array matches');
});

describe('requireActivePermission', () => {
    it('does not throw when key is present in context');
    it('throws HTTP 403 when key is absent');
    it('throws HTTP 403 when activePermissionKeys is empty');
});

describe('requirePermission middleware', () => {
    it('calls next() when key is present');
    it('returns 403 when key is absent');
    it('accepts an array and passes when any key matches');
});
```

- [x] Do NOT delete `src/middleware/role-auth.ts` in this phase (Phase 6 only)

---

## Phase 3: Refactor Core Route Guards

**Goal:** Replace all `roleAuthMiddleware` / `getCoreAdminAllowedRoles` calls in
core module routes with `requirePermission`.

### Behavioral Equivalence — Routes

| Route           | Method            | Before (role check)                                    | After (permission key)                     |
| --------------- | ----------------- | ------------------------------------------------------ | ------------------------------------------ |
| `/rooms`        | GET               | `roleAuthMiddleware(['admin','support','instructor'])` | `requirePermission('rooms:view')`          |
| `/rooms`        | POST/PATCH/DELETE | `roleAuthMiddleware(['admin','support'])`              | `requirePermission('rooms:manage')`        |
| `/semesters`    | GET               | `roleAuthMiddleware(getCoreAdminAllowedRoles(...))`    | `requirePermission('semesters:view')`      |
| `/semesters`    | POST/PATCH/DELETE | `roleAuthMiddleware(getCoreAdminAllowedRoles(...))`    | `requirePermission('semesters:manage')`    |
| `/departments`  | GET               | `roleAuthMiddleware(getCoreAdminAllowedRoles(...))`    | `requirePermission('departments:view')`    |
| `/departments`  | POST/PATCH/DELETE | `roleAuthMiddleware(getCoreAdminAllowedRoles(...))`    | `requirePermission('departments:manage')`  |
| `/institutions` | GET               | `roleAuthMiddleware(getCoreAdminAllowedRoles(...))`    | `requirePermission('institutions:view')`   |
| `/institutions` | POST/PATCH/DELETE | `roleAuthMiddleware(getCoreAdminAllowedRoles(...))`    | `requirePermission('institutions:manage')` |

### Tasks

- [x] Apply `requirePermission` to each route in the four route files per the
      table above
- [x] Remove all imports of `roleAuthMiddleware` and `getCoreAdminAllowedRoles`
      from these files
- [x] Write integration tests asserting:
    - Request with the required permission key → `200` / `201`
    - Request without the required permission key → `403`
    - Unauthenticated request → `401` (unchanged behavior)

---

## Phase 4: Refactor Security Module Services

**Goal:** Remove hardcoded role comparisons from `access-control-authorization.service.ts`
and `access-control-assignment.service.ts`.

### Behavioral Equivalence — Authorization Service

| Function                      | Before                                                                | After                                                                           |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `assertAccessControlAccess()` | `role === 'support' \|\| role === 'superadmin' \|\| role === 'admin'` | `requireActivePermission(c, isGet ? 'permissions:view' : 'permissions:manage')` |
| `assertSupportAccess()`       | `role === 'support'`                                                  | `requireActivePermission(c, 'permissions:manage')`                              |

**Why this is equivalent:** `support` and `superadmin` will still pass because
their rows in `rbac_role_permissions` grant `permissions:view` and
`permissions:manage`. The logic moves from the code to the DB seed.

### Behavioral Equivalence — Assignment Service

| Check                  | Before                                           | After                                                 |
| ---------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| System role protection | `CORE_ROLES.includes(roleName)` — hardcoded list | `role.is_system === true` — DB field on `roles` table |
| Assignable-by check    | `SUPPORT_ASSIGNABLE_ROLE_NAMES` constant         | `role.assignable_by` column on `roles` table          |

**Resolved ambiguity — fallback behavior:** If `RolesRepository.findRoleBySlug`
returns `null` (role not found), throw HTTP `404` with message
`"Role not found"` before performing any assignment or deletion.

### Tasks

**`access-control-authorization.service.ts`**

- [x] Remove `role === 'support'` / `role === 'superadmin'` / `role === 'admin'`
      comparisons in `assertAccessControlAccess()` and `assertSupportAccess()`
- [x] Replace with `requireActivePermission(c, key)` per the equivalence table

**`access-control-assignment.service.ts`**

- [x] Remove `const CORE_ROLES = [...]` and the `isCoreRole()` closure
- [x] Replace with `role.is_system` flag lookup via `RolesRepository.findRoleBySlug`
- [x] Add `null` guard as described above
- [x] Add JSDoc to `createAssignment()` and `deleteAssignment()` describing the
      new guard logic

**Tests**

- [x] Write unit tests at `src/modules/security/access-control/tests/access-control-authorization.test.ts`
      covering `assertAccessControlAccess` and `assertSupportAccess` with both
      permission-present and permission-absent mock contexts
- [x] Write unit tests covering the `is_system` guard — assert a system role
      cannot be deleted even when `permissions:manage` is present

---

## Phase 5: Refactor Examination & Notification Modules

**Goal:** Remove role string comparisons from `assessment-access.ts` and the
notification base service.

### Behavioral Equivalence — Assessment Access

| Function                           | Before                                          | After                                                         |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| `assertAssessmentAccess()`         | `ASSESSMENT_ALLOWED_ROLES.includes(role)`       | `requireActivePermission(c, 'assessments:manage')`            |
| `assertAssessmentReadAccess()`     | `ASSESSMENT_READ_ALLOWED_ROLES.includes(role)`  | `requireActivePermission(c, 'assessments:view')`              |
| `resolveAssessmentInstitutionId()` | `role === 'superadmin' \|\| role === 'support'` | `hasActivePermission(keys, 'institutions:cross-tenant-view')` |

### Behavioral Equivalence — Notification Base Service

| Function                          | Before                                                    | After                                                                                             |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `getUserPrimaryRole()`            | Hardcoded priority list of role strings                   | Query `user_roles` joined with `roles`, order by `is_system DESC, domain_scope ASC`, return first |
| `resolveInstitutionLevel()`       | `actorRole === 'support' \|\| actorRole === 'superadmin'` | `hasActivePermission(activePermissionKeys, 'institutions:cross-tenant-view')`                     |
| `getRecipientRolesForActorRole()` | Static role → recipient-role map                          | **See design decision below**                                                                     |

**Resolved ambiguity — `getRecipientRolesForActorRole()`:**
The trade-off between a DB round-trip and the current static list is resolved
in favor of a **configurable static map in a seeded DB config table** (not a
hardcoded constant). In the interim, replace `SupportedActorRole` string union
with `string` and retain the existing mapping logic but sourced from a
`notification_role_routing` config key in the DB. If the config key is absent,
fall back to the current behavior and log a warning. This decouples the
notification routing from code without requiring a full dynamic DB query per
notification event.

**Resolved ambiguity — `SupportedActorRole` type:**
Replace with `string`. The RBAC system is now the authority; this type must not
re-enumerate role names.

### Tasks

**`assessment-access.ts`**

- [x] Remove `ASSESSMENT_ALLOWED_ROLES` and `ASSESSMENT_READ_ALLOWED_ROLES` constants
- [x] Refactor the three functions per the equivalence table
- [x] Add `institutions:cross-tenant-view` to `sync-system-permissions.ts` and
      map `superadmin` and `support` roles to it in the seed

**`activity-notification-base.service.ts`**

- [x] Replace `SupportedActorRole` with `string` throughout
- [x] Refactor `getUserPrimaryRole()` — DB-ordered query, no hardcoded list
- [x] Refactor `resolveInstitutionLevel()` — use permission key
- [x] Refactor `getRecipientRolesForActorRole()` — configurable map per decision above
- [x] Write unit tests covering refactored functions with mocked DB clients

---

## Phase 6: Retire `roleAuthMiddleware` & Shared Constants Cleanup

**Goal:** Delete the deprecated role-auth middleware and all remaining
hardcoded role constants.

**Prerequisite:** Verify zero remaining imports of `roleAuthMiddleware` and
`getCoreAdminAllowedRoles` before deleting — run:

```bash
grep -r "roleAuthMiddleware\|getCoreAdminAllowedRoles" app/sentinel-api/src/
# Must return zero results
```

### Tasks

- [x] Delete `src/middleware/role-auth.ts`
- [x] Remove `getCoreAdminAllowedRoles()` from `src/lib/permissions.ts`
- [x] In `packages/shared/src/constants/access-control.ts`, preserve
      `SUPPORT_ASSIGNABLE_ROLE_NAMES` for backward compatibility with frontend applications
      and user query filter functions
- [x] Export `SUPPORT_ASSIGNABLE_ROLE_NAMES` from `packages/shared/src/constants/index.ts`
      barrel export to maintain clean compilation
- [x] Run typecheck and Prettier format check — zero errors
- [x] Run `pnpm --dir app/sentinel-api test` — all tests pass

---

## Phase 7: Documentation & Final Validation

**Goal:** Document the RBAC system and validate end-to-end correctness.

### Tasks

- [x] Create `docs/architecture/rbac-system.md` with:
    - Three-layer model diagram (`roles` → `rbac_role_permissions` → `rbac_permissions`)
    - How to add a new role (DB steps only — no code changes)
    - How to add a new permission key (`sync-system-permissions.ts` + seed)
    - `requirePermission` / `requireActivePermission` / `hasActivePermission` API reference
    - Permission key naming convention (`resource:action`)
- [x] Write smoke test at `src/tests/rbac-smoke.test.ts`:
    1. Create a test role with one permission via DB client
    2. Assign the role to a test user
    3. Assert `getUserActivePermissions` returns that key
    4. Assert a request to a protected route succeeds/fails per the permission
- [x] Manually verify behavioral neutrality for an existing `admin` user across
      `institutions`, `rooms`, `semesters`, `departments` routes
- [x] Run `pnpm --dir app/sentinel-api test` — all pass, zero skips
- [x] Run typecheck and Prettier formatting — zero errors

---

## Done Criteria

- [x] Zero occurrences of `roleAuthMiddleware`, `getCoreAdminAllowedRoles`,
      `ASSESSMENT_ALLOWED_ROLES`, `ASSESSMENT_READ_ALLOWED_ROLES`, `CORE_ROLES`,
      and inline role string arrays in business logic, middleware, or route files
- [x] All role-permission checks route through `requireActivePermission` /
      `requirePermission` / `hasActivePermission` using canonical permission keys
- [x] `src/middleware/role-auth.ts` is deleted; `getCoreAdminAllowedRoles` is
      removed from `lib/permissions.ts`
- [x] `SUPPORT_ASSIGNABLE_ROLE_NAMES` is replaced with `roles.assignable_by` for DB assignments, but preserved as a deprecated constant for backward compatibility
- [x] `SupportedActorRole` string union is replaced with `string`
- [x] All Vitest tests pass; new tests added per phase cover refactored logic
- [x] A new role can be created and granted permissions through DB rows alone —
      zero backend code changes required
- [x] `docs/architecture/rbac-system.md` is published

---

## Breaking Changes

> [!WARNING]
> **No breaking API changes.** This refactor is behaviorally neutral. All
> existing role-permission mappings are preserved in the `rbac_role_permissions`
> seed. HTTP contract (routes, request/response shapes, status codes) is unchanged.

---

## Rollback Strategy

If a phase introduces a regression:

1. The `roleAuthMiddleware` file is not deleted until Phase 6 — any phase 3–5
   route can be reverted to `roleAuthMiddleware` temporarily without code loss.
2. New permission keys in `sync-system-permissions.ts` are additive — removing
   them from the seed and re-syncing restores the prior state.
3. No DB migrations were made — there is no migration to roll back.

---

## Reference Docs

- [System Overview](../../architecture/system-overview.md)
- [Context Document](../../../docs/context/June/june-7-refactor-dynamic-role.md)
- [Permission Data Layer](../../../app/sentinel-api/src/modules/security/permission/data/get-user-active-permissions.ts)
- [Roles Repository](../../../app/sentinel-api/src/modules/security/roles/roles.repository.ts)
- [Sync System Permissions](../../../app/sentinel-api/src/modules/security/permission/data/sync-system-permissions.ts)
