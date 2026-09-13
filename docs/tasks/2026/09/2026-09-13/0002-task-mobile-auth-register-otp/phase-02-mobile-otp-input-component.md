---
title: "Phase 2: Native Mobile 6-Digit OTP Cell Component"
type: phase
parent: "0002-task-mobile-auth-register-otp"
phase: "2"
status: completed
created: "2026-09-13"
tags: [task, phase, mobile, ui, otp, component, pin, theme]
---

# Phase 2: Native Mobile 6-Digit OTP Cell Component

## Objective

Build a reusable, accessible 6-digit PIN input component (`components/auth/auth-otp-input.tsx`) featuring 6 discrete rounded digit cells matching Sentinel's theme (`#323d8f` active border, `#f4f4f5` background, `#e4e4e7` border), complete with auto-focus, paste handling, SMS auto-fill, and unit tests.

## Dependencies & Prerequisites

- `constants/theme.ts` design tokens (`Colors.light.primary`, `Colors.light.input`, `Colors.light.border`, `Colors.light.text`).
- Phase 1 unblock (can be developed in parallel).

## Impacted Files & Components

- `app/sentinel-mobile/components/auth/auth-otp-input.tsx`: **[NEW]** Visual PIN component with hidden input.
- `app/sentinel-mobile/components/auth/index.ts`: Export `AuthOtpInput` and its props interface.
- `app/sentinel-mobile/components/auth/auth-otp-input.test.tsx`: **[NEW]** Vitest unit tests verifying digit rendering, active cell styling, and paste behavior.

## Implementation Tasks

- [x] Task 2.1: Implement `AuthOtpInput` in `components/auth/auth-otp-input.tsx`:
  - 6 discrete box cells with `justifyContent: 'space-between'`.
  - Hidden overlay `TextInput` with `inputMode="numeric"`, `keyboardType="number-pad"`, `maxLength={6}`, `autoComplete="one-time-code"`.
  - Active cell highlight with 2px border `#323d8f` when focused.
  - Smooth display of entered digits with bold monospace styling.
  - Support `value`, `onChange`, `disabled`, `autoFocus`, and optional error highlighting.
- [x] Task 2.2: Export `AuthOtpInput` from `components/auth/index.ts`.
- [x] Task 2.3: Add unit tests in `components/auth/auth-otp-input.test.tsx` verifying character entry, deletion, and cell count.

## Verification & Testing

- Command: `pnpm --filter sentinel-mobile test components/auth/auth-otp-input.test.tsx`
  - Output: `✓ components/auth/auth-otp-input.test.tsx (6 tests) 4ms`
  - Result: PASS (6/6 tests passed)
- Full auth components test suite: `pnpm --filter sentinel-mobile test components/auth/`
  - Output: `17 passed (17)` in 174ms
- Files modified/created:
  - `app/sentinel-mobile/components/auth/auth-otp-input.tsx` (NEW)
  - `app/sentinel-mobile/components/auth/index.ts` (MODIFIED)
  - `app/sentinel-mobile/components/auth/auth-otp-input.test.tsx` (NEW)

## Risks & Rollback

- **Risk:** Virtual keyboard obscuring cells or paste event mishandling.
- **Mitigation:** Rely on native `TextInput` text change event with sanitize regex (`replace(/[^0-9]/g, '').slice(0, 6)`) and standard `KeyboardAvoidingView`.
