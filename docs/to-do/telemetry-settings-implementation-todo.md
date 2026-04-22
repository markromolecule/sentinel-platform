# Telemetry Settings Implementation To-Do

## Goal

Turn the telemetry plan in `docs/telemetry-plan.md` into an implementation-ready workflow for Sentinel's current architecture.

This implementation should add a support-managed telemetry settings surface in `sentinel-support`, backed by `sentinel-api`, while preserving the current rule-aware telemetry pipeline that already exists across:

- `app/sentinel-api`
- `app/sentinel-support`
- `packages/shared`
- `packages/services`
- `packages/hooks`

## Plan Analysis

The original plan is directionally good, but a few parts need to be tightened so we do not build something that conflicts with the current telemetry design.

- Telemetry already has stable runtime contracts in `packages/shared/src/schema/telemetry/telemetry-schema.ts`.
- Event ingestion, batching, flushing, incident review, and health monitoring already exist in `app/sentinel-api/src/modules/telemetry`.
- Support-managed global settings already have a working persistence pattern through `system_settings`, used by the examination settings flow in `app/sentinel-api/src/modules/security/access-control`.
- The support app already has a reusable settings-page pattern in `app/sentinel-support/src/app/(protected)/(support)/access-control`.

Because of that, this feature should be treated as a configuration and administration layer on top of the existing telemetry system, not as a rewrite of telemetry itself.

## Scope Corrections

- "Enable or disable telemetry data collection" should be implemented as a support-managed kill switch plus scoped rule controls, not by deleting or mutating existing telemetry enums.
- "Frequency of data collection" should mean batching, sampling, debounce windows, or AI polling cadence. Telemetry is event-driven, so this should not be modeled as a generic timer without context.
- "Managing the types of data collected" should mean enabling or overriding supported rule/event behavior within the existing `TelemetryRuleKey` and `TelemetryEventType` contracts.
- Runtime editing of `TelemetryEventTypeSchema`, `TelemetryPlatformSchema`, `TelemetrySourceSchema`, or `TelemetryRuleKeySchema` is out of scope. Those are source-controlled contracts, not admin-editable data.
- MediaPipe gaze tracking should be implemented as a sandboxed configuration group first, then integrated into student checkup/exam flows after the settings contract is stable.

## Recommended Product Shape

Ship this as one support-facing feature with two clearly separated areas:

1. Telemetry Operations
   Controls whether telemetry ingestion is active, how batching behaves, and which supported rules can be globally tightened or relaxed.
2. MediaPipe Sandbox
   Controls experimental gaze-tracking settings for future student checkup and instructor event workflows without immediately turning it into a hard exam dependency.

## 1-3-1 Decision Rule

For every non-trivial implementation decision, record:

- 1 problem to solve
- 3 viable options
- 1 recommended path

Apply that rule at minimum to these checkpoints:

### Decision 1: Where telemetry admin settings live

- Problem: We need durable support-managed telemetry settings.
- Option A: Store settings in `system_settings` as JSON under a telemetry key.
- Option B: Create a dedicated `telemetry_settings` table immediately.
- Option C: Keep settings in environment variables only.
- Recommendation: Use `system_settings` first because the repo already uses that pattern for support-managed global settings and it keeps v1 small.

### Decision 2: How overrides interact with exam configuration

- Problem: Support wants global control, but telemetry already respects exam configuration.
- Option A: Global settings completely replace exam configuration.
- Option B: Global settings only affect ingestion infrastructure and never touch rule behavior.
- Option C: Layer settings as `system defaults -> exam config -> runtime telemetry decision`, with support settings acting as guards or defaults.
- Recommendation: Use layered precedence. Exam configuration must remain the source of truth for attempt-level rules, while support telemetry settings add global kill switches, thresholds, and safe overrides.

### Decision 3: How to roll out MediaPipe

- Problem: MediaPipe is desired, but the checkup and instructor event flow is not yet fully integrated.
- Option A: Ship live proctoring enforcement immediately.
- Option B: Ship only a hidden backend setting with no UI.
- Option C: Ship a visible sandbox configuration with no hard enforcement until checkup integration is complete.
- Recommendation: Use the sandbox rollout. It creates progress without coupling experimental AI behavior to current exam reliability.

## Assumptions For This To-Do

- V1 is support-managed and global, not institution-scoped.
- Existing telemetry contracts in `packages/shared/src/schema/telemetry/telemetry-schema.ts` remain source-controlled.
- Existing incident review endpoints remain the primary read/write surface for telemetry evidence and review state.
- MediaPipe sandbox settings are schema-present but enforcement is a no-op in v1.
- `PUT /telemetry/settings` uses full-replace semantics on the settings payload, consistent with the existing examination settings flow.
- Flush endpoint secret handling remains environment-based through `TELEMETRY_CRON_SECRET` or `CRON_SECRET`, not support-managed UI configuration.

