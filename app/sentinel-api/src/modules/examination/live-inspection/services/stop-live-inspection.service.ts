import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { isLiveInspectionTerminalState } from '@sentinel/shared/schema';
import { LiveKitManagedService } from '../../../infrastructure/livekit/services/livekit-managed.service';
import { getLiveKitConfig } from '../../../infrastructure/livekit/livekit.config';
import { getLiveInspectionLeaseForViewer } from '../live-inspection.repository';
import { assertLiveInspectionViewerAccess } from '../live-inspection-access.service';
import {
    terminalizeLiveInspectionLeaseState,
    transitionLiveInspectionLeaseState,
} from '../live-inspection-state.service';
import {
    assertLiveInspectionEnabled,
    cleanupLiveInspectionProviderRoom,
    mapLiveInspectionLeaseStatus,
    toLiveInspectionProviderFailureCode,
    type LiveInspectionServiceDeps,
} from './live-inspection-service-helpers';

export type StopLiveInspectionArgs = {
    dbClient: DbClient;
    examId: string;
    leaseId: string;
    viewerUserId: string;
    role: string;
    activeInstitutionId: string;
    activePermissionKeys?: string[] | Set<string>;
};

/**
 * Idempotently stops an inspection lease and best-effort cleans the provider room.
 */
export async function stopLiveInspection(
    args: StopLiveInspectionArgs,
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

    if (isLiveInspectionTerminalState(lease.state as any)) {
        return mapLiveInspectionLeaseStatus(lease);
    }

    const stopping =
        lease.state === 'STOPPING'
            ? lease
            : await transitionLiveInspectionLeaseState({
                  dbClient: args.dbClient,
                  leaseId: lease.lease_id,
                  fromState: lease.state as any,
                  toState: 'STOPPING',
                  expectedVersion: lease.version,
              });

    const liveKit =
        deps.liveKit ?? new LiveKitManagedService({ config: deps.config ?? getLiveKitConfig() });
    let lastErrorCode: string | null = null;

    try {
        await cleanupLiveInspectionProviderRoom(liveKit, stopping as any);
    } catch (error) {
        lastErrorCode = toLiveInspectionProviderFailureCode(error);
    }

    const ended =
        (await terminalizeLiveInspectionLeaseState({
            dbClient: args.dbClient,
            leaseId: lease.lease_id,
            state: lastErrorCode ? 'FAILED' : 'ENDED',
            endReason: lastErrorCode ? 'PROVIDER_ERROR' : 'VIEWER_STOPPED',
            lastErrorCode,
        })) ?? stopping;

    return mapLiveInspectionLeaseStatus(ended as any);
}
