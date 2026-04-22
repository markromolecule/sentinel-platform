# Telemetry Frequency-Aware Severity Plan

## Goal

Improve Sentinel's telemetry review quality by making incident severity frequency-aware per rule, while also storing clearer escalation logs for instructors, support, and post-exam reporting.

This plan is specifically for the behavior you described:

- a single suspicious event should not always jump to the same severity
- repeated behavior by the same student in the same attempt should escalate more intelligently
- logs should explain why the incident is `low`, `medium`, or `high`

## Current Repo State

- Telemetry events are filtered first by rule thresholds in `app/sentinel-api/src/modules/telemetry/ingestion/rules/`.
- Support telemetry settings already allow rule overrides for:
  - `severity`
  - `confidenceThreshold`
  - `durationThresholdMs`
  - `repeatThreshold`
- Incidents are persisted in `flagged_incidents` through `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`.
- The current persistence layer already:
  - deduplicates recent incidents by incident type
  - tracks `occurrenceCount`
  - stores the last triggering event
  - escalates to `HIGH` when recent incident volume crosses a hardcoded threshold
- The current severity model is still coarse because it primarily uses:
  - event-type defaults from `storage.constants.ts`
  - optional support-managed severity override
  - one generic recent-incident escalation rule

## 1-3-1 Analysis

### One Goal

- Turn telemetry severity into a rule-aware and frequency-aware model that is easier to review, easier to explain, and less noisy than the current fixed-severity approach.

### Three Viable Options

#### Option 1: Keep the current severity model and only improve UI wording

- Leave backend severity logic mostly unchanged and only expose better labels, tooltips, and support-facing explanations.

Pros:

- Lowest implementation risk.
- Quickest visible improvement for support users.

Cons:

- Does not materially improve incident quality.
- Keeps severity decisions too blunt for instructor review.
- Logs still will not explain escalation clearly enough.

#### Option 2: Add frequency-aware severity in the persistence layer only

- Keep current threshold evaluation logic, but make incident severity escalate per rule or incident type using occurrence history inside the attempt.

Pros:

- Best fit for the current architecture.
- Reuses the existing telemetry rule pipeline and incident persistence layer.
- Improves severity decisions without rewriting ingestion contracts.

Cons:

- Still depends on the quality of upstream threshold filtering.
- Requires careful metadata design so escalation reasons remain auditable.

#### Option 3: Redesign severity as a full scoring engine across all telemetry signals

- Replace per-rule severity with a larger scoring model that combines event type, confidence, duration, repetition, and cross-rule behavior into one risk score.

Pros:

- Most flexible long-term model.
- Can support richer proctoring analytics later.

Cons:

- Too large for the current scope.
- Harder to validate safely.
- Introduces more product and review complexity than needed for the current requirement.

### One Recommended Outcome

- Proceed with **Option 2** and add frequency-aware severity on top of the existing telemetry rule pipeline, while improving stored escalation metadata and support visibility.

## Proposed Product Behavior

After this work:

- thresholds still decide whether an event is important enough to persist
- severity is then decided using rule-specific repeat behavior inside the current attempt
- incident details explain:
  - what threshold triggered persistence
  - how many similar events were seen
  - which severity rule was applied
  - why the incident became `low`, `medium`, or `high`

Example target behavior:

- `RIGHT_CLICK_ATTEMPT`
  - first occurrence in window: `LOW`
  - repeated occurrences: `MEDIUM`
  - persistent repeated behavior: `HIGH`
- `TAB_SWITCH`
  - first occurrence: `MEDIUM`
  - repeated occurrences in short window: `HIGH`
- `MULTIPLE_FACES`
  - may remain immediately `HIGH`
- `PRINT_SCREEN_ATTEMPT`
  - may remain immediately `HIGH`

This means severity becomes rule-specific, not globally uniform.

## Scope Boundaries

This plan includes:

- backend severity logic
- incident detail enrichment
- support-facing visibility improvements
- tests and verification

This plan does not include:

