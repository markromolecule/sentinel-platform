# Phase 6 — Live Monitoring And LiveKit

## Dependencies

- Student readiness and attempt flow are already stable on the current canonical routes
- Instructor monitoring is already backed by real attempts and real telemetry incidents
- LiveKit remains a late integration, not a prerequisite for the exam runtime

## Goal

Add live video transport for instructor monitoring without changing the existing attempt, telemetry, or configuration contracts. LiveKit should carry live media only; it should not become the source of truth for attempt state or incident review.

---

## Initial Check

Before implementation:

- inspect current instructor monitoring pages and identify all remaining mock dependencies
- inspect telemetry-backed monitoring data sources before adding LiveKit transport
- inspect the current empty or stub LiveKit infrastructure module
- identify the smallest working increment:
  - real monitoring data first
  - token generation next
  - transport wiring after that

---

## Current Integration Targets

### Instructor monitoring pages

- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/[studentId]/page.tsx`

### Monitoring UI

- `app/sentinel-web/src/features/exams/monitoring/_components/live-feed-monitor.tsx`
- `app/sentinel-web/src/features/exams/monitoring/_components/student-monitoring-detail.tsx`

### Backend infrastructure

- `app/sentinel-api/src/modules/infrastructure/livekit/`

---

## Preconditions

Do not consider this phase ready until the monitoring pages are no longer mock-driven.

Required baseline before LiveKit completion:

- instructor student lists come from real active attempts
- student detail pages show real telemetry incidents from the existing telemetry storage/review flow
- the monitoring detail screen is tied to real attempt identity, not mock card data

---

## Tasks

### Task 6.1 — Replace mock monitoring dependencies

Before LiveKit transport is considered complete:

- remove dependence on mock monitoring students for instructor pages
- load real student attempt context
- load real telemetry incidents into the existing instructor monitoring timeline and detail views

### Task 6.2 — Keep LiveKit scope narrow

LiveKit is responsible for:

- token generation
- room join permissions
- student publish flow
- instructor subscribe flow
- room teardown

LiveKit is **not** responsible for:

- attempt creation
- telemetry persistence
- configuration storage
- flagging history or review workflow

### Task 6.3 — Implement backend LiveKit infrastructure

Use:

```txt
app/sentinel-api/src/modules/infrastructure/livekit/
```

to implement:

- token generation for student publishers
- token generation for instructor subscribers
- room lifecycle helpers tied to the existing attempt/session lifecycle

Room identity should align to the current attempt/session model instead of inventing a separate monitoring identity scheme.

### Task 6.4 — Publish student video from the real attempt flow

Student LiveKit publishing should attach to the current active attempt route only after:

- readiness checks pass
- the session already exists
- configuration permits the required camera behavior

LiveKit connection failure should not silently create a second exam state machine.

### Task 6.5 — Subscribe on instructor monitoring pages

Update `live-feed-monitor.tsx` and the instructor detail screen so they:

- connect using real student attempt context
- show connection state clearly
- coexist with the real telemetry incident timeline

The instructor view should combine:

- live video feed
- real incident timeline
- student identity and attempt context

### Task 6.6 — Document environment expectations

Document environment and deployment requirements without hardcoding infrastructure values into the frontend.

Relevant expectations include:

- `NEXT_PUBLIC_LIVEKIT_URL`
- `LIVEKIT_SERVER_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

If production uses `live.sentinelph.tech`, keep that as deployment context only. Source code must continue to read from environment variables.

---

## Backend Test Requirement

Any backend logic added under `app/sentinel-api/src/modules/infrastructure/livekit/` must have dedicated test coverage.

Expected test locations:

- `app/sentinel-api/src/modules/infrastructure/livekit/livekit.service.test.ts`
- route/controller tests if token endpoints or room lifecycle endpoints are introduced

Minimum coverage:

- token generation for student publisher scope
- token generation for instructor subscriber scope
- room identity alignment with the current attempt/session model
- failure handling when LiveKit configuration is missing or invalid

---

## Deliverables Checklist

- [ ] Instructor monitoring pages no longer depend on mock student monitoring data
- [ ] Instructor detail views use real telemetry incidents
- [ ] LiveKit backend infrastructure is scoped to token and room lifecycle concerns
- [ ] Student publish flow attaches to the real attempt lifecycle
- [ ] Instructor subscribe flow is integrated into the real monitoring detail screen
- [ ] LiveKit environment requirements are documented without frontend hardcoding
- [ ] Backend tests exist for any LiveKit backend logic added in this phase

---

## Exit Criteria

This phase is complete when live video monitoring is added as a transport layer on top of the existing exam runtime and instructor monitoring system, without introducing a second monitoring architecture.
