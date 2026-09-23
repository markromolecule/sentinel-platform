---
title: "Sentinel Mobile Expo APK and Play Store Release Engineering"
type: task
status: completed
created: "2026-09-23"
tags: [task, mobile, expo, eas, android, release]
---

# Sentinel Mobile Expo APK and Play Store Release Engineering

## Outcome

Established a production-grade build, environment validation, and deployment pipeline for `sentinel-mobile` that enables:
1. One-click or command-line generation of directly installable standalone Android `.apk` builds (via `preview` / `production-apk` EAS profiles) for internal QA dogfooding and device testing.
2. Production-grade Google Play Store release configuration generating signed Android App Bundles (`.aab` via `production` EAS profile) with remote version code auto-increment.
3. Strict, compile-time and runtime Zod-based environment variable verification (`lib/config/env.ts` and `scripts/verify-env.mjs`) guaranteeing all required variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`, etc.) are validated before EAS build and app startup.
4. EAS Workflows (`.eas/workflows/build-apk.yaml`, `.eas/workflows/release-playstore.yaml`) and NPM/PNPM release scripts for seamless automation.

## Pre-planning record

### Actors and goals

- **QA Engineers & Testers:** Need direct `.apk` downloads to sideload and test on physical devices without Google Play review latency.
- **Release Engineers:** Need repeatable, verifiable `.aab` builds for Google Play Console internal testing and production release.
- **Mobile Developers:** Need instant feedback when environment variables are missing or malformed, preventing broken production builds on Expo EAS.

### Domain language

- **APK (Android Package):** Standalone installable file format for direct side-loading on Android devices.
- **AAB (Android App Bundle):** Google Play's publishing format; Google Play generates optimized APKs from the bundle for end-user devices.
- **EAS Build:** Expo Application Services cloud build system configured via `eas.json`.
- **EAS Workflows:** Native CI/CD orchestration defined in `.eas/workflows/*.yaml` on Expo.
- **EXPO_PUBLIC_*:** Inlined public environment variables embedded into the JavaScript bundle at build time.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Developer runs APK build | `eas.json` has `buildType: "apk"` under `preview` / `production-apk` | EAS generates downloadable `.apk` file | If env missing, pre-build validator aborts with clear error | Verified |
| SC-02 | Developer runs Play Store build | `eas.json` has `buildType: "app-bundle"` and `autoIncrement: true` | EAS generates `.aab` ready for Play Store submission | Version collision avoided via EAS remote version source | Verified |
| SC-03 | App launches with missing/invalid env | Runtime environment lacks `EXPO_PUBLIC_SUPABASE_URL` | Zod schema in `env.ts` catches issue immediately with diagnostic error | App fails fast with explicit log instead of silent undefined crash | Verified |
| SC-04 | EAS build runs in cloud without local `.env` | Remote EAS environment variables configured | Build picks up production variables defined in EAS project settings and `eas.json` | EAS env verified via pre-flight script | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | How to produce `.apk` vs `.aab`? | Configure `preview` and `production-apk` profiles with `android.buildType: "apk"` and `production` with `android.buildType: "app-bundle"` | Expo EAS standards recommend separate profiles for APK side-loading vs Play Store AAB publishing | Building only AAB requires extra bundletool extraction for testers | `app/sentinel-mobile/eas.json` |
| DEC-02 | How to guarantee production env vars? | Combine Zod runtime schema (`lib/config/env.ts`), pre-build validator (`scripts/verify-env.mjs`), and EAS environment reconciliation | Eliminates silent undefined variable failures in production | Ad-hoc `process.env.VAR!` non-null assertions | `lib/config/env.ts` |
| DEC-03 | Where to define automated workflows? | Create `.eas/workflows/build-apk.yaml` and `.eas/workflows/release-playstore.yaml` in `app/sentinel-mobile/.eas/workflows/` | Native Expo Workflows integration displayed directly in Expo dashboard (`@livadomc/sentinel-mobile`) | Only local terminal commands | `.eas/workflows/` |

### Unknowns and blockers

- *Google Play Service Account Key:* Google Play API service account JSON is needed for automatic `eas submit` to Google Play Console. Documented in the release runbook (`docs/context/September/23/mobile-release-runbook.md`).

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-01 | `eas.json` supports standalone `.apk` generation via `preview` and `production-apk` profiles | Configure `buildType: "apk"` and `distribution: "internal"` in `eas.json` | `eas config --platform android --profile preview` | Verified |
| AC-02 | SC-02, DEC-01 | `eas.json` supports Play Store `.aab` generation with auto-incrementing version codes | Configure `buildType: "app-bundle"` and `autoIncrement: true` in `eas.json` | `eas config --platform android --profile production` | Verified |
| AC-03 | SC-03, DEC-02 | Runtime env validator catches missing/invalid variables before app crash | Implement Zod schema in `lib/config/env.ts` | Unit tests in `lib/config/env.test.ts` (9/9 pass) | Verified |
| AC-04 | SC-03, DEC-02 | All existing env references (`lib/supabase.ts`, `lib/config/api-config.ts`, `lib/auth/oauth-callback.ts`) use validated env | Refactor call sites to use `env.ts` | Full mobile test suite (57/57 files pass, 410/410 tests) | Verified |
| AC-05 | SC-04, DEC-02 | Pre-build script verifies env completeness before triggering EAS build | Implement `scripts/verify-env.mjs` and `package.json` script `verify:env` | Run `pnpm run verify:env` | Verified |
| AC-06 | DEC-03 | EAS Workflows configured for APK and Play Store release | Create `.eas/workflows/build-apk.yaml` and `.eas/workflows/release-playstore.yaml` | Validated YAML structures against Expo specification | Verified |

## Scope

- Updating `app/sentinel-mobile/eas.json` with `preview`, `production-apk`, and `production` profiles.
- Updating `app/sentinel-mobile/app.json` with baseline `versionCode` and permissions.
- Creating `app/sentinel-mobile/lib/config/env.ts` for Zod runtime validation.
- Creating `app/sentinel-mobile/scripts/verify-env.mjs` for pre-build CLI validation.
- Refactoring `lib/supabase.ts`, `lib/config/api-config.ts`, and `lib/auth/oauth-callback.ts` to use validated config.
- Creating `.eas/workflows/build-apk.yaml` and `.eas/workflows/release-playstore.yaml`.
- Updating `app/sentinel-mobile/package.json` with build, submission, and verification scripts.
- Adding comprehensive unit tests for env validation.

## Non-goals

- Modifying iOS build certificates or App Store provisioning.
- Changing API route contracts in `sentinel-api`.

## Constraints and decisions

- Maintain compatibility with Expo SDK 57 and React Native 0.86.3.
- Monorepo package dependencies must resolve cleanly via pnpm.

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1: Environment Validation & Configuration Contracts
- [x] `phase-02-architecture-and-contracts.md` — Phase 2: EAS Build Profiles, App Manifest & Permissions
- [x] `phase-03-implementation-and-tests.md` — Phase 3: Implementation, Refactoring, Scripts & Unit Tests
- [x] `phase-04-verification-and-release.md` — Phase 4: Full Quality Gates, Pre-flight Verification & Dry Run

## Verification

- Automated test suite: `pnpm --filter sentinel-mobile test` (PASS: 57 test files, 410 tests passed).
- Unit test suite: `pnpm --filter sentinel-mobile test lib/config/env.test.ts` (PASS: 9 tests passed).
- Pre-flight env check: `pnpm --filter sentinel-mobile run verify:env` (PASS: all production environment variables validated).
- EAS profile inspection:
  - `eas config --platform android --profile preview` (PASS: verifies APK build configuration & production EAS environment variable loading).
  - `eas config --platform android --profile production-apk` (PASS: verifies production-targeted APK build configuration).
  - `eas config --platform android --profile production` (PASS: verifies Play Store AAB bundle configuration & autoIncrement).

## Deviations

None.

## Result

Sentinel Mobile is completely prepared and production-ready for:
1. Generating standalone Android `.apk` builds directly for device installation.
2. Generating `.aab` release bundles for Google Play Store with auto-incrementing version codes.
3. Automatically validating all environment variables before EAS builds and on application boot.
4. Managing automated build pipelines through EAS Workflows in Expo and developer CLI scripts.