- a full telemetry risk-scoring engine
- a cross-attempt behavioral profile for a student across all exams
- major schema redesign outside the telemetry module
- AI model changes or MediaPipe model changes

## Phase 1: Define Severity Rules And Logging Contract

### Objective

Freeze the frequency-aware severity contract before implementation so persistence, support UI, and reporting all read the same meaning from telemetry incidents.

### Tasks

- [x] Define a severity escalation contract per rule or incident type.
- [x] Decide which rules are:
  - [x] immediately severe
  - [x] frequency-escalated
  - [x] threshold-only with fixed severity
- [x] Add a `1-3-1` decision record for the escalation granularity:
  - [x] incident type only
  - [x] rule key only
  - [x] rule key plus platform
- [x] Define the metadata fields that must be stored in `details`, such as:
  - [x] `occurrenceCount`
  - [x] `severityReason`
  - [x] `severityInputs`
  - [x] `aggregation.trigger`
  - [x] `previousSeverity`
  - [x] `currentSeverity`
- [x] Define whether escalation windows are global or rule-specific.
- [x] Decide whether support-managed rule overrides can:
  - [x] force severity directly
  - [x] tune repeat thresholds only
  - [x] do both, with forced severity taking precedence
- [x] Document recommended default ladders per rule family:
  - [x] AI rules
  - [x] web rules
  - [x] mobile rules

### Acceptance Criteria

- [x] Every supported rule has a clear severity strategy.
- [x] The logging shape is explicit enough for future UI and report consumers.
- [x] Support overrides have a documented precedence rule.

### Phase 1 Outcome

Phase 1 is locked as of `2026-04-22`. The contract below is the implementation target for Phase 2 and Phase 3.

### Severity Strategy By Rule

Escalation matching must use `attemptId + ruleKey + platform`. Incident type alone is not specific enough because it would wrongly blend distinct behaviors such as `RIGHT_CLICK_ATTEMPT` and `CLIPBOARD_ATTEMPT`, which both currently map to `SUSPICIOUS_MOVEMENT`.

#### AI Rules

| Rule key | Event type | Strategy | Default ladder | Matching window | Notes |
| --- | --- | --- | --- | --- | --- |
| `aiRules.gaze_tracking` | `GAZE_OFF_SCREEN` | frequency-escalated | `LOW` -> `MEDIUM` at 2 matches -> `HIGH` at 4 matches | 120s for `MEDIUM`, 300s for `HIGH` | Persistence still depends on duration or repeat threshold from ingestion. |
| `aiRules.face_detection` | `NO_FACE_DETECTED` | frequency-escalated | `MEDIUM` -> `HIGH` at 2 matches | 120s | No `LOW` tier because the event already crossed the face-loss threshold before persistence. |
| `aiRules.audio_anomaly_detection` | `AUDIO_ANOMALY` | frequency-escalated | `LOW` -> `MEDIUM` at 2 matches -> `HIGH` at 4 matches | 120s for `MEDIUM`, 300s for `HIGH` | Confidence-threshold and repeat-threshold persistence both feed the same severity ladder. |
| `aiRules.multiple_faces_detection` | `MULTIPLE_FACES` | threshold-only fixed severity | `HIGH` | n/a | Once confidence is high enough to persist, severity stays `HIGH`. |

#### Web Rules

