# fix-004 — Implementation Plan: Role-Matrix Permissions Not Saving on Update

**Task summary:** Permissions toggled in the role-matrix revert to their previous state after the
auto-save completes, caused by `syncSystemRoles` re-seeding permissions on every internal roles
read and a frontend draft-state race condition in `confirmedPermissionIdsByRoleIdRef`.

---

## Pre-Planning Checklist

- [x] Read and summarized the issue in one sentence (above).
- [x] Scanned source files: `roles.service.ts`, `replace-access-control-role-permissions.controller.ts`,
      `get-access-control-roles.controller.ts`, `sync-system-role-permissions.ts`, `roles.repository.ts`,
      `use-role-matrix.ts`, `use-access-control-role-mutations.ts`, `access-control.ts` (services),
      `role-matrix-table.tsx`, `role-matrix-view.tsx`.
- [x] Identified all files and DB tables touched (see each phase).
- [x] Prisma migration required: **No** — this is a logic/service bug, no schema changes needed.

---

## Options (1-3-1 Rule)

### Option A — Remove sync from internal reads only (Minimal / Safe) ✅ Chosen

Extract the roles read inside `replaceRolePermissions` to bypass `syncSystemRoles`. Move the
sync call to the public `GET /roles` controller so it only runs on explicit user-facing reads.

- **Tradeoff:** Minimal surface area change. System roles remain synced on every GET, which is
  the correct entry point. No risk of breaking other callers that depend on `getRoles`.

### Option B — Remove `syncSystemRoles` from `getRoles` entirely (Aggressive)

Strip the sync from `getRoles` and add explicit `syncSystemRoles` calls everywhere it's needed.

- **Tradeoff:** Cleanest long-term design but touches many callers — higher risk in a single
  focused fix. Better suited for a dedicated refactor sprint.

### Option C — Debounce and re-validate on the frontend only (Frontend-only patch)

Improve draft reconciliation to better tolerate server values that disagree after a save.

- **Tradeoff:** Treats the symptom, not the cause. Backend still overwrites the user's data
  in the DB for system roles — purely cosmetic fix.

**Chosen: Option A.** Targets the root cause precisely with the smallest change surface.
Frontend `confirmedPermissionIdsByRoleIdRef` timing fix is included as a safety layer (Phase 2).

---

## Phase 1: Backend — Isolate `syncSystemRoles` from Internal Reads

**Goal:** Prevent `syncSystemRoles` (which re-inserts system blueprint permissions) from running
inside `replaceRolePermissions`, so user-submitted permission changes are not immediately overwritten.

- [ ] In `app/sentinel-api/src/modules/security/roles/services/roles.service.ts`:
    - Add a private static method `readRoles(dbClient, search?)` that calls
      `RolesRepository.findAllRoles` and maps rows via `mapRoleRow` — identical to `getRoles`
      but **without** the `syncSystemRoles` call.
    - In `replaceRolePermissions`, replace the final `await this.getRoles(dbClient)` call with
      `await this.readRoles(dbClient)` to avoid triggering the system-permission re-seed after
      the transaction completes.
    - In `updateRole` and `createRole`, replace their trailing `await this.getRoles(dbClient)` calls
      with `await this.readRoles(dbClient)` for the same reason (consistent behaviour).
    - Add JSDoc on `readRoles`:
        ```ts
        /**
         * Reads all roles from the database without triggering system sync.
         * Use this for internal post-mutation reads. Use getRoles() for public entry points only.
         */
        ```
- [ ] In `app/sentinel-api/src/modules/security/roles/controllers/get-access-control-roles.controller.ts`:
    - Confirm `getRoles` (with `syncSystemRoles`) is only called from this public controller.
      No changes required if already true.
- [ ] Write tests at
      `app/sentinel-api/src/modules/security/roles/services/roles.service.test.ts` (new file):
    - Test: `replaceRolePermissions` returns exactly the submitted `permissionIds` (no extras re-added
      by blueprint sync).
    - Test: `replaceRolePermissions` for a non-system role does not call `syncSystemRolePermissions`.
    - Test: `getRoles` still triggers `syncSystemRoles` (public contract unchanged).

