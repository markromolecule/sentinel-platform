import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processLiveKitWebhook } from './live-inspection-webhook.service';
import {
    getLiveInspectionLeaseByRoomName,
    markLiveKitWebhookEventProcessed,
    recordLiveKitWebhookEventOnce,
} from '../live-inspection.repository';
import { transitionLiveInspectionLeaseState } from '../live-inspection-state.service';

vi.mock('../live-inspection.repository', () => ({
    getLiveInspectionLeaseByRoomName: vi.fn(),
    markLiveKitWebhookEventProcessed: vi.fn(),
    recordLiveKitWebhookEventOnce: vi.fn(),
}));

vi.mock('../live-inspection-state.service', () => ({
    terminalizeLiveInspectionLeaseState: vi.fn(),
    transitionLiveInspectionLeaseState: vi.fn(),
}));

describe('processLiveKitWebhook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('treats duplicate provider events as successful no-ops', async () => {
        vi.mocked(getLiveInspectionLeaseByRoomName).mockResolvedValueOnce(undefined as any);
        vi.mocked(recordLiveKitWebhookEventOnce).mockResolvedValueOnce(false);

        await expect(
            processLiveKitWebhook({
                dbClient: {} as any,
                event: {
                    event: 'participant_joined',
                    room: { name: 'room-1' },
                    participant: { identity: 'viewer' },
                    createdAt: 1,
                } as any,
            }),
        ).resolves.toEqual({ processed: false, result: 'DUPLICATE' });
        expect(markLiveKitWebhookEventProcessed).not.toHaveBeenCalled();
    });

    it('maps publisher track publication to publisher-ready transition', async () => {
        vi.mocked(getLiveInspectionLeaseByRoomName).mockResolvedValueOnce({
            lease_id: '11111111-1111-4111-8111-111111111111',
            provider_room_name: 'room-1',
            state: 'PUBLISHER_CONNECTING',
            version: 4,
        } as any);
        vi.mocked(recordLiveKitWebhookEventOnce).mockResolvedValueOnce(true);

        const result = await processLiveKitWebhook({
            dbClient: {} as any,
            event: {
                event: 'track_published',
                room: { name: 'room-1' },
                participant: {
                    identity: 'live-inspection:publisher:11111111-1111-4111-8111-111111111111',
                },
                createdAt: 2,
            } as any,
        });

        expect(result).toEqual({ processed: true, result: 'PUBLISHER_READY' });
        expect(transitionLiveInspectionLeaseState).toHaveBeenCalledWith({
            dbClient: {},
            leaseId: '11111111-1111-4111-8111-111111111111',
            fromState: 'PUBLISHER_CONNECTING',
            toState: 'PUBLISHER_READY',
            expectedVersion: 4,
        });
        expect(markLiveKitWebhookEventProcessed).toHaveBeenCalledWith({} as any, {
            providerEventId:
                'track_published:room-1:live-inspection:publisher:11111111-1111-4111-8111-111111111111:2',
            processingResult: 'PUBLISHER_READY',
        });
    });
});
