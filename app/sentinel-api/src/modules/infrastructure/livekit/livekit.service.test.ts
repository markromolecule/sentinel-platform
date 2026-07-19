import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { LogsService } from '../../general/logs/logs.service';
import { LiveKitService } from './livekit.service';

vi.mock('../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn(),
    },
}));

describe('LiveKitService', () => {
    let dbClient: DbClient;

    beforeEach(() => {
        vi.clearAllMocks();
        dbClient = {} as DbClient;
    });

    it('logs managed LiveKit token grants without token or secret fields', async () => {
        await LiveKitService.logLiveKitTokenGranted(dbClient, {
            attemptId: 'attempt-1',
            actorId: 'actor-1',
            institutionId: 'institution-1',
            roomName: 'inspection-room-1',
            identity: 'participant-opaque-1',
            role: 'viewer',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(dbClient, {
            userId: 'actor-1',
            action: 'infrastructure.rtc_token_granted',
            resourceType: 'livekit',
            resourceId: 'attempt-1',
            activeInstitutionId: 'institution-1',
            details: {
                attemptId: 'attempt-1',
                roomName: 'inspection-room-1',
                identity: 'participant-opaque-1',
                role: 'viewer',
            },
        });

        const details = vi.mocked(LogsService.createLog).mock.calls[0]?.[1].details;

        expect(JSON.stringify(details).toLowerCase()).not.toContain('token');
        expect(JSON.stringify(details).toLowerCase()).not.toContain('secret');
        expect(JSON.stringify(details).toLowerCase()).not.toContain('api_key');
    });

    it('keeps logging failures non-blocking', async () => {
        vi.mocked(LogsService.createLog).mockRejectedValueOnce(new Error('database unavailable'));
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(
            LiveKitService.logLiveKitTokenGranted(dbClient, {
                attemptId: 'attempt-1',
                actorId: 'actor-1',
                institutionId: 'institution-1',
                roomName: 'inspection-room-1',
                identity: 'participant-opaque-1',
                role: 'publisher',
            }),
        ).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to log LiveKit token grant:',
            expect.any(Error),
        );
    });
});
