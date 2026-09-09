---
title: "Phase 1 — Boundary Analysis and Interface Contracts"
type: phase
parent: "refactor-mobile-live-inspection-bridge"
phase: "01"
status: complete
created: "2026-09-09"
tags: [task, phase, refactor, contracts]
---

# Phase 1 — Boundary Analysis and Interface Contracts

## Objective

Analyze the responsibilities and dependencies of `MobileLiveInspectionBridge` and define the public interfaces for:
1. `features/exam/lib/mobile-live-inspection.ts`
2. `features/exam/hooks/use-mobile-live-inspection.ts`
3. `features/exam/components/session/mobile-live-inspection-bridge.tsx`

## Dependencies & Prerequisites

- Review `mobile-live-inspection-bridge.test.tsx` to ensure all execution semantics and mock expectations are preserved.

## Impacted Files & Components

- [`app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.tsx)
- [`app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.test.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/mobile-live-inspection-bridge.test.tsx)

## Implementation Tasks

- [x] Task 1: Document state transitions:
  - Publish states: `REQUESTED`, `PUBLISHER_CONNECTING`, `PUBLISHER_READY`, `LIVE`.
  - Stop states: `STOPPING`, `ENDED`, `FAILED`, `EXPIRED`.
- [x] Task 2: Define the `useMobileLiveInspection` hook options and return interface:
  - Inputs: `{ sessionId: string | null; attemptId?: string | null; enabled: boolean; mediaPipeRef?: React.RefObject<MobileMediaPipeBridgeRef | null>; getLiveVideoTrack?: () => any }`
  - Output: `{ isLive: boolean; stopPublication: () => Promise<void>; reconcileDirective: () => Promise<void> }`
- [x] Task 3: Verify existing test expectations on mock orders (`useState` -> `activeLeaseIdRef` -> `useEffect`).

