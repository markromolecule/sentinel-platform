> [!NOTE]
> **Canonical location:** [.agents/docs/features/audio-anomaly/calibration-baseline.md](../../../.agents/docs/features/audio-anomaly/calibration-baseline.md)

# Audio Anomaly Calibration Baseline

This document outlines the empirically validated baseline thresholds for the Sentinel audio anomaly detection engine, alongside the reasoning behind these defaults.

## Test Conditions

- **Hardware**: Mid-range laptop microphones (e.g., MacBook Air M1, standard Dell/HP laptops) and common external headsets.
- **Environment**: Quiet room with minimal background noise (standard exam conditions).
- **YAMNet Frame Size**: 0.975 seconds per frame.

## Baseline Thresholds

| Anomaly Type       | Threshold | Consecutive Frames | Cooldown (ms) | Rationale                                                                                                                                                                            |
| :----------------- | :-------- | :----------------- | :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TALKING`          | 0.65      | 3                  | 10000         | Speech is highly distinguishable by YAMNet. A 0.65 threshold prevents false alarms from short coughs or sighs. 3 frames (~3 seconds) ensure sustained talking is captured.           |
| `TYPING`           | 0.55      | 4                  | 10000         | Keyboards vary widely in sound profile. A lower threshold of 0.55 ensures mechanical and membrane keyboards are caught. Requires 4 consecutive frames to filter out isolated clicks. |
| `TAPPING`          | 0.50      | 2                  | 10000         | Tapping can be sporadic. A 0.50 threshold and 2-frame window catches repetitive tapping or knocking that might indicate communication.                                               |
| `MOUTH_BREATHING`  | 0.45      | 5                  | 10000         | Breathing near the microphone is generally low confidence but persistent. A 5-frame window prevents single heavy breaths from triggering alerts.                                     |
| `BACKGROUND_NOISE` | 0.70      | 5                  | 10000         | A high threshold avoids constant alerts for normal room ambiance. Flags loud, sustained interference (e.g., fans, traffic) that could mask other activities.                         |

## Global Sensitivity

The baseline `sensitivityMultiplier` is 1.0. Support teams can adjust this globally (0.5x to 2.0x) to accommodate noisier physical testing centers or particularly sensitive microphone arrays.
