import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getLiveKitConfig, resetLiveKitConfigForTests } from '../livekit.config';
import { LiveKitManagedService } from './livekit-managed.service';

const runSmoke = process.env.LIVEKIT_SMOKE_TEST_ENABLED === 'true' ? describe : describe.skip;

runSmoke('LiveKit managed provider smoke', () => {
    it('creates a bounded two-participant room, grants only expected roles, and cleans up', async () => {
        resetLiveKitConfigForTests();
        const config = getLiveKitConfig();
        const service = new LiveKitManagedService({ config });
        const leaseId = randomUUID();
        const roomName = `sentinel-smoke-live-inspection-${leaseId}`;

        try {
            const room = await service.createInspectionRoom({ roomName, leaseId });
            expect(room.name).toBe(roomName);
            expect(Number(room.maxParticipants)).toBe(2);

            const publisher = await service.createPublisherToken({ roomName, leaseId });
            const viewer = await service.createViewerToken({ roomName, leaseId });

            expect(publisher.participantIdentity).toBe(`live-inspection:publisher:${leaseId}`);
            expect(viewer.participantIdentity).toBe(`live-inspection:viewer:${leaseId}`);
            expect(publisher.token).toBeTruthy();
            expect(viewer.token).toBeTruthy();
            expect(publisher.liveKitUrl).toBe(config.liveKitUrl);
            expect(viewer.liveKitUrl).toBe(config.liveKitUrl);

            const participants = await service.listInspectionParticipants(roomName);
            expect(participants).toHaveLength(0);
        } finally {
            await service.deleteInspectionRoom(roomName);
            const participantsAfterCleanup = await service.listInspectionParticipants(roomName);
            expect(participantsAfterCleanup).toHaveLength(0);
        }
    }, 30_000);
});