## Implementation Outcome

After this work, Sentinel should have:

- a support page for telemetry settings
- API routes to fetch and update telemetry settings
- shared schemas and defaults for those settings
- rule-safe integration with the existing telemetry policy and queueing flow
- a separate sandbox section for MediaPipe configuration
- tests that prove settings validation, persistence, and policy application

## Phase 1: Define The Shared Settings Contract

### Objective

Create one shared contract for support-managed telemetry settings so the API, hooks, services, and support UI all use the same schema.

### Tasks

- [x] Create `packages/shared/src/schema/telemetry/telemetry-settings-schema.ts`.
- [x] Define `telemetrySettingsSchema` for the full support-managed payload.
- [x] Define a `telemetryOperationsSettingsSchema` section with fields such as:
  - `enabled`
  - `ingestionMode`
  - `batchingEnabled`
  - `batchWindowMs`
  - `maxBatchSize`
  - `dedupeWindowSeconds`
- [x] Define a `telemetryRuleOverrideSchema` section keyed by supported `TelemetryRuleKey` values.
- [x] Keep override fields limited to supported runtime controls such as:
  - `enabled`
  - `severity`
  - `confidenceThreshold`
  - `durationThresholdMs`
  - `repeatThreshold`
- [x] Do not create a separate `telemetryEventOverrideSchema` in v1. Rule-level overrides are the only supported runtime tuning surface.
- [x] Define a `telemetryMediaPipeSandboxSchema` section with fields such as:
  - `enabled`
  - `captureDuringCheckup`
  - `emitDuringExam`
  - `confidenceThreshold`
  - `frameIntervalMs`
  - `offScreenDurationMs`
  - `calibrationRequired`
  - `debugOverlayEnabled`
- [x] Define a `telemetrySettingsRecordSchema` shaped like the existing examination settings record.
- [x] Export the new schemas and inferred types from `packages/shared/src/schema/index.ts` and any root barrel currently used by the repo.
- [x] Add `DEFAULT_TELEMETRY_SETTINGS` in `packages/shared/src/constants`.

### Acceptance Criteria

- [x] The settings contract is reusable from API and support UI.
- [x] The schema rejects unsupported rule keys, event types, or extra properties.
- [x] Default values are explicit and versionable.

## Phase 2: Add Backend Persistence And DTOs

### Objective

Persist telemetry settings using the same support-managed system settings pattern already used for examination global settings.

### Tasks

- [x] Add a telemetry settings key constant, for example `TELEMETRY_SETTINGS_KEY`.
- [x] Create `app/sentinel-api/src/modules/telemetry/settings/` or a similarly named domain under the telemetry module.
- [x] Add data access helpers similar to:
  - `get-telemetry-settings.ts`
  - `upsert-telemetry-settings.ts`
- [x] Add a telemetry settings resolver with an in-process module-level cache:
  - [x] 30-second TTL
  - [x] cache invalidation on successful `PUT /telemetry/settings`
  - [x] fallback to DB read on cache miss
  - [x] document that multi-instance consistency is eventual within the TTL window
- [x] Store the payload in `system_settings` with a telemetry-specific category and description.
- [x] Create DTO exports in a telemetry settings DTO file.
- [x] Define `GET /telemetry/settings`.
- [x] Define `PUT /telemetry/settings`.
- [x] Define `PUT /telemetry/settings` as full replacement of the writable settings payload.
- [x] Require clients to send the full nested settings object, not partial merge fragments.
- [x] Register telemetry settings routes from `app/sentinel-api/src/modules/telemetry/telemetry.routes.ts`.
- [x] Reuse existing auth middleware patterns and return consistent `{ message, data }` response shapes.

### Suggested File Targets

- `app/sentinel-api/src/modules/telemetry/telemetry.routes.ts`
- `app/sentinel-api/src/modules/telemetry/settings/*.ts`
- `packages/shared/src/schema/telemetry/telemetry-settings-schema.ts`

### Acceptance Criteria

- [x] Settings can be fetched and updated through API routes.
- [x] Data survives restarts because it is stored in `system_settings`.
- [x] DTO validation uses shared schemas instead of duplicating shapes.

## Phase 3: Authorization And Permission Catalog

### Objective

Make telemetry settings explicitly permissioned instead of relying only on broad support access.

### Tasks

