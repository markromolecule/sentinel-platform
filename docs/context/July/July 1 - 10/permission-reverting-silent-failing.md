# Permission Reverting and Examination Defaults Not Applying

## Purpose

This note expands the current issue context for a later implementation plan. It is not the implementation plan yet. The goal is to capture the observed behavior, affected Sentinel workspaces, known code paths, likely failure modes, and validation questions before deciding the fix.

## Summary

Two support-governed configuration areas appear to return successful API responses but do not consistently influence the rest of the system:

- Access-control role matrix changes can look successful in the browser network tab, but selected permissions are not retained after refresh or after navigating away and back.
- Examination global defaults can be saved in Support, but exam creation, exam configuration, reporting behavior, and runtime policies may still use hardcoded or exam-local defaults such as `passing_score = 75`.

Both issues are high impact because Support is expected to define system-wide behavior used by `sentinel-support`, `sentinel-core`, `sentinel-web`, `sentinel-mobile`, and `sentinel-api`.

## Affected Areas

- Support portal: `app/sentinel-support`
    - Access Control / Role Matrix.
    - Access Control / Examination Defaults.
- Core admin UI: `app/sentinel-core`
    - Exam creation and builder defaults.
    - Exam configuration and reporting views.
- Instructor/student web UI: `app/sentinel-web`
    - Exam creation and builder defaults.
    - Student runtime flows and report displays.
- Mobile app: `app/sentinel-mobile`
    - Consumes exam data, including `passingScore`.
- API: `app/sentinel-api`
    - Access-control role and permission routes.
    - Examination settings route.
    - Exam creation, configuration, runtime access, grading, reporting, and student overrides.
- Database: `packages/db`
    - `roles`
    - `rbac_permissions`
    - `rbac_role_permissions`
    - `rbac_user_permission_overrides`
    - `user_roles`
    - `system_settings`
    - `exams`
    - `exam_configurations`

## User-Observed Symptoms

### Role Matrix

- A Support user toggles permissions for a role in the Role Matrix.
- The browser Network tab shows a successful response, typically HTTP `200`.
- After refreshing, navigating away, or managing the same user's permissions again, the expected permission state is not reflected.
- The visible result feels like a silent failure because the UI does not clearly say the operation was rejected or later normalized.

### Examination Defaults

- Support sets a global examination baseline, for example a passing score of `60`.
- Later exam history or database review still shows `passing_score = 75`.
- The expected behavior is that Support-managed examination settings are treated as the dynamic baseline across the whole system.

## Current Access-Control Flow

### Shared Client

The shared service client is in `packages/services/src/api/access-control.ts`.

Important calls:

- `GET /access-control/roles`
- `PUT /access-control/roles/:roleId/permissions`
- `GET /access-control/permissions`
- `GET /access-control/examination-settings`
- `PUT /access-control/examination-settings`

The role permission update sends:

```ts
{ permissionIds: string[] }
```

where each value is a permission UUID from `rbac_permissions.permission_id`, not a permission key such as `examinations:update`.

### Support Role Matrix UI

The current Role Matrix view is routed through:

- `app/sentinel-support/src/app/(protected)/(support)/control/_components/governance/control-governance-form.tsx`
- `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-matrix-view.tsx`
- `app/sentinel-support/src/app/(protected)/(support)/control/roles/_hooks/use-role-matrix.ts`
- `app/sentinel-support/src/app/(protected)/(support)/control/roles/_components/role-matrix-table.tsx`

The role matrix uses an autosave model:

- Checkbox toggles update local draft state.
- Draft changes are debounced.
- `useReplaceAccessControlRolePermissionsMutation()` sends `PUT /access-control/roles/:roleId/permissions`.
- On success, React Query invalidates the roles query.

The hook tracks pending and confirmed permission IDs to reduce race conditions:

- `pendingPermissionIdsByRoleIdRef`
- `confirmedPermissionIdsByRoleIdRef`
- `savingRoleIds`

This means a later implementation plan should check both server persistence and UI reconciliation.

### API Route and Service

The route is registered under:

- `app/sentinel-api/src/modules/security/access-control/access-control.route.ts`
- `app/sentinel-api/src/modules/security/roles/roles.route.ts`
- `app/sentinel-api/src/modules/security/roles/controllers/replace-access-control-role-permissions.controller.ts`

The service is:

- `app/sentinel-api/src/modules/security/roles/services/replace-role-permissions.service.ts`

Current behavior:

1. Validate Support access.
2. Read `roleId` and `permissionIds`.
3. Delete all existing rows in `rbac_role_permissions` for that role.
4. Insert the submitted permissions.
5. Read roles back with `readRoles()`.
6. Return HTTP `200` with the updated role.

The write itself is transactional:

```ts
delete from rbac_role_permissions where role_id = roleId;
insert submitted permission IDs;
```

