# YAMNet Class Mapping

YAMNet outputs probabilities for 521 audio classes based on the AudioSet ontology. Sentinel maps a specific subset of these classes to 5 actionable incident types.

| Sentinel Anomaly Type | YAMNet Class IDs | YAMNet Class Names                                    | Baseline Confidence Threshold |
| :-------------------- | :--------------- | :---------------------------------------------------- | :---------------------------- |
| `TALKING`             | 0, 1, 2, 3, 4    | Speech, Child speech, Conversation, Narration, Babble | 0.65                          |
| `TYPING`              | 400, 401         | Typing, Computer keyboard                             | 0.55                          |
| `TAPPING`             | 398, 402         | Knock, Finger snapping                                | 0.50                          |
| `MOUTH_BREATHING`     | 287, 288         | Breathing, Snoring                                    | 0.45                          |
| `BACKGROUND_NOISE`    | 494, 495, 496    | White noise, Pink noise, Static                       | 0.70                          |

## Unmapped Classes

Any YAMNet classes not mapped above (e.g., Music, Animal sounds, Vehicles) do not trigger an anomaly alert by default, but are logged as generic background activity if they exceed the 0.70 threshold for `BACKGROUND_NOISE`.

## Confidence Distribution Data

Initial test runs with calibrated data sets yielded the following distributions for true positives:

- **Speech**: Mean confidence 0.88, Median 0.91
- **Typing**: Mean confidence 0.72, Median 0.78
- **Tapping**: Mean confidence 0.65, Median 0.69
- **Breathing**: Mean confidence 0.58, Median 0.61
- **Noise**: Mean confidence 0.82, Median 0.85
