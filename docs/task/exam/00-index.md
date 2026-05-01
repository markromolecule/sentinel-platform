# Sentinel Exam Tasks — Current System Index

## Purpose

This folder is the execution guide for aligning the exam flow to the **current Sentinel system**. It is intentionally modular: each file should stay focused enough to implement in isolation without dragging the full exam scope into one conversation.

`docs/plan/01-exam-plan.md` may be used as historical context, but it is **not** the implementation contract for this work.

---

## Current System Baseline

These modules and paths already define the active architecture and must be treated as the foundation for every phase:

### Student runtime

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/configuration/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/monitoring/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/configuration/_hooks/use-system-check/`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/monitoring/_hooks/use-exam-monitoring.ts`

### Instructor monitoring

- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/[studentId]/page.tsx`
- `app/sentinel-web/src/features/exams/monitoring/_components/`

### Shared engine target

- `app/sentinel-web/src/features/exams/_components/engine/`

### Backend exam flow and configuration

- `app/sentinel-api/src/modules/examination/flow/`
- `app/sentinel-api/src/modules/examination/configuration/`

### Shared contracts

- `packages/shared/src/schema/exams/configuration-schema.ts`
- `packages/shared/src/schema/exams/assessment-schema.ts`
- `packages/shared/src/schema/telemetry/telemetry-schema.ts`

### Telemetry modules

- `app/sentinel-api/src/modules/telemetry/ingestion/`
- `app/sentinel-api/src/modules/telemetry/storage/`

### Future infrastructure integrations

- `app/sentinel-api/src/modules/infrastructure/mediapipe/`
- `app/sentinel-api/src/modules/infrastructure/livekit/`

---

## Architecture Rules

- The canonical student flow remains:
    - `configuration` for exam entry, readiness, permissions, and session bootstrap
    - `monitoring` for the active exam attempt
- Existing configuration, session, and telemetry contracts must be reused. Do not define:
    - a second attempt model
    - a second configuration model
    - a second proctoring log pipeline
- `MediaPipe` and `LiveKit` are integrations into the current flow. They are not the source of truth for attempts, incidents, or runtime policy.
- Shared UI that is used by both instructor preview and student runtime belongs in `features/exams/_components/engine/`.
- Preview is a simulation layer for instructor validation. It must not define the canonical runtime architecture.
- Every phase starts with an **initial check** before implementation:
    - inspect the current route, module, hook, service, and test files that will be touched
    - identify what can be reused before creating anything new
    - identify the smallest working increment for that phase
- Every backend-affecting phase must create or update a backend test file before the phase is considered complete.
- Validation should happen in minimal increments. Do not batch large frontend and backend changes without an intermediate verification step.

---

## Implementation Discipline

- Reusable components first:
    - if a UI block will be used by preview and student runtime, build it once in `engine/`
    - avoid duplicating layouts across instructor preview and student pages
- UI quality rule:
    - avoid generic dashboard-card stacking as the default solution
    - prefer clearer page structure, stronger layout hierarchy, and deliberate spacing over adding more containers and context panels
    - only add explanatory UI when it helps the student or instructor make a decision
- Attempt page design gate:
    - do not finalize or build the actual attempt-page UI until the user provides the reference image
    - architectural prep is allowed, but final attempt layout implementation is blocked by the design reference

---

## Build Order

Complete the files in sequence. Each file stays narrow, but all of them must align to the baseline above.

| File                       | Focus                                             | Notes                                                                              |
| -------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `01-preview-routes.md`     | Instructor preview as a shared-engine consumer    | Preview mirrors runtime states without persistence                                 |
| `02-attempt-page.md`       | Active exam attempt runtime                       | Based on the current student `monitoring` page                                     |
| `03-mediapipe-sandbox.md`  | MediaPipe calibration aligned to shared telemetry | No custom logging pipeline                                                         |
| `04-student-pages.md`      | Student runtime flow alignment                    | Current student route structure is canonical                                       |
| `05-configuration.md`      | Configuration and runtime contract audit          | Existing schemas and locking rules stay authoritative unless intentionally changed |
| `06-livekit-monitoring.md` | Late-stage live video monitoring                  | Depends on real attempts and real incidents, not mocks                             |

---

## Cross-Phase Acceptance Criteria

- Every task file maps to real repo paths and current system contracts.
- Preview, student runtime, telemetry, and instructor monitoring read as one connected system.
- No file invents a parallel backend flow for attempts, configuration, or incident ingestion.
- Each phase remains focused enough to implement without bloating context.
- Each phase includes an initial check and a verification gate.
- Each backend change has a matching or updated backend test file.
