import { describe, expect, it } from 'vitest';
import { ingestProctoringEventSchema } from './ingestion.dto';

describe('ingestProctoringEventSchema', () => {
    it('accepts MediaPipe aggregation metadata on telemetry ingestion requests', () => {
        const parsed = ingestProctoringEventSchema.body.parse({
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            timestamp: '2026-04-23T00:00:00.000Z',
            platform: 'WEB',
            source: 'AI',
            ruleKey: 'aiRules.face_detection',
            eventType: 'NO_FACE_DETECTED',
            metadata: {
                durationMs: 1500,
                confidenceScore: 0.42,
                aggregation: {
                    trigger: 'duration-threshold',
                    occurrenceCount: 3,
                    threshold: 1500,
                },
            },
            sessionContext: {
                browser: 'Chrome',
                os: 'macOS',
                deviceType: 'DESKTOP',
                clientCapabilities: ['camera-stream', 'gaze-signal-analysis'],
            },
        });

        expect(parsed.metadata).toMatchObject({
            durationMs: 1500,
            confidenceScore: 0.42,
            aggregation: {
                trigger: 'duration-threshold',
                occurrenceCount: 3,
                threshold: 1500,
            },
        });
    });
});
