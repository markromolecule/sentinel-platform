---
title: "Phase 1 — Onboarding UI Responsiveness and Dropdown Layout Stabilization"
type: phase
parent: "0001-task-student-onboarding-ui-responsiveness-gmail-otp-and"
phase: "01"
status: completed
created: "2026-09-11"
tags: [task, phase, ui, onboarding, responsiveness]
---

# Phase 1 — Onboarding UI Responsiveness and Dropdown Layout Stabilization

## Objective

Eliminate horizontal distortion and component widening on the student onboarding page caused by long degree program and department names in Radix UI `Select` components, ensuring stable responsiveness across all viewports (320px to 1440px+).

## Dependencies & Prerequisites

- Verified current behavior in `app/sentinel-web/src/app/(protected)/onboarding`.
- Inspected `packages/ui/src/components/ui/select.tsx` and `academic-info-fields.tsx`.

## Impacted Files & Components

- [MODIFY] `packages/ui/src/components/ui/select.tsx`: Ensure `SelectTrigger` and `SelectValue` support overflow clipping, text truncation, and `min-w-0`.
- [MODIFY] `app/sentinel-web/src/app/(protected)/onboarding/_components/academic-info-fields.tsx`: Apply trimming/truncation logic to selected trigger labels, attach `title` attribute tooltips for full visibility on hover, and maintain full title in dropdown lists.
- [MODIFY] `app/sentinel-web/src/app/(protected)/onboarding/_components/onboarding-form.tsx`: Add `min-w-0` to the left-hand form column grid container to prevent CSS grid track expansion.
- [MODIFY] `app/sentinel-web/src/app/(protected)/onboarding/page.tsx`: Audit responsive container padding, max-width constraints, and small viewport wrapping.
- [MODIFY] `app/sentinel-web/src/app/(protected)/onboarding/_components/personal-info-fields.tsx`: Ensure personal info grid container has `w-full min-w-0`.

## Implementation Tasks

- [x] **Task 1.1 — Bounding CSS Grid Tracks:** Added `min-w-0` and `w-full` to the left-side form column `div` inside `OnboardingForm` to strictly prevent flex/grid expansion beyond the grid track boundaries.
- [x] **Task 1.2 — Select Component Text Truncation:** Updated `packages/ui/src/components/ui/select.tsx` so that `SelectTrigger` and `SelectValue` reliably apply `truncate` / `overflow-hidden` / `min-w-0` to prevent layout widening.
- [x] **Task 1.3 — Selected Value Trimming & Tooltips:** In `academic-info-fields.tsx`, added `title` tooltips with full labels on `SelectTrigger`, bounded max-width of trigger and dropdown content (`max-w-[calc(100vw-2rem)] sm:max-w-md`), and enabled ellipsis truncation for long program names.
- [x] **Task 1.4 — Responsive Layout Audit:** Added `min-w-0 overflow-hidden` to the Card and CardContent in `onboarding/page.tsx` and `w-full min-w-0` in `personal-info-fields.tsx` to guarantee zero horizontal blowout across mobile, tablet, and desktop viewports.

## Verification & Testing

- **TypeScript Typecheck (`packages/ui`):**
  `./node_modules/.bin/tsc --noEmit -p packages/ui/tsconfig.json` (Exited with code 0: PASS)
- **ESLint Validation (`sentinel-web` onboarding components):**
  `./node_modules/.bin/eslint -c app/sentinel-web/eslint.config.mjs app/sentinel-web/src/app/(protected)/onboarding` (Exited with code 0: PASS)

## Risks & Rollback

- **Risk:** Truncation might obscure important distinctions between similar program names (e.g. BSIT vs BSIS).
- **Resolution:** `title` attributes on `SelectTrigger` display full unclipped text on hover, and dropdown menu options show complete titles with codes.
