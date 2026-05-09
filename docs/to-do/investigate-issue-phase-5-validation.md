# Phase 5 Validation

## Permission Audit

- `notifications:view` remains the single V1 gate for the notifications API and UI.
- Default role assignment after audit:
  - `support`: does not receive `notifications:view` in V1 because inbound support notifications were explicitly deferred in Phase 0.
  - `superadmin`: retains `notifications:view`.
  - `admin`: retains `notifications:view`.
  - `instructor`: retains `notifications:view`.
  - `student`: does not receive `notifications:view`.
  - `proctor`: does not receive `notifications:view`.
- No finer-grained notification permission key was introduced because the current V1 surface is account-addressed and fully guarded by recipient scoping plus institution scoping.

## Mixed-Role Scope Validation

- Notification listing is always constrained by:
  - `recipient_user_id`
  - active `institution_id` context when present
- This prevents a user who holds different roles across institutions from seeing Institution A notifications while operating inside Institution B.
- Phase 5 added explicit service-level regression coverage for this institution-context behavior.

## Prisma and Type Audit

- Notification migration chain present and ordered:
  - `20260509191500_add_notifications`
  - `20260510010000_expand_notifications_for_subject_requests`
  - `20260510020000_expand_notifications_for_institution_activity`
  - `20260510030000_expand_notifications_for_support_operations`
- Validation completed:
  - `pnpm --dir packages/db generate`
  - `pnpm --dir packages/db build`
- Direct Prisma client import audit outside `packages/db` found no app code importing `@prisma/client` directly.

## Frontend Smoke Coverage

- `sentinel-core` notification dropdown smoke and interaction coverage passed.
- `sentinel-web` instructor notification dropdown smoke coverage passed.
- No browser E2E harness was added in this phase; component-level smoke coverage is the V1 frontend validation artifact.
