# Deduplication and Audio Calibration Investigation Context

## Issue Summary

Two proctoring issues are still visible during the student attempt flow:

- Duplicate proctoring events still appear during the student [Attempt] page and can inflate `occurrenceCount`, student warning toasts, and instructor monitoring/log views.
- Audio anomaly detection is too sensitive to keyboard sounds. Keyboard typing can be classified as a suspicious audio incident, creating inaccurate flags for students and instructors.

This context should be treated as a root-cause investigation brief, not only a fix request. The implementation should verify every connected event path before changing thresholds or dedupe behavior.

## Priority

- Deduplication is highest priority because incorrect counts can make legitimate students look like repeat offenders and can trigger inaccurate severity escalation.
- Audio calibration is also high priority because support-managed global calibration should control real exam behavior. If support calibration saves successfully but attempts still use defaults, the support feature is effectively disconnected.

## Current Evidence From Connected Files

### Student Browser Event Emission

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
    - Emits `CLIPBOARD_ATTEMPT`, `TAB_SWITCH`, `FULL_SCREEN_EXIT`, `RIGHT_CLICK_ATTEMPT`, and `PRINT_SCREEN_ATTEMPT`.
    - Uses local burst windows:
        - Clipboard: `800ms`
        - Right click: `800ms`
        - Print screen: `800ms`
        - Focus/tab switch: `1000ms`
        - Fullscreen exit: `1000ms`
    - Builds metadata with `createTelemetryActionMetadata()`, including `eventId`, `dedupeKey`, and `clientActionAt`.
    - Potential root cause area: clipboard actions are registered from both `keydown` shortcuts and `copy` / `cut` / `paste` DOM events. The shared `lastClipboardIncidentAtRef` should suppress the browser's double event burst, but this must be tested against real browser behavior where event order can vary.

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/_utils/action-metadata.ts`
    - Builds `dedupeKey` as `{examSessionId}:{eventType}:{actionSource}:{bucketStart}`.
    - Potential root cause area: if the same user action reaches different `actionSource` values, it becomes different dedupe keys and can bypass duplicate-key suppression.

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-telemetry.ts`
    - Suppresses emission when monitoring is suspended, IDs are missing, or the device is mobile.
    - Potential root cause area: if the attempt flow remounts monitoring hooks, local refs reset. The server must remain the final authority for duplicate prevention.

### Server Dedupe and Occurrence Counting

- `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
    - Checks exact duplicate `metadata.dedupeKey` first and ignores duplicates.
    - Merges distinct same-rule incidents inside `operations.dedupeWindowSeconds`, defaulting to `120s`.
    - Inserts first incidents with `occurrenceCount: 1`.
    - Updates existing incidents with `getNextOccurrenceCount()`.
    - Potential root cause area: exact duplicate keys are ignored, while distinct keys inside the dedupe window increment occurrence count. That is correct for separate actions, but wrong if one physical action generates multiple distinct keys.

- `packages/db/prisma/migrations/20260706000000_add_telemetry_dedupe_index/migration.sql`
    - Adds a partial unique index on `(attempt_id, rule_key, platform, dedupe_key)` when `dedupe_key IS NOT NULL`.
    - Potential root cause area: confirm this migration is applied in the environment showing duplicates. Without it, concurrent duplicate inserts can slip through.

- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
    - Routes both single and batch events through `appendIncidentRecord()`.
    - Potential root cause area: batch/Redis flush should not process the same event twice. Review queue/buffer retries if duplicates appear with identical `dedupe_key`.

- `app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts`
    - Counts stored occurrence totals in the lookback window and escalates severity at calibrated thresholds.
    - Potential root cause area: inflated `occurrenceCount` directly raises severity.

### Instructor and Logs Toast Perception

- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/_hooks/use-monitoring.ts`
    - Shows a warning when `incidentCount` or `openIncidentCount` increases after initial hydration.
    - Potential root cause area: if the API increments `incidentCount` based on occurrence updates rather than row count, a single deduped incident update can still look like a new incident in monitoring.

- `app/sentinel-web/src/features/exams/logs/hooks/use-incident-logs.ts`
    - Shows one toast for a new incident ID and another for occurrence-count increases.
    - Potential root cause area: this can make deduped updates feel like duplicate incidents. The UI copy should distinguish "same incident updated" from "new incident logged."

