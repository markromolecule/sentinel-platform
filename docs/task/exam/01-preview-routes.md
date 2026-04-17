# Phase 1 — Instructor Preview Routes As Shared-Engine Consumers

## Dependencies

- Use the current system baseline from `00-index.md`
- Do **not** treat preview as the source of truth for student architecture

## Goal

Build the instructor-facing preview as a **simulation layer** over the same UI primitives the student runtime will use. Preview exists to validate readiness states and attempt rendering without creating real attempts, writing progress, or triggering production side effects.

---

## Initial Check

Before implementation:

- inspect the current preview subtree under `app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/`
- inspect the current student pages that preview is supposed to mirror:
  - `student/exam/[id]/configuration/page.tsx`
  - `student/exam/[id]/monitoring/page.tsx`
- inspect `features/exams/_components/engine/` and identify what should be shared before creating preview-specific UI
- confirm that no preview task requires backend mutation or a real attempt/session write

---

## Scope

### Preview base path

```txt
app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/
```

### Shared component target

```txt
app/sentinel-web/src/features/exams/_components/engine/
```

Preview may use preview-only route wrappers, banners, and controls, but reusable rendering logic must be moved into `engine/`.

---

## Preview Principles

- Preview mirrors the real exam flow, but it does not define it.
- Preview must reuse runtime-oriented components for:
  - instruction content
  - privacy acknowledgement
  - hardware readiness states
  - readiness / lobby state
  - active attempt rendering
- Preview must never:
  - call `startExamSession`
  - create or mutate `exam_attempts`
  - emit real telemetry incidents
  - depend on LiveKit
- Preview UI must not collapse into generic card-on-card layouts.
- Prefer a stronger page composition for each state:
  - one dominant content region
  - one supporting region only if it adds real value
  - minimal chrome and minimal duplicated explanatory text
- Build reusable visual sections, not route-specific decoration, when the same structure will appear in student runtime.

---

## Tasks

### Task 1.1 — Define preview route wrappers

- Create or complete preview routes under `preview/[sessionId]/` for:
  - `instruction`
  - `privacy`
  - `checkup`
  - `lobby`
  - `attempt`
- Keep route-level logic thin:
  - read exam context
  - pass preview props into shared engine components
  - provide local-only navigation between simulation steps

### Task 1.2 — Build preview-safe engine primitives

Create shared components in `features/exams/_components/engine/` for:

- instruction step rendering
- privacy acknowledgement rendering
- hardware readiness summary
- readiness / waiting-state panel
- exam attempt shell primitives that can be used by both preview and the real student attempt

Each shared component must:

- accept typed props
- avoid direct data fetching
- support a preview-safe mode such as `mode="preview"` or `isPreview`
- avoid side effects that belong to route-specific runtime code
- be designed for reuse by both preview and student runtime without wrapping everything in generic cards
- expose layout primitives where useful, so routes can compose better page structures without cloning component internals

### Task 1.3 — Add preview-only affordances

Preview-only UI may live outside shared engine primitives and should include:

- a clear preview banner
- local navigation controls to move between readiness states
- optional knobs to simulate configuration states, such as:
  - camera required vs not required
  - microphone required vs not required
  - fullscreen required vs not required
  - monitoring rules on/off for visual inspection only

These controls must remain local to preview and must not mutate persisted exam configuration.

### Task 1.4 — Preview `attempt` as a renderer, not a live session

The preview `attempt` route should validate layout and shared rendering only:

- display the attempt shell
- render question content using the same engine-level presentation primitives planned for student runtime
- allow local-only answer interaction if useful for UI validation
- do not bootstrap a real session, timer persistence, telemetry, or submission
- if the real attempt-page reference image has not been provided yet, keep this route limited to placeholder structure and shared component wiring only

---

## Verification Gate

- confirm preview pages render without backend writes
- confirm shared engine components are reused instead of duplicated
- confirm preview still works if session creation APIs are unavailable
- if any backend helper was touched by mistake, add or update a backend test before considering the phase complete

---

## Deliverables Checklist

- [ ] Preview routes exist under the current instructor preview subtree
- [ ] Shared preview/runtime UI primitives are created in `features/exams/_components/engine/`
- [ ] Preview uses shared components instead of duplicating student UI
- [ ] Preview layout avoids generic stacked-card composition where it does not improve the experience
- [ ] Preview navigation is local and side-effect free
- [ ] Preview does not create attempts, persist answers, or emit real telemetry

---

## Exit Criteria

Preview is complete when an instructor can simulate the readiness flow and inspect the attempt shell using the same shared presentation layer that the real student runtime will consume.
