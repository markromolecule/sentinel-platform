import { type DbClient } from '@sentinel/db';
import { LogsService } from '../../general/logs/logs.service';

export class LiveKitService {
    /**
     * Records a managed-LiveKit token grant audit event.
     *
     * This helper must receive only opaque identities and correlation IDs. Token
     * values, API keys, API secrets, and provider webhook secrets must never be
     * passed to this method or persisted in log details.
     */
    static async logLiveKitTokenGranted(
        dbClient: DbClient,
        args: {
            attemptId: string;
            actorId: string;
            institutionId: string;
            roomName: string;
            identity: string;
            role: 'publisher' | 'viewer';
        },
    ) {
        try {
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
                    role: args.role,
                },
            });
        } catch (logErr) {
            console.error('Failed to log LiveKit token grant:', logErr);
        }
    }
}