- [x] Add new permission keys in `packages/shared/src/constants/permissions.ts`.
- [x] Recommended permissions:
  - `telemetry:view_settings`
  - `telemetry:update_settings`
  - `telemetry:view_health`
- [x] Keep incident review on the existing permission model:
  - `incidents:view`
  - `incidents:review`
  - `incidents:export`
- [x] Do not introduce `telemetry:view_incidents` in v1 unless incident routes are refactored to use a telemetry-specific permission boundary.
- [x] Map the new permissions into role blueprints explicitly:
  - `support`: `telemetry:view_settings`, `telemetry:update_settings`, `telemetry:view_health`
  - `proctor`: keep existing incident permissions only
  - `disciplinary_officer`: keep existing incident permissions only
  - `superadmin`: no global telemetry settings permission in v1 because this feature is support-managed and global
- [x] Ensure `sync-system-permissions.ts` picks them up automatically through shared constants.
- [x] Add route-level authorization checks in the telemetry settings controllers.
- [x] Keep existing support-role checks as a fallback only where necessary.

### Acceptance Criteria

- [x] Support-only access to global telemetry settings is explicit in the permission catalog.
- [x] Existing incident permissions remain intact and are not duplicated under a second telemetry-specific permission family.
- [x] Telemetry settings access can be narrowed later without refactoring route structure.

## Phase 4: Integrate Settings Into Telemetry Runtime Safely

### Objective

Wire support-managed settings into the existing telemetry pipeline without breaking the current configuration-aware exam logic.

### Tasks

- [x] Add a telemetry settings resolver service backed by the Phase 2 cache contract instead of querying `system_settings` on every event.
- [x] Apply the global `enabled` flag before queue submission in `ingestion.service.ts`.
- [x] Apply batching-related settings in `ingestion-queue.service.ts`.
- [x] Apply safe override thresholds in `telemetry-policy.service.ts`.
- [x] Keep exam attempt configuration as the source of truth for whether a rule is applicable to a session.
- [x] Allow support settings to tighten or disable runtime processing only in approved ways.
- [x] Do not allow support settings to bypass required exam configuration integrity checks.
- [x] Log which settings snapshot influenced a decision when useful for debugging.

### Integration Guardrails

- [x] A disabled global telemetry switch should stop persistence, but should not silently mutate client contracts.
- [x] Rule overrides must be ignored if they reference unsupported `TelemetryRuleKey` values.
- [x] MediaPipe sandbox settings must not auto-enable gaze enforcement in exam sessions unless that rollout is intentional and tested.
- [x] Telemetry health and flush endpoint authentication remain environment-driven operational concerns, not mutable support settings.
- [ ] Existing `GET /telemetry/health` and incident review flows must keep working.

### Acceptance Criteria

- [x] Runtime behavior changes only through validated settings.
- [x] Existing exam config gating still works.
- [x] Unsupported admin configuration cannot corrupt ingestion behavior.

## Phase 5: Build The Support UI

### Objective

Add a support-facing telemetry settings page that follows the existing settings-page pattern in `sentinel-support`.

### Tasks

- [x] Add a new support route, recommended as `app/sentinel-support/src/app/(protected)/(support)/telemetry/page.tsx`.
- [x] Add a telemetry settings form component under the new route's `_components` folder.
- [x] Reuse the same page-shell approach used by access-control settings.
- [x] Add sidebar navigation in `app/sentinel-support/src/components/sidebar/superadmin/constants/index.ts`.
- [x] Add `packages/services` API functions for `getTelemetrySettings` and `updateTelemetrySettings`.
- [x] Add `packages/hooks` query and mutation hooks for telemetry settings.
- [x] Split the page into sections or tabs:
  - Operations
  - Rule Overrides
  - MediaPipe Sandbox
  - Health
- [x] Surface existing telemetry health data from `GET /telemetry/health`.
- [x] Show non-blocking warnings using frontend-computed precedence rules only.
- [x] Do not add a dedicated conflict-analysis endpoint in v1.
- [x] Limit warnings to deterministic cases the UI can infer from the settings payload and documented precedence rules.
- [x] Add a save flow with optimistic or mutation-pending feedback consistent with the rest of the support app.

### Suggested UI Sections

- [x] Operations summary cards
- [x] Ingestion toggles
- [x] Batch and flush configuration inputs
- [x] Rule override list grouped by AI, web, and mobile
- [x] MediaPipe sandbox controls
- [x] Health panel for queue mode, queue depth, and last known status

### Acceptance Criteria

- [x] Support users can inspect and update telemetry settings without touching code.
- [x] The page feels consistent with the existing support control surfaces.
- [x] Health and configuration are visible in one place.

## Phase 6: MediaPipe Sandbox Rollout

### Objective

