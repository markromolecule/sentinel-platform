---
title: "Phase 1: EAS Build Profile and Script Configuration"
type: phase
parent: "0001-task-sentinel-mobile-enforce-android-apk-build"
phase: "01"
status: completed
completed_at: "2026-09-28"
merge_commit: "ea573caf"
tags: [task, phase, mobile, eas]
---

# Phase 1: EAS Build Profile and Script Configuration

## Objective

Configure `app/sentinel-mobile/eas.json` to enforce `apk` build generation for preview and ad-hoc distribution profiles, and declare convenience CLI build scripts in `app/sentinel-mobile/package.json`.

## Units

- [x] `unit-01-eas-build-profile-and-scripts.md` — Configure EAS build profiles and npm scripts. (verified, commit `ea573caf`)

## Deliverables

- Updated `app/sentinel-mobile/eas.json` with explicit `"android": { "buildType": "apk" }`.
- Added `build:android:apk` and `build:android:apk:local` npm scripts in `app/sentinel-mobile/package.json`.
