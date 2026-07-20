import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { liveInspectionFailureAckSchema } from '@sentinel/shared/schema';
import { getLiveInspectionLeaseForStudent } from '../live-inspection.repository';
import { assertLiveInspectionStudentAccess } from '../live-inspection-access.service';
import { terminalizeLiveInspectionLeaseState } from '../live-inspection-state.service';

export type AcknowledgePublisherFailureArgs = {
    dbClient: DbClient;
    sessionId: string;
    studentUserId: string;
    leaseId: string;
    revision: number;
    errorCode: string;
};

/**
 * Accepts a current-version publisher failure acknowledgement from the student owner.
 */
export async function acknowledgePublisherFailure(args: AcknowledgePublisherFailureArgs) {
    const attempt = await assertLiveInspectionStudentAccess({
        dbClient: args.dbClient,
        sessionId: args.sessionId,
        studentUserId: args.studentUserId,
    });
    const lease = await getLiveInspectionLeaseForStudent(args.dbClient, {
        leaseId: args.leaseId,
        studentUserId: args.studentUserId,
    });

    if (!lease || lease.attempt_id !== attempt.attempt_id) {
        throw new HTTPException(404, { message: 'Live inspection is not available.' });
    }

    if (lease.version !== args.revision) {
        throw new HTTPException(409, { message: 'Live inspection lease changed.' });
    }

    const failed =
        (await terminalizeLiveInspectionLeaseState({
            dbClient: args.dbClient,
            leaseId: lease.lease_id,
            state: 'FAILED',
            endReason: 'PROVIDER_ERROR',
            lastErrorCode: args.errorCode,
        })) ?? lease;

    return liveInspectionFailureAckSchema.parse({
        leaseId: failed.lease_id,
        revision: failed.version,
        state: 'FAILED',
        errorCode: args.errorCode,
    });
}
