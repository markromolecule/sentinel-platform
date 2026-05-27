> [!NOTE]
> **Canonical location:** [.agents/docs/features/telemetry/03-policy-rules-settings.md](../../../.agents/docs/features/telemetry/03-policy-rules-settings.md)

# Policy, Rules & Settings — Context, Purpose & How It Works

## Purpose

Raw telemetry events are inherently noisy. A student may briefly glance away for a split second, or a browser may momentarily lose fullscreen focus during a window resize. Without a filtering layer, the incident log would be flooded with meaningless records that obscure genuine cheating signals.

The **Policy & Rules Engine** solves this by acting as a **gatekeeper** — evaluating every incoming event against configurable business rules before deciding whether it is worth persisting. The **Settings** module allows those rules to be tuned at runtime without any deployment.

---

## The Three-Layer Filter

Every event passes through three checks in sequence:

### Layer 1 — Global Kill Switch (Settings)

The `TelemetryIngestionService` reads the `telemetry.global.settings` record from the database (cached for 30 seconds). If `operations.enabled = false`, **all events are silently dropped** regardless of type or source. This is the master switch.

### Layer 2 — Exam-Level Rule Toggle (Configuration)

Each exam has its own AI rule configuration (set by the instructor). The `TelemetryPolicyService` resolves the configuration for the active `examSessionId` and checks if the specific `ruleKey` on the event is enabled. If the rule is off for that exam, the event is dropped with a log entry.

Example: An exam may have `aiRules.gaze_tracking = false` (e.g., a take-home open-book exam), meaning all `GAZE_OFF_SCREEN` signals from that session are discarded.

### Layer 3 — Rule Evaluation (Business Logic)

If the event passes Layers 1 and 2, it is handed to the concrete `BaseTelemetryRule` implementation registered for that event type. The rule evaluates one of two conditions:

---

## How Rules Evaluate Events

### Evaluation Method 1: Duration Threshold

The event carries a `metadata.durationMs` field indicating how long the anomalous behavior persisted on the client side. If this exceeds the rule's minimum duration, the event is flagged immediately:

```
if payload.metadata.durationMs >= durationThresholdMs
  → persist
```

This is effective for gaze-off signals where the client's MediaPipe system already accumulates time before sending.

### Evaluation Method 2: Repeat Threshold (Redis Counter)

For events without a meaningful duration, the system uses a **sliding-window counter** stored in Redis. Each time a qualifying event arrives, the system:

```
key = telemetry:important-log-window:{platform}:{ruleKey}:{examSessionId}:{studentId}

INCR key      → count
if count == 1: EXPIRE key {windowSeconds}   ← sets the window TTL on first hit
if count == threshold: PERSIST
else: IGNORE
```

> [!NOTE]
> Only the **exact threshold hit** triggers persistence. Events above the threshold are silently dropped. This means exactly **one incident record** is created per breach of the threshold window — not one per occurrence.

### Evaluation Method 3: Confidence Threshold (Immediate)

Some rules (e.g., `MULTIPLE_FACES`) can trigger an immediate persist if the AI's `confidenceScore` exceeds a set value, bypassing the count window entirely.

---

## The Rule Registry

All rule implementations are registered centrally in the `TelemetryRuleRegistry`. The registry provides O(1) lookup by either `ruleKey` or `eventType`:

| Category   | Rules                                                                                                |
| :--------- | :--------------------------------------------------------------------------------------------------- |
| **AI**     | `GazeTrackingRule`, `FaceDetectionRule`, `AudioAnomalyRule`, `MultipleFacesRule`                     |
| **Web**    | `TabSwitchRule`, `FullScreenRule`, `ClipboardRule`, `RightClickRule`, `PrintScreenRule`              |
| **Mobile** | `AppBackgroundingRule`, `ScreenshotRule`, `JailbreakRule`, `AppPinningRule`, `NotificationBlockRule` |

Each rule implements:

