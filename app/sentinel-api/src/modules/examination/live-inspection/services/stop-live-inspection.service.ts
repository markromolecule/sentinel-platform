import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { isLiveInspectionTerminalState } from '@sentinel/shared/schema';
import { LiveKitService } from '../../../infrastructure/livekit/livekit.service';
import { LiveKitManagedService } from '../../../infrastructure/livekit/services/livekit-managed.service';
import { getLiveKitConfig } from '../../../infrastructure/livekit/livekit.config';
import {
    getLiveInspectionLeaseForViewer,
    compareAndSetLiveInspectionLeaseState,
} from '../live-inspection.repository';
import { assertLiveInspectionViewerAccess } from '../live-inspection-access.service';
import {
    terminalizeLiveInspectionLeaseState,
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

    const maxRetries = 5;
    let currentLease = lease;
    let isTerminal = false;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (isLiveInspectionTerminalState(currentLease.state as any)) {
            isTerminal = true;
            break;
        }

        if (currentLease.state === 'STOPPING') {
            break;
        }

        // Attempt transition to STOPPING
        const updated = await compareAndSetLiveInspectionLeaseState(args.dbClient, currentLease.lease_id, {
            fromState: currentLease.state as any,
            toState: 'STOPPING',
            expectedVersion: currentLease.version,
        });

        if (updated) {
            currentLease = updated;
            break;
        }

        // Conflict: re-read the lease and retry
        const reRead = await getLiveInspectionLeaseForViewer(args.dbClient, {
            leaseId: args.leaseId,
            viewerUserId: args.viewerUserId,
        });

        if (!reRead || reRead.exam_id !== args.examId) {
            throw new HTTPException(404, { message: 'Live inspection is not available.' });
        }
        currentLease = reRead;
    }

    if (isLiveInspectionTerminalState(currentLease.state as any) || isTerminal) {
        return mapLiveInspectionLeaseStatus(currentLease);
    }

    if (currentLease.state !== 'STOPPING') {
        throw new HTTPException(409, { message: 'Live inspection lease state transition conflict.' });
    }

    const liveKit =
        deps.liveKit ?? new LiveKitManagedService({ config: deps.config ?? getLiveKitConfig() });
    let lastErrorCode: string | null = null;

    try {
        await cleanupLiveInspectionProviderRoom(liveKit, currentLease as any);
    } catch (error) {
        lastErrorCode = toLiveInspectionProviderFailureCode(error);
    }

    const terminalized = await terminalizeLiveInspectionLeaseState({
        dbClient: args.dbClient,
        leaseId: currentLease.lease_id,
        state: lastErrorCode ? 'FAILED' : 'ENDED',
        endReason: lastErrorCode ? 'PROVIDER_ERROR' : 'VIEWER_STOPPED',
        lastErrorCode,
    });

    let endedLease;
    if (terminalized) {
        endedLease = terminalized;
        await LiveKitService.logLiveInspectionLifecycleEvent(args.dbClient, {
            metric: lastErrorCode ? 'failed' : 'ended',
            leaseId: currentLease.lease_id,
            attemptId: currentLease.attempt_id,
            examId: currentLease.exam_id,
            actorId: args.viewerUserId,
            institutionId: currentLease.institution_id,
            role: 'viewer',
            state: lastErrorCode ? 'FAILED' : 'ENDED',
            previousState: lease.state,
            reason: lastErrorCode ? 'PROVIDER_ERROR' : 'VIEWER_STOPPED',
            durationMs: Date.now() - currentLease.requested_at.getTime(),
            boundedCode: lastErrorCode,
        });
    } else {
        const reRead = await getLiveInspectionLeaseForViewer(args.dbClient, {
            leaseId: args.leaseId,
            viewerUserId: args.viewerUserId,
        });
        endedLease = reRead ?? currentLease;
    }

    return mapLiveInspectionLeaseStatus(endedLease as any);
}
