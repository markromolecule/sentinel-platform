# End-to-End Telemetry, Audit, and Event-Tracking Analysis Plan

**One-sentence summary:** Establish a phased approach to systematically analyze every module in `@app/sentinel-api/src/modules` across its controller, service, and database layers to produce a unified end-to-end activity and telemetry matrix document.

---

## Viable Options (1-3-1 Rule)

### Option A — Phased Manual Code Inspection _(chosen)_

Physically traverse and read the source code of all 10 API module folders, layer-by-layer (Controllers, Services, and Data Access files), to compile the activity mapping tables.

**Tradeoff:** Maximum completeness and accuracy (captures custom DTOs, inline database transactions, and metadata payloads); requires substantial manual analysis time.

### Option B — AST-Based Static Code Scanning

Write a custom Node.js script using a TS AST parser (e.g., `ts-morph`) to scan `@app/sentinel-api/src/modules` for Hono route handler signatures, service classes, and Prisma/Kysely database mutations.

**Tradeoff:** Fast and programmatically consistent; will fail to catch complex business logic flow, hidden state transitions, and custom metadata payload structures.

### Option C — Top-Down OpenAPI Specification Mapping

Extract OpenAPI metadata from Hono route definitions (`*.routes.ts`) to produce a controller-only API operation mapping, and back-reference service/model layers manually.

**Tradeoff:** Highly efficient for mapping external API entry points; fails to map internal system events, background jobs, and deep service state transitions that do not correspond to dedicated API routes.

### Why Option A

Option A is the only viable approach for mapping out a truly comprehensive and accurate audit logging schema. Observability requires capturing not just API endpoints (Option C) or query ASTs (Option B), but the rich context, life-cycle transitions (e.g., `archive` vs `delete`), and edge-case exceptions embedded within the business logic layers. A phased manual traversal ensures zero blind spots.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should the final consolidated matrix be saved as a new markdown file inside `docs/capstone/end-to-end-activity-matrix.md` or `docs/architecture/end-to-end-activity-matrix.md`?
> _Assumption:_ Save it at [docs/capstone/end-to-end-activity-matrix.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/end-to-end-activity-matrix.md) to keep it co-located with the source requirements file.

> [!NOTE]
> **Q2:** Do we need to capture events that are purely internal (e.g., event emitter fires within memory) separately from database-driven event transitions?
> _Assumption:_ Yes, we will document them distinctively under the "Triggered Event" column (e.g., internal `exam.started` vs external DB insert).

---

## Proposed Changes

### Phase 1 — Identity & Access Control Domain Analysis

**Goal:** Inspect the five identity-related sub-modules to map their API routes, user operations, and onboarding workflows.

#### [NEW] [end-to-end-activity-matrix.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/end-to-end-activity-matrix.md)

- Initialize the target telemetry matrix file with project headers and standard definitions.

#### [MODIFY] [end-to-end-activity-matrix.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/end-to-end-activity-matrix.md)

- **Module: Auth** — Inspect `identity/auth/*.ts` (e.g., `loginRoute`, `registerRoute`, `logOauthRoute`) to capture authentication events.
- **Module: Users** — Inspect `identity/users/controllers/*` and `identity/users/services/*` (e.g., user CRUD and invite processes).
- **Module: Enrollments** — Inspect `identity/enrollments/controllers/*` and `identity/enrollments/services/*` (e.g., student/instructor enroll, unenroll, requests approval).
- **Module: Student Whitelist** — Inspect `identity/student-whitelist/controllers/*` and services (e.g., bulk import, purge, CRUD).
- **Module: Onboarding** — Inspect `identity/onboarding/controllers/*` and services (e.g., student profile creation, eligibility assertions).

**Tests to run:**

- Run `pnpm --dir app/sentinel-api test` focusing on identity files (`auth`, `users`, `student-whitelist`) to confirm all services function.

**Migration required:** No

---

### Phase 2 — Examination & Academic Management Domain Analysis

**Goal:** Map out the high-stakes examination and academic assessment module sub-directories and question content systems.

#### [MODIFY] [end-to-end-activity-matrix.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/end-to-end-activity-matrix.md)

