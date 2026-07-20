import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { liveInspectionDirectiveSchema } from '@sentinel/shared/schema';
import { getActiveLiveInspectionLeaseForAttempt } from '../live-inspection.repository';
import { assertLiveInspectionStudentAccess } from '../live-inspection-access.service';
import { isLiveInspectionLeaseExpired } from './live-inspection-service-helpers';

export type GetStudentLiveInspectionDirectiveArgs = {
    dbClient: DbClient;
    sessionId: string;
    studentUserId: string;
};

/**
 * Returns the authenticated student's private wake-up directive for an active lease.
 */
export async function getStudentLiveInspectionDirective(
    args: GetStudentLiveInspectionDirectiveArgs,
) {
    const attempt = await assertLiveInspectionStudentAccess({
        dbClient: args.dbClient,
        sessionId: args.sessionId,
        studentUserId: args.studentUserId,
    });

    if (!attempt.exam_id) {
        throw new HTTPException(404, { message: 'Live inspection is not available.' });
    }

    const lease = await getActiveLiveInspectionLeaseForAttempt(args.dbClient, {
        examId: attempt.exam_id,
        attemptId: attempt.attempt_id,
    });

    if (!lease || isLiveInspectionLeaseExpired(lease)) {
        throw new HTTPException(404, { message: 'Live inspection is not available.' });
    }

    return liveInspectionDirectiveSchema.parse({
        leaseId: lease.lease_id,
        revision: lease.version,
        state: lease.state,
        attemptId: lease.attempt_id,
        topic: `exam-attempt:${lease.attempt_id}:live-inspection`,
    });
}
