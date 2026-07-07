export const AUDIO_ANOMALY_TYPES = [
    'TALKING',
    'TYPING',
    'TAPPING',
    'MOUTH_BREATHING',
    'BACKGROUND_NOISE',
    'SILENCE_DETECTED',
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
    TALKING: 0.45,
    TYPING: 0.8,
    TAPPING: 0.8,
    MOUTH_BREATHING: 0.6,
    BACKGROUND_NOISE: 0.55,
    SILENCE_DETECTED: 0.015,
};

export const DEFAULT_AUDIO_ANOMALY_CONFIG: AudioAnomalyConfig = {
    sensitivityMultiplier: 1,
    consecutiveFrameThreshold: 2,
    cooldownMs: 10_000,
    thresholds: { ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS },
    enabledAnomalyTypes: ['TALKING', 'BACKGROUND_NOISE'],
};

// Keep this mapping aligned with `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`.
export const YAMNET_CLASS_IDS_BY_ANOMALY_TYPE: Record<AudioAnomalyType, readonly number[]> = {
    TALKING: [0, 1, 2, 3, 4],
    TYPING: [378, 379, 380],
    TAPPING: [354],
    MOUTH_BREATHING: [36],
    BACKGROUND_NOISE: [500, 507, 508],
    SILENCE_DETECTED: [],
};