**Migration required:** No.

---

## Phase 2: Frontend — Fix `confirmedPermissionIdsByRoleIdRef` Race Condition

**Goal:** Ensure the confirmed-ref is only written after a successful mutation, and is cleaned up
on failure, preventing stale ref state from suppressing future saves or causing draft resets.

- [ ] In `app/sentinel-support/src/app/(protected)/(support)/control/roles/_hooks/use-role-matrix.ts`:
    - In `saveRolePermissions`, move the write to `confirmedPermissionIdsByRoleIdRef.current[roleId]`
      from **before** `replacePermissionsMutation.mutateAsync` to **after** it resolves successfully:
        ```ts
        // BEFORE (line ~186) — confirmed set before mutateAsync resolves:
        confirmedPermissionIdsByRoleIdRef.current[roleId] = permissionIds;

        // AFTER — only confirmed on success:
        try {
            await replacePermissionsMutation.mutateAsync({ roleId, permissionIds });
            confirmedPermissionIdsByRoleIdRef.current[roleId] = permissionIds; // ← move here
        } catch {
            delete pendingPermissionIdsByRoleIdRef.current[roleId];
            delete confirmedPermissionIdsByRoleIdRef.current[roleId]; // ← clean up on failure
            // Roll draft back to last known server state
            setDraftPermissionIdsByRoleId((current) => {
                const currentRole = sortedRoles.find((r) => r.id === roleId);
                if (!currentRole) return current;
                return { ...current, [roleId]: currentRole.permissionIds };
            });
            return;
        }
        ```
    - Add a JSDoc comment above `saveRolePermissions` explaining the pending/confirmed ref pattern.
- [ ] Write tests at
      `app/sentinel-support/src/app/(protected)/(support)/control/roles/_hooks/use-role-matrix.test.ts`
      (new file or extend existing):
    - Test: after a failed mutation, the draft for the affected role reverts to `role.permissionIds`.
    - Test: `confirmedPermissionIdsByRoleIdRef` is not set when the mutation rejects.
    - Test: a subsequent toggle after a failed save correctly re-triggers `saveRolePermissions`.

**Migration required:** No.

---

## Phase 3: Frontend — Narrow Query Invalidation Scope

**Goal:** Avoid unnecessary refetches of permissions and overview queries when only role-permission
mappings change, reducing the window in which a stale server response can race against draft state.

- [ ] In `packages/hooks/src/query/access-control/use-access-control-role-mutations.ts`:
    - In `useReplaceAccessControlRolePermissionsMutation.onSuccess`, invalidate only
      `ACCESS_CONTROL_QUERY_KEYS.roles()` instead of all three queries (roles, overview, permissions):
        ```ts
        onSuccess: async (data, variables, context) => {
            // Permission catalog is unaffected by role-permission mapping changes
            await queryClient.invalidateQueries({ queryKey: ACCESS_CONTROL_QUERY_KEYS.roles() });
            (args.onSuccess as any)?.(data, variables, context);
        },
        ```
    - Add an inline comment explaining why permissions/overview are excluded.
- [ ] Write/update tests at
      `packages/hooks/src/query/access-control/use-access-control-role-mutations.test.ts`:
    - Test: `useReplaceAccessControlRolePermissionsMutation` invalidates roles query on success.
    - Test: permissions and overview queries are NOT invalidated by this mutation.

**Migration required:** No.

---

## Done Criteria

- [ ] Every phase's tasks reference concrete file paths and function names.
- [ ] Each phase has at least one test task.
- [ ] Migration decision is explicit per phase (all No for this fix).
- [ ] No vague tasks — each bullet specifies the exact code change.
- [ ] `readRoles` private method is documented with JSDoc.
- [ ] `confirmedPermissionIdsByRoleIdRef` timing fix includes an error-path rollback.
- [ ] `.env.example` — no new environment variables required.
- [ ] Manual verification: toggling a permission and refreshing the page confirms persistence.
