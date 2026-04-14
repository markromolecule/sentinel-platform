# Configuration-Driven Telemetry Refactor To-Do

## Goal

Refactor the telemetry system so it fully respects the **current** exam configuration model already defined in Sentinel, with one coherent contract across:

- `app/sentinel-api`
- `app/sentinel-web`
- `app/sentinel-mobile`
- `packages/shared`

This refactor must stay scoped to the configuration keys that exist **today**. It should not introduce speculative proctoring rules beyond the current system requirements.

## Current Configuration Scope

The refactor must only cover these existing configuration groups from `packages/shared/src/schema/exams/assessment-schema.ts`:

- Shared core hardware/session settings
    - `maxReconnectAttempts`
    - `strictMode`
    - `screenLock`
    - `cameraRequired`
    - `micRequired`
    - `autoSubmitTimeoutMinutes`

- Shared AI rules
    - `aiRules.gaze_tracking`
    - `aiRules.face_detection`
    - `aiRules.audio_anomaly_detection`
    - `aiRules.multiple_faces_detection`

- Web-specific rules
    - `webSecurity.tab_switching_monitor`
    - `webSecurity.full_screen_required`
    - `webSecurity.clipboard_control`
    - `webSecurity.right_click_disable`
    - `webSecurity.print_screen_disable`

- Mobile-specific rules
    - `mobileSecurity.app_pinning_required`
    - `mobileSecurity.prevent_backgrounding`
    - `mobileSecurity.notification_block`
    - `mobileSecurity.screenshot_block`
    - `mobileSecurity.root_jailbreak_detection`

## Refactor Outcome

After this refactor, telemetry should:

- know whether an event came from web or mobile
- know which configuration rule it belongs to
- ignore events for rules that are disabled
- persist only incidents that are valid under the active exam configuration
- support review workflows that clearly distinguish platform, rule, severity, and review state
- keep `packages/shared` as the single source of truth for shared telemetry/config contracts where appropriate

## Key Problems In The Current Implementation

- Telemetry event types are still generic and not yet aligned with all current web/mobile configuration rules.
- Telemetry policy uses hardcoded thresholds but does not yet consult the active exam configuration.
- `flagged_incidents` is usable, but it is too thin for platform-aware review.
- `packages/shared` already models configuration rules, but telemetry-specific shared contracts are still missing or incomplete.
- Web and mobile can diverge because their telemetry payload expectations are not yet standardized in a shared package contract.

## Phase 1: Shared Contract Alignment

### Objective

Define the shared telemetry language first so API, web, and mobile all speak the same contract.

### Tasks

- [x] Create shared telemetry types/schemas under `packages/shared/src/schema` or a closely related shared location.
- [x] Define a shared `telemetry-platform` contract.
    - `WEB`
    - `MOBILE`
- [x] Define a shared `telemetry-source` contract.
    - `CLIENT`
    - `SERVER`
    - `AI`
- [x] Define a shared `telemetry-rule-key` contract based on the **current** configuration keys only.
    - `aiRules.gaze_tracking`
    - `aiRules.face_detection`
    - `aiRules.audio_anomaly_detection`
    - `aiRules.multiple_faces_detection`
    - `webSecurity.tab_switching_monitor`
    - `webSecurity.full_screen_required`
    - `webSecurity.clipboard_control`
    - `webSecurity.right_click_disable`
    - `webSecurity.print_screen_disable`
    - `mobileSecurity.app_pinning_required`
    - `mobileSecurity.prevent_backgrounding`
    - `mobileSecurity.notification_block`
    - `mobileSecurity.screenshot_block`
    - `mobileSecurity.root_jailbreak_detection`
- [x] Define shared telemetry event types limited to current requirements.
- [x] Decide which event types are platform-specific and which are shared.
- [x] Export these contracts from `packages/shared` so `sentinel-api`, `sentinel-web`, and `sentinel-mobile` consume the same definitions.

### Expected Refactor Result

- No duplicated telemetry enums across apps.
- No API-only interpretation of rule keys.
- Web and mobile can construct telemetry payloads from the same shared contract.

## Phase 2: Database Model Upgrade

### Objective

Upgrade `flagged_incidents` so stored incidents are reviewable across both web and mobile.

### Recommended Schema Additions

- [x] Add `platform`
- [x] Add `source`
- [x] Add `rule_key`
- [x] Add `reviewed_by`
- [x] Add `reviewed_at`
- [x] Add `review_notes`
- [x] Add `configuration_snapshot`
- [x] Add `session_context`
- [x] Add `dedupe_key`

