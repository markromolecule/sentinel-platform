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

    it('accepts eventId, dedupeKey, and clientActionAt on metadata', () => {
        const parsed = ingestProctoringEventSchema.body.parse({
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            timestamp: '2026-04-23T00:00:00.000Z',
            platform: 'WEB',
            source: 'CLIENT',
            ruleKey: 'webSecurity.right_click_disable',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            metadata: {
                eventId: '123e4567-e89b-12d3-a456-426614174888',
                dedupeKey: 'RIGHT_CLICK_ATTEMPT:123e4567-e89b-12d3-a456-426614174888',
                clientActionAt: '2026-04-23T00:00:00.000Z',
            },
        });

        expect(parsed.metadata).toMatchObject({
            eventId: '123e4567-e89b-12d3-a456-426614174888',
            dedupeKey: 'RIGHT_CLICK_ATTEMPT:123e4567-e89b-12d3-a456-426614174888',
            clientActionAt: '2026-04-23T00:00:00.000Z',
        });
    });

    it('rejects malformed eventId (not uuid)', () => {
        const parseResult = ingestProctoringEventSchema.body.safeParse({
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            studentId: '123e4567-e89b-12d3-a456-426614174001',
            timestamp: '2026-04-23T00:00:00.000Z',
            platform: 'WEB',
            source: 'CLIENT',
            ruleKey: 'webSecurity.right_click_disable',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            metadata: {
                eventId: 'not-a-uuid',
            },
        });

        expect(parseResult.success).toBe(false);
    });
});