### Audio Calibration and Runtime Detection

- `packages/shared/src/audio/audio-anomaly.ts`
    - Defaults:
        - `TALKING: 0.45`
        - `TYPING: 0.55`
        - `TAPPING: 0.5`
        - `MOUTH_BREATHING: 0.45`
        - `BACKGROUND_NOISE: 0.55`
        - `SILENCE_DETECTED: 0.015`
    - Enabled by default: `TALKING`, `TYPING`, `TAPPING`, `MOUTH_BREATHING`, `BACKGROUND_NOISE`.
    - Current code mapping in `YAMNET_CLASS_IDS_BY_ANOMALY_TYPE` does not correlate cleanly with `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`:
        - `TALKING: [0, 1, 3, 4]` maps to `Speech`, `Child speech, kid speaking`, `Narration, monologue`, and `Babbling`. This is mostly aligned, though it excludes `2 = Conversation`.
        - `TYPING: [400, 401]` maps to `Clock` and `Tick`, not keyboard typing.
        - `TAPPING: [398, 402]` maps to `Mechanisms` and `Tick-tock`, not hand/table tapping. The CSV has `354 = Tap` and `140 = Tapping (guitar technique)`.
        - `MOUTH_BREATHING: [287, 288]` maps to `Waterfall` and `Ocean`, not breathing. The CSV has `36 = Breathing`.
        - `BACKGROUND_NOISE: [494, 495, 496]` maps to `Silence`, `Sine wave`, and `Harmonic`, not general background noise. The CSV has `507 = Noise`, `508 = Environmental noise`, and room/space classes such as `500 = Inside, small room`.
        - `SILENCE_DETECTED` does not use YAMNet class IDs and is handled by RMS, but the CSV does have `494 = Silence`.
    - Likely root cause: the audio anomaly class mapping itself is misaligned with the bundled YAMNet class map. This can make calibration misleading because thresholds are applied to the wrong labels.
    - Secondary policy issue: even after fixing class IDs, keyboard sounds may still be intentionally detected if `TYPING` / `TAPPING` remain enabled by default. Decide whether keyboard sounds should be disabled, low-severity, support-configurable only, or separately labeled instead of treated like unknown-person audio.

- `packages/shared/src/audio/yamnet-class-mapper.ts`
    - Effective threshold is `configuredThreshold / sensitivityMultiplier`.
    - Important calibration detail: increasing `sensitivityMultiplier` makes detection more sensitive because it lowers the effective threshold. The support UI copy currently says "Lower value = more sensitive", which contradicts the code.
    - Likely root cause: support may be tuning in the wrong direction because UI semantics and threshold math disagree.
    - Must be validated against `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv` whenever `YAMNET_CLASS_IDS_BY_ANOMALY_TYPE` changes.

- `app/sentinel-web/src/workers/audio-anomaly-engine.ts`
    - Evaluates every enabled anomaly type independently and can emit multiple anomaly types for the same audio window.
    - Requires `consecutiveFrameThreshold` frames, then applies per-type cooldown.
    - Potential root cause area: a keyboard sound can emit `TYPING`, `TAPPING`, and possibly `TALKING` / `BACKGROUND_NOISE` if the YAMNet scores or RMS fallback cross thresholds.

- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.ts`
    - Applies another client-side cooldown before toast and telemetry emission.
    - Emits one telemetry request per accepted anomaly type.
    - Potential root cause area: if the worker emits multiple anomaly types for one keyboard burst, the hook can send multiple telemetry events because cooldown is keyed by anomaly type.

- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-anomaly-telemetry.ts`
    - Builds audio dedupe keys as `{examSessionId}:AUDIO_ANOMALY:{anomalyType}:{bucketStart}`.
    - Potential root cause area: one physical keyboard burst with both `TYPING` and `TAPPING` becomes two separate dedupe streams and two incident updates.

### Support Audio Calibration Wiring

- `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/views/support-audio-calibration-view.tsx`
    - Reads and updates global audio settings through hooks.