| Rule key | Event type | Strategy | Default ladder | Matching window | Notes |
| --- | --- | --- | --- | --- | --- |
| `webSecurity.tab_switching_monitor` | `TAB_SWITCH` | frequency-escalated | `MEDIUM` -> `HIGH` at 2 matches | 300s | One tab switch is reviewable; repeated tab switching is severe. |
| `webSecurity.full_screen_required` | `FULL_SCREEN_EXIT` | frequency-escalated | `MEDIUM` -> `HIGH` at 2 matches | 300s | Must not cross-escalate with plain tab switching even though both map to the same incident family today. |
| `webSecurity.clipboard_control` | `CLIPBOARD_ATTEMPT` | frequency-escalated | `MEDIUM` -> `HIGH` at 2 matches | 300s | Clipboard attempts are stronger than right-click attempts on first occurrence. |
| `webSecurity.right_click_disable` | `RIGHT_CLICK_ATTEMPT` | frequency-escalated | `LOW` -> `MEDIUM` at 2 matches -> `HIGH` at 4 matches | 120s for `MEDIUM`, 300s for `HIGH` | Keeps one-off UI noise out of the highest tier. |
| `webSecurity.print_screen_disable` | `PRINT_SCREEN_ATTEMPT` | immediately severe | `HIGH` | n/a | Persist as `HIGH` on first occurrence unless support explicitly forces another severity. |

#### Mobile Rules

| Rule key | Event type | Strategy | Default ladder | Matching window | Notes |
| --- | --- | --- | --- | --- | --- |
| `mobileSecurity.app_pinning_required` | `APP_PINNING_VIOLATION` | immediately severe | `HIGH` | n/a | Breaks the locked-exam posture immediately. |
| `mobileSecurity.prevent_backgrounding` | `APP_BACKGROUNDING` | frequency-escalated | `MEDIUM` -> `HIGH` at 2 matches | 300s | One leave-and-return can be accidental; repeated backgrounding is severe. |
| `mobileSecurity.notification_block` | `NOTIFICATION_BLOCK_VIOLATION` | frequency-escalated | `LOW` -> `MEDIUM` at 2 matches -> `HIGH` at 4 matches | 300s for `MEDIUM`, 600s for `HIGH` | Keep this less aggressive than screenshot or root-detection rules. |
| `mobileSecurity.screenshot_block` | `SCREENSHOT_ATTEMPT` | immediately severe | `HIGH` | n/a | Screenshot capture remains an immediate high-severity event. |
| `mobileSecurity.root_jailbreak_detection` | `ROOT_JAILBREAK_DETECTED` | immediately severe | `HIGH` | n/a | Device compromise remains immediate high severity. |

### 1-3-1 Decision Record: Escalation Granularity

#### One Goal

Choose a matching key that escalates repeated suspicious behavior without blending unrelated telemetry events.

#### Three Viable Options

##### Option 1: Incident Type Only

Use `incident_type` as the only escalation key.

Pros:

- Simplest query shape.
- Reuses the current persistence model directly.

Cons:

- Incorrectly blends distinct rules that share the same incident type.
- Would allow `RIGHT_CLICK_ATTEMPT` to escalate `CLIPBOARD_ATTEMPT`.
- Would allow `TAB_SWITCH` to escalate `FULL_SCREEN_EXIT`.

##### Option 2: Rule Key Only

Use `attemptId + ruleKey` as the escalation key.

Pros:

- Separates distinct suspicious behaviors cleanly.
- Matches how support-managed overrides are authored today.

Cons:

- Leaves platform out of the key for AI rules that can run on both web and mobile.
- Makes future multi-client telemetry harder to reason about.

##### Option 3: Rule Key Plus Platform

Use `attemptId + ruleKey + platform` as the escalation key.

Pros:

- Prevents mixed-rule escalation.
- Preserves room for shared rule keys across web and mobile clients.
- Aligns cleanly with existing telemetry payload fields and support overrides.

Cons:

- Slightly more verbose query logic.
- Requires dedupe lookups to stop relying on incident type alone.

#### One Recommended Outcome

Proceed with `attemptId + ruleKey + platform` for both escalation matching and same-behavior dedupe whenever incident-type grouping would collapse distinct rules.

### Logging Contract For `details`

The persisted `details` payload must remain backward-compatible with older rows, but new writes must include the fields below when available:

