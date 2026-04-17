# Phase 4 — Student Runtime Flow Alignment

## Dependencies

- The current student route structure is canonical:

```txt
app/sentinel-web/src/app/(protected)/student/exam/[id]/configuration/page.tsx
app/sentinel-web/src/app/(protected)/student/exam/[id]/monitoring/page.tsx
```

- Phase 2 defines the active attempt runtime
- Phase 3 defines how MediaPipe may later emit shared telemetry signals

## Goal

Align the student-facing exam flow to the current architecture instead of mirroring preview routes. The runtime should be a two-stage flow:

- `configuration` for readiness and entry
- `monitoring` for the live attempt

Preview may simulate these states, but preview does not define them.

---

## Initial Check

Before implementation:

- inspect the current student `configuration` and `monitoring` pages
- inspect the current session bootstrap flow and stored session helpers
- inspect existing telemetry hooks and current configuration query usage
- identify which behaviors can be moved into reusable engine components instead of staying route-local

---

## Flow Definition

### Canonical student flow

```txt
exam detail -> configuration -> monitoring -> submit / completion
```

### Internal readiness states inside `configuration`

The current `configuration` page should evolve into an ordered readiness flow that includes:

1. instruction
2. privacy acknowledgement
3. hardware and platform checks
4. readiness / waiting or final confirmation to enter the attempt

These are runtime states inside the canonical student route. They do not need to become separate canonical student routes unless there is a strong implementation reason later.

---

## Tasks

### Task 4.1 — Refactor `configuration` into an ordered readiness flow

Use the current page as the base and expand it into a guided sequence for:

- instruction review
- privacy acknowledgement before device capture
- camera / microphone checks based on existing configuration
- platform-specific readiness messaging for web vs mobile-compatible behavior
- final confirmation before entering the live attempt

This flow must continue to use the current session bootstrap service and stored session metadata.

### Task 4.2 — Align readiness behavior to existing configuration keys

The readiness flow must consume the current configuration model only, including:

- `cameraRequired`
- `micRequired`
- `screenLock`
- `webSecurity.full_screen_required`
- mobile-specific flags only where the current platform actually uses them

No readiness behavior should be added behind undocumented or invented fields.

### Task 4.3 — Make `monitoring` the real active attempt page

Once the readiness flow passes, `monitoring` becomes the real exam surface:

- attempt session already exists or is resumed
- attempt runtime reads config snapshot and saved session state
- telemetry hooks are active only when the relevant current configuration rule is enabled
- MediaPipe integration, if added later, plugs into this route instead of creating a parallel page

### Task 4.4 — Keep session start and resume aligned to the current flow module

Student runtime must continue to use:

- `packages/services/src/api/exams.ts -> startExamSession`
- `app/sentinel-api/src/modules/examination/flow/`

Required behavior:

- reuse existing session when resumed
- persist the config snapshot needed by runtime enforcement
- avoid duplicate attempt creation

### Task 4.5 — Define failure and recovery behavior

Document and implement the runtime behavior for:

- denied camera permission
- denied microphone permission
- fullscreen request failure on web
- refresh / reconnect during an active attempt
- invalid or missing stored session state

These flows must align to current configuration and session policy instead of ad hoc runtime fallbacks.

---

## Backend Test Requirement

If this phase changes backend flow, session, or attempt behavior, create or update backend tests before considering the phase done.

Expected test locations:

- `app/sentinel-api/src/modules/examination/flow/flow.test.ts`
- any new attempt-related backend test file introduced by answer persistence or readiness-side policy updates

Minimum coverage:

- start vs resume behavior
- readiness flow assumptions that depend on backend policy
- invalid session handling when the backend contract changes

---

## Deliverables Checklist

- [ ] Student route structure remains aligned to current canonical paths
- [ ] `configuration` represents an ordered readiness flow
- [ ] `monitoring` is treated as the live attempt route
- [ ] Session start and resume reuse the existing flow endpoint and config snapshot
- [ ] Readiness and runtime behavior use current configuration keys only
- [ ] Preview is clearly documented as a consumer, not the source, of student architecture
- [ ] Backend tests are created or updated for any flow/attempt backend changes

---

## Exit Criteria

This phase is complete when the student runtime is described and implemented as one coherent flow on the current routes, with readiness and attempt responsibilities clearly separated.
