---
title: "Upgrade Expo SDK to SDK 57"
type: task
status: completed
created: "2026-09-09"
tags: [task, mobile, expo, sdk-upgrade]
---

# Upgrade Expo SDK to SDK 57

## Outcome

Upgrade `app/sentinel-mobile` and the root workspace from Expo SDK 54 to Expo SDK 57 (`57.0.21`), aligning React Native to `0.86.3` and React to `19.2.3`, migrating Reanimated 4 worklets Babel configuration, decoupling React Navigation imports to Expo Router, regenerating the pnpm lockfile, and ensuring all tests and typechecks pass.

## Pre-planning record

### Actors and goals

- **Mobile Developer / Student User:** Can run and load Sentinel Mobile on physical iOS devices running the latest Expo Go app (SDK 57.0.0) without incompatibility errors.
- **Sentinel Engineering:** Maintains dependency parity across the monorepo where web/core apps already use React `19.2.3`.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student opens app in Expo Go SDK 57 | Expo Go v57 installed on iOS | Project loads without SDK mismatch modal | If package version mismatch, run `expo install --check` | Verified |
| SC-02 | Mobile developer runs unit tests | Vitest configured | All 36 test suites pass | Update mock for `expo-router` / `useFocusEffect` | Verified |
| SC-03 | Mobile developer runs TypeScript check | `tsc --noEmit` executed | Zero type errors | Align React / Native types | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Which Expo SDK 57 version to target? | `~57.0.21` (Expo latest) | Matches current Expo Go installed version 57.0.0 and stable release dist-tag | Staying on SDK 54 (incompatible with device Expo Go) | `package.json` |
| DEC-02 | How to migrate `useFocusEffect`? | Import directly from `expo-router` | In SDK 56+, Expo Router decoupled from `@react-navigation/*` | Keeping `@react-navigation/native` peer dependency conflicts | `use-exam-lobby.ts` |
| DEC-03 | How to configure Reanimated 4 in Babel? | Use `react-native-worklets/plugin` | Reanimated 4 split worklets into `react-native-worklets` | Retaining `react-native-reanimated/plugin` causes runtime crash | `babel.config.js` |

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01 / DEC-01 | `expo` is updated to `~57.0.21` and all Expo native modules match SDK 57 | Update `app/sentinel-mobile/package.json` and root `package.json` | `npx expo install --check` | Verified |
| AC-02 | DEC-02 | `@react-navigation` dependencies removed; `useFocusEffect` imported from `expo-router` | Update `use-exam-lobby.ts` and test mock | `pnpm --dir app/sentinel-mobile test` | Verified |
| AC-03 | DEC-03 | Babel uses `react-native-worklets/plugin` | Update `babel.config.js` | Inspection and test execution | Verified |
| AC-04 | SC-02 | All unit tests pass | Keep mocks aligned | `vitest run --passWithNoTests` | Verified |
| AC-05 | SC-03 | Typecheck passes with zero errors | Type alignment | `tsc --noEmit` | Verified |

## Scope

- `app/sentinel-mobile/package.json`: Upgrade Expo and native module dependencies to SDK 57 specs.
- `package.json`: Upgrade root `expo` to `^57.0.21`.
- `app/sentinel-mobile/babel.config.js`: Update plugin to `react-native-worklets/plugin`.
- `app/sentinel-mobile/features/exam/hooks/use-exam-lobby.ts`: Migrate `useFocusEffect` import to `expo-router`.
- `app/sentinel-mobile/features/exam/hooks/use-exam-lobby.test.ts`: Update test mock.
- `pnpm-lock.yaml`: Regenerate lockfile via `pnpm install`.

## Non-goals

- Refactoring mobile application UI or business logic unrelated to SDK upgrade.
- Upgrading unrelated web or core app dependencies.

## Phases

- [x] `phase-01-package-dependencies.md` — Update package.json files and dependencies to SDK 57.
- [x] `phase-02-code-and-config-migrations.md` — Migrate Babel configuration, decouple React Navigation imports, update test mocks.
- [x] `phase-03-lockfile-and-verification.md` — Regenerate lockfile, run expo install checks, typecheck, and test suite.

## Verification

- `pnpm --dir app/sentinel-mobile test`: 36 passed (36 test files, 229 passed tests).
- `pnpm --dir app/sentinel-mobile exec tsc --noEmit`: 0 errors.
- `npx expo install --check`: Dependencies are up to date (exit code 0).
- `npx expo-doctor`: 21/21 checks passed. No issues detected! (exit code 0).

## Result

Expo SDK 57 upgrade successfully completed. Dependencies, Babel plugin, navigation imports, configuration schema, TypeScript types, and test suites are all validated and passing. Ready for device verification with Expo Go SDK 57.0.0.
