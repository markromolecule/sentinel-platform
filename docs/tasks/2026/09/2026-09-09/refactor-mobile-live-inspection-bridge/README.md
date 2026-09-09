---
title: "Refactor MobileLiveInspectionBridge"
type: task
status: complete
created: "2026-09-09"
tags: [task, refactor, mobile, inspection, architecture]
---

# Refactor MobileLiveInspectionBridge

## Outcome

Refactor `MobileLiveInspectionBridge` in `app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx` to separate concerns cleanly:
1. Extract pure inspection state and error parsing utilities into `features/exam/lib/mobile-live-inspection.ts`.
2. Extract the LiveKit directive reconciliation, Supabase subscription, and polling lifecycle into a dedicated hook `features/exam/hooks/use-mobile-live-inspection.ts`.
3. Simplify `MobileLiveInspectionBridge` to act as a lightweight presentation facade using `StyleSheet.create`.
4. Maintain 100% backward compatibility with existing component consumers and test suites.

## Pre-planning record

### Decision ledger

| ID | Decision | Rationale | Alternatives rejected |
|---|---|---|---|
| DEC-01 | Extract state machine & 404 detection into pure lib functions | Enhances testability without needing React hook or component harness | Keeping logic inline |
| DEC-02 | Extract lifecycle into `useMobileLiveInspection` hook | Adheres to SRP; aligns with other exam session hooks (`use-mobile-mediapipe-monitoring`, `use-exam-session-sync`) | Leaving mixed component |
| DEC-03 | Maintain exact JSX accessibility tree in `MobileLiveInspectionBridge` | Guarantees existing integration tests and screen-reader accessibility remain intact | Renaming attributes or adding intermediate wrapper layers |

## Acceptance criteria

| ID | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|
| AC-01 | Pure protocol helpers correctly classify states and 404 errors | `mobile-live-inspection.ts` | Unit tests in `mobile-live-inspection.test.ts` | Verified |
| AC-02 | `useMobileLiveInspection` handles directive reconciliation, LiveKit WebView control, and cleanup | `use-mobile-live-inspection.ts` | Unit tests in `use-mobile-live-inspection.test.ts` | Verified |
| AC-03 | `MobileLiveInspectionBridge` renders alert indicator with `StyleSheet.create` and preserves accessibility attributes | `mobile-live-inspection-bridge.tsx` | Unit tests in `mobile-live-inspection-bridge.test.tsx` | Verified |
| AC-04 | Zero TypeScript or lint errors across `sentinel-mobile` | Package check | `tsc --noEmit` | Verified |

## Phases

- [x] `phase-01-boundary-analysis.md` — Phase 1 — Boundary Analysis and Interface Contracts
- [x] `phase-02-vertical-slice-refactoring.md` — Phase 2 — Implementation of Lib, Hook, and Component Facade
- [x] `phase-03-integration-tests.md` — Phase 3 — Verification, Quality Gates, and Tests
