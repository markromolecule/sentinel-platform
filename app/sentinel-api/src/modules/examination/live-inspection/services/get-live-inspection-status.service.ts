import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import {
    getActiveLiveInspectionLeaseForAttempt,
    getLiveInspectionLeaseById,
} from '../live-inspection.repository';
import { assertLiveInspectionViewerAccess } from '../live-inspection-access.service';
import {
    mapLiveInspectionLeaseStatus,
    type LiveInspectionServiceDeps,
} from './live-inspection-service-helpers';

export type GetLiveInspectionStatusArgs = {
    dbClient: DbClient;
    examId: string;
    attemptId?: string;
    leaseId?: string;
    viewerUserId: string;
    role: string;
    activeInstitutionId: string;
    activePermissionKeys?: string[] | Set<string>;
};

/**
 * Returns redacted staff-visible lease status after relationship authorization.
 */
export async function getLiveInspectionStatus(
    args: GetLiveInspectionStatusArgs,
    _deps: LiveInspectionServiceDeps = {},
) {
    const lease = args.leaseId
        ? await getLiveInspectionLeaseById(args.dbClient, args.leaseId)
        : args.attemptId
          ? await getActiveLiveInspectionLeaseForAttempt(args.dbClient, {
                examId: args.examId,
                attemptId: args.attemptId,
            })
          : undefined;

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

    return mapLiveInspectionLeaseStatus(lease);
}
