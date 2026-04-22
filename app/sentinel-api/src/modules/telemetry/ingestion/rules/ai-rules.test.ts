import { describe, expect, it } from 'vitest';
import { FaceDetectionRule, GazeTrackingRule, MultipleFacesRule } from './ai-rules';

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
});
