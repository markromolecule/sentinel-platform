---
title: "Phase 2 — Architecture, Contracts, and Data Modeling"
type: task
status: completed
created: "2026-09-13"
tags: [task, phase]
phase: 2
---

# Phase 2 — Architecture, Contracts, and Data Modeling

## Objectives

Define contract updates, payload extensions, and status resolution rules adhering to SOLID design principles.

## Architectural Contracts

### 1. Telemetry Payload Contract (`mobile-telemetry-client.ts`)

```typescript
export type MobileTelemetryMetadata = {
    durationMs?: number;
    confidenceScore?: number;
    aggregation?: {
        trigger?: string;
        occurrenceCount?: number;
        windowSeconds?: number;
        threshold?: number;
    };
};

export type MobileTelemetryPayload = {
    examSessionId: string;
    studentId: string;
    timestamp: string;
    platform: 'MOBILE';
    source: (typeof TELEMETRY_EVENT_DEFINITIONS)[TelemetryEventType]['source'];
    ruleKey: (typeof TELEMETRY_EVENT_DEFINITIONS)[TelemetryEventType]['ruleKey'];
    eventType: MobileTelemetryEventType;
    metadata?: MobileTelemetryMetadata;
    sessionContext?: MobileTelemetrySessionContext;
};

export type EmitMobileTelemetryEventArgs = {
    apiClient?: ApiClientType;
    configuration?: ExamConfiguration;
    examSessionId: string;
    eventType: MobileTelemetryEventType;
    studentId?: string;
    metadata?: MobileTelemetryMetadata;
};
```

### 2. Live Inspection Handshake Contract (`use-mobile-live-inspection.ts`)

- `createPublisherConnection` commits a state transition from `REQUESTED` to `PUBLISHER_CONNECTING`, returning `{ revision: number }`.
- Client must store and pass `revision: connection.revision` to `acknowledgeLiveInspectionPublisherReady`.

### 3. Student Exam Status Resolution Contract (`mobile-exam-display-adapter.ts`)

- `resolveMobileExamStatus(exam: Exam): string` normalizes completed attempts (`completedAt`, `attempt_status === 'COMPLETED'`, `status === 'turned_in' | 'completed'`) to `'turned_in'`, and delegates dynamic active states to `resolveStudentExamStatus` from `@sentinel/shared`.

## Tasks

- [x] Align payload interfaces across `mobile-telemetry-client.ts` and `use-mobile-mediapipe-monitoring.ts`.
- [x] Define helper functions for exam status normalization on mobile.

## Verification

- Command: `pnpm --filter sentinel-mobile test features/exam/lib/mobile-telemetry-client.test.ts` (PASS: 6/6 passed)
- Command: `pnpm --filter sentinel-mobile test features/exam/lib/mobile-exam-display-adapter.test.ts` (PASS: 7/7 passed)
- Command: `pnpm --filter sentinel-mobile test` (PASS: 48/48 test files, 312/312 tests passed)

