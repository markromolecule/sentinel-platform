# Goal

- The audio now returns good but it does not sends a event or anomaly for some cases for example: background noice or something you can check it what are the things that needs to be show as event or anomaly

export const AUDIO_ANOMALY_TYPES = [
'TALKING',
'TYPING',
'TAPPING',
'MOUTH_BREATHING',
'BACKGROUND_NOISE',
] as const;

@packages/shared/src/audio/audio-anomaly.ts

For example in mediapipe

1. When looking away
2. When no face is detected

Now, in audio, what are the event log that should have like this.

- Ensure that in instructor monitoring page, when the student trigger those event. It should appear similar on the other events like when the student trigger the right click attempt
