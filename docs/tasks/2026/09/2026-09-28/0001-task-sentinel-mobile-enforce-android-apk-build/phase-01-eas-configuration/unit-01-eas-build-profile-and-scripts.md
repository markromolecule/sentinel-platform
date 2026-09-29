---
title: "Configure EAS Android Build Profiles and Package Scripts"
type: unit
parent: "phase-01-eas-configuration"
unit: "01.01"
branch: "task/0001/phase-01/unit-01-eas-build-profile-and-scripts"
worktree: ".worktrees/0001/phase-01/unit-01-eas-build-profile-and-scripts"
status: verified
created: "2026-09-28"
tags: [task, unit, mobile, eas]
depends_on: []
parallelizable_with: []
---

# Unit 01.01: Configure EAS Android Build Profiles and Package Scripts

> Phase: phase-01-eas-configuration · Depends on: none · Parallelizable with: none
> Worktree: .worktrees/0001/phase-01/unit-01-eas-build-profile-and-scripts · Branch: task/0001/phase-01/unit-01-eas-build-profile-and-scripts

## Objective

Update `app/sentinel-mobile/eas.json` to enforce standalone `.apk` output on the `preview` profile and add an explicit `preview-apk` profile, while defining convenience build scripts in `app/sentinel-mobile/package.json`.

## Context packet

### Current `app/sentinel-mobile/eas.json`

```json
{
    "cli": {
        "version": ">= 16.32.0",
        "appVersionSource": "remote"
    },
    "build": {
        "development": {
            "developmentClient": true,
            "distribution": "internal"
        },
        "preview": {
            "distribution": "internal"
        },
        "production": {
            "autoIncrement": true
        }
    },
    "submit": {
        "production": {}
    }
}
```

### Current `app/sentinel-mobile/package.json` Scripts

```json
    "scripts": {
        "start": "expo start",
        "android": "expo run:android",
        "ios": "expo run:ios",
        "web": "expo start --web",
        "test": "vitest run --passWithNoTests",
        "ignore-build": "npx turbo-ignore"
    }
```

### Acceptance Criteria Served

- **AC-01:** `eas.json` explicitly defines `"android": { "buildType": "apk" }` on `preview` and `preview-apk` profiles.
- **AC-02:** `eas.json` preserves `production` profile as `.aab` for store submissions.
- **AC-03:** `package.json` defines `build:android:apk` and `build:android:apk:local`.

## Preconditions

- Branch `task/0001/phase-01/unit-01-eas-build-profile-and-scripts` checked out.

## Scope

**In scope:**

- `app/sentinel-mobile/eas.json`
- `app/sentinel-mobile/package.json`

**Out of scope:**

- Native `android/` or `ios/` project files.
- Modifying production submission settings in `eas.json`.

## Steps

1. In `app/sentinel-mobile/eas.json`, update the `preview` profile to include `"android": { "buildType": "apk" }`.
2. Add a `preview-apk` profile that explicitly sets `"distribution": "internal"` and `"android": { "buildType": "apk" }`.
3. In `app/sentinel-mobile/package.json`, add the following convenience scripts:
   - `"build:android:apk": "eas build --platform android --profile preview"`
   - `"build:android:apk:local": "eas build --platform android --profile preview --local"`
4. Verify JSON syntax of both modified files.

## Verification

- **Test Type:** Contract / Configuration Test
  - *Justification:* Validates configuration contract required by EAS CLI.
- **Test Case 1 (Happy Path - APK Profile):** Verify `eas.json` parsed as JSON contains `build.preview.android.buildType === "apk"`.
- **Test Case 2 (Store Safety):** Verify `eas.json` does not set `buildType: "apk"` on `production`.
- **Test Case 3 (Scripts):** Verify `package.json` scripts contain executable EAS commands.
- **Command:** `node --test app/sentinel-mobile/eas-config.test.mjs`
- **Result:** PASS (3/3 tests passed in 80ms)
- **Commit:** `ea573caf` (`feat(mobile): enforce APK buildType for preview and add build scripts (01.01)`)

## Rollback

Revert changes to `app/sentinel-mobile/eas.json` and `app/sentinel-mobile/package.json` using `git checkout -- app/sentinel-mobile/eas.json app/sentinel-mobile/package.json`.

## Definition of done

- [x] Maps to acceptance criteria: AC-01, AC-02, AC-03
- [x] Valid JSON syntax in `eas.json` and `package.json`
- [x] Executed inside dedicated worktree `.worktrees/0001/phase-01/unit-01-eas-build-profile-and-scripts`
- [x] Independent diff review pre-screening passed (0 scope leaks, 0 SOLID violations)

