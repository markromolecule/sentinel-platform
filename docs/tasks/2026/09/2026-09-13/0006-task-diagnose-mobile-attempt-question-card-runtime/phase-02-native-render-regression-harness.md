---
title: "Phase 2 — Establish Native QuestionCard Render Regression Coverage"
type: phase
parent: "0006-task-diagnose-mobile-attempt-question-card-runtime"
phase: 2
status: planned
created: "2026-09-13"
tags: [task, phase, sentinel-mobile, testing]
---

# Phase 2 — Establish Native QuestionCard Render Regression Coverage

## Objective

Replace the current hand-built element-tree assertions with a native React component render harness that traverses nested JSX and validates the card’s prompt, header, and type-specific answer control.

## Dependencies & Prerequisites

- Phase 1 classification and its developer checkpoint are complete.
- Current test failure is understood: `question-card.test.tsx` calls `QuestionCard` as a function and its mocked `createElement` does not render nested child components after the JSX change.

## Impacted Files & Components

- `app/sentinel-mobile/features/exam/components/session/question-card.test.tsx` — replace direct invocation/hand-walk strategy.
- `app/sentinel-mobile/vitest.config.ts` — configure only the native rendering test environment/mocks required by the selected existing renderer.
- `app/sentinel-mobile/package.json` and `pnpm-lock.yaml` — only if a direct native-render test dependency is not already declared for the workspace.
- `app/sentinel-mobile/features/exam/components/session/inputs/*.tsx` — test consumers; do not change behavior unless Phase 3 evidence requires it.

## Implementation Tasks

- [ ] Choose the existing renderer-compatible test approach that renders nested React Native JSX; do not keep a direct function-call test and label it as rendering coverage.
- [ ] Isolate Expo/native module mocks in a dedicated setup file so `mobile-live-inspection-bridge.test.tsx` and `question-drawer.test.tsx` can initialize under the declared test environment.
- [ ] Add render assertions for each of the eight normalized types: card header, prompt/fallback prompt, and its expected input family.
- [ ] Add explicit cases for a null current question, empty choice options, malformed content fallback, and question transition/key behavior if Phase 1 identifies a transition defect.
- [ ] Preserve behavioral interaction assertions for option selection, flags, multi-response, matching, blanks, enumeration, and true/false booleans.

## Verification & Testing

- Focused `QuestionCard` test suite passes with actual nested child output inspected.
- A targeted suite for `mobile-live-inspection-bridge` and `question-drawer` loads without Expo runtime initialization errors, or each still-unavailable native dependency is explicitly documented with a replacement verification.
- `pnpm --filter sentinel-mobile exec tsc --noEmit`.

## Risks & Rollback

- **Risk:** Test configuration hides native-module incompatibilities through broad mocks.
- **Mitigation:** Mock only the required native boundary; retain production component and interaction assertions.
- **Rollback:** Revert test/config/dependency changes without touching the mobile runtime.
