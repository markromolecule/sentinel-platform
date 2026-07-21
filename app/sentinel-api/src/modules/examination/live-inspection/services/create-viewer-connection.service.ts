import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { liveInspectionConnectionResponseSchema } from '@sentinel/shared/schema';
import { LiveKitManagedService } from '../../../infrastructure/livekit/services/livekit-managed.service';
import { getLiveKitConfig } from '../../../infrastructure/livekit/livekit.config';
import { LiveKitService } from '../../../infrastructure/livekit/livekit.service';
import { getLiveInspectionLeaseForViewer } from '../live-inspection.repository';
import { assertLiveInspectionViewerAccess } from '../live-inspection-access.service';
import {
    assertLiveInspectionEnabled,
    isLiveInspectionLeaseExpired,
    type LiveInspectionServiceDeps,
} from './live-inspection-service-helpers';

export type CreateViewerConnectionArgs = {
    dbClient: DbClient;
    examId: string;
    leaseId: string;
    viewerUserId: string;
    role: string;
    activeInstitutionId: string;
    activePermissionKeys?: string[] | Set<string>;
};

/**
 * Issues a subscribe-only viewer token after the publisher is ready.
 */
export async function createViewerConnection(
    args: CreateViewerConnectionArgs,
    deps: LiveInspectionServiceDeps = {},
) {
    assertLiveInspectionEnabled(deps, args.activeInstitutionId);

    const lease = await getLiveInspectionLeaseForViewer(args.dbClient, {
        leaseId: args.leaseId,
        viewerUserId: args.viewerUserId,
    });

    if (!lease || lease.exam_id !== args.examId) {
        throw new HTTPException(404, { message: 'Live inspection is not available.' });
    }

    await assertLiveInspectionViewerAccess({
        dbClient: args.dbClient,
        attemptId: lease.attempt_id,
        viewerUserId: args.viewerUserId,
        role: args.role,
        activeInstitutionId: args.activeInstitutionId,
        activePermissionKeys: args.activePermissionKeys,
    });

    if (isLiveInspectionLeaseExpired(lease)) {
        throw new HTTPException(409, { message: 'Live inspection lease expired.' });
    }

    if (lease.state !== 'PUBLISHER_READY') {
        throw new HTTPException(409, { message: 'Publisher is not ready.' });
    }

    const liveKit =
        deps.liveKit ?? new LiveKitManagedService({ config: deps.config ?? getLiveKitConfig() });
    const token = await liveKit.createViewerToken({
        roomName: lease.provider_room_name,
        leaseId: lease.lease_id,
    });
    await LiveKitService.logLiveInspectionLifecycleEvent(args.dbClient, {
        metric: 'viewer_connection_requested',
        leaseId: lease.lease_id,
        attemptId: lease.attempt_id,
        examId: lease.exam_id,
        actorId: args.viewerUserId,
        institutionId: lease.institution_id,
        role: 'viewer',
        state: lease.state,
        durationMs: Date.now() - lease.requested_at.getTime(),
    });
    await LiveKitService.logLiveKitTokenGranted(args.dbClient, {
        attemptId: lease.attempt_id,
        actorId: args.viewerUserId,
        institutionId: lease.institution_id,
        roomName: lease.provider_room_name,
        identity: token.participantIdentity,
        role: 'viewer',
    });

    return liveInspectionConnectionResponseSchema.parse({
        leaseId: lease.lease_id,
        revision: lease.version,
        roomName: lease.provider_room_name,
        token: token.token,
        liveKitUrl: token.liveKitUrl,
        participantIdentity: token.participantIdentity,
        expiresAt: token.expiresAt.toISOString(),
    });
}