- `packages/hooks/src/query/audio/use-audio-settings-query.ts`
- `packages/hooks/src/query/audio/use-update-audio-settings-mutation.ts`
- `packages/services/src/api/audio.ts`
- `app/sentinel-api/src/modules/infrastructure/audio/audio.service.ts`
- `app/sentinel-api/src/modules/infrastructure/audio/services/audio-resolver.service.ts`
    - The support API path exists and persists/resolves audio calibration settings.

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
    - Current attempt flow passes `DEFAULT_AUDIO_ANOMALY_CONFIG` into `useAttemptMonitoring()` when `audio_anomaly_detection` is enabled.
    - Likely root cause: student attempts do not appear to query or pass support-managed global audio calibration. This means the support page can save settings successfully while live attempts continue using hard-coded defaults.

## Highest-Probability Root Causes

1. **Support audio calibration is not wired into student attempts.**
    - Evidence: the attempt hook passes `DEFAULT_AUDIO_ANOMALY_CONFIG`, not `useAudioSettingsQuery().data.value`.
    - Impact: support changes do not affect real exam audio behavior.

2. **The YAMNet class IDs are misaligned with the bundled class map.**
    - Evidence: `TYPING: [400, 401]` maps to `Clock`/`Tick`; `MOUTH_BREATHING: [287, 288]` maps to `Waterfall`/`Ocean`; `BACKGROUND_NOISE: [494, 495, 496]` maps to `Silence`/tones in `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`.
    - Impact: audio thresholds can fire on the wrong semantic classes, making keyboard/talking/background calibration unreliable.

3. **Keyboard sound is currently configured as a first-class anomaly.**
    - Evidence: `TYPING` and `TAPPING` are enabled by default. The correct CSV keyboard-related classes appear to be `378 = Typing`, `379 = Typewriter`, and `380 = Computer keyboard`.
    - Impact: after correcting class IDs, keyboard noise may be correctly detected by the model but still incorrectly treated as a suspicious "unknown person" style incident unless product policy changes.

4. **Audio can emit multiple anomaly types for one physical sound.**
    - Evidence: the engine evaluates all enabled types independently, and audio dedupe keys include `anomalyType`.
    - Impact: one keyboard burst can become multiple telemetry events or occurrence increments.

5. **A single browser action may generate multiple distinct client dedupe keys.**
    - Evidence: dedupe keys include `actionSource`; clipboard shortcut and clipboard DOM events may differ if not suppressed by local burst timing.
    - Impact: server exact dedupe ignores only identical keys, while distinct keys inside the window increment `occurrenceCount`.

6. **Production database may not have the dedupe unique index applied.**
    - Evidence: dedupe relies on the July 6 migration for concurrency safety.
    - Impact: exact duplicate keys can insert more than once under concurrent requests.

## Files To Assess Before Implementing

### Deduplication

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/_utils/action-metadata.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/_utils/payloads.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-details.utils.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-severity-resolver.service.ts`
- `packages/db/prisma/migrations/20260706000000_add_telemetry_dedupe_index/migration.sql`
- `packages/db/prisma/schema.prisma`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/_hooks/use-monitoring.ts`
- `app/sentinel-web/src/features/exams/logs/hooks/use-incident-logs.ts`

### Audio Calibration

- `packages/shared/src/audio/audio-anomaly.ts`
- `packages/shared/src/audio/yamnet-class-mapper.ts`
- `packages/shared/src/schema/audio/audio-settings-schema.ts`
- `app/sentinel-web/src/workers/audio-anomaly-engine.ts`
- `app/sentinel-web/src/workers/audio-anomaly.worker.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-anomaly-telemetry.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/audio-anomaly-controller.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts`
- `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/audio/audio-calibration-form.tsx`
- `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/views/support-audio-calibration-view.tsx`
- `packages/hooks/src/query/audio/use-audio-settings-query.ts`
- `packages/hooks/src/query/audio/use-update-audio-settings-mutation.ts`
- `packages/services/src/api/audio.ts`
- `app/sentinel-api/src/modules/infrastructure/audio/audio.service.ts`
- `app/sentinel-api/src/modules/infrastructure/audio/services/audio-resolver.service.ts`

## Suggested Implementation Direction

1. Wire support-managed audio settings into the student attempt runtime.
    - Query audio settings in the student attempt flow or an appropriate provider.
    - Pass the resolved `record.value` into `useAttemptMonitoring()`.
    - Fall back to `DEFAULT_AUDIO_ANOMALY_CONFIG` only while settings are unavailable or not persisted.