- **Module: Examination & Assessment Flow** — Inspect `examination/flow/*`, `examination/access/*`, `examination/assessment/*`, `examination/lobby/*` (e.g., exam start, exam submit, lobby check-ins).
- **Module: Exams Configuration & Customization** — Inspect `examination/exams/*`, `examination/configuration/*`, `examination/builder/*`, `examination/student-overrides/*` (e.g., builder mutations, override assignments).
- **Module: Grading & Reporting** — Inspect `examination/grading/*`, `examination/reporting/*` (e.g., auto-grading logic, report generations).
- **Module: Monitoring & Runtime Access** — Inspect `examination/monitoring/*`, `examination/runtime-access/*` (e.g., supervisor events, socket connections, access token assertions).
- **Module: Content Systems** — Inspect `content/question/*`, `content/question-bank/*`, `content/question-collection/*`, `content/question-type/*` (e.g., question creation, banking, and classification workflows).

**Tests to run:**

- Run `pnpm --dir app/sentinel-api test` focusing on examination files (`exams`, `monitoring`, `flow`) to ensure runtime test stability.

**Migration required:** No

---

### Phase 3 — Infrastructure, Telemetry, and Integration Domain Analysis

**Goal:** Analyze downstream telemetry ingestion pipelines, media infrastructure, external integrations, and analytics log services.

#### [MODIFY] [end-to-end-activity-matrix.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/end-to-end-activity-matrix.md)

- **Module: Telemetry Pipeline** — Inspect `telemetry/settings/*`, `telemetry/ingestion/*`, `telemetry/storage/*` (e.g., telemetry rules configuration, queue buffering, worker ingest, incident review & persistence).
- **Module: Infrastructure Services** — Inspect `infrastructure/audio/*`, `infrastructure/livekit/*`, `infrastructure/mediapipe/*` (e.g., audio file processing, LiveKit token generation, computer vision telemetry parsing).
- **Module: External Integrations** — Inspect `integrations/gemini/*` (AI operations, prompt tokens logging).
- **Module: General Analytics & Logging Utilities** — Inspect `general/analytics/*`, `general/logs/*` (e.g., report triggers, manual logs dispatch).

**Tests to run:**

- Run `pnpm --dir app/sentinel-api test` focusing on telemetry files (`ingestion`, `storage`) to verify pipeline test contracts.

**Migration required:** No

---

### Phase 4 — Centralization, Payload Cross-Reference, and Review

**Goal:** Consolidate data structures, identify event gaps, document architectural traceability notes, and wrap up the matrix.

#### [MODIFY] [end-to-end-activity-matrix.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/capstone/end-to-end-activity-matrix.md)

- Cross-reference metadata fields mapped in the matrices against the central PostgreSQL schema columns defined in Kysely database types or `prisma.schema`.
- Synthesize "Traceability Notes" detailing structural tracking gaps (e.g., actions happening directly in Supabase without passing through `sentinel-api`, missing transactional rollbacks, anonymous event actors).
- Organize the documentation layout matching the expected format exactly.

**Verification to perform:**

- Perform a markdown syntax and structural layout check on the finalized file.

**Migration required:** No

---

## Files Touched Summary

| File                                                                               | Action                                                                 |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `docs/capstone/end-to-end-activity-matrix.md`                                      | **New** — Complete telemetry, audit, and event-tracking mapping matrix |
| `docs/task/2026-05-29/doc-002-implementation-plan-end-to-end-activity-analysis.md` | **New** — Implementation Plan (This document)                          |

---

## Verification Plan

### Automated Tests

- Run full API test suite to verify codebase integrity before, during, and after analysis:
    ```bash
    pnpm --dir app/sentinel-api test
    ```
- Ensure the newly created documentation has valid relative links and clean Markdown syntax.

### Manual Verification

- Review the generated matrix against `@app/sentinel-api/src/modules` directory to ensure that 100% of the active modules listed under the `/modules` folder are fully represented.
- Check that each module has its core responsibilities described and incorporates:
    - Ingress endpoints (Controllers)
    - Core business logic orchestrators (Services)
    - State changes (Models/Data layer)
    - Clear "Traceability Notes" on security or audit gaps.