| Field | Type | Purpose |
| --- | --- | --- |
| `eventType` | telemetry event type | Preserve the original triggering event. |
| `metadata` | event metadata | Preserve duration, confidence, and the original ingestion aggregation block. |
| `telemetrySettings.version` | number or `null` | Tie the incident to the runtime settings snapshot used at ingest time. |
| `telemetrySettings.ruleOverrideApplied` | override object or `null` | Record the applied support override, if any. |
| `occurrenceCount` | integer | Count of matching incidents merged into this stored incident record. |
| `severityReason` | string enum | One of `default-ladder`, `repeat-escalated`, `forced-override`, `immediate-high`, `threshold-fixed`. |
| `severityInputs` | object | Record the ladder inputs used for the final decision. |
| `severityInputs.baseSeverity` | severity | Default severity before repeat escalation or force override. |
| `severityInputs.ladder` | severity array | Exact ladder evaluated for the rule. |
| `severityInputs.matchingCount` | integer | Count of matching incidents considered for severity resolution. |
| `severityInputs.matchingWindowSeconds` | integer or `null` | Window used for the severity lookup that produced the final tier. |
| `severityInputs.repeatThreshold` | integer or `null` | Effective support-tuned repeat threshold when the rule uses one. |
| `severityInputs.overrideSeverity` | severity or `null` | Explicit support-managed forced severity, if present. |
| `aggregation.trigger` | string | Preserve the upstream persistence reason from ingestion. |
| `previousSeverity` | severity or `null` | Severity before the current write. |
| `currentSeverity` | severity | Final stored severity after resolution. |
| `lastEvent` | object | Preserve the most recent triggering event summary on deduped updates. |

`severityInputs` is the contract support and reporting should read when explaining why a severity changed. `severityReason` is the short label for badges, table chips, and audit copy.

### Escalation Window Policy

- Escalation windows are rule-specific, not global.
- AI rules should reuse their existing repeat windows where that makes sense, then extend only the highest tier window when needed.
- Web and mobile rules without an existing repeat window should use the defaults listed in the tables above.
- The dedupe window remains an operations concern and stays separate from the severity escalation window.

### Support Override Precedence

Support-managed overrides can do both:

1. Force severity directly through `severity`.
2. Tune repeat-sensitive rules through `repeatThreshold`.

Precedence order for Phase 2 implementation:

1. Evaluate whether the event is important enough to persist using the current ingestion thresholds and support-tuned thresholds.
2. Resolve the rule's default severity ladder for the matching behavior.
3. Apply repeat-based escalation using the rule-specific window and the effective repeat threshold.
4. If a support-managed severity override is set, force the final severity to that value.
5. Persist `severityReason`, `severityInputs`, `previousSeverity`, and `currentSeverity` so the override is auditable.

Forced severity takes precedence over immediate-high defaults and repeat escalation because it is an explicit support action. Phase 3 must show that the severity was forced, not organically escalated.

### Phase Gate

Pause here before Phase 2. Do not start the persistence refactor until this Phase 1 contract is reviewed against product expectations for the ladders above.

## Phase 2: Implement Frequency-Aware Persistence And Escalation

### Objective

Replace the current generic recent-incident escalation with rule-aware severity escalation while preserving the existing telemetry pipeline.

### Tasks

- [x] Refactor `incident-persistence.service.ts` so severity escalation is no longer a single hardcoded `HIGH` promotion for all recent incidents.
- [x] Introduce a reusable severity resolver service inside the telemetry module.
- [x] Escalate based on the same suspicious behavior, not only any mixed incident in the same window.
- [x] Preserve current deduplication behavior where it still makes sense.
- [x] Store richer incident details including:
  - [x] escalation trigger
  - [x] severity ladder used
  - [x] recent matching count
  - [x] matching window
  - [x] prior severity and final severity
- [x] Ensure support-managed severity override is still honored when explicitly set.
- [x] Ensure support-managed `repeatThreshold` can influence escalation for repeat-sensitive rules.
- [x] Keep terminal telemetry drops for completed or missing sessions from the worker fix intact.
- [x] Add or update tests for:
  - [x] single occurrence severity
  - [x] repeated same-rule escalation
  - [x] deduped incident updates
  - [x] forced severity override precedence
  - [x] mixed-rule incidents not incorrectly escalating each other

