# Attempt Monitoring Audio Matrix

Synthetic fixture verification recorded on 2026-07-11.

| Fixture | Enabled types | Top class IDs | Confidence | Result | Latency note |
| --- | --- | --- | --- | --- | --- |
| `TALKING_SCORES` | `TALKING`, `BACKGROUND_NOISE` | `0,1` | `0.90` | persisted as `TALKING` | Worker `detectedAt` is forwarded unchanged to toast and telemetry |
| `TYPING_SCORES` | `TYPING` | `378,379` | `0.88` | persisted as `TYPING` | Triggered only after the configured consecutive-frame streak |
| `BACKGROUND_NOISE_SCORES` | `BACKGROUND_NOISE` | `500,507` | `0.70` | persisted as `BACKGROUND_NOISE` | Cooldown is engine-owned rather than hook-owned |
| `MIXED_SPEECH_TYPING_SCORES` | `TALKING`, `TYPING` | `378,0` | `0.90` | strongest subtype wins | Selected subtype, confidence, and timestamp remain aligned end to end |
| `SILENCE_FRAME` | `SILENCE_DETECTED` | n/a | RMS-derived | persisted only after the stricter silence streak | Extended silence cooldown remains longer than the default cooldown |
