# Attempt Monitoring Audio Matrix

Synthetic fixture verification recorded on 2026-07-11.

| Fixture                      | Enabled types                 | Top class IDs | Confidence  | Result                                           | Latency note                                                          |
| ---------------------------- | ----------------------------- | ------------- | ----------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| `TALKING_SCORES`             | `TALKING`, `BACKGROUND_NOISE` | `0,1`         | `0.90`      | persisted as `TALKING`                           | Worker `detectedAt` is forwarded unchanged to toast and telemetry     |
| `TYPING_SCORES`              | `TYPING`                      | `378,379`     | `0.88`      | persisted as `TYPING`                            | Triggered only after the configured consecutive-frame streak          |
| `BACKGROUND_NOISE_SCORES`    | `BACKGROUND_NOISE`            | `500,507`     | `0.70`      | persisted as `BACKGROUND_NOISE`                  | Cooldown is engine-owned rather than hook-owned                       |
| `MIXED_SPEECH_TYPING_SCORES` | `TALKING`, `TYPING`           | `378,0`       | `0.90`      | strongest subtype wins                           | Selected subtype, confidence, and timestamp remain aligned end to end |
| `SILENCE_FRAME`              | `SILENCE_DETECTED`            | n/a           | RMS-derived | persisted only after the stricter silence streak | Extended silence cooldown remains longer than the default cooldown    |

## Audio Startup and Model Load Timings (Observed July 2026)

During Phase 0, we measured the following baseline timing matrix on supported devices:

- **Worker Thread instantiation:** 15ms - 50ms
- **Model downloading (Uncached YAMNet):** 800ms - 3,500ms (highly network dependent)
- **Model downloading (Cached YAMNet):** 10ms - 45ms
- **Worker `INIT` to `INIT_SUCCESS` (Model loading + WebGL/CPU compilation):** 2,500ms - 7,200ms
- **AudioContext wake-up transition:** ~100ms

## Bounded Recovery Limits

To ensure resilience without lockup or CPU thrashing, the following boundaries are active:

- **Warm-up / Preload Timeout:** 15,000ms.
- **Maximum Worker Re-creation Retries:** Exactly 1 retry (bounded retry path).
- **Graceful Degradation:** If model loading fails twice, the UI falls back to a degraded state allowing the exam to continue without audio proctoring alerts.
