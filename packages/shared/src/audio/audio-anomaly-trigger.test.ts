import { describe, expect, it } from 'vitest';
import { evaluateAudioAnomalyTrigger } from './audio-anomaly-trigger';

describe('evaluateAudioAnomalyTrigger', () => {
    it('does not advance when confidence stays below the threshold boundary', () => {
        expect(
            evaluateAudioAnomalyTrigger({
                anomalyType: 'TALKING',
                confidence: 0.44,
                threshold: 0.45,
                consecutiveFrames: 1,
                requiredConsecutiveFrames: 2,
                cooldownMs: 10_000,
                lastTriggeredAtMs: null,
                nowMs: 1_000,
            }),
        ).toEqual({
            triggered: false,
            nextConsecutiveFrames: 0,
            cooldownActive: false,
            acceptedConfidence: null,
        });
    });

    it('tracks consecutive frames until the threshold is met', () => {
        expect(
            evaluateAudioAnomalyTrigger({
                anomalyType: 'TALKING',
                confidence: 0.45,
                threshold: 0.45,
                consecutiveFrames: 1,
                requiredConsecutiveFrames: 2,
                cooldownMs: 10_000,
                lastTriggeredAtMs: null,
                nowMs: 1_000,
            }),
        ).toEqual({
            triggered: true,
            nextConsecutiveFrames: 0,
            cooldownActive: false,
            acceptedConfidence: 0.45,
        });
    });

    it('keeps per-type counters independent by consuming caller-owned state', () => {
        const talking = evaluateAudioAnomalyTrigger({
            anomalyType: 'TALKING',
            confidence: 0.9,
            threshold: 0.45,
            consecutiveFrames: 0,
            requiredConsecutiveFrames: 2,
            cooldownMs: 10_000,
            lastTriggeredAtMs: null,
            nowMs: 1_000,
        });
        const typing = evaluateAudioAnomalyTrigger({
            anomalyType: 'TYPING',
            confidence: 0.88,
            threshold: 0.8,
            consecutiveFrames: 1,
            requiredConsecutiveFrames: 2,
            cooldownMs: 10_000,
            lastTriggeredAtMs: null,
            nowMs: 1_000,
        });

        expect(talking).toEqual({
            triggered: false,
            nextConsecutiveFrames: 1,
            cooldownActive: false,
            acceptedConfidence: 0.9,
        });
        expect(typing).toEqual({
            triggered: true,
            nextConsecutiveFrames: 0,
            cooldownActive: false,
            acceptedConfidence: 0.88,
        });
    });

    it('holds a qualified detection during cooldown until the cooldown expires', () => {
        expect(
            evaluateAudioAnomalyTrigger({
                anomalyType: 'BACKGROUND_NOISE',
                confidence: 0.7,
                threshold: 0.55,
                consecutiveFrames: 1,
                requiredConsecutiveFrames: 2,
                cooldownMs: 60_000,
                lastTriggeredAtMs: 1_000,
                nowMs: 30_000,
            }),
        ).toEqual({
            triggered: false,
            nextConsecutiveFrames: 2,
            cooldownActive: true,
            acceptedConfidence: 0.7,
        });
        expect(
            evaluateAudioAnomalyTrigger({
                anomalyType: 'BACKGROUND_NOISE',
                confidence: 0.7,
                threshold: 0.55,
                consecutiveFrames: 1,
                requiredConsecutiveFrames: 2,
                cooldownMs: 60_000,
                lastTriggeredAtMs: 1_000,
                nowMs: 61_001,
            }),
        ).toEqual({
            triggered: true,
            nextConsecutiveFrames: 0,
            cooldownActive: false,
            acceptedConfidence: 0.7,
        });
    });
});
