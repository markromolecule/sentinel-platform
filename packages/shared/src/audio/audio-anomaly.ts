export const AUDIO_ANOMALY_TYPES = [
    'TALKING',
    'TYPING',
    'TAPPING',
    'MOUTH_BREATHING',
    'BACKGROUND_NOISE',
] as const;

export type AudioAnomalyType = (typeof AUDIO_ANOMALY_TYPES)[number];

export type AudioAnomalyThresholds = Record<AudioAnomalyType, number>;

export interface AudioAnomalyConfig {
    sensitivityMultiplier: number;
    consecutiveFrameThreshold: number;
    cooldownMs: number;
    thresholds: AudioAnomalyThresholds;
    enabledAnomalyTypes: AudioAnomalyType[];
}

export interface AudioCapabilityReport {
    webWorkerSupported: boolean;
    webAudioSupported: boolean;
    microphonePermission: 'granted' | 'denied' | 'prompt' | 'unavailable';
    wasmSupported: boolean;
}

export const DEFAULT_AUDIO_ANOMALY_THRESHOLDS: AudioAnomalyThresholds = {
    TALKING: 0.65,
    TYPING: 0.55,
    TAPPING: 0.5,
    MOUTH_BREATHING: 0.45,
    BACKGROUND_NOISE: 0.7,
};

export const DEFAULT_AUDIO_ANOMALY_CONFIG: AudioAnomalyConfig = {
    sensitivityMultiplier: 1,
    consecutiveFrameThreshold: 3,
    cooldownMs: 10_000,
    thresholds: { ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS },
    enabledAnomalyTypes: ['TALKING', 'TYPING', 'TAPPING', 'MOUTH_BREATHING'],
};

export const YAMNET_CLASS_IDS_BY_ANOMALY_TYPE: Record<AudioAnomalyType, readonly number[]> = {
    TALKING: [0, 1, 3, 4],
    TYPING: [400, 401],
    TAPPING: [398, 402],
    MOUTH_BREATHING: [287, 288],
    BACKGROUND_NOISE: [494, 495, 496],
};
