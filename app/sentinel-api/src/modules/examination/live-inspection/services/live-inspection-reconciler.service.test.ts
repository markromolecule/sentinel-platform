import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reconcileExpiredLiveInspections } from './live-inspection-reconciler.service';
import { findExpiredLiveInspectionLeases } from '../live-inspection.repository';
import { terminalizeLiveInspectionLeaseState } from '../live-inspection-state.service';

vi.mock('../live-inspection.repository', () => ({
    findExpiredLiveInspectionLeases: vi.fn(),
}));

vi.mock('../live-inspection-state.service', () => ({
    terminalizeLiveInspectionLeaseState: vi.fn(),
}));

describe('reconcileExpiredLiveInspections', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cleans provider participants and expires overdue leases without touching attempts', async () => {
        const lease = {
            lease_id: '11111111-1111-4111-8111-111111111111',
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
    });
});
