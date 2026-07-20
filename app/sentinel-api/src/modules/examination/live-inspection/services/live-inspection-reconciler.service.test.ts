import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reconcileExpiredLiveInspections } from './live-inspection-reconciler.service';
import { findExpiredLiveInspectionLeases } from '../live-inspection.repository';
import { terminalizeLiveInspectionLeaseState } from '../live-inspection-state.service';
import { LiveKitService } from '../../../infrastructure/livekit/livekit.service';

vi.mock('../live-inspection.repository', () => ({
    findExpiredLiveInspectionLeases: vi.fn(),
}));

vi.mock('../live-inspection-state.service', () => ({
    terminalizeLiveInspectionLeaseState: vi.fn(),
}));

vi.mock('../../../infrastructure/livekit/livekit.service', () => ({
    LiveKitService: {
        logLiveInspectionLifecycleEvent: vi.fn(),
    },
}));

describe('reconcileExpiredLiveInspections', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cleans provider participants and expires overdue leases without touching attempts', async () => {
        const lease = {
            lease_id: '11111111-1111-4111-8111-111111111111',
            attempt_id: '22222222-2222-4222-8222-222222222222',
            exam_id: '33333333-3333-4333-8333-333333333333',
            institution_id: '44444444-4444-4444-8444-444444444444',
            state: 'LIVE',
            requested_at: new Date('2026-07-20T00:00:00.000Z'),
            provider_room_name: 'room-1',
        };
        const liveKit = {
            removeParticipant: vi.fn().mockResolvedValue(undefined),
            deleteInspectionRoom: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(findExpiredLiveInspectionLeases).mockResolvedValueOnce([lease] as any);
        vi.mocked(terminalizeLiveInspectionLeaseState).mockResolvedValueOnce({
            lease_id: lease.lease_id,
        } as any);

        await expect(
            reconcileExpiredLiveInspections(
                { dbClient: {} as any, batchSize: 5 },
                { liveKit: liveKit as any },
            ),
        ).resolves.toEqual({ expiredCount: 1 });

        expect(liveKit.removeParticipant).toHaveBeenCalledTimes(2);
        expect(liveKit.deleteInspectionRoom).toHaveBeenCalledWith('room-1');
        expect(terminalizeLiveInspectionLeaseState).toHaveBeenCalledWith({
            dbClient: {},
            leaseId: lease.lease_id,
            state: 'EXPIRED',
            endReason: 'LEASE_EXPIRED',
            lastErrorCode: null,
        });
        expect(LiveKitService.logLiveInspectionLifecycleEvent).toHaveBeenCalledWith(
            {},
            expect.objectContaining({
                metric: 'expired',
                leaseId: lease.lease_id,
                state: 'EXPIRED',
                previousState: 'LIVE',
                reason: 'LEASE_EXPIRED',
            }),
        );
    });
});
