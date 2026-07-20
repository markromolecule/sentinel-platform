import type { DbClient } from '@sentinel/db';
import { dbClient as defaultDbClient } from '@sentinel/db';
import { getLiveKitConfig } from '../../../infrastructure/livekit/livekit.config';
import { LiveKitService } from '../../../infrastructure/livekit/livekit.service';
import { LiveKitManagedService } from '../../../infrastructure/livekit/services/livekit-managed.service';
import { findExpiredLiveInspectionLeases } from '../live-inspection.repository';
import { terminalizeLiveInspectionLeaseState } from '../live-inspection-state.service';
import {
    cleanupLiveInspectionProviderRoom,
    toLiveInspectionProviderFailureCode,
    type LiveInspectionServiceDeps,
} from './live-inspection-service-helpers';

const DEFAULT_RECONCILE_INTERVAL_MS = 30_000;
let reconcileTimer: NodeJS.Timeout | null = null;

export type ReconcileExpiredLiveInspectionsArgs = {
    dbClient: DbClient;
    batchSize?: number;
};

/**
 * Expires overdue live-inspection leases and best-effort removes provider rooms.
 */
export async function reconcileExpiredLiveInspections(
    args: ReconcileExpiredLiveInspectionsArgs,
    deps: LiveInspectionServiceDeps = {},
) {
    const expiredLeases = (await findExpiredLiveInspectionLeases(args.dbClient)).slice(
        0,
        args.batchSize ?? 25,
    );
    const liveKit =
        deps.liveKit ?? new LiveKitManagedService({ config: deps.config ?? getLiveKitConfig() });
    let expiredCount = 0;

    for (const lease of expiredLeases) {
        let lastErrorCode: string | null = null;

        try {
            await cleanupLiveInspectionProviderRoom(liveKit, lease as any);
        } catch (error) {
            lastErrorCode = toLiveInspectionProviderFailureCode(error);
        }

        const terminal = await terminalizeLiveInspectionLeaseState({
            dbClient: args.dbClient,
            leaseId: lease.lease_id,
            state: lastErrorCode ? 'FAILED' : 'EXPIRED',
            endReason: lastErrorCode ? 'PROVIDER_ERROR' : 'LEASE_EXPIRED',
            lastErrorCode,
        });

        if (terminal) {
            expiredCount += 1;
            await LiveKitService.logLiveInspectionLifecycleEvent(args.dbClient, {
                metric: lastErrorCode ? 'cleanup_failed' : 'expired',
                leaseId: lease.lease_id,
                attemptId: lease.attempt_id,
                examId: lease.exam_id,
                actorId: null,
                institutionId: lease.institution_id,
                role: 'system',
                state: lastErrorCode ? 'FAILED' : 'EXPIRED',
                previousState: lease.state,
                reason: lastErrorCode ? 'PROVIDER_ERROR' : 'LEASE_EXPIRED',
                durationMs: Date.now() - lease.requested_at.getTime(),
                boundedCode: lastErrorCode,
            });
        }
    }

    return { expiredCount };
}

/**
 * Starts the bounded expiry reconciler when live inspection is enabled.
 */
export function startLiveInspectionReconciler(
    dbClient: DbClient = defaultDbClient,
    deps: LiveInspectionServiceDeps = {},
) {
    const config = deps.config ?? getLiveKitConfig();

    if (!config.enabled || reconcileTimer) {
        return false;
    }

    reconcileTimer = setInterval(() => {
        reconcileExpiredLiveInspections({ dbClient }, deps).catch((error) => {
            console.error('[live-inspection] Reconciler failed:', error);
        });
    }, DEFAULT_RECONCILE_INTERVAL_MS);

    return true;
}

/**
 * Stops the expiry reconciler during API shutdown.
 */
export function stopLiveInspectionReconciler() {
    if (!reconcileTimer) {
        return false;
    }

    clearInterval(reconcileTimer);
    reconcileTimer = null;
    return true;
}