### Recommended Enum Review

Keep current incident types, but align them with current configuration needs.

Current useful incident categories already present:

- `GAZE`
- `MULTIPLE_FACES`
- `FACE_NOT_VISIBLE`
- `TAB_SWITCH`
- `AUDIO_DETECTED`
- `SCREENSHOT`
- `SCREEN_RECORD`

Recommended additions only if they map directly to current mobile configuration:

- [x] `APP_BACKGROUNDING`
- [x] `ROOT_JAILBREAK_DETECTED`
- [x] `APP_PINNING_VIOLATION`
- [x] `NOTIFICATION_BLOCK_VIOLATION`

### Notes

- `configuration_snapshot` should store only the incident-relevant subset, not the full exam configuration unless necessary.
- `session_context` can store app version, browser, OS, device type, or client capabilities.
- `dedupe_key` helps collapse repeated identical incidents during bursts.

## Phase 3: Telemetry Ingestion Contract Refactor

### Objective

Refactor API ingestion payloads so they explicitly represent configuration-aware telemetry.

### Tasks

- [x] Update `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.dto.ts`
- [x] Add `platform` to the ingestion payload.
- [x] Add `source` to the ingestion payload.
- [x] Add `ruleKey` to the ingestion payload.
- [x] Add optional `sessionContext` to the ingestion payload.
- [x] Keep payloads lightweight.
- [x] Do **not** introduce heavy media uploads into telemetry ingestion.
- [x] Ensure the DTO remains strict and rejects unexpected keys.

### Payload Design Rules

- `ruleKey` must map to an active configuration rule.
- `platform` must be required.
- Event metadata must remain compact and serializable.
- Client payloads should describe incidents/signals, not raw video/audio streams.

## Phase 4: Configuration-Aware Policy Engine

### Objective

Refactor telemetry policy so decisions are based on the effective configuration for the active exam attempt.

### Tasks

- [x] Replace hardcoded-only policy logic in `telemetry-policy.service.ts` with configuration-aware evaluation.
- [x] Load effective configuration for the incoming attempt.
- [x] Ignore telemetry for disabled rules.
- [x] Keep thresholding, but only after configuration gating.
- [x] Split policy evaluation into:
    - shared AI rules
    - web rules
    - mobile rules

### Examples

- [x] Ignore `GAZE_OFF_SCREEN` if `aiRules.gaze_tracking` is false.
- [x] Ignore `NO_FACE_DETECTED` if `aiRules.face_detection` is false.
- [x] Ignore `MULTIPLE_FACES` if `aiRules.multiple_faces_detection` is false.
- [x] Ignore `AUDIO_ANOMALY` if `aiRules.audio_anomaly_detection` is false.
- [x] Ignore `TAB_SWITCH` if `webSecurity.tab_switching_monitor` is false.
- [x] Ignore screenshot-related mobile telemetry if `mobileSecurity.screenshot_block` is false.
- [x] Ignore root/jailbreak telemetry if `mobileSecurity.root_jailbreak_detection` is false.
- [x] Ignore backgrounding telemetry if `mobileSecurity.prevent_backgrounding` is false.

### Refactor Notes

- The policy service should not directly own data access complexity.
- Create a small configuration resolver service for telemetry if needed.
- Keep Redis aggregation focused on de-duplication and repeat windows, not on configuration resolution.

## Phase 5: Telemetry Event Model Expansion

### Objective

Expand telemetry event support to match the current configuration surface without going beyond it.

### Candidate Event Coverage

#### Shared AI events

- [x] `GAZE_OFF_SCREEN`
- [x] `MULTIPLE_FACES`
- [x] `NO_FACE_DETECTED`
- [x] `AUDIO_ANOMALY`

#### Web events

- [x] `TAB_SWITCH`
- [x] `FULL_SCREEN_EXIT`
- [x] `CLIPBOARD_ATTEMPT`
- [x] `RIGHT_CLICK_ATTEMPT`
- [x] `PRINT_SCREEN_ATTEMPT`

#### Mobile events

- [x] `APP_BACKGROUNDING`
- [x] `SCREENSHOT_ATTEMPT`
- [x] `ROOT_JAILBREAK_DETECTED`
- [x] `APP_PINNING_VIOLATION`
- [x] `NOTIFICATION_BLOCK_VIOLATION`

### Important Scope Rule

Only implement events that directly map to existing configuration requirements. Do not invent new proctoring concepts outside the current config model.

## Phase 6: Storage Mapping Refactor

### Objective

Refactor storage mapping so incidents preserve rule/platform context and remain review-friendly.

