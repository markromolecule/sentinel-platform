import { describe, expect, it } from 'vitest';
import {
    mapYamnetScoresToAnomaly,
    type AudioAnomalyConfig,
    DEFAULT_AUDIO_ANOMALY_THRESHOLDS,
    YAMNET_CLASS_IDS_BY_ANOMALY_TYPE,
    DEFAULT_AUDIO_ANOMALY_CONFIG,
} from './index';

describe('YAMNet Class Mapper', () => {
    const mockConfig: AudioAnomalyConfig = {
        sensitivityMultiplier: 1,
        consecutiveFrameThreshold: 2,
        cooldownMs: 10000,
        thresholds: { ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS },
        enabledAnomalyTypes: ['TALKING', 'TYPING', 'BACKGROUND_NOISE'],
    };

    it('keeps anomaly class ids aligned with the bundled YAMNet class map', () => {
        expect(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE.TALKING).toEqual([0, 1, 2, 3, 4]);
        expect(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE.TYPING).toEqual([378, 379, 380]);
        expect(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE.TAPPING).toEqual([354]);
        expect(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE.MOUTH_BREATHING).toEqual([36]);
        expect(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE.BACKGROUND_NOISE).toEqual([500, 507, 508]);
        expect(YAMNET_CLASS_IDS_BY_ANOMALY_TYPE.SILENCE_DETECTED).toEqual([]);
    });

    it('does not enable keyboard-specific anomalies by default', () => {
        expect(DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes).not.toContain('TYPING');
        expect(DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes).not.toContain('TAPPING');
    });

    it('identifies talking when the corresponding YAMNet class score is high', () => {
        const scores = new Float32Array(521).fill(0);
        scores[0] = 0.8;

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result?.type).toBe('TALKING');
        expect(result?.confidence).toBeCloseTo(0.8);
    });

    it('identifies background noise when scores exceed the threshold', () => {
        const scores = new Float32Array(521).fill(0);
        scores[507] = 0.75;

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result?.type).toBe('BACKGROUND_NOISE');
    });

    it('returns the highest confidence match when multiple anomalies are detected', () => {
        const scores = new Float32Array(521).fill(0);
        scores[0] = 0.7; // Talking
        scores[507] = 0.85; // Background Noise

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result?.type).toBe('BACKGROUND_NOISE');
        expect(result?.confidence).toBeCloseTo(0.85);
    });

    it('respects sensitivity multiplier by lowering effective thresholds', () => {
        const scores = new Float32Array(521).fill(0);
        // Talking threshold is 0.45. With multiplier 2, effective is 0.225.
        scores[0] = 0.4;

        const highSensitivityConfig = { ...mockConfig, sensitivityMultiplier: 2 };
        const result = mapYamnetScoresToAnomaly(scores, highSensitivityConfig);

        expect(result?.type).toBe('TALKING');
    });

    it('ignores anomalies that do not meet the effective threshold', () => {
        const scores = new Float32Array(521).fill(0);
        scores[0] = 0.2;

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result).toBeNull();
    });

    it('ignores disabled anomaly types', () => {
        const scores = new Float32Array(521).fill(0);
        scores[378] = 0.9;

        const disabledKeyboardConfig: AudioAnomalyConfig = {
            ...mockConfig,
            enabledAnomalyTypes: ['TALKING', 'BACKGROUND_NOISE'],
        };

        const result = mapYamnetScoresToAnomaly(scores, disabledKeyboardConfig);
        expect(result).toBeNull();
    });

    it('requires a conservative threshold for keyboard typing when the anomaly is enabled', () => {
        const scores = new Float32Array(521).fill(0);
        scores[380] = 0.79;

        const keyboardConfig: AudioAnomalyConfig = {
            ...mockConfig,
            enabledAnomalyTypes: ['TYPING'],
            thresholds: {
                ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS,
                TYPING: 0.8,
            },
        };

        expect(mapYamnetScoresToAnomaly(scores, keyboardConfig)).toBeNull();
    });
});
