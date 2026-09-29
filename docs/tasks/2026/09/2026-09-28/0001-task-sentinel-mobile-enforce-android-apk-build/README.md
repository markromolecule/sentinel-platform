---
title: "Sentinel Mobile Enforce Android APK Build"
type: task
status: completed
created: "2026-09-28"
completed_at: "2026-09-28"
tags: [task, mobile, android, expo, eas, apk]
target_branch: build-android-expo
base_branch: "task/0001-sentinel-mobile-enforce-android-apk-build"
---

# Sentinel Mobile Enforce Android APK Build Implementation Plan

## Outcome

Configure `sentinel-mobile` to enforce the generation of a standalone, installable `.apk` file for testing and sideloading on Android devices via Expo Application Services (EAS Build), while preserving `.aab` (Android App Bundle) output for Google Play Store production distribution.

## Pre-planning record

- **Context Specification:** [[docs/context/September/28/sentinel-mobile-android-apk-build|Sentinel Mobile Android APK Build Context Spec]] (`status: ready`)

### Actors and goals

- **Mobile QA / Proctors:** Download and directly sideload `.apk` binaries onto test phones/tablets to verify mobile monitoring, camera/mic permissions, and websocket heartbeat streams without needing Google Play Console access.
- **Mobile Developers:** Trigger builds with `eas build -p android --profile preview` (or `--local`) and receive an `.apk` artifact directly.
- **Release Engineers:** Ensure production store track retains `.aab` for compliance with Google Play publishing standards.

### Domain language

- **Android App Bundle (.aab):** Google Play's publishing format that defers APK generation and signing to Google Play. Cannot be directly sideloaded via `adb install` or downloaded as an installable file by end users.
- **Android Package (.apk):** Self-contained, executable Android application package installable directly onto any physical device or emulator.
- **EAS Build:** Expo Application Services cloud and local compilation pipeline configured via `eas.json`.
- **Build Profile:** Named configuration in `eas.json` (e.g. `development`, `preview`, `production`) specifying credentials, environment variables, and artifact targets.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Developer runs EAS build with `--profile preview` | `app/sentinel-mobile/eas.json` configured | EAS outputs standalone `.apk` binary | If `buildType` is missing, defaults to `.aab`; fixed by explicit `"buildType": "apk"` | Covered |
| SC-02 | Developer runs EAS build with `--profile production` | `eas.json` configured | EAS outputs `.aab` for Google Play | Store bundle remains compliant | Covered |
| SC-03 | Developer executes local preview build | EAS CLI installed with `--local` | Local build daemon generates `.apk` without consuming cloud build queue | Sideloadable on emulator / test hardware | Covered |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| D-01 | Where should `buildType: "apk"` be declared? | In `preview` and `preview-apk` profiles in `app/sentinel-mobile/eas.json` | Keeps `production` compliant with Google Play (.aab) while giving test builds an installable APK. | Rejected changing `production` directly to `.apk`, which would break Google Play Store submissions. | [[docs/context/September/28/sentinel-mobile-android-apk-build|Context Spec]] |
| D-02 | Should dedicated package scripts be added? | Yes, add `build:android:apk` and `build:android:apk:local` to `app/sentinel-mobile/package.json` | Reduces friction and ensures developers run the exact profile flags without remembering EAS CLI arguments. | Rejected requiring manual memorization of CLI arguments. | [[docs/context/September/28/sentinel-mobile-android-apk-build|Context Spec]] |

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | D-01, SC-01 | `app/sentinel-mobile/eas.json` explicitly defines `"android": { "buildType": "apk" }` on the `preview` profile and a dedicated `preview-apk` profile. | `app/sentinel-mobile/eas.json` | `node --test app/sentinel-mobile/eas-config.test.mjs` | Verified |
| AC-02 | D-01, SC-02 | `app/sentinel-mobile/eas.json` preserves `production` profile without `buildType: "apk"`, ensuring `.aab` is retained for store publishing. | `app/sentinel-mobile/eas.json` | `node --test app/sentinel-mobile/eas-config.test.mjs` | Verified |
| AC-03 | D-02, SC-03 | `app/sentinel-mobile/package.json` includes `build:android:apk` and `build:android:apk:local` scripts targeting the preview profile. | `app/sentinel-mobile/package.json` | `node --test app/sentinel-mobile/eas-config.test.mjs` | Verified |
| AC-04 | SC-01, SC-03 | A runbook section in `app/sentinel-mobile/README.md` documents how to build, download, and sideload the `.apk` on physical test devices. | `app/sentinel-mobile/README.md` | `node --test app/sentinel-mobile/runbook.test.mjs` | Verified |

## Scope

- **In Scope:**
  - `app/sentinel-mobile/eas.json`
  - `app/sentinel-mobile/package.json`
  - `app/sentinel-mobile/README.md`
- **Non-goals:**
  - Changing Google Play production bundle settings (`production` profile continues generating `.aab`).
  - Modifying native code in `android/` directly.

## Worktree & Branch Topology

| Phase | Unit ID | Unit Title | Branch Name | Worktree Directory | Merge Target | Status |
|---|---|---|---|---|---|---|
| phase-01 | 01.01 | Configure EAS Android Build Profiles and Package Scripts | `task/0001/phase-01/unit-01-eas-build-profile-and-scripts` | `.worktrees/0001/phase-01/unit-01-eas-build-profile-and-scripts` | `task/0001/phase-01/integration` | merged |
| phase-02 | 02.01 | Validate EAS Schema and Author APK Build Runbook | `task/0001/phase-02/unit-01-schema-validation-and-runbook` | `.worktrees/0001/phase-02/unit-01-schema-validation-and-runbook` | `task/0001/phase-02/integration` | merged |

## Phases

- [x] `phase-01-eas-configuration/phase.md` — Phase 1: EAS Build Profile and Script Configuration
- [x] `phase-02-verification-and-runbook/phase.md` — Phase 2: Schema Validation and Runbook Documentation

## Verification

- **Command:** `node --test app/sentinel-mobile/eas-config.test.mjs app/sentinel-mobile/runbook.test.mjs`
- **Result:** 4/4 tests passing in 88ms.

## Finalization & Merge Ledger

| Stage | Source Branch | Target Branch | Merge Commit SHA | Worktree Cleaned | Verification Command |
|---|---|---|---|---|---|
| Unit 01.01 | `task/0001/phase-01/unit-01-...` | `task/0001/phase-01/integration` | `ea573caf` | Yes | `node --test app/sentinel-mobile/eas-config.test.mjs` |
| Phase 01 | `task/0001/phase-01/integration` | `task/0001-sentinel-mobile-...` | `ea573caf` | Yes | Fast-forward merge |
| Unit 02.01 | `task/0001/phase-02/unit-01-...` | `task/0001/phase-02/integration` | `02b63733` | Yes | `node --test app/sentinel-mobile/runbook.test.mjs` |
| Phase 02 | `task/0001/phase-02/integration` | `task/0001-sentinel-mobile-...` | `02b63733` | Yes | Fast-forward merge |
| Task Final | `task/0001-sentinel-mobile-...` | `build-android-expo` | `02b63733` | Yes | `node --test app/sentinel-mobile/*.test.mjs` |
