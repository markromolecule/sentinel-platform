# refactor-005 — Implementation Plan: Modularize RolesService

**Task summary:** Break down the monolithic `RolesService` class into separate, modular service
files in the `services/` directory and use the root `roles.service.ts` file as the main entry
point to make the codebase more modular, scalable, readable, and maintainable.

---

## Pre-Planning Checklist

- [x] Read and summarized the task in one sentence (above).
- [x] Scanned source files: `roles.service.ts` (monolith), `access-control-catalog.service.ts`,
      `access-control-assignment.service.ts`, controllers (`get-access-control-roles.controller.ts`, etc.).
- [x] Identified all files and DB tables touched (no DB tables modified, logic shift only).
- [x] Prisma migration required: **No** — logic refactoring only.

---

## Options (1-3-1 Rule)

### Option A — Clean Class-Delegated Entry Point (Robust / Compatible) ✅ Chosen

Create individual service functions in separate files under `services/`, and export a class
`RolesService` in `roles.service.ts` that references those functions as static properties.

- **Tradeoff:** Zero impact on existing imports and callers because the `RolesService` class interface
  is perfectly preserved. Keeps code extremely clean.

### Option B — Fully Function-Based Services (Aggressive)

Ditch the class altogether and export functions directly from `roles.service.ts`.

- **Tradeoff:** Forces rewriting every single import statement and method call in all controllers
  and other modules (e.g. `RolesService.getRoles` → `getRoles`). High churn, higher risk of regression.

### Option C — Namespace Barrel File

Use a TypeScript `namespace` or barrel export in `roles.service.ts` to simulate a class.

- **Tradeoff:** Works, but class static assignments are more standard in the current codebase
  (matching `PermissionService`).

**Chosen: Option A.** Retains full API compatibility with all existing consumers while separating
the monolithic class implementation into clean, testable single-responsibility service files.

---

## Phase 1: Create Modular Service Files

**Goal:** Create individual single-responsibility service files under the `services/` folder and
implement their corresponding operations.

- [ ] Create `app/sentinel-api/src/modules/security/roles/services/validate-role-boundaries.ts`
      containing the Option A boundary checking validation logic.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/sync-system-roles.service.ts`
      implementing the `syncSystemRoles` function.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/get-role-record.service.ts`
      implementing `getRoleRecord`.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/get-roles.service.ts`
      implementing `getRoles` and the internal `readRoles` helper.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/create-role.service.ts`
      implementing `createRole`.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/update-role.service.ts`
      implementing `updateRole`.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/delete-role.service.ts`
      implementing `deleteRole`.
- [ ] Create `app/sentinel-api/src/modules/security/roles/services/replace-role-permissions.service.ts`
      implementing `replaceRolePermissions`.

**Migration required:** No.

---

## Phase 2: Set Up Main Entry Point and Clean Up

**Goal:** Populate the root `roles.service.ts` entry point class and delete the old monolith file.

- [ ] Write the new class in `app/sentinel-api/src/modules/security/roles/roles.service.ts` mapping each static method to the imported modular functions.
- [ ] Add JSDoc comments to the main class and all exported functions.
- [ ] Delete `app/sentinel-api/src/modules/security/roles/services/roles.service.ts` (monolith).

**Migration required:** No.

---

## Phase 3: Update Callers and Run Tests

**Goal:** Point all existing callers to the new main entry point file and verify that everything compiles and passes tests.

- [ ] Update imports in:
    - `access-control-catalog.service.ts`
    - `access-control-assignment.service.ts`
    - `replace-access-control-role-permissions.controller.ts`
    - `get-access-control-roles.controller.ts`
    - `update-access-control-role.controller.ts`
    - `delete-access-control-role.controller.ts`
    - `create-access-control-role.controller.ts`
    - `roles.service.test.ts`
- [ ] Run vitest:
    ```bash
    pnpm --dir app/sentinel-api test src/modules/security/roles --run
    ```
    Ensure all tests pass successfully.

**Migration required:** No.

---

## Done Criteria

- [ ] All 8 service files are created with correct type signatures.
- [ ] Root `roles.service.ts` correctly re-exports static methods.
- [ ] Monolith file is deleted.
- [ ] All imports updated to the root service entry point.
- [ ] All unit and integration tests run and pass without failures.