### Acceptance Criteria

- [x] Severity is determined per rule or incident strategy, not by one global escalation shortcut.
- [x] Stored incident details explain why the final severity was chosen.
- [x] Existing queue, ingestion, and incident review flows still work.

### Phase 2 Outcome

Phase 2 is implemented as of `2026-04-22`.

- `incident-persistence.service.ts` now deduplicates and escalates by `attemptId + ruleKey + platform` instead of incident type alone.
- `incident-severity-resolver.service.ts` centralizes the default ladders, repeat-threshold scaling, immediate-high rules, and forced severity precedence.
- Stored incident `details` now capture `severityReason`, `severityInputs`, `previousSeverity`, `currentSeverity`, `occurrenceCount`, and `lastEvent`.
- Mixed-rule incidents such as `RIGHT_CLICK_ATTEMPT` and `CLIPBOARD_ATTEMPT` no longer merge into the same `SUSPICIOUS_MOVEMENT` record or escalate each other.
- Existing terminal drop handling for completed and missing sessions remains in place because the worker boundary and `404` / `409` behavior were not changed.

### Phase Gate

Pause here before Phase 3. Do not change support UI or reporting consumers until the Phase 2 persistence output is reviewed against expected incident detail payloads.

## Phase 3: Surface Better Review Signals In Support And Reporting

### Objective

Make the new severity logic understandable in the support workspace and downstream reporting so reviewers can trust what they see.

### Tasks

- [x] Update support telemetry review surfaces to display richer severity context when available.
- [x] Show escalation context such as:
  - [x] occurrence count
  - [x] trigger reason
  - [x] repeat window
  - [x] whether severity was forced by override
- [x] Add support-facing copy that distinguishes:
  - [x] threshold-triggered incidents
  - [x] repeat-escalated incidents
  - [x] immediate high-severity incidents
- [x] Review reporting queries and mappers to ensure new detail fields do not break existing summaries.
- [x] Add or update tests for support/reporting consumers that read severity and occurrence metadata.
- [x] Add a short operator note in docs explaining how to interpret frequency-aware incidents.

### Acceptance Criteria

- [x] Support users can see why an incident severity changed.
- [x] Reporting still works with the enriched incident details.
- [x] Reviewers can distinguish one-off noise from repeated suspicious behavior.

### Phase 3 Outcome

Phase 3 is implemented as of `2026-04-22`.

- Shared telemetry and monitoring schemas now recognize `severityReason`, `severityInputs`, persistence trigger metadata, and forced-override context.
- Monitoring incidents now expose `occurrenceCount`, `severityReason`, `persistenceTrigger`, `matchingWindowSeconds`, and `wasSeverityForced` to downstream clients.
- The monitoring timeline now explains whether a flag was threshold-triggered, repeat-escalated, immediate-high, or support-forced instead of only showing the final severity badge.
- The support telemetry rules workspace now includes reviewer guidance for threshold-triggered, repeat-escalated, immediate-high, and forced-override incidents.
- The operator note is documented in [docs/telemetry-frequency-aware-operator-note.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/telemetry-frequency-aware-operator-note.md).

### Phase Gate

Pause here before any broader rollout or follow-on phase work. The remaining checklist items are manual validation tasks, not implementation tasks.

## Verification Checklist

- [x] Run focused backend tests for telemetry persistence and severity logic.
- [x] Run support app tests that touch telemetry views or incident consumers.
- [ ] Manually verify at least one rule from each family:
  - [ ] AI rule
  - [ ] web rule
  - [ ] mobile rule
- [ ] Manually verify one immediate-severity rule and one repeat-escalated rule.
- [x] Confirm incident payloads and review pages still render when older rows do not contain the new metadata fields.

## Implementation Outcome

After these phases, Sentinel should have:

- rule-aware and frequency-aware telemetry severity
- better incident logs for support and instructor review
- clearer distinction between one-off events and repeated suspicious behavior
- support-configurable rule behavior that still fits the current telemetry architecture
