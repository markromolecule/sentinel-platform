import { describe, expect, it } from 'vitest';
import {
    mapYamnetScoresToAnomaly,
    type AudioAnomalyConfig,
    DEFAULT_AUDIO_ANOMALY_THRESHOLDS,
} from './index';

describe('YAMNet Class Mapper', () => {
    const mockConfig: AudioAnomalyConfig = {
        sensitivityMultiplier: 1,
        consecutiveFrameThreshold: 2,
        cooldownMs: 10000,
        thresholds: { ...DEFAULT_AUDIO_ANOMALY_THRESHOLDS },
        enabledAnomalyTypes: ['TALKING', 'TYPING', 'BACKGROUND_NOISE'],
    };

    it('identifies talking when the corresponding YAMNet class score is high', () => {
        const scores = new Float32Array(521).fill(0);
        // Talking classes: 0, 1, 2, 3, etc. (based on YAMNET_CLASS_IDS_BY_ANOMALY_TYPE)
        scores[0] = 0.8;

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result?.type).toBe('TALKING');
        expect(result?.confidence).toBeCloseTo(0.8);
    });

    it('identifies background noise when scores exceed the threshold', () => {
        const scores = new Float32Array(521).fill(0);
        // Background noise classes: 494, 497, etc.
        scores[494] = 0.75;

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result?.type).toBe('BACKGROUND_NOISE');
    });

    it('returns the highest confidence match when multiple anomalies are detected', () => {
        const scores = new Float32Array(521).fill(0);
        scores[0] = 0.7; // Talking
        scores[494] = 0.85; // Background Noise

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
        scores[450] = 0.9; // TAPPING (disabled in mockConfig)

        const result = mapYamnetScoresToAnomaly(scores, mockConfig);
        expect(result).toBeNull();
    });
});