This means a `200` can be real for the immediate write, even if another sync path later adds mappings back.

## Important Access-Control Sync Behavior

System RBAC catalogs are synchronized from code constants:

- `app/sentinel-api/src/middleware/auth.ts`
- `app/sentinel-api/src/modules/security/access-control/services/access-control-catalog.service.ts`
- `app/sentinel-api/src/modules/security/roles/services/sync-system-roles.service.ts`
- `app/sentinel-api/src/modules/security/roles/data/sync-system-role-permissions.ts`
- `app/sentinel-api/src/modules/security/permission/data/sync-system-permissions.ts`
- `packages/shared/src/constants/permissions.ts`

`authMiddleware` runs catalog sync before loading active permissions:

1. `ensureAccessControlCatalogsSynced()`
2. `ensureAccessControlCatalogs()`
3. `RolesService.syncSystemRoles()`
4. `PermissionService.syncSystemPermissions()`
5. `syncSystemRolePermissions()`

`GET /access-control/roles` also calls `RolesService.getRoles()`, which synchronizes system roles before reading.

Critical behavior:

- `syncSystemRolePermissions()` inserts any missing role-to-permission mappings from `SYSTEM_ROLE_BLUEPRINTS`.
- It does not remove extra mappings.
- Therefore, removing a default blueprint permission from a system role can appear to succeed, then reappear on the next sync/read.
- Adding an extra permission to a system role may persist because the sync only inserts missing defaults.
- Custom roles should not be repopulated by `SYSTEM_ROLE_BLUEPRINTS`, unless they share a system role name or are otherwise marked/treated as system roles.

This is the strongest current explanation for "Network shows 200 but permission reverts" when the edited role is a system role.

## Role Matrix Risks to Validate

- Whether the user is editing a system role or custom role when the revert occurs.
- Whether the reverted permission is part of that role's `SYSTEM_ROLE_BLUEPRINTS` baseline.
- Whether the API response body after `PUT` shows the expected `permissionIds`.
- Whether the follow-up `GET /access-control/roles` already shows the reverted value.
- Whether the database row in `rbac_role_permissions` changes immediately after `PUT` and then changes again after another authenticated request.
- Whether Support should be allowed to modify system-role permission baselines at all.
- Whether the UI should disable system-role permission removal, show a "managed by blueprint" state, or persist Support overrides in a separate table instead of fighting the sync.
- Whether role permission changes should invalidate more than roles, especially if dashboards or active permission state are shown immediately after mutation.
- Whether in-flight autosaves can overwrite a later local draft when toggles happen quickly for the same role.

## Current Examination Settings Flow

### Shared Defaults

The shared global settings constant is:

- `packages/shared/src/constants/access-control.ts`

Current code default:

```ts
defaultDurationMinutes: 60;
defaultPassingScore: 70;
```

However, several exam creation and builder paths still hardcode `passingScore: 75`, and some builder constants use `passingScore: 60`.

### Support Examination Settings API

Support settings are handled by:

- `packages/services/src/api/access-control.ts`
- `packages/hooks/src/query/access-control/use-access-control-examination-settings-query.ts`
- `packages/hooks/src/query/access-control/use-access-control-examination-settings-mutation.ts`
- `app/sentinel-api/src/modules/security/access-control/controllers/get-access-control-examination-settings.controller.ts`
- `app/sentinel-api/src/modules/security/access-control/controllers/update-access-control-examination-settings.controller.ts`
- `app/sentinel-api/src/modules/security/access-control/services/access-control-examination-settings.service.ts`
- `app/sentinel-api/src/modules/security/access-control/data/get-examination-global-settings.ts`
- `app/sentinel-api/src/modules/security/access-control/data/upsert-examination-global-settings.ts`

The setting is stored in `system_settings` with:

```txt
category = examination
setting_key = examination.global_defaults
setting_value = ExaminationGlobalSettings JSON
```

The Support settings API can save and read the record, but saving this record is not enough unless all exam creation/runtime consumers use it.

## Examination Defaults Not Fully Consumed

### Exam Creation

Exam create forms use:

- `packages/shared/src/constants/exams/exam-constants.ts`
- `app/sentinel-web/src/features/exams/config/_hooks/use-exam-create-form.ts`
- `app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts`

`getExamCreateFormDefaults()` currently returns:

```ts
passingScore: 75;
shuffleQuestions: true;
allowReview: true;
```

These are static UI defaults. They do not read `system_settings`.

The API then persists whatever the client submits:

- `app/sentinel-api/src/modules/examination/exams/services/build-exam-write-values.service.ts`

Current create value:

```ts
passing_score: body.passingScore;
```

There is no backend fallback to `system_settings.examination.global_defaults` when the client submits no passing score or submits the UI hardcoded default.

