---
title: "Sentinel Mobile Expo APK and Play Store Production Release"
type: context
status: draft
created: "2026-09-23"
tags: [context, mobile, expo, eas, android, release]
feature: "sentinel-mobile-expo-apk-and-playstore-release"
---

# Sentinel Mobile Expo APK and Play Store Production Release Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  The `sentinel-mobile` React Native / Expo application currently lacks production-grade build configuration for both direct Android Package (`.apk`) distribution (for internal pre-release testing and side-loading) and Google Play Store release (`.aab` Android App Bundle). Furthermore, environment variables are only referenced unsafely via `process.env.EXPO_PUBLIC_*` without a runtime or build-time validation contract, which leads to silent failures and crashes in production builds if variables are missing. Finally, EAS Workflows and monorepo scripts are missing to reliably automate builds.
- **Business / User Value:**
  Enables the development and QA team to quickly generate downloadable `.apk` builds for device installation and dogfooding before submitting production `.aab` bundles to Google Play Store internal testing or production tracks. Guarantees environment variable integrity in production builds so end-users never experience authentication or API connection failure due to missing configuration.
- **Success Criteria:**
  1. Developers can produce standalone `.apk` builds directly via Expo EAS (`preview` and `production-apk` profiles).
  2. Developers can produce production-ready `.aab` bundles configured with proper versioning and signing for Google Play Store release (`production` profile).
  3. Environment variables are strictly validated at both compile/pre-build time and runtime using a Zod schema (`lib/config/env.ts`), failing fast with descriptive diagnostics if required variables are missing.
  4. EAS Workflows (`.eas/workflows/`) are configured in `sentinel-mobile` for automated APK building and Play Store staging.
  5. EAS remote environment configurations are reconciled with local `.env` requirements.

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a QA engineer or developer, I want to trigger an EAS build that yields an installable `.apk` file, so that I can immediately install and test the Sentinel app on physical Android devices without going through Google Play.*
- *As a release manager, I want to trigger a production build that produces a signed `.aab` and submits it to Google Play Console, so that students can download Sentinel from the Play Store.*
- *As a developer, I want all required production environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`, etc.) to be validated before and during application initialization, so that misconfigured builds fail immediately with actionable error messages rather than unpredictable runtime crashes.*

### Functional Requirements

- [ ] **EAS Build Profile Matrix (`eas.json`):**
  - Add `preview` profile with `"distribution": "internal"`, `"android": { "buildType": "apk" }`, and `"environment": "production"` (or explicit fallback env).
  - Add `production-apk` profile extending `production` with `"android": { "buildType": "apk" }` for generating production-pointed APKs.
  - Configure `production` profile with `"autoIncrement": true` and `"android": { "buildType": "app-bundle" }` for Google Play Console submission.
  - Configure `submit.production` block with proper track parameters (`track: "internal"`).
- [ ] **App Manifest Readiness (`app.json`):**
  - Define `android.versionCode: 1` as baseline in `app.json` alongside `expo.version: "1.0.0"`.
  - Ensure all necessary Android permissions (`CAMERA`, `RECORD_AUDIO`, `INTERNET`) and package identifiers (`com.livadomc.sentinelmobile`) are declared.
- [ ] **Strict Production Environment Validation (`lib/config/env.ts`):**
  - Create a Zod validation schema validating:
    - `EXPO_PUBLIC_SUPABASE_URL`: valid URL string.
    - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: valid non-empty JWT/anon string.
    - `EXPO_PUBLIC_API_URL`: valid URL string (defaulting to `https://api.sentinelph.tech` in production if unspecified).
    - `EXPO_PUBLIC_WEB_URL`: valid URL string (defaulting to `https://app.sentinelph.tech`).
    - `EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH`: default `auth/callback`.
    - `EXPO_PUBLIC_EXPO_AUTH_PROXY_URL`: optional valid URL string.
  - Refactor `lib/supabase.ts` and `lib/config/api-config.ts` to consume the typed, validated configuration.
