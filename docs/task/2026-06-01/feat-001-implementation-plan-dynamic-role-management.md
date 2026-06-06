# Dynamic Role Management — Implementation Plan

**Summary:** Transition the Sentinel platform from hardcoded roles to a database-driven dynamic role model, enabling support for domain-scoped Role CRUD operations, a dynamic Role Matrix page with filterable domain scopes, and flexible identity assignment rules across the monorepo.

---

## Viable Options Analysis (per the 1-3-1 Rule)

### Design Decision: Role Hierarchy and Assignment Validation Layer

- **Option A — Centralized Context-Based Gatekeeping (Recommended for MVP)**  
  Keep assignment permission rules simple: `support` manages all `superadmin` and domain-internal roles, while `admin` manages roles within the `app` domain (e.g., `instructor`, student, custom end-user roles).  
  _Tradeoff:_ Simple and quick to implement, but limits flexibility if a new tenant needs custom creator mappings.
- **Option B — Fully Dynamic `assignableBy` Field Configuration**  
  Add `assignableBy: String[]` to each role model defining exactly which role slugs can assign/create users with this role.  
  _Tradeoff:_ Highly extensible, but introduces complex circular-dependency checks during role creation and increases governance complexity.
- **Option C — Fine-grained RBAC permissions mapping**  
  Generate dynamic permissions like `assign:role:moderator` for every created role and assign them to parent roles.  
  _Tradeoff:_ Follows standard RBAC but results in high database bloat (hundreds of permission rows) and high UI complexity for managing permissions.

**Selected Option:** **Option A** with schema support for **Option B** (i.e. add nullable/optional `assignableBy` to the schema but default validation to Option A behavior). This allows us to deliver a simple, stable MVP immediately, while avoiding future database migrations when upgrading to dynamic parent assignments later.

---

## Proposed Changes

### Phase 1: Database Schema & Migrations

**Goal:** Modify the database schema to transition `roles` to a dynamic, domain-scoped model and prepare relational bindings.

- [ ] Modify the `roles` model in `packages/db/prisma/schema.prisma` to add the `slug` (String, unique), `domain_scope` (String[]), `is_active` (Boolean, default true), and `assignable_by` (String[]) fields.
- [ ] Run Prisma migration command `pnpm --filter db db:migrate --name add_dynamic_roles_fields` to apply changes.
- [ ] Seed system-default roles (`support`, `superadmin`, `admin`, `instructor`) with their corresponding fields in the database.
- [ ] Write integration test verification inside `packages/db/src/tests/roles-migration.test.ts` to ensure fields are queried and returned correctly.

**Migration required:** Yes — new fields are required for dynamic roles to be filtered, scoped, and activated.

---

### Phase 2: Shared Zod Schema & TypeScript Types

**Goal:** Update shared schemas and types to enforce role structure validation across both Hono API and Next.js frontend workspaces.

- [ ] Modify `accessControlRoleSchema` inside `packages/shared/src/schema/access-control/access-control-schema.ts` to include `slug`, `domainScope`, `isActive`, and `assignableBy` fields.
- [ ] Modify `accessControlRoleBodySchema` inside `packages/shared/src/schema/access-control/access-control-schema.ts` to validate fields: `name` (length 2-50), `slug` (regex alphanumeric + hyphen, optional), `description` (max 255, optional), `domainScope` (min length 1, valid domains), `isActive`, and `assignableBy`.
- [ ] Write unit tests inside `packages/shared/src/schema/access-control/access-control-schema.test.ts` to verify Zod parsing catches empty domains, invalid slug patterns, and malformed request bodies.

**Migration required:** No — updating shared validation layer only.

---

### Phase 3: Backend API Repository & Service Layer

**Goal:** Implement business logic for Role CRUD operations and dynamic matrix data generation.

- [ ] Create repository functions inside `app/sentinel-api/src/modules/security/roles/roles.repository.ts` including `createRole()`, `updateRole()`, `deleteRole()`, `findAllRoles()`, and `findRoleById()`.
- [ ] Create service layer functions inside `app/sentinel-api/src/modules/security/roles/services/roles.service.ts` to enforce dynamic role business logic, prevent updating/deleting system-seeded roles, and validate assignment scope limits (Option A rules).
- [ ] Write service unit tests inside `app/sentinel-api/src/modules/security/roles/tests/roles.service.test.ts` asserting system role locking, scope boundaries validation, and dynamic slug collisions handler.

**Migration required:** No — business logic and data access implementation only.

---

### Phase 4: Backend API Controllers & Routes

**Goal:** Expose access control endpoints and hook up Hono validation middleware.

- [ ] Modify `app/sentinel-api/src/modules/security/roles/roles.dto.ts` to ensure route schema shapes map correctly to updated `@sentinel/shared` Zod exports.
- [ ] Modify `app/sentinel-api/src/modules/security/roles/roles.route.ts` to register routes: `GET /access-control/roles`, `POST /access-control/roles`, `PATCH /access-control/roles/:roleId`, and `DELETE /access-control/roles/:roleId`.
- [ ] Modify `app/sentinel-api/src/modules/security/roles/controllers/create-access-control-role.controller.ts` to apply gatekeeping middleware asserting caller roles, parse validation bodies, and invoke the repository/service layer.
- [ ] Write Hono integration tests inside `app/sentinel-api/src/modules/security/roles/tests/roles.controller.test.ts` using native mock route clients.

