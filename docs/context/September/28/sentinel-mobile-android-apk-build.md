---
title: "Enforce Standalone Android APK Build Generation in Sentinel Mobile"
type: context
status: draft
created: "2026-09-28"
tags: [context, mobile, android, expo, eas, apk]
feature: "sentinel-mobile-apk-build"
---

# Enforce Standalone Android APK Build Generation in Sentinel Mobile Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  Building `sentinel-mobile` for Android currently generates an Android App Bundle (`.aab`) instead of an installable Android Package (`.apk`). An `.aab` file cannot be installed directly onto physical mobile devices, emulators, or test hardware for QA/field testing without going through Google Play Console or running `bundletool` conversion.
- **Root Cause Analysis (Evidence-Backed):**
  - `app/sentinel-mobile/eas.json` currently defines three build profiles: `development`, `preview`, and `production`.
  - When running `eas build -p android` without an explicit `--profile` flag, EAS Build defaults to `--profile production`, which defaults to `"buildType": "app-bundle"` (`.aab`) because Google Play requires `.aab` for store publishing.
  - The `preview` profile specifies `"distribution": "internal"`, but lacks an explicit `android.buildType: "apk"` declaration. Modern EAS CLI defaults or treats profiles without `buildType: "apk"` as app bundles unless explicitly overridden.
- **Business / User Value:**
  Enables QA engineers, proctors, and developers to download and sideload `.apk` binaries directly onto test devices for rapid offline and on-campus exam monitoring verification without requiring Google Play Store submission or manual `bundletool` extraction.
- **Success Criteria:**
  1. Triggering an Android build via EAS (cloud or `--local`) generates a directly downloadable, installable `.apk` artifact.
  2. Developers have explicit build profiles separating store-targeted `.aab` builds (`production`) from installable `.apk` distribution builds (`preview` / `preview-apk`).
  3. Clear documentation and/or npm/pnpm convenience scripts for generating APK builds.

## 2. Requirements & User Stories

### User Stories / Scenarios
- *As a QA Tester or Mobile Developer, I want to trigger a build for `sentinel-mobile` that yields an installable `.apk`, so that I can directly sideload and test exam monitoring, camera/mic permissions, and websocket telemetry on physical Android devices.*
- *As a Release Engineer, I want the production profile to retain `.aab` output for Google Play Store compliance, while test/preview profiles yield `.apk` output, so that distribution pipelines remain clean and predictable.*

### Functional Requirements
- [ ] **EAS Configuration Update:** Update `app/sentinel-mobile/eas.json` to configure `"android": { "buildType": "apk" }` on the `preview` profile (and/or add a dedicated `apk` profile).
- [ ] **Preserve Production AAB:** Keep the `production` profile generating `.aab` for Google Play Store releases.
- [ ] **Local Build Script (Optional Convenience):** Add convenience package script (e.g. `build:android:apk`) in `app/sentinel-mobile/package.json` for running `eas build -p android --profile preview` (or `--local`).
- [ ] **Verification:** Validate that EAS CLI parses `eas.json` schema without errors.

### Edge Cases & Failure Modes
- **File Size Increase:** APKs package universal ABIs unless split APKs are configured, resulting in larger binary sizes (~40-80MB) compared to dynamic split bundles delivered by Google Play.
- **Signing Credentials:** Building an APK for internal distribution requires Android credentials (keystore). EAS handles this either in cloud credentials management or locally via interactive prompts.
- **Development vs Standalone:** A `developmentClient: true` APK requires a running Metro dev server (`npx expo start`), whereas `distribution: "internal"` with `buildType: "apk"` creates a standalone self-contained app running compiled JavaScript bundles.

## 3. Technical & Architectural Context

- **Affected Layers:** Mobile (`app/sentinel-mobile/`)
- **Existing Files & Configuration Symbols:**
  - `app/sentinel-mobile/eas.json` - Defines EAS build profiles (`preview`, `production`, `development`).
  - `app/sentinel-mobile/app.json` - Expo project configuration, bundle identifier (`com.livadomc.sentinelmobile`), and permissions.
  - `app/sentinel-mobile/package.json` - Mobile scripts and dependencies (`expo`: `~57.0.22`, `react-native`: `0.86.3`).
- **Data Model & Schema Changes:** None.
- **Security & Permissions:**
  - Android permissions in `app.json`: `CAMERA`, `RECORD_AUDIO` (exam monitoring).
  - Keystore signing credentials managed via EAS cloud or local keystore.

## 4. Scope & Boundaries

- **In Scope:**
  - Configuration of `app/sentinel-mobile/eas.json` to enforce `.apk` creation for preview/ad-hoc testing.
  - Documenting CLI execution instructions for both cloud EAS Build and local `--local` builds.
- **Out of Scope / Non-Goals:**
  - Modifying native Java/Kotlin code under `android/` directly.
  - Changing Google Play production release artifact policy (remains `.aab`).

## 5. References & External Context

- Expo EAS Build Android buildType reference: `https://docs.expo.dev/build-reference/apk/`
- Expo `eas.json` configuration schema.
