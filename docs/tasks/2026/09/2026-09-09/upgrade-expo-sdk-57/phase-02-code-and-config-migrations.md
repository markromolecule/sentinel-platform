---
title: "Phase 02: Code and Configuration Migrations"
type: phase
parent: "upgrade-expo-sdk-57"
phase: "02"
status: completed
created: "2026-09-09"
tags: [task, phase, mobile, configuration, migration]
---

# Phase 02: Code and Configuration Migrations

## Objective

Apply necessary configuration adjustments and source code import migrations required by React Native Reanimated 4 and Expo Router decoupled navigation in SDK 57.

## Dependencies & Prerequisites

- Phase 01 package specifications defined.

## Impacted Files & Components

- `app/sentinel-mobile/babel.config.js`: Update plugin from `react-native-reanimated/plugin` to `react-native-worklets/plugin`.
- `app/sentinel-mobile/features/exam/hooks/use-exam-lobby.ts`: Migrate `useFocusEffect` from `@react-navigation/native` to `expo-router`.
- `app/sentinel-mobile/features/exam/hooks/use-exam-lobby.test.ts`: Update test mock so `useFocusEffect` is provided by `expo-router`.

## Implementation Tasks

- [x] Modify `babel.config.js` to register `react-native-worklets/plugin`.
- [x] In `use-exam-lobby.ts`, replace `import { useFocusEffect } from '@react-navigation/native';` with `useFocusEffect` import from `expo-router`.
- [x] In `use-exam-lobby.test.ts`, update the `expo-router` mock to include `useFocusEffect: vi.fn()` and remove `@react-navigation/native` mock.

## Verification & Testing

- Run unit test suite: `pnpm --dir app/sentinel-mobile test features/exam/hooks/use-exam-lobby.test.ts` (PASS: 1/1 test file, 4/4 tests passed).

## Risks & Rollback

- Revert Babel plugin and import changes if tests fail.
