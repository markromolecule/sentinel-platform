import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import {
    compareAndSetLiveInspectionLeaseState,
    terminalizeLiveInspectionLease,
} from './live-inspection.repository';
import {
    terminalizeLiveInspectionLeaseState,
    transitionLiveInspectionLeaseState,
} from './live-inspection-state.service';

vi.mock('./live-inspection.repository', () => ({
    compareAndSetLiveInspectionLeaseState: vi.fn(),
    terminalizeLiveInspectionLease: vi.fn(),
}));

const dbClient = {} as any;

describe('live inspection state service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('applies allowed transitions through optimistic versioning', async () => {
        vi.mocked(compareAndSetLiveInspectionLeaseState).mockResolvedValueOnce({
            lease_id: 'lease-1',
            state: 'PUBLISHER_CONNECTING',
            version: 2,
        } as any);

        await expect(
            transitionLiveInspectionLeaseState({
                dbClient,
                leaseId: 'lease-1',
                fromState: 'REQUESTED',
                toState: 'PUBLISHER_CONNECTING',
                expectedVersion: 1,
            }),
        ).resolves.toMatchObject({ version: 2 });

        expect(compareAndSetLiveInspectionLeaseState).toHaveBeenCalledWith(
            dbClient,
            'lease-1',
            expect.objectContaining({
                fromState: 'REQUESTED',
                toState: 'PUBLISHER_CONNECTING',
                expectedVersion: 1,
            }),
        );
    });

    it('rejects denied transitions and stale versions', async () => {
        await expect(
            transitionLiveInspectionLeaseState({
                dbClient,
                leaseId: 'lease-1',
                fromState: 'REQUESTED',
                toState: 'LIVE',
                expectedVersion: 1,
            }),
        ).rejects.toBeInstanceOf(HTTPException);

        vi.mocked(compareAndSetLiveInspectionLeaseState).mockResolvedValueOnce(undefined);

        await expect(
            transitionLiveInspectionLeaseState({
                dbClient,
                leaseId: 'lease-1',
                fromState: 'PUBLISHER_READY',
                toState: 'LIVE',
                expectedVersion: 1,
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });

    it('passes duplicate terminalization through the idempotent repository helper', async () => {
        vi.mocked(terminalizeLiveInspectionLease).mockResolvedValueOnce(undefined as any);

        await expect(
            terminalizeLiveInspectionLeaseState({
                dbClient,
                leaseId: 'lease-1',
                state: 'EXPIRED',
                endReason: 'LEASE_EXPIRED',
            }),
        ).resolves.toBeUndefined();
    });
});
