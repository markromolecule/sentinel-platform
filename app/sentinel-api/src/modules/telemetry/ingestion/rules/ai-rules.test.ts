import { describe, it, expect, vi } from 'vitest';
import {
    AudioAnomalyRule,
    FaceDetectionRule,
    GazeTrackingRule,
    MultipleFacesRule,
} from './ai-rules';

const BASE_PAYLOAD = {
    examSessionId: '11111111-1111-1111-1111-111111111111',
    studentId: '22222222-2222-2222-2222-222222222222',
    timestamp: new Date('2026-04-23T00:00:00.000Z').toISOString(),
    platform: 'WEB' as const,
    source: 'AI' as const,
    sessionContext: {
        browser: 'Chrome',
        os: 'macOS',
        deviceType: 'DESKTOP' as const,
        clientCapabilities: ['camera-stream'],
    },
};

describe('MediaPipe AI ingestion rules', () => {
    it('persists a gaze event once the responsive attempt threshold is reached', async () => {
        const rule = new GazeTrackingRule();
        const decision = await rule.evaluate({
            ...BASE_PAYLOAD,
            ruleKey: 'aiRules.gaze_tracking',
            eventType: 'GAZE_OFF_SCREEN',
            metadata: {
                durationMs: 1_500,
                confidenceScore: 0.91,
            },
        });

        expect(decision.action).toBe('persist');
        expect(
            decision.action === 'persist' ? decision.payload.metadata?.aggregation : null,
        ).toEqual(
            expect.objectContaining({
                trigger: 'duration-threshold',
                threshold: 1_500,
            }),
        );
    });

    it('persists a no-face event once the responsive attempt threshold is reached', async () => {
        const rule = new FaceDetectionRule();
        const decision = await rule.evaluate({
            ...BASE_PAYLOAD,
            ruleKey: 'aiRules.face_detection',
            eventType: 'NO_FACE_DETECTED',
            metadata: {
                durationMs: 1_500,
                confidenceScore: 0.88,
            },
        });

        expect(decision.action).toBe('persist');
        expect(
            decision.action === 'persist' ? decision.payload.metadata?.aggregation : null,
        ).toEqual(
            expect.objectContaining({
                trigger: 'duration-threshold',
                threshold: 1_500,
            }),
        );
    });

    it('keeps multiple-faces as an immediate persistence rule', async () => {
        const rule = new MultipleFacesRule();
        const decision = await rule.evaluate({
            ...BASE_PAYLOAD,
            ruleKey: 'aiRules.multiple_faces_detection',
            eventType: 'MULTIPLE_FACES',
            metadata: {
                confidenceScore: 0.92,
            },
        });

        expect(decision.action).toBe('persist');
        expect(
            decision.action === 'persist' ? decision.payload.metadata?.aggregation : null,
        ).toEqual(
            expect.objectContaining({
                trigger: 'confidence-threshold',
                threshold: 0.8,
            }),
        );
    });

    describe('Audio Anomaly Rule', () => {
        it('persists a high-confidence audio anomaly immediately', async () => {
            const rule = new AudioAnomalyRule();
            const decision = await rule.evaluate({
                ...BASE_PAYLOAD,
                ruleKey: 'aiRules.audio_anomaly_detection',
                eventType: 'AUDIO_ANOMALY',
                metadata: {
                    anomalyType: 'TALKING',
                    confidenceScore: 0.75,
                },
            });

            expect(decision.action).toBe('persist');
            expect(
                decision.action === 'persist' ? decision.payload.ruleKey : null,
            ).toBe('aiRules.audio_anomaly_detection');
            expect(
                decision.action === 'persist' ? decision.payload.eventType : null,
            ).toBe('AUDIO_ANOMALY');
            expect(
                decision.action === 'persist' ? decision.payload.metadata?.aggregation : null,
            ).toEqual(
                expect.objectContaining({
                    trigger: 'confidence-threshold',
                    threshold: 0.4,
                }),
            );
        });

        it('allows background noise at moderate confidence to persist (due to relaxed threshold)', async () => {
            const rule = new AudioAnomalyRule();
            const decision = await rule.evaluate({
                ...BASE_PAYLOAD,
                ruleKey: 'aiRules.audio_anomaly_detection',
                eventType: 'AUDIO_ANOMALY',
                metadata: {
                    anomalyType: 'BACKGROUND_NOISE',
                    confidenceScore: 0.55,
                },
            });

            expect(decision.action).toBe('persist');
            expect(
                decision.action === 'persist' ? decision.payload.metadata?.anomalyType : null,
            ).toBe('BACKGROUND_NOISE');
            expect(
                decision.action === 'persist' ? decision.payload.metadata?.aggregation : null,
            ).toEqual(
                expect.objectContaining({
                    trigger: 'confidence-threshold',
                    threshold: 0.4,
                }),
            );
        });

        it('ignores audio anomalies below the relaxed confidence threshold', async () => {
            const rule = new AudioAnomalyRule();
            const evaluateRepeatThresholdSpy = vi
                .spyOn(
                    rule as AudioAnomalyRule & {
                        evaluateRepeatThreshold: (
                            payload: typeof BASE_PAYLOAD & {
                                ruleKey: 'aiRules.audio_anomaly_detection';
                                eventType: 'AUDIO_ANOMALY';
                                metadata: {
                                    anomalyType: 'TYPING';
                                    confidenceScore: number;
                                };
                            },
                            options: unknown,
                        ) => Promise<{ action: 'ignore' }>;
                    },
                    'evaluateRepeatThreshold',
                )
                .mockResolvedValue({ action: 'ignore' });

            const decision = await rule.evaluate({
                ...BASE_PAYLOAD,
                ruleKey: 'aiRules.audio_anomaly_detection',
                eventType: 'AUDIO_ANOMALY',
                metadata: {
                    anomalyType: 'TYPING',
                    confidenceScore: 0.35,
                },
            });

            expect(decision.action).toBe('ignore');
            expect(evaluateRepeatThresholdSpy).toHaveBeenCalledOnce();
        });
    });
});
