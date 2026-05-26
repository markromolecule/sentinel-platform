> [!NOTE]
> **Canonical location:** [.agents/docs/features/audio-anomaly/false-positive-analysis.md](../../../.agents/docs/features/audio-anomaly/false-positive-analysis.md)

# False Positive Analysis

During integration testing, several common false positive scenarios were identified. The table below details these scenarios and the mitigations applied to the calibration baselines.

| False Positive Scenario        | Misclassified As   | Mitigation                                                                                                   |
| :----------------------------- | :----------------- | :----------------------------------------------------------------------------------------------------------- |
| **Throat Clearing / Coughing** | `TALKING`          | Increased `TALKING` `consecutiveFrameThreshold` to 3. Short noises rarely span 3 seconds continuously.       |
| **Mouse Clicking**             | `TYPING`           | Isolated clicks are filtered out by requiring 4 consecutive frames for `TYPING`.                             |
| **Dropping a Pen**             | `TAPPING`          | Set `consecutiveFrameThreshold` to 2 for `TAPPING` to filter out single impact events.                       |
| **Heavy Sigh / Yawn**          | `MOUTH_BREATHING`  | Increased `MOUTH_BREATHING` `consecutiveFrameThreshold` to 5. Requires sustained heavy breathing to trigger. |
| **Rustling Paper**             | `BACKGROUND_NOISE` | Maintained a high threshold (0.70) for `BACKGROUND_NOISE` to ignore minor ambient disturbances.              |

## Recommendations for Instructors

If an instructor observes repeated false positives for a specific student, they should:

1. Review the audio alert feed confidence scores.
2. If consistently hovering near the threshold, request Support to adjust the global `sensitivityMultiplier` for the exam environment if widespread, or note it as an isolated hardware quirk.
