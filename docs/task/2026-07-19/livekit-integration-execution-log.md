# LiveKit Integration Execution Log

## Work Package 01: Foundation and Configuration

- Date: 2026-07-19
- Starting repository status: untracked LiveKit context/planning documents under `docs/context/July/July 19/` and `docs/task/2026-07-19/`; no implementation files modified at package start.
- Baseline tests before implementation: not run before edits; package 01 was explicitly requested for execution after plan creation.
- Package 02-06 implementation status at entry: not started in this execution.
- Dependency install:
    - `pnpm --dir app/sentinel-api add livekit-server-sdk`: passed, added `livekit-server-sdk ^2.17.0`.
    - `pnpm --dir packages/hooks add livekit-client`: passed, added `livekit-client ^2.20.1`.
- Focused tests:
    - `pnpm --dir app/sentinel-api test --run src/modules/infrastructure/livekit/livekit.config.test.ts src/modules/infrastructure/livekit/livekit.service.test.ts`: passed, 2 test files and 11 tests.
- Build and type checks:
    - `pnpm --dir packages/hooks build`: passed.
    - Scoped server SDK typecheck using `livekit-server-sdk` imports under `app/sentinel-api`: passed.
    - Scoped client SDK typecheck using `livekit-client` imports under `packages/hooks`: passed.
    - `pnpm --dir app/sentinel-api typecheck`: failed at the default 4 GB heap limit with a Node out-of-memory error.
    - `NODE_OPTIONS="--max-old-space-size=8192" pnpm --dir app/sentinel-api exec tsc --noEmit`: failed on existing repo-wide TypeScript errors outside the LiveKit package, beginning with missing `src/modules/_shared/authorization-scope/*` modules and older Hono test context typing errors.
- Formatting:
    - `pnpm format:check`: failed because the repository currently has 199 pre-existing formatting warnings across unrelated apps/docs/packages.
    - Targeted package-01 Prettier check for touched files: passed.
- Dependency/scope review:
    - No AWS SDK, recording, Egress, or `@livekit/components-react` package was added.
    - No `NEXT_PUBLIC_LIVEKIT_*` variable was added.
    - The obsolete empty EC2 service file was deleted.
    - Lockfile review found two Expo peer-resolution line normalizations around React 19.1/19.2; no Expo package dependency was added or upgraded.
    - Dependency scan found no AWS SDK, recording, Egress, `@livekit/components-react`, or `NEXT_PUBLIC_LIVEKIT_*` usage in the package-01 dependency/configuration surface.

## Work Package 02: Persistence, Contracts, and Authorization

- Date: 2026-07-19
- Entry gate:
    - Work-package-01 commit present: `d8e48b6b feat(livekit): add managed service foundation`.
    - Package 03-06 implementation status at entry: not started in this execution.
    - `LIVE_INSPECTION_ENABLED` scan found no enabled shared environment value in tracked package-02 scope.
- Implemented:
    - Shared live-inspection state, response, and transition schemas.
    - Prisma lease/webhook models, generated Kysely types, and migration SQL with active partial indexes, check constraints, private Realtime trigger, SELECT-only student policy, and no browser INSERT policy.
    - Dedicated `examinations:monitor_live_video` permission for `superadmin`, `admin`, and `instructor`; support and student are excluded.
    - Relationship-aware viewer/student access service, provider-independent repository helpers, and state-transition service.
- Verification:
    - `pnpm --dir packages/db generate`: passed.
    - `pnpm --dir packages/shared test --run src/schema/exams/live-inspection-schema.test.ts`: passed, 1 file and 6 tests.
    - `pnpm --dir packages/shared build`: passed.
    - `pnpm --dir packages/db test --run src/tests/live-inspection-schema.test.ts src/tests/live-inspection-realtime-policy.test.ts`: passed, 2 files and 6 tests.
    - `pnpm --dir packages/db build`: passed.
    - Focused API live-inspection TypeScript check through a temporary scoped tsconfig: passed.
    - `pnpm --dir app/sentinel-api test --run src/modules/security/permission/data/sync-system-permissions.test.ts src/modules/examination/live-inspection/live-inspection-access.service.test.ts src/modules/examination/live-inspection/live-inspection.repository.test.ts src/modules/examination/live-inspection/live-inspection-state.service.test.ts --testNamePattern "^(?!.*sync permissions into the database).*"`: passed, 4 files, 29 tests passed and 1 existing DB-backed sync test skipped.
    - Targeted Prettier check for package-02 touched files: passed.
- Database-backed validation:
    - `pnpm --dir packages/db exec prisma migrate status`: confirmed `20260719143000_add_live_inspection_leases` was pending before provider endpoints were mounted.
    - First deploy attempt failed on Supabase with `ERROR: must be owner of table messages` for `ALTER TABLE "realtime"."messages" ENABLE ROW LEVEL SECURITY`; follow-up catalog check confirmed `realtime.messages` already had RLS enabled and was owned by `supabase_realtime_admin`.
    - Rollback-only permission probe confirmed the migration role can create the required SELECT policy on `realtime.messages`; the migration was corrected to remove the owner-only RLS enable statement.
    - Reviewed and added `packages/db/prisma/migrations/20260719143000_add_live_inspection_leases/rollback.sql`; the empty partial LiveKit tables/functions from the failed attempt were dropped with that rollback script, then Prisma marked the failed attempt rolled back.
    - `pnpm --dir packages/db exec prisma migrate deploy`: passed after repair, applying `20260719143000_add_live_inspection_leases`.
    - DB-backed concurrent synthetic lease validation passed:
        - duplicate active attempt rejected by `live_inspection_leases_active_attempt_key`;
        - duplicate active viewer rejected by `live_inspection_leases_active_viewer_key`.
    - Cleanup verification confirmed zero remaining synthetic `codex-livekit-*` leases, attempts, and auth users.