### Tasks

- [x] Update `storage.dto.ts` mappings to include platform-aware incident shaping.
- [x] Update `storage.service.ts` insert logic to persist:
    - `platform`
    - `source`
    - `rule_key`
    - `configuration_snapshot`
    - `session_context`
    - `dedupe_key`
- [x] Keep raw signal detail in `details`, but move queryable dimensions into proper columns.
- [x] Revisit severity mapping for platform-specific incidents.

### Review-Oriented Requirements

Each incident should answer:

- What happened?
- On which platform?
- Which rule was active?
- Why was it persisted?
- Was it reviewed?
- Who reviewed it?
- Was there evidence?

## Phase 7: Review Endpoint Expansion

### Objective

Upgrade telemetry review endpoints so proctors/instructors/support can review incidents by platform, rule, and state.

### Tasks

- [x] Extend `GET /telemetry/incidents` filters:
    - `platform`
    - `ruleKey`
    - `source`
    - `status`
    - `incidentType`
    - `attemptId`
    - `examId`
    - `studentId`
- [x] Extend incident response DTOs to include:
    - `platform`
    - `source`
    - `ruleKey`
    - `reviewedBy`
    - `reviewedAt`
    - `reviewNotes`
    - `configurationSnapshot`
    - `sessionContext`
- [x] Extend `PATCH /telemetry/incidents/{incidentId}` to support review workflow updates cleanly.
- [ ] Consider adding bulk review actions later, but keep that out of initial refactor scope.

## Phase 8: Redis Aggregation Refactor

### Objective

Keep Redis narrow and useful.

### Tasks

- [x] Update Redis aggregation keys to include:
    - platform
    - ruleKey
    - attemptId
    - studentId
- [x] Ensure repeat windows are rule-specific and platform-specific.
- [x] Use Redis only for short-lived signal windows and de-duplication.
- [x] Do not turn Redis into the source of truth for incidents.

### Example Redis Key Shape

- `telemetry:important-log-window:WEB:webSecurity.tab_switching_monitor:{attemptId}:{studentId}`
- `telemetry:important-log-window:MOBILE:mobileSecurity.prevent_backgrounding:{attemptId}:{studentId}`

## Phase 9: Web Client Integration

### Objective

Make `sentinel-web` emit telemetry only for web rules that are currently enabled.

### Tasks

- [x] Consume shared telemetry contracts from `packages/shared`.
- [x] Build a small client-side telemetry adapter for web.
- [x] Gate event emission by active exam configuration.
- [x] Emit only relevant web telemetry:
    - tab switch
    - fullscreen exit
    - clipboard attempt
    - right-click attempt
    - print-screen attempt where technically possible
- [x] Include `platform: WEB` and the correct `ruleKey` in all payloads.

## Phase 10: Mobile Client Integration

### Objective

Make `sentinel-mobile` emit telemetry only for mobile rules that are currently enabled.

### Tasks

- [x] Consume shared telemetry contracts from `packages/shared`.
- [x] Build a small client-side telemetry adapter for mobile.
- [x] Gate event emission by active exam configuration.
- [x] Emit only relevant mobile telemetry:
    - app backgrounding
    - screenshot attempt
    - root/jailbreak detection
    - app pinning violation
    - notification-block violations if detectable
- [x] Include `platform: MOBILE` and the correct `ruleKey` in all payloads.

Current implementation note:

- App backgrounding, app-pinning, and notification-block telemetry are wired with the current Expo app lifecycle signals.
- Screenshot and root/jailbreak telemetry still need dedicated native detection support before they can be emitted reliably.

## Phase 11: `packages/shared` Refactor Checklist

### Objective

Ensure shared contracts become the single source of truth for telemetry/config alignment.

### Tasks

- [x] Add shared telemetry enums/types/schemas.
- [x] Export shared rule keys.
- [x] Export shared platform/source types.
- [x] Add shared incident DTOs if web/mobile review UIs consume them.
- [x] Update shared review-facing types used by proctor monitoring pages if needed.
- [x] Ensure any monitoring constants/mocks align with real incident categories after refactor.

### Important Rule

Any telemetry contract duplicated in `sentinel-api`, `sentinel-web`, or `sentinel-mobile` without a good reason should be moved into `packages/shared`.

## Phase 12: Migration & Rollout Strategy

### Objective

Reduce risk while refactoring a live cross-platform feature.

### Rollout Order