This explains why a Support baseline of `60` can still result in `exams.passing_score = 75`.

### Exam Builder Stores

Web builder defaults:

- `app/sentinel-web/src/features/exams/builder/_stores/use-exam-store/constants.ts`

Core builder defaults:

- `app/sentinel-core/src/features/exams/builder/_stores/use-exam-store.ts`

Known hardcoded defaults:

- Web store default `passingScore: 75`
- Core store default `passingScore: 75`
- Builder constants in both apps include `passingScore: 60`

These should be reconciled before implementation because the system currently has multiple sources of truth.

### Exam Configuration Defaults

Configuration service files:

- `app/sentinel-api/src/modules/examination/configuration/data/get-global-settings.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/get-exam-configuration-state.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/build-default-exam-configuration.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/map-exam-configuration-state.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/save-exam-configuration.ts`

`getExamConfigurationState()` reads `system_settings` and passes the value into `mapExamConfigurationState()`.

However:

- `buildDefaultExamConfiguration()` only maps runtime/configuration defaults such as lobby mode, reconnect attempts, camera/mic requirements, AI rules, web security, and mobile security.
- It does not include `defaultPassingScore`, `defaultDurationMinutes`, `defaultShuffleQuestions`, `defaultAllowReview`, `defaultShowCorrectAnswers`, or `defaultRandomizeChoices`.
- `mapExamConfigurationState()` uses exam-record fallback settings for shuffle/review booleans, not the full Support baseline.
- `saveExamConfiguration()` calls `mapExamConfigurationState(currentRecord)` without passing global defaults and uses `buildDefaultExamConfiguration()` with static code defaults.

There is already a test note in `app/sentinel-api/src/modules/examination/configuration/configuration.service.test.ts` saying a global settings expectation currently fails because `map-exam-configuration-state` does not read from `system_settings`.

### Runtime and Reports

Several downstream systems read the exam's persisted `passing_score`, not the Support global setting:

- `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.service.ts`
- `app/sentinel-api/src/modules/examination/reporting/services/get-reporting-exam-context.ts`
- `app/sentinel-api/src/modules/examination/reporting/services/map-reporting-response.ts`
- `app/sentinel-api/src/modules/examination/history/services/get-student-exam-history-detail.ts`
- `app/sentinel-mobile/features/exam/lib/mobile-exam-adapter.ts`

This may be correct if the global setting is only a default applied at exam creation time. It is not correct if Support expects changing the global baseline to dynamically recalibrate already-created exams and historical pass/fail decisions.

The implementation plan must decide whether Support settings are:

- Defaults for new exams only.
- Fallbacks for exams with null/missing values only.
- Live global policy that can override or recalculate existing exams.
- A hybrid where exam-specific overrides win, but Support can push a recalibration action.

## Candidate Root Causes

### Root Cause A: System Role Permissions Are Re-Synced From Code

Most likely for Role Matrix permission reverts on system roles.

The API accepts the change and returns `200`, but subsequent catalog sync re-inserts missing permissions from `SYSTEM_ROLE_BLUEPRINTS`. Because sync happens in auth middleware and role reads, the revert can happen quickly and look like a silent failure.

### Root Cause B: Role Matrix Allows Editing Something That Is Not Actually Mutable

The UI prevents editing system role names, but permission checkboxes still appear editable for system roles. If system role baselines are code-owned, the UI currently presents a misleading control surface.

### Root Cause C: Autosave Reconciliation Can Hide Persistence Failures

The autosave hook keeps drafts, pending IDs, confirmed IDs, and server role IDs in separate state/ref locations. This reduces flicker but can also make it harder to see whether the server accepted, normalized, or reverted the change. A future fix should make the accepted server state explicit.

### Root Cause D: Examination Settings Are Saved But Not Used by Exam Creation

Support writes `system_settings`, but web/core exam creation still starts from static defaults and submits `passingScore: 75`. The API persists the submitted value directly.

### Root Cause E: Examination Settings Are Partially Used by Configuration Only

The configuration service reads global settings for some runtime configuration fields, but not for all general baseline fields. Passing score and duration live on the `exams` table, not inside `exam_configurations`, and are not currently resolved from Support defaults during create/update.

### Root Cause F: Undefined Policy Between Defaults and Live Overrides

The product expectation says "dynamically and real-time" across all clients. Existing code behaves more like "static defaults at creation time" for some fields and "runtime configuration fallback" for others. The later implementation plan needs to settle this policy before code changes.

## Data Checks for Investigation

Use these checks before implementation planning:

- Confirm the edited role row:
    - `roles.role_id`
    - `roles.role_name`
    - `roles.is_system`
    - `roles.slug`
- Confirm whether reverted permissions are listed in `SYSTEM_ROLE_BLUEPRINTS`.
- Compare `rbac_role_permissions`:
    - Before the Role Matrix toggle.
    - Immediately after the `PUT` request.
    - After refresh or another authenticated API call.
