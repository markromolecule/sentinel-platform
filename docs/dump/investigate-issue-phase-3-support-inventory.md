# Investigate Issue Phase 3 Support Inventory

## Purpose

Phase 3 inventory for support-originated actions referenced by
[investigate-issue-implementation-plan.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/to-do/investigate-issue-implementation-plan.md).

This list captures the support-owned actions currently visible in the repo, their target scope,
and whether they emit notifications in V1.

## V1 Notification Scope

### 1. Institution create

- Action name: `createInstitution`
- Backend path:
    - `app/sentinel-api/src/modules/core/institutions/controllers/create-institution.controller.ts`
    - `app/sentinel-api/src/modules/core/institutions/institution.service.ts`
- Target resource: institution
- Expected recipients: users inside the created institution with role `superadmin`, `admin`, or `instructor`
- Scope type: institution-scoped
- V1 decision: emit notification

### 2. Institution update

- Action name: `updateInstitution`
- Backend path:
    - `app/sentinel-api/src/modules/core/institutions/controllers/update-institution.controller.ts`
    - `app/sentinel-api/src/modules/core/institutions/institution.service.ts`
- Target resource: institution
- Expected recipients: users inside the updated institution with role `superadmin`, `admin`, or `instructor`
- Scope type: institution-scoped
- V1 decision: emit notification

### 3. Institution delete

- Action name: `deleteInstitution`
- Backend path:
    - `app/sentinel-api/src/modules/core/institutions/controllers/delete-institution.controller.ts`
    - `app/sentinel-api/src/modules/core/institutions/institution.service.ts`
- Target resource: institution
- Expected recipients: users inside the deleted institution with role `superadmin`, `admin`, or `instructor`
- Scope type: institution-scoped
- V1 decision: emit notification

## Deferred Or Non-Notification Actions

### 4. Institution branch link and unlink

- Action names:
    - `linkInstitutionBranch`
    - `unlinkInstitutionBranch`
- Scope type: institution-scoped
- V1 decision: no notification
- Rationale: related to institution governance but lower priority than primary institution CRUD for the first support slice

### 5. Institution naming convention saves

- Action name: `saveInstitutionNamingConvention`
- Scope type: institution-scoped
- V1 decision: no notification
- Rationale: operationally lower-value and likely too noisy without a separate settings activity taxonomy

### 6. Telemetry settings updates

- Action names:
    - telemetry settings update
    - telemetry health operations
- Scope type: global
- V1 decision: no notification
- Rationale: Phase 0 kept support inbound notifications out of scope, and there is no finalized global recipient model yet

### 7. Support-owned setup modules outside institutions

- Modules:
    - departments
    - semesters
    - rooms
- Scope type: mixed, mostly institution-scoped
- V1 decision: no notification
- Rationale: possible future expansion, but not needed to satisfy the first support activity slice

## Implementation Decision

Phase 3 V1 implementation will emit notifications only for support-originated institution CRUD.

- Notification resource type: `SUPPORT_OPERATION`
- Notification action type: `SUPPORT_OPERATION_COMPLETED`
- Metadata discriminator: `targetType: 'INSTITUTION'` plus `operation`
