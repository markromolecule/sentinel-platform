import { type DbClient } from '@sentinel/db';

export class LiveKitService {
    static async logLiveKitTokenGranted(
        dbClient: DbClient,
        args: {
            attemptId: string;
            actorId: string;
            institutionId: string;
            roomName: string;
            identity: string;
        },
    ) {
        try {
            const { LogsService } = await import('../../../general/logs/logs.service');
            await LogsService.createLog(dbClient, {
                userId: args.actorId,
                action: 'infrastructure.rtc_token_granted',
                resourceType: 'livekit',
                resourceId: args.attemptId,
                activeInstitutionId: args.institutionId,
                details: {
                    attemptId: args.attemptId,
                    roomName: args.roomName,
                    identity: args.identity,
                },
            });
        } catch (logErr) {
            console.error('Failed to log LiveKit token grant:', logErr);
        }
    }
}