1. [x] Add Prisma schema changes for `flagged_incidents`
2. [x] Generate and review SQL migration
3. [x] Update shared contracts in `packages/shared`
4. [x] Update API DTOs and storage mappings
5. [x] Update config-aware policy logic
6. [x] Update Redis aggregation keys
7. [x] Update review endpoints
8. [x] Update web telemetry sender
9. [x] Update mobile telemetry sender
10. [x] Add monitoring dashboards/logging
11. [x] Run staged QA with web only — all 28 telemetry tests pass; fixed `telemetryIncidentDetailsSchema` export naming bug in `storage.dto.ts` (was exported as `telemetryIncidentDetailsSchemaExport`, causing `details` to silently resolve to `null`)
12. [x] Run staged QA with mobile only — 13 tests: all 5 rule gates, shared-contract coverage, payload construction; runs in API suite (`mobile-telemetry-client.test.ts`)
13. [x] Run mixed-platform review QA — 12 tests: platform distinguishability, dedupe key isolation, shared schema validation for WEB + MOBILE, review workflow preservation (`mixed-platform-review.test.ts`)

## Phase 13: Testing Requirements

### Backend

- [x] DTO validation tests for new telemetry payload fields — `ingestion.test.ts` (7 validation tests)
- [x] policy tests for enabled/disabled rule behavior — `ingestion.test.ts` (6 service tests including all 3 platform groups)
- [x] aggregation tests for repeat-window behavior by platform/rule — `ingestion.test.ts` (3 Redis window tests)
- [x] storage tests for richer incident mapping — `storage.test.ts` (7 tests: row mapping, dedupe key, insert shape, review workflow)
- [x] route tests for review filtering — `storage-routes.test.ts` (19 tests: GET filter forwarding + 400/403 rejection, PATCH review body validation)

### Shared Package

- [x] schema/type tests if applicable — `shared-contract.test.ts` (23 tests: rule key completeness, event type coverage, TELEMETRY_EVENT_DEFINITIONS integrity)
- [x] ensure API and clients consume the same exported contracts — `shared-contract.test.ts` (DTO schema equivalence tests; `isRuleEnabled` for all 14 rule keys)

### Web

- [x] verify disabled rules do not emit telemetry — `sentinel-web/web-telemetry-client.test.ts`
- [x] verify enabled rules emit the correct `ruleKey` and `platform` — `sentinel-web/web-telemetry-client.test.ts`

### Mobile

- [x] verify disabled rules do not emit telemetry — `mobile-telemetry-client.test.ts` (all 5 rules)
- [x] verify enabled rules emit the correct `ruleKey` and `platform` — `mobile-telemetry-client.test.ts`

### Review Workflow

- [x] verify incidents from web and mobile are distinguishable — `mixed-platform-review.test.ts`
- [x] verify review status changes persist correctly — `mixed-platform-review.test.ts` + `storage-routes.test.ts`
- [x] verify filters by `platform`, `ruleKey`, and `status` — `storage-routes.test.ts` (route-level) + `mixed-platform-review.test.ts` (service-level)

## Phase 14: Non-Goals For This Refactor

To prevent this project from expanding uncontrollably, the following are explicitly out of scope unless separately approved:

- raw video/audio upload through telemetry ingestion
- full forensic evidence management pipeline
- ML model changes
- analytics dashboards beyond review needs
- speculative proctoring rules not already represented in current configuration

## Suggested First Implementation Slice

If the full refactor is too large to start all at once, begin with this controlled slice:

1. [x] Add `platform`, `source`, `rule_key`, `reviewed_by`, `reviewed_at`, `review_notes`, and `configuration_snapshot` to `flagged_incidents`
2. [x] Move telemetry shared contracts into `packages/shared` — `packages/shared/src/schema/telemetry/telemetry-schema.ts` and exported via `schema/index.ts`
3. [x] Refactor ingestion DTO to require `platform` and `ruleKey`
4. [x] Make policy config-aware for:
    - `aiRules.gaze_tracking`
    - `aiRules.face_detection`
    - `aiRules.audio_anomaly_detection`
    - `aiRules.multiple_faces_detection`
    - `webSecurity.tab_switching_monitor`
    - `mobileSecurity.prevent_backgrounding`
    - `mobileSecurity.screenshot_block`
    - `mobileSecurity.root_jailbreak_detection`
5. [x] Expand review endpoints to expose `platform` and `ruleKey` — `getTelemetryIncidentsSchema.request.query` includes both as filters; response shape includes them via `telemetryIncidentSchema`

This slice already delivers the biggest value:

- telemetry respects current system configuration
- incidents become reviewable across web and mobile
- `packages/shared` becomes the contract hub
- backend and clients stay aligned