2. Recalibrate keyboard behavior explicitly.
    - First correct `YAMNET_CLASS_IDS_BY_ANOMALY_TYPE` against `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`.
    - Candidate CSV-backed mappings to review:
        - Talking: include `0 = Speech`, `1 = Child speech`, `2 = Conversation`, `3 = Narration`, `4 = Babbling` only if each should count.
        - Typing/keyboard: `378 = Typing`, `379 = Typewriter`, `380 = Computer keyboard`.
        - Tapping: likely `354 = Tap`; avoid unrelated `398 = Mechanisms` and `402 = Tick-tock`.
        - Breathing: `36 = Breathing`; possibly review nearby breathing-related subclasses if needed.
        - Background noise: likely `507 = Noise`, `508 = Environmental noise`, and possibly room/space classes `500-504`; avoid `494 = Silence` unless using the explicit silence path.
    - Decide whether `TYPING` and `TAPPING` should be disabled by default, support-configurable only, or shown as a lower-severity keyboard-specific signal instead of an "unknown person" style audio flag.
    - If keeping them enabled, raise defaults and add tests for keyboard-like YAMNet scores below the incident threshold.
    - Fix the support UI description for `sensitivityMultiplier` so it matches `configuredThreshold / sensitivityMultiplier`.

3. Prevent one physical audio burst from producing multiple incident increments.
    - Consider emitting only the highest-confidence anomaly per audio frame/window, or grouping multiple detected audio labels into one telemetry event.
    - If multiple labels remain valid, ensure instructor UI communicates that they came from the same audio window.

4. Strengthen browser-event dedupe around physical actions.
    - Test clipboard shortcut plus DOM clipboard event ordering.
    - Consider normalizing clipboard `actionSource` to a single value for all clipboard pathways.
    - Confirm exact duplicate `dedupeKey` requests no-op and do not increment `occurrenceCount`.

5. Verify database and queue behavior in the target environment.
    - Confirm `flagged_incidents_dedupe_key_unique` exists.
    - Check whether duplicates share the same `dedupe_key`. Same key means server/db dedupe failed; different keys mean client/action-source/audio-type grouping is likely the cause.

## Test Coverage To Add Or Re-Verify

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.test.tsx`
    - Prove the attempt hook passes persisted support audio settings into `useAttemptMonitoring()`.

- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.test.tsx`
    - Prove a worker message with multiple audio anomaly types does not create unintended duplicate toasts/telemetry for one physical sound, depending on the chosen behavior.

- `app/sentinel-web/src/workers/tests/audio-anomaly-engine.test.ts`
    - Add keyboard-like YAMNet scores and assert the calibrated config does not flag keyboard noise as talking/unknown-person audio.

- `packages/shared/src/audio/yamnet-class-mapper.test.ts`
    - Cover the corrected sensitivity semantics, keyboard threshold behavior, and exact class-ID correlation with `yamnet_class_map.csv`.

- `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/audio/audio-calibration-form.test.tsx`
    - Verify the UI renders persisted values and that sensitivity helper text matches the actual threshold math.

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts`
    - Prove one clipboard shortcut plus the resulting clipboard event emits one telemetry event.
    - Prove the next distinct clipboard action after the burst window emits a separate event.

- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts`
    - Prove duplicate `dedupeKey` leaves `occurrenceCount = 1`.
    - Prove distinct dedupe keys inside the dedupe window increment to `2`.
    - Prove concurrent identical dedupe keys create one row when the unique index exists.

## Acceptance Criteria

- One physical browser/security action produces one student toast and one server-accepted telemetry occurrence.
- Exact duplicate `dedupeKey` submissions do not create a row and do not increment `occurrenceCount`.
- Distinct actions still increment occurrence counts correctly.
- Instructor monitoring/logs do not present deduped updates as separate new incidents.
- Support audio calibration settings are used by live student attempts.
- Keyboard typing/tapping is not mislabeled as unknown-person audio and does not create high-confidence audio incidents under the calibrated default settings.
- Tests cover the student attempt audio settings wiring, audio keyboard calibration, client dedupe, server duplicate-key behavior, and instructor/log display semantics.
