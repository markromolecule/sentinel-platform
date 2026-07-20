import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { getLiveKitConfig } from '../../../infrastructure/livekit/livekit.config';
import { LiveKitManagedService } from '../../../infrastructure/livekit/services/livekit-managed.service';
import {
    acquireLiveInspectionLease,
    countActiveLiveInspectionLeases,
    countActiveLiveInspectionLeasesByInstitution,
    getActiveLiveInspectionLeaseForAttempt,
    terminalizeLiveInspectionLease,
} from '../live-inspection.repository';
import { assertLiveInspectionViewerAccess } from '../live-inspection-access.service';
import {
    assertLiveInspectionEnabled,
    createLiveInspectionRoomName,
    getLiveInspectionAttemptForStaff,
    mapLiveInspectionLeaseStatus,
    toLiveInspectionProviderFailureCode,
    type LiveInspectionServiceDeps,
} from './live-inspection-service-helpers';

export type StartLiveInspectionArgs = {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
    viewerUserId: string;
    role: string;
    activeInstitutionId: string;
    activePermissionKeys?: string[] | Set<string>;
};

/**
 * Starts one durable inspection lease and creates its managed LiveKit room.
 */
export async function startLiveInspection(
    args: StartLiveInspectionArgs,
    deps: LiveInspectionServiceDeps = {},
) {
    const config = assertLiveInspectionEnabled(deps, args.activeInstitutionId);

    const access = await assertLiveInspectionViewerAccess({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        viewerUserId: args.viewerUserId,
        role: args.role,
        activeInstitutionId: args.activeInstitutionId,
        activePermissionKeys: args.activePermissionKeys,
    });

    const attempt = await getLiveInspectionAttemptForStaff(args.dbClient, {
        examId: args.examId,
        attemptId: args.attemptId,
    });

    if (!attempt?.studentUserId || !attempt.institutionId || access.examId !== args.examId) {
        throw new HTTPException(404, { message: 'Live inspection is not available.' });
    }

    if (
        (await countActiveLiveInspectionLeases(args.dbClient)) >= config.globalActiveInspectionLimit
    ) {
        throw new HTTPException(429, { message: 'Live inspection global capacity reached.' });
    }

    if (
        (await countActiveLiveInspectionLeasesByInstitution(
            args.dbClient,
            attempt.institutionId,
        )) >= config.institutionActiveInspectionLimit
    ) {
        throw new HTTPException(429, { message: 'Live inspection institution capacity reached.' });
    }

    const existingLease = await getActiveLiveInspectionLeaseForAttempt(args.dbClient, {
        examId: args.examId,
        attemptId: args.attemptId,
    });

    if (existingLease) {
        throw new HTTPException(409, { message: 'Live inspection is already active.' });
    }

    const providerRoomName = createLiveInspectionRoomName();
    const expiresAt = new Date(Date.now() + config.maxInspectionDurationSeconds * 1000);
    const acquired = await acquireLiveInspectionLease(args.dbClient, {
        examId: args.examId,
        attemptId: args.attemptId,
        studentUserId: attempt.studentUserId,
        viewerUserId: args.viewerUserId,
        institutionId: attempt.institutionId,
        providerRoomName,
        expiresAt,
    });

    if (!acquired.ok) {
        throw new HTTPException(409, {
            message:
                acquired.code === 'VIEWER_ALREADY_ACTIVE'
                    ? 'Viewer already has an active live inspection.'
                    : 'Live inspection is already active.',
        });
    }

    const liveKit =
        deps.liveKit ?? new LiveKitManagedService({ config: deps.config ?? getLiveKitConfig() });

    try {
        await liveKit.createInspectionRoom({
            roomName: providerRoomName,
            leaseId: acquired.leaseId,
        });
    } catch (error) {
        await terminalizeLiveInspectionLease(args.dbClient, {
            leaseId: acquired.leaseId,
            state: 'FAILED',
            endReason: 'PROVIDER_ERROR',
            lastErrorCode: toLiveInspectionProviderFailureCode(error),
        });
        throw error;
    }

    const lease = await getActiveLiveInspectionLeaseForAttempt(args.dbClient, {
        examId: args.examId,
        attemptId: args.attemptId,
    });

    return mapLiveInspectionLeaseStatus(lease!);
}