- `ruleKey` — Unique identifier (e.g., `aiRules.gaze_tracking`).
- `eventTypes` — Which event types it handles.
- `isEnabled(config)` — Whether it is active for a given exam configuration.
- `evaluate(payload, runtimeOverride?)` — Returns `{ action: 'persist' | 'ignore' }`.

---

## Rule Thresholds Reference

| Rule                              | Duration Trigger                      | Repeat Trigger                |
| :-------------------------------- | :------------------------------------ | :---------------------------- |
| **Gaze Tracking**                 | `durationMs >= 1,500ms`               | `3 occurrences` in `120s`     |
| **Face Detection**                | `durationMs >= 1,500ms`               | `2 occurrences` in `60s`      |
| **Multiple Faces**                | Immediate if `confidenceScore >= 0.8` | `3 occurrences` in `120s`     |
| **Audio Anomaly**                 | `confidenceScore >= 0.85`             | `3 occurrences` in `120s`     |
| **Tab Switch / Fullscreen**       | N/A                                   | Immediate (single occurrence) |
| **Clipboard / Right Click**       | N/A                                   | Immediate                     |
| **Screenshot / Print Screen**     | N/A                                   | Immediate                     |
| **App Backgrounding / Jailbreak** | N/A                                   | Immediate                     |

---

## Settings Module

The Settings module stores and resolves the `telemetry.global.settings` record. It is the **runtime control plane** for the entire telemetry system — managed by the Support portal without requiring a code deployment.

### Settings Record Schema

```json
{
    "version": 1,
    "operations": {
        "enabled": true,
        "ingestionMode": "redis",
        "batchingEnabled": true,
        "maxBatchSize": 100,
        "batchWindowMs": 5000,
        "dedupeWindowSeconds": 120
    },
    "ruleOverrides": {
        "aiRules.gaze_tracking": {
            "enabled": true,
            "durationThresholdMs": 2000,
            "repeatThreshold": 2,
            "confidenceThreshold": 0.85
        }
    },
    "mediaPipeSandbox": {
        "enabled": false
    }
}
```

| Setting                                      | Effect                                                      |
| :------------------------------------------- | :---------------------------------------------------------- |
| `operations.enabled`                         | Master kill switch. `false` drops every event immediately.  |
| `operations.ingestionMode`                   | Switch between `sync` and `redis` without a deployment.     |
| `operations.batchingEnabled`                 | Toggle the Redis list buffer for batch events.              |
| `operations.maxBatchSize`                    | Maximum events per Redis buffer chunk.                      |
| `operations.dedupeWindowSeconds`             | Lookback window for incident deduplication at storage time. |
| `ruleOverrides[ruleKey].enabled`             | Disable a specific rule globally across all exams.          |
| `ruleOverrides[ruleKey].durationThresholdMs` | Override the minimum duration for a rule.                   |
| `ruleOverrides[ruleKey].repeatThreshold`     | Override the occurrence count for a rule.                   |
| `ruleOverrides[ruleKey].confidenceThreshold` | Override the AI confidence cutoff for a rule.               |

### Caching

Settings are cached **in-memory per API instance** for `30,000ms` (30 seconds). This means:

- Database reads for settings happen at most once every 30 seconds, preventing DB hammering.
- In a multi-instance deployment (e.g., 3 API pods), each instance has its own cache. Updates to settings are **eventually consistent** within the TTL window.
- The cache is invalidated explicitly after a settings update via `telemetrySettingsResolverService.invalidate()`.

---

_See also:_

- [`02-ingestion.md`](./02-ingestion.md) — Where the policy service is called.
- [`04-redis.md`](./04-redis.md) — The Redis counter used by repeat-threshold rules.
- Source: [`telemetry-policy.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-policy.service.ts)
- Source: [`abstract.rule.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/abstract.rule.ts)
- Source: [`registry.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/rules/registry.ts)
- Source: [`settings.constants.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/settings/settings.constants.ts)