**Migration required:** No — API routes orchestration layer.

---

### Phase 5: Next.js Sidebar Navigation & Routing

**Goal:** Reorganize authorization layout routes and navigation schemas inside `sentinel-support`.

- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/control/_components/layout/control-nav.tsx` to extend the `AccessControlSection` union type with `'roles' | 'role-matrix'` and update navigation lists.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/control/_components/governance/control-governance-form.tsx` to map `/control/roles` to CRUD management and `/control/role-matrix` to the Dynamic Matrix, rendering the correct page views.
- [ ] Modify `app/sentinel-support/src/components/sidebar/support/constants/index.ts` to sync the main dashboard sidebar links to target Access Control child menus.
- [ ] Write component tests inside `app/sentinel-support/src/app/(protected)/(support)/control/_components/layout/control-nav.test.tsx` to ensure proper active routes are rendered.

**Migration required:** No — layout navigation structure update.

---

### Phase 6: Frontend CRUD Pages & Dynamic Role Matrix

**Goal:** Build responsive and elegant interfaces for dynamic role creation and custom matrix operations.

- [ ] Create `RoleManagementView` in `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-management-view.tsx` to list, edit, and deactivate dynamic roles.
- [ ] Create `RoleForm` inside `app/sentinel-support/src/app/(protected)/(support)/control/_components/roles/role-form.tsx` incorporating react hook forms, validation schemas, and save/cancel triggers.
- [ ] Modify `RoleMatrixView` inside `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-matrix-view.tsx` to dynamically query active columns, filter them via domain tabs selector, and keep core system columns locked.
- [ ] Create Custom Tanstack Query Hooks in `app/sentinel-support/src/app/(protected)/(support)/control/_lib/hooks/use-roles.ts` exposing `useRoles()`, `useCreateRole()`, `useUpdateRole()`, and `useDeleteRole()`.
- [ ] Write integration and interaction tests inside `app/sentinel-support/src/app/(protected)/(support)/control/_lib/hooks/use-roles.test.ts` utilizing Tanstack Query mock providers.

**Migration required:** No — frontend features and hooks integration.

---

## Files Touched Summary

| File                                                                                                            | Action | Phase   |
| --------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| `packages/db/prisma/schema.prisma`                                                                              | Modify | Phase 1 |
| `packages/shared/src/schema/access-control/access-control-schema.ts`                                            | Modify | Phase 2 |
| `app/sentinel-api/src/modules/security/roles/roles.repository.ts`                                               | New    | Phase 3 |
| `app/sentinel-api/src/modules/security/roles/services/roles.service.ts`                                         | New    | Phase 3 |
| `app/sentinel-api/src/modules/security/roles/roles.dto.ts`                                                      | Modify | Phase 4 |
| `app/sentinel-api/src/modules/security/roles/roles.route.ts`                                                    | Modify | Phase 4 |
| `app/sentinel-api/src/modules/security/roles/controllers/create-access-control-role.controller.ts`              | Modify | Phase 4 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/layout/control-nav.tsx`                 | Modify | Phase 5 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/governance/control-governance-form.tsx` | Modify | Phase 5 |
| `app/sentinel-support/src/components/sidebar/support/constants/index.ts`                                        | Modify | Phase 5 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-management-view.tsx`         | New    | Phase 6 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/roles/role-form.tsx`                    | New    | Phase 6 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-matrix-view.tsx`             | Modify | Phase 6 |
| `app/sentinel-support/src/app/(protected)/(support)/control/_lib/hooks/use-roles.ts`                            | New    | Phase 6 |

---

## Open Questions

> [!IMPORTANT]
> **Phase 1 — Schema Default Handling**: Should we preserve `role_id` as an autoincrement `SmallInt` and map foreign keys accordingly, or fully migrate assignments to join on the unique alphanumeric `slug`? Transitioning to slug-based foreign keys will ensure high type-safety across distributed domains, but requires dynamic migration of existing user roles.

> [!NOTE]
> **Phase 6 — Inactive Role State**: When a role is marked inactive (`isActive = false`), should we preserve its previous permissions overrides mapping in read-only cells on the matrix, or fully clear its permissions records upon deactivation? Product recommends preservation for audit trails.

---

## Verification Plan

### Automated Tests

- Run unit tests across workspaces via Turborepo:
    ```bash
    pnpm --filter @sentinel/shared test
    pnpm --filter sentinel-api test
    pnpm --filter sentinel-support test
    ```
- Ensure 100% assertions coverage for schema validations, roles endpoint service limits, and optimistic React query mutations.

### Manual Verification

- **Step 1:** Run database migrations and verify custom fields exist in postgres using Prisma Studio.
- **Step 2:** Trigger `POST /access-control/roles` via Postman or terminal curl using support admin credentials. Verify system slug auto-derivation works correctly.
- **Step 3:** Open support app `/control/roles`. Verify custom roles are listable, and toggling active switches hides/unhides corresponding columns in `/control/role-matrix`.
- **Step 4:** Select domain tab (e.g. `app.sentinelph.tech`) on Role Matrix. Verify only app-scoped custom columns are rendered.
