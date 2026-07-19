import { HTTPException } from 'hono/http-exception';
import type { LiveInspectionState, LiveInspectionTerminalReason } from '@sentinel/shared/schema';
import {
    canTransitionLiveInspectionState,
    isLiveInspectionTerminalState,
} from '@sentinel/shared/schema';
import {
    compareAndSetLiveInspectionLeaseState,
    terminalizeLiveInspectionLease,
} from './live-inspection.repository';
import type { DbClient } from '@sentinel/db';

export type LiveInspectionStateTransitionArgs = {
    dbClient: DbClient;
    leaseId: string;
    fromState: LiveInspectionState;
    toState: LiveInspectionState;
    expectedVersion: number;
    endReason?: LiveInspectionTerminalReason | null;
    lastErrorCode?: string | null;
};

/**
 * Applies one explicit live-inspection transition using optimistic versioning.
 */
export async function transitionLiveInspectionLeaseState(args: LiveInspectionStateTransitionArgs) {
    if (!canTransitionLiveInspectionState(args.fromState, args.toState)) {
        throw new HTTPException(409, { message: 'Invalid live inspection state transition.' });
    }

    if (isLiveInspectionTerminalState(args.fromState)) {
        throw new HTTPException(409, { message: 'Live inspection is already terminal.' });
    }

    const nextLease = await compareAndSetLiveInspectionLeaseState(args.dbClient, args.leaseId, {
        fromState: args.fromState,
        toState: args.toState,
        expectedVersion: args.expectedVersion,
        endReason: args.endReason,
        lastErrorCode: args.lastErrorCode,
    });

    if (!nextLease) {
        throw new HTTPException(409, { message: 'Live inspection lease changed.' });
    }

    return nextLease;
}

/**
 * Idempotently moves a lease to a terminal state through the repository.
 */
export async function terminalizeLiveInspectionLeaseState(args: {
    dbClient: DbClient;
    leaseId: string;
    state: Extract<LiveInspectionState, 'ENDED' | 'FAILED' | 'EXPIRED'>;
    endReason: LiveInspectionTerminalReason;
    lastErrorCode?: string | null;
}) {
    return terminalizeLiveInspectionLease(args.dbClient, args);
}
