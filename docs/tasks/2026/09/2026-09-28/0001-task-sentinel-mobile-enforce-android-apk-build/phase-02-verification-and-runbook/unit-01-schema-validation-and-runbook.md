---
title: "Validate EAS Schema and Author APK Build Runbook"
type: unit
parent: "phase-02-verification-and-runbook"
unit: "02.01"
branch: "task/0001/phase-02/unit-01-schema-validation-and-runbook"
worktree: ".worktrees/0001/phase-02/unit-01-schema-validation-and-runbook"
status: verified
created: "2026-09-28"
tags: [task, unit, mobile, docs]
depends_on: ["01.01"]
parallelizable_with: []
---

# Unit 02.01: Validate EAS Schema and Author APK Build Runbook

> Phase: phase-02-verification-and-runbook · Depends on: 01.01 · Parallelizable with: none
> Worktree: .worktrees/0001/phase-02/unit-01-schema-validation-and-runbook · Branch: task/0001/phase-02/unit-01-schema-validation-and-runbook

## Objective

Validate `eas.json` with the EAS CLI schema parser and author a clear, operational runbook in `app/sentinel-mobile/README.md` explaining how to run cloud and local APK builds, download the artifact, and install it on physical test devices via ADB or direct download.

## Context packet

### Acceptance Criteria Served
- **AC-04:** A runbook section in `app/sentinel-mobile/README.md` documents how to build, download, and sideload the `.apk` on physical test devices.

### Required Runbook Sections
1. Prerequisites (EAS CLI, logged-in Expo account or local Android SDK).
2. Cloud Build command: `pnpm --dir app/sentinel-mobile run build:android:apk` (or `eas build -p android --profile preview`).
3. Local Build command: `pnpm --dir app/sentinel-mobile run build:android:apk:local` (or `eas build -p android --profile preview --local`).
4. Device Installation: `adb install -r <path-to-apk>` or scanning EAS QR code.

## Preconditions

- Unit 01.01 completed and merged to `task/0001/phase-01/integration`.
- Dedicated git worktree and branch checked out.

## Scope

**In scope:**
- `app/sentinel-mobile/README.md`

**Out of scope:**
- Code changes in React Native components or features.

## Steps

1. Check if `app/sentinel-mobile/README.md` exists; if not, initialize it with project overview and mobile setup details.
2. Add a dedicated section: `## Building Android APK for Testing and Sideloading`.
3. Document commands for cloud EAS builds and local `--local` builds.
4. Detail testing on physical Android devices (`adb install` and permission acceptance for camera/mic).
5. Verify formatting with markdown lint / prettier.

## Verification

- **Test Type:** Documentation & Schema Contract Audit
  - *Justification:* Ensures human and automated consumers have reproducible build and verification instructions.
- **Test Case 1 (README Completeness):** Verify `README.md` contains accurate `build:android:apk` commands and sideload instructions.
- **Command:** `node --test app/sentinel-mobile/runbook.test.mjs`
- **Result:** PASS (1/1 test passed in 89ms)
- **Commit:** `02b63733` (`docs(mobile): author APK build runbook and test verification (02.01)`)

## Rollback

Revert `app/sentinel-mobile/README.md` using `git checkout -- app/sentinel-mobile/README.md`.

## Definition of done

- [x] Maps to acceptance criteria: AC-04
- [x] Runbook clearly documents APK build and installation steps
- [x] Changes committed cleanly to unit branch `task/0001/phase-02/unit-01-schema-validation-and-runbook`
- [x] Independent diff review pre-screening passed (0 scope leaks, 0 SOLID violations)
