---
title: "Phase 2: EAS Build Profiles, App Manifest & Permissions"
type: phase
parent: "0001-task-sentinel-mobile-expo-apk-and-playstore-release"
phase: "2"
status: completed
created: "2026-09-23"
tags: [task, phase, mobile, eas, android]
---

# Phase 2: EAS Build Profiles, App Manifest & Permissions

## Objective

Configure `eas.json` with dedicated build profiles for standalone Android `.apk` generation (`preview` and `production-apk`) and Google Play Store Android App Bundle generation (`production`). Align `app.json` with required Android manifest configurations, baseline `versionCode`, and scoped permissions.

## Dependencies & Prerequisites

- Phase 1 environment validation contract.
- Validated Expo account `@livadomc/sentinel-mobile` and project ID `249c9386-b6d4-4eaa-80c8-11c0f4abe5d3`.

## Impacted Files & Components

- `app/sentinel-mobile/eas.json` [MODIFY]: Configured `preview`, `production-apk`, and `production` profiles.
- `app/sentinel-mobile/app.json` [MODIFY]: Added baseline `android.versionCode: 1`, explicit permissions array, and verified bundle identifiers.

## Implementation Tasks

- [x] Task 2.1 — Update `eas.json`:
  - `build.preview`:
    - `"distribution": "internal"`
    - `"android": { "buildType": "apk" }`
    - `"environment": "production"`
  - `build.production-apk`:
    - `"extends": "production"`
    - `"distribution": "internal"`
    - `"android": { "buildType": "apk" }`
  - `build.production`:
    - `"autoIncrement": true`
    - `"android": { "buildType": "app-bundle" }`
  - `submit.production`:
    - `"android": { "track": "internal" }`
- [x] Task 2.2 — Update `app.json`:
  - Add `versionCode: 1` under `expo.android`.
  - Add explicit permissions list under `expo.android.permissions` (`CAMERA`, `RECORD_AUDIO`, `INTERNET`, `ACCESS_NETWORK_STATE`).
  - Verify package name is `com.livadomc.sentinelmobile`.

## Verification & Testing

- `eas config --platform android --profile preview` (PASS: resolves `buildType: "apk"` and links production EAS environment).
- `eas config --platform android --profile production` (PASS: resolves `buildType: "app-bundle"`, `autoIncrement: true`, and links production EAS environment).
- `eas config` validates `app.json` schema without errors.

## Risks & Rollback

- **Risk:** Auto-increment version code might fail if remote credentials are not synchronized.
- **Mitigation:** Setting baseline `versionCode: 1` in `app.json` ensures local and remote fallbacks are consistent.
