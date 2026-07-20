import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { liveInspectionReadyAckSchema } from '@sentinel/shared/schema';
import { getLiveInspectionLeaseForStudent } from '../live-inspection.repository';
import { assertLiveInspectionStudentAccess } from '../live-inspection-access.service';
import { transitionLiveInspectionLeaseState } from '../live-inspection-state.service';

export type AcknowledgePublisherReadyArgs = {
    dbClient: DbClient;
    sessionId: string;
    studentUserId: string;
    leaseId: string;
    revision: number;
};

/**
 * Accepts a current-version publisher-ready acknowledgement from the student owner.
 */
export async function acknowledgePublisherReady(args: AcknowledgePublisherReadyArgs) {
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

    const nextLease = await transitionLiveInspectionLeaseState({
        dbClient: args.dbClient,
        leaseId: lease.lease_id,
        fromState: 'PUBLISHER_CONNECTING',
        toState: 'PUBLISHER_READY',
        expectedVersion: args.revision,
    });

    return liveInspectionReadyAckSchema.parse({
        leaseId: nextLease.lease_id,
        revision: nextLease.version,
        state: nextLease.state,
    });
}