Introduce MediaPipe as an experimental settings-backed capability without overcommitting it to the active exam runtime.

### Tasks

- [x] Keep MediaPipe configuration in the shared telemetry settings contract.
- [x] Define which events it is allowed to emit in v1. Recommended: `GAZE_OFF_SCREEN` only.
- [x] Lock v1 scope now: no runtime MediaPipe integration in student checkup or exam sessions.
- [x] Treat `captureDuringCheckup` and `emitDuringExam` as schema-present but functionally inert in v1.
- [x] Still ship the settings UI and persistence layer so the product path is ready.
- [x] Document that MediaPipe remains experimental until calibration, false-positive handling, and instructor visibility are verified.

### Acceptance Criteria

- [x] MediaPipe configuration exists as a real, persisted sandbox.
- [x] The feature does not create accidental exam-session regressions.
- [x] Future checkup integration has a stable configuration source.

## Phase 7: Observability And Auditability

### Objective

Make it clear when telemetry settings changed and whether the system is healthy.

### Tasks

- [x] Include `updatedAt` and `updatedBy` in the telemetry settings record response.
- [x] Reuse `system_settings.updated_by` and `updated_at`.
- [x] Add structured server logs around telemetry settings load and update.
- [x] Consider an audit-log entry for settings changes if the repo already tracks admin mutations elsewhere.
- [x] Show last-updated metadata on the support page.
- [x] Expose health status from the existing telemetry monitoring route in the UI.

### Acceptance Criteria

- [x] Operators can see who changed settings and when.
- [x] Telemetry runtime health is easy to inspect.

## Phase 8: Testing

### Objective

Cover schema validation, persistence, authorization, and runtime integration.

### Backend Tests

- [x] Shared schema tests for telemetry settings defaults and validation.
- [x] Controller tests for `GET /telemetry/settings` and `PUT /telemetry/settings`.
- [x] Authorization tests for allowed and forbidden roles.
- [x] Service tests for `system_settings` persistence and merge behavior.
- [x] Cache tests for TTL expiry and invalidation after successful settings updates.
- [x] Policy tests proving global telemetry disable and supported rule overrides work as expected.
- [x] Dedicated integration tests for layered precedence:
  - support settings disable telemetry globally
  - exam configuration disables a rule even when support settings allow telemetry
  - runtime policy thresholds apply only after both higher-precedence layers allow the event
- [x] Queue tests for batching config behavior if the queue service reads admin settings.

### Frontend Tests

- [x] Hook tests for telemetry settings queries and mutations.
- [ ] Form tests for validation and dirty-state handling.
- [x] UI smoke tests for loading, error, and success states.

### Manual QA

- [ ] Toggle global telemetry off and confirm no new events are persisted.
- [ ] Change a safe threshold and confirm the policy reacts accordingly.
- [ ] Verify existing incident review screens still work.
- [ ] Verify telemetry health still reports queue stats.
- [ ] Verify MediaPipe sandbox settings save and reload correctly.

## Execution Order

Use this implementation order to avoid rework:

1. [x] Phase 1: finalize shared settings schema and defaults, with MediaPipe explicitly no-op in v1.
2. [x] Phase 2: add persistence, DTOs, and the module-level 30-second cache contract.
3. [x] Phase 3: add permission keys and explicit role mapping.
4. [x] Phase 5A: add `packages/services` API helpers and `packages/hooks` queries and mutations.
5. [x] Phase 5B: build the support page, form, warnings, and telemetry health panel.
6. [x] Phase 4: integrate safe runtime behavior into ingestion, queueing, and policy services.
7. [x] Phase 6: ship MediaPipe sandbox configuration as persisted UI-only settings.
8. [x] Phase 7: expose update metadata and logs.
9. [ ] Phase 8: run backend, frontend, precedence, cache, and manual QA.

## Out Of Scope For This Pass

- Runtime editing of telemetry enums or shared schema source-of-truth contracts
- Arbitrary custom event creation from the admin UI
- Raw video or audio upload through telemetry settings
- Fully enforced MediaPipe-based proctoring before checkup calibration and false-positive handling are proven
- Institution-specific telemetry settings unless product requirements explicitly expand the scope

## Definition Of Done

- [x] `sentinel-support` has a working telemetry settings page.
- [x] `sentinel-api` exposes validated telemetry settings read and update routes.
- [x] Settings persist through `system_settings`.
- [x] Runtime telemetry safely consumes approved settings.
- [x] Existing telemetry incidents, ingestion, and health flows remain intact.
- [x] MediaPipe sandbox settings exist and are clearly marked experimental.
- [x] Tests cover the new contract and its main failure paths.