- Capture the `PUT /access-control/roles/:roleId/permissions` request body.
- Capture the `PUT` response body's returned `data.permissionIds`.
- Capture the next `GET /access-control/roles` response for the same role.
- Inspect `system_settings` for:
    - `setting_key = examination.global_defaults`
    - Actual JSON value.
    - Whether `setting_value` is returned as an object or a string in the runtime database driver.
- Inspect a newly created exam row:
    - `exams.passing_score`
    - `exams.duration_minutes`
    - `exams.shuffle_questions`
    - `exams.allow_review`
    - `exams.show_correct_answers`
    - `exams.randomize_choices`
- Compare that row against the Support settings that existed before exam creation.

## Questions for the Later Implementation Plan

- Should Support be able to change permissions for built-in system roles, or only custom roles?
- If system-role permissions must be editable, should the source of truth move from `SYSTEM_ROLE_BLUEPRINTS` into the database with explicit reset-to-default support?
- If system-role permissions remain code-owned, should the Role Matrix make blueprint permissions read-only and explain that they are managed defaults?
- Should role permission changes immediately affect active sessions, or only future requests after token/session refresh?
- Should direct user permission overrides be exposed in this same workflow or kept separate from role matrix changes?
- Should `defaultPassingScore` apply only when an exam is created, or should changing it alter existing exams and reports?
- Should existing exams store a snapshot of the global defaults used at creation time for auditability?
- Should exam-specific settings always override global settings?
- Which apps must fetch Support defaults before rendering create forms: `sentinel-web`, `sentinel-core`, or both?
- Should `sentinel-api` enforce defaults even when a client submits stale hardcoded values?
- Does `sentinel-mobile` need any direct settings endpoint, or is consuming normalized exam API output enough?

## Expected Outcome of the Future Fix

The eventual implementation should make Support-managed settings behave as an explicit source of truth:

- Role Matrix changes should either persist across refreshes or be clearly blocked/read-only when a role is code-managed.
- Permission mutation success should mean the next `GET /access-control/roles` returns the same effective mapping unless a documented policy says otherwise.
- Examination defaults should have one canonical resolver in the API.
- Web and Core exam creation should no longer submit stale hardcoded baselines when Support settings exist.
- API create/update paths should protect against stale clients by resolving missing or default-like values against the canonical Support baseline.
- Reports, grading, student history, and mobile output should use the correct policy for exam-local snapshots versus live global policy.

## Relevant Files

- `packages/services/src/api/access-control.ts`
- `packages/hooks/src/query/access-control/use-access-control-role-mutations.ts`
- `packages/hooks/src/query/access-control/use-access-control-roles-query.ts`
- `packages/hooks/src/query/access-control/use-access-control-examination-settings-query.ts`
- `packages/hooks/src/query/access-control/use-access-control-examination-settings-mutation.ts`
- `packages/shared/src/constants/access-control.ts`
- `packages/shared/src/constants/permissions.ts`
- `packages/shared/src/constants/exams/exam-constants.ts`
- `packages/shared/src/schema/access-control/access-control-schema.ts`
- `packages/shared/src/types/access-control.ts`
- `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/role-matrix-view.tsx`
- `app/sentinel-support/src/app/(protected)/(support)/control/roles/_hooks/use-role-matrix.ts`
- `app/sentinel-support/src/app/(protected)/(support)/control/_components/views/examination-governance-view.tsx`
- `app/sentinel-api/src/middleware/auth.ts`
- `app/sentinel-api/src/modules/security/access-control/access-control.route.ts`
- `app/sentinel-api/src/modules/security/access-control/services/access-control-catalog.service.ts`
- `app/sentinel-api/src/modules/security/roles/services/sync-system-roles.service.ts`
- `app/sentinel-api/src/modules/security/roles/data/sync-system-role-permissions.ts`
- `app/sentinel-api/src/modules/security/roles/services/replace-role-permissions.service.ts`
- `app/sentinel-api/src/modules/security/access-control/services/access-control-examination-settings.service.ts`
- `app/sentinel-api/src/modules/security/access-control/data/upsert-examination-global-settings.ts`
- `app/sentinel-api/src/modules/examination/exams/services/build-exam-write-values.service.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/get-exam-configuration-state.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/map-exam-configuration-state.ts`
- `app/sentinel-api/src/modules/examination/configuration/services/save-exam-configuration.ts`
- `app/sentinel-web/src/features/exams/config/_hooks/use-exam-create-form.ts`
- `app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts`
- `app/sentinel-web/src/features/exams/builder/_stores/use-exam-store/constants.ts`
- `app/sentinel-core/src/features/exams/builder/_stores/use-exam-store.ts`