- [ ] **Pre-Build Verification Script (`scripts/verify-env.mjs`):**
  - Add a CLI pre-flight check script that runs before `eas build` to assert all required environment variables are set and meet schema requirements.
- [ ] **EAS Workflows (`.eas/workflows/`):**
  - Create `.eas/workflows/build-apk.yaml` for building Android APK on demand.
  - Create `.eas/workflows/release-playstore.yaml` for building production AAB and submitting to Google Play Store internal track.
- [ ] **NPM / PNPM Scripts in `app/sentinel-mobile/package.json`:**
  - Add `verify:env`, `build:apk`, `build:apk:prod`, `build:playstore`, and `submit:playstore`.

### Edge Cases & Failure Modes

- **Missing Environment Variables in EAS Cloud:** Since `.env` files are gitignored, builds on EAS servers fail if variables aren't defined in EAS Project Settings or `eas.json`. The `preview` profile on EAS currently has NO variables configured. Reconciling `preview` to link to the `production` environment or declaring explicit build envs eliminates missing variable errors.
- **Malformed URL in Environment:** Invalid URLs (e.g. trailing slashes, missing `https://`, or local IP in production) will be caught and normalized by `lib/config/env.ts`.
- **Version Code Collisions:** When uploading successive `.aab` builds to Google Play, Google rejects duplicate `versionCode` values. Setting `autoIncrement: true` and remote version management in `eas.json` prevents version collisions.

## 3. Technical & Architectural Context

- **Affected Domains / Layers:** Mobile (`app/sentinel-mobile/`).
- **Existing Files & Reference Symbols:**
  - `app/sentinel-mobile/eas.json`: EAS build and submit configuration.
  - `app/sentinel-mobile/app.json`: Expo application manifest and Android bundle parameters.
  - `app/sentinel-mobile/lib/supabase.ts`: Supabase client initialization.
  - `app/sentinel-mobile/lib/config/api-config.ts`: API base URL resolution and network logging.
  - `app/sentinel-mobile/lib/auth/oauth-callback.ts`: Mobile OAuth callback resolution.
  - `app/sentinel-mobile/.env.example`: Environment variable documentation.
  - `app/sentinel-mobile/package.json`: Scripts and dependencies.
- **Data Model & Schema Changes:** None.
- **Security & Authorization:**
  - Public keys (`EXPO_PUBLIC_SUPABASE_ANON_KEY`) are client-safe; service role keys must NEVER be exposed or prefixed with `EXPO_PUBLIC_`.
  - Android permissions are scoped strictly to camera and microphone proctoring purposes.

## 4. UI/UX & Interaction Guidelines (if applicable)

- **State Management & Feedback:**
  - In development and preview APK builds, startup environment issues should display a user-friendly error overlay / crash log rather than a silent white screen.

## 5. Scope & Boundaries

- **In Scope:**
  - Configuring `eas.json` for APK generation (`preview`, `production-apk`) and Google Play Store bundle (`production`).
  - Configuring EAS Workflows (`.eas/workflows/build-apk.yaml`, `.eas/workflows/release-playstore.yaml`).
  - Strict runtime and pre-build environment validation with Zod (`lib/config/env.ts`, `scripts/verify-env.mjs`).
  - Unit tests for environment validator and configuration resolver.
  - Updating `package.json` with build and verification commands.
- **Out of Scope / Non-Goals:**
  - iOS App Store distribution certificates and provisioning profiles (focus is Android APK & Play Store release).
  - Google Play Console Service Account JSON creation (this requires developer Google Cloud console access; we provide instructions and EAS configuration for it).

## 6. References & External Context

- Expo EAS Workflows documentation: `https://docs.expo.dev/eas/workflows/`
- Expo Android APK builds guide: `https://docs.expo.dev/build-reference/apk/`
- Expo Environment Variables guide: `https://docs.expo.dev/guides/environment-variables/`
- Google Play Store submission: `https://docs.expo.dev/submit/android/`
