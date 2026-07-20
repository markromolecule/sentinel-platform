import { type DbClient } from '@sentinel/db';
import { LogsService } from '../../general/logs/logs.service';

export type LiveInspectionMetricName =
    | 'requested'
    | 'publisher_connecting'
    | 'publisher_ready'
    | 'viewer_connection_requested'
    | 'live'
    | 'ended'
    | 'failed'
    | 'expired'
    | 'cleanup_failed';

export type LiveInspectionLifecycleEvent = {
    metric: LiveInspectionMetricName;
    leaseId: string;
    attemptId: string;
    examId?: string | null;
    actorId?: string | null;
    institutionId: string;
    role?: 'publisher' | 'viewer' | 'system' | null;
    state?: string | null;
    previousState?: string | null;
    reason?: string | null;
    durationMs?: number | null;
    activeGlobalCount?: number | null;
    activeInstitutionCount?: number | null;
    boundedCode?: string | null;
};

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

    /**
     * Records bounded lifecycle observability for live inspection.
     *
     * The payload is intentionally correlation-only: no token, API credential,
     * SDP/ICE data, email, student number, image/video bytes, thumbnails, audio
     * metadata, or face landmarks are accepted by this method.
     */
    static async logLiveInspectionLifecycleEvent(
        dbClient: DbClient,
        event: LiveInspectionLifecycleEvent,
    ) {
        try {
            await LogsService.createLog(dbClient, {
                userId: event.actorId ?? null,
                action: `infrastructure.rtc_inspection_${event.metric}`,
                resourceType: 'livekit',
                resourceId: event.leaseId,
                activeInstitutionId: event.institutionId,
                details: toSafeLifecycleDetails(event),
            });
        } catch (logErr) {
            console.error('Failed to log LiveKit lifecycle event:', logErr);
        }
    }
}

function toSafeLifecycleDetails(event: LiveInspectionLifecycleEvent) {
    return {
        metric: event.metric,
        leaseId: event.leaseId,
        attemptId: event.attemptId,
        examId: event.examId ?? null,
        institutionId: event.institutionId,
        actorId: event.actorId ?? null,
        role: event.role ?? null,
        state: event.state ?? null,
        previousState: event.previousState ?? null,
        reason: event.reason ?? null,
        durationMs: event.durationMs ?? null,
        activeGlobalCount: event.activeGlobalCount ?? null,
        activeInstitutionCount: event.activeInstitutionCount ?? null,
        boundedCode: event.boundedCode ?? null,
    };
}
