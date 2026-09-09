---
title: "Phase 01: Package Dependencies Upgrade"
type: phase
parent: "upgrade-expo-sdk-57"
phase: "01"
status: completed
created: "2026-09-09"
tags: [task, phase, mobile, dependencies]
---

# Phase 01: Package Dependencies Upgrade

## Objective

Update package version declarations in `app/sentinel-mobile/package.json` and root `package.json` to the target Expo SDK 57 release matrix (`expo ~57.0.21`, React `19.2.3`, React Native `0.86.3`, and matching native modules).

## Dependencies & Prerequisites

- Baseline test run and typecheck pass on SDK 54 verified.
- Target versions fetched from Expo SDK 57 `bundledNativeModules.json`.

## Impacted Files & Components

- `app/sentinel-mobile/package.json`: Update core Expo, React, React Native, and Expo module versions; remove `@react-navigation/*` packages.
- `package.json`: Update workspace root `expo` dependency from `^54.0.33` to `^57.0.21`.

## Implementation Tasks

- [x] Update `app/sentinel-mobile/package.json` with SDK 57 compatible versions:
  - `expo`: `~57.0.21`
  - `react`: `19.2.3`
  - `react-dom`: `19.2.3`
  - `react-native`: `0.86.3`
  - `react-native-gesture-handler`: `~2.32.0`
  - `react-native-reanimated`: `4.5.1`
  - `react-native-safe-area-context`: `~5.7.0`
  - `react-native-screens`: `~4.26.0`
  - `react-native-svg`: `15.15.4`
  - `react-native-web`: `~0.21.0`
  - `react-native-webview`: `13.16.1`
  - `react-native-worklets`: `0.10.1`
  - `@react-native-async-storage/async-storage`: `2.2.0`
  - `@expo/vector-icons`: `^15.0.2`
  - `expo-audio`: `~57.0.4`
  - `expo-auth-session`: `~57.0.11`
  - `expo-blur`: `~57.0.2`
  - `expo-camera`: `~57.0.4`
  - `expo-constants`: `~57.0.17`
  - `expo-dev-client`: `~57.0.18`
  - `expo-font`: `~57.0.3`
  - `expo-haptics`: `~57.0.2`
  - `expo-linear-gradient`: `~57.0.1`
  - `expo-linking`: `~57.0.9`
  - `expo-router`: `~57.0.20`
  - `expo-screen-capture`: `~57.0.2`
  - `expo-splash-screen`: `~57.0.8`
  - `expo-status-bar`: `~57.0.1`
  - `expo-symbols`: `~57.0.2`
  - `expo-system-ui`: `~57.0.3`
  - `expo-video`: `~57.0.3`
  - `expo-web-browser`: `~57.0.2`
- [x] Remove deprecated `@react-navigation/native` and `@react-navigation/bottom-tabs` dependencies.
- [x] Update root `package.json` `"expo": "^57.0.21"`.

## Verification & Testing

- Validate package.json formatting and syntax via JSON parsing (PASS).
- Target files verified: `app/sentinel-mobile/package.json`, `package.json`.

## Risks & Rollback

- Revert package.json changes via git checkout if version conflicts cannot be resolved.
