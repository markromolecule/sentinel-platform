export const MEDIAPIPE_SUPPORTED_EVENT_TYPES = [
    'GAZE_OFF_SCREEN',
    'NO_FACE_DETECTED',
    'MULTIPLE_FACES',
] as const;

export const MEDIAPIPE_DEFAULT_THRESHOLDS = {
    confidenceThreshold: 0.8,
    frameIntervalMs: 500,
    gazeDurationMs: 3_000,
    noFaceDurationMs: 5_000,
} as const;

export const MEDIAPIPE_ATTEMPT_PERSISTENCE_DURATION_MS = 1_500;

export const MEDIAPIPE_EYE_CLOSED_RATIO_THRESHOLD = 0.12;
export const MEDIAPIPE_EYE_NARROW_RATIO_THRESHOLD = 0.18;

export const MEDIAPIPE_LANDMARK_INDEX = {
    noseTip: 1,
    browCenter: 168,
    chin: 152,
    eyeAOuter: 33,
    eyeAInner: 133,
    eyeAUpperOuter: 160,
    eyeAUpperCenter: 159,
    eyeAUpperInner: 158,
    eyeALowerOuter: 144,
    eyeALowerCenter: 145,
    eyeALowerInner: 153,
    eyeBInner: 362,
    eyeBOuter: 263,
    eyeBUpperInner: 387,
    eyeBUpperCenter: 386,
    eyeBUpperOuter: 385,
    eyeBLowerInner: 373,
    eyeBLowerCenter: 374,
    eyeBLowerOuter: 380,
} as const;

export const MEDIAPIPE_IRIS_LANDMARK_GROUPS = [
    [468, 469, 470, 471, 472],
    [473, 474, 475, 476, 477],
] as const;

export const MEDIAPIPE_CLIENT_CAPABILITIES = [
    'camera-stream',
    'mediapipe-face-landmarker',
    'face-landmark-overlay',
    'gaze-signal-analysis',
    'telemetry-preview',
] as const;
