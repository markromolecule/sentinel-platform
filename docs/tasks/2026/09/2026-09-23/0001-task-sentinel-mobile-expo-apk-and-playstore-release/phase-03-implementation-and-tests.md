---
title: "Phase 3: Incremental Implementation, Refactoring & EAS Workflows"
type: phase
parent: "0001-task-sentinel-mobile-expo-apk-and-playstore-release"
phase: "3"
status: completed
created: "2026-09-23"
tags: [task, phase, mobile, workflows]
---

# Phase 3: Incremental Implementation, Refactoring & EAS Workflows

## Objective

Connect all existing runtime environment references to the new validated configuration (`lib/config/env.ts`), set up EAS Workflows (`.eas/workflows/`), and add developer-friendly package scripts for verifying environments, building APKs, and releasing to the Play Store.

## Dependencies & Prerequisites

- Phase 1 & Phase 2 designs approved.

## Impacted Files & Components

- `app/sentinel-mobile/lib/supabase.ts` [MODIFY]: Consumes validated `supabaseUrl` and `supabaseAnonKey` from `env.ts`.
- `app/sentinel-mobile/lib/config/api-config.ts` [MODIFY]: Integrates validated API URLs via `getMobileEnv()`.
- `app/sentinel-mobile/lib/auth/oauth-callback.ts` [MODIFY]: Uses validated auth proxy and callback path via `getMobileEnv()`.
- `app/sentinel-mobile/.eas/workflows/build-apk.yaml` [NEW]: EAS workflow for building Android APK.
- `app/sentinel-mobile/.eas/workflows/release-playstore.yaml` [NEW]: EAS workflow for building production AAB and submitting to Google Play Store.
- `app/sentinel-mobile/package.json` [MODIFY]: Added scripts `verify:env`, `build:apk`, `build:apk:prod`, `build:playstore`, and `submit:playstore`.

## Implementation Tasks

- [x] Task 3.1 — Refactor `lib/supabase.ts` to use `env.EXPO_PUBLIC_SUPABASE_URL` and `env.EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [x] Task 3.2 — Refactor `lib/config/api-config.ts` and `lib/auth/oauth-callback.ts` to utilize typed values from `lib/config/env.ts`.
- [x] Task 3.3 — Author EAS Workflow `.eas/workflows/build-apk.yaml`:
  - Triggers: `workflow_dispatch` (manual) and tag/branch triggers.
  - Jobs: `build_apk` running EAS build on Android with `preview` / `production-apk` profile.
- [x] Task 3.4 — Author EAS Workflow `.eas/workflows/release-playstore.yaml`:
  - Triggers: `workflow_dispatch` and release tags (`v*`).
  - Jobs: `build_production_aab` running EAS build on Android with `production` profile, followed by `submit_playstore` job.
- [x] Task 3.5 — Add package scripts to `app/sentinel-mobile/package.json`:
  ```json
  "verify:env": "node scripts/verify-env.mjs",
  "build:apk": "pnpm run verify:env && eas build --platform android --profile preview",
  "build:apk:prod": "pnpm run verify:env && eas build --platform android --profile production-apk",
  "build:playstore": "pnpm run verify:env && eas build --platform android --profile production",
  "submit:playstore": "eas submit --platform android --profile production"
  ```

## Verification & Testing

- `pnpm --filter sentinel-mobile run verify:env` (PASS: all production environment variables validated).
- Full regression suite: `pnpm --filter sentinel-mobile test` (PASS: 57/57 test files passed, 410/410 tests passed).
- EAS workflow YAML files created and syntax-checked.

## Risks & Rollback

- **Risk:** Inlined `EXPO_PUBLIC_*` variables not recognized by Babel / Metro if accessed through dynamic indexing.
- **Mitigation:** Access properties as static member expressions (`process.env.EXPO_PUBLIC_SUPABASE_URL`) in `env.ts` so Metro replaces them with constants at bundle time.
