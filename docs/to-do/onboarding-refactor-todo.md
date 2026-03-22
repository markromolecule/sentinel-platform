# To-Do Plan: Onboarding Form Refactoring

## Overview
This document outlines the planned refactoring for the Onboarding Form and its custom hook to improve modularity and adhere to project standards.

## Investigation & 1-3-1 Analysis

### Task: Refactor Onboarding Form and Logic

**Objective**: Modularize the form and separate concerns between UI, state management, and API logic.

**Viable Options:**

- **Option 1: Component Decomposition Only**
  - *Description*: Split `OnboardingForm.tsx` into smaller components but keep `useOnboardingForm` as is.
- **Option 2: Logic & UI Separation (Standard Refactor) [BEST OPTION]**
  - *Description*: Extract submission logic to `useOnboardingMutation`, split the UI into atomic components, and standardize types/constants.
  - *Why*: Aligns with `refactor-web-components` workflow and improves maintainability by separating API logic from UI state.
- **Option 3: Feature-Based Re-architecture**
  - *Description*: Move onboarding to `src/features/onboarding` and use global state (Zustand).
  - *Why*: Overkill for the current simple form.

## To-Do List

- [x] **Phase 1: Structural Setup**
  - [x] Create `_types/index.ts` for onboarding.
  - [x] Create `_constants/index.ts`.
- [x] **Phase 2: Logic Extraction**
  - [x] Implement `useOnboardingMutation.ts` in `src/hooks/query/onboarding/`.
  - [x] Refactor `useOnboardingForm.ts` to use the new mutation and focus on state.
- [x] **Phase 3: Component Refinement**
  - [x] Create `_components/personal-info-fields.tsx`.
  - [x] Create `_components/academic-info-fields.tsx`.
  - [x] Update `onboarding-form.tsx` to use sub-components and `@sentinel/ui` Select.
- [/] **Phase 4: Verification**
  - [/] Run `pnpm lint`.
  - [ ] Manual end-to-end test of the onboarding flow.

## Next Steps

Awaiting approval of Option 2 to proceed with the refactoring.
