import { describe, expect, it } from 'vitest';
import {
    canTransitionLiveInspectionState,
    isLiveInspectionTerminalState,
    liveInspectionConnectionResponseSchema,
    liveInspectionDirectiveSchema,
    liveInspectionFailureAckSchema,
    liveInspectionStaffStatusSchema,
    liveInspectionStateSchema,
    liveInspectionTerminalReasonSchema,
    LIVE_INSPECTION_TRANSITION_MAP,
    type LiveInspectionState,
} from './live-inspection-schema';

const uuid = '11111111-1111-4111-8111-111111111111';

describe('live inspection schemas', () => {
    it('accepts only the bounded state and terminal reason vocabulary', () => {
        expect(liveInspectionStateSchema.parse('REQUESTED')).toBe('REQUESTED');
        expect(liveInspectionStateSchema.safeParse('CREATING_ROOM').success).toBe(false);
        expect(liveInspectionTerminalReasonSchema.parse('LEASE_EXPIRED')).toBe('LEASE_EXPIRED');
        expect(liveInspectionTerminalReasonSchema.safeParse('USER_TYPED_REASON').success).toBe(
            false,
        );
    });

    it('covers every allowed transition and rejects wildcard transitions', () => {
        for (const [from, allowedTargets] of Object.entries(
            LIVE_INSPECTION_TRANSITION_MAP,
        ) as Array<[LiveInspectionState, LiveInspectionState[]]>) {
            for (const to of allowedTargets) {
                expect(canTransitionLiveInspectionState(from, to)).toBe(true);
            }

            for (const to of liveInspectionStateSchema.options) {
                if (!allowedTargets.includes(to)) {
                    expect(canTransitionLiveInspectionState(from, to)).toBe(false);
                }
            }
        }
    });

    it('detects terminal states', () => {
        expect(isLiveInspectionTerminalState('ENDED')).toBe(true);
        expect(isLiveInspectionTerminalState('FAILED')).toBe(true);
        expect(isLiveInspectionTerminalState('EXPIRED')).toBe(true);
        expect(isLiveInspectionTerminalState('LIVE')).toBe(false);
    });

    it('rejects malformed identifiers and failure codes', () => {
        expect(
            liveInspectionDirectiveSchema.safeParse({
                leaseId: 'not-a-uuid',
                revision: 1,
                state: 'REQUESTED',
                attemptId: uuid,
                topic: 'exam-attempt:attempt:live-inspection',
            }).success,
        ).toBe(false);

        expect(
            liveInspectionFailureAckSchema.safeParse({
                leaseId: uuid,
                revision: 1,
                state: 'FAILED',
                errorCode: 'contains spaces',
            }).success,
        ).toBe(false);
    });

    it('keeps serializable status models token-free', () => {
        const status = liveInspectionStaffStatusSchema.parse({
            leaseId: uuid,
            attemptId: uuid,
            studentUserId: uuid,
            viewerUserId: uuid,
            state: 'LIVE',
            revision: 2,
            requestedAt: '2026-07-19T10:00:00.000Z',
            expiresAt: '2026-07-19T10:05:00.000Z',
            startedAt: '2026-07-19T10:01:00.000Z',
            endedAt: null,
            endReason: null,
            lastErrorCode: null,
        });

        expect(JSON.stringify(status).toLowerCase()).not.toContain('token');
        expect(JSON.stringify(status).toLowerCase()).not.toContain('secret');
    });

    it('allows tokens only in immediate connection responses', () => {
        expect(
            liveInspectionConnectionResponseSchema.parse({
                leaseId: uuid,
                revision: 2,
                roomName: 'room-1',
                token: 'jwt',
                liveKitUrl: 'wss://sentinel-test.livekit.cloud',
                participantIdentity: 'viewer-1',
                expiresAt: '2026-07-19T10:05:00.000Z',
            }).token,
        ).toBe('jwt');
    });
});
