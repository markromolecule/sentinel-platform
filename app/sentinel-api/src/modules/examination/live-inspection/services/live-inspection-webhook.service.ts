import type { DbClient } from '@sentinel/db';
import type { WebhookEvent } from 'livekit-server-sdk';
import {
    getLiveInspectionLeaseByRoomName,
    markLiveKitWebhookEventProcessed,
    recordLiveKitWebhookEventOnce,
} from '../live-inspection.repository';
import {
    terminalizeLiveInspectionLeaseState,
    transitionLiveInspectionLeaseState,
} from '../live-inspection-state.service';
import {
    getLiveKitWebhookRoomName,
    buildLiveKitParticipantIdentity,
} from '../../../infrastructure/livekit/services/livekit-managed.service';

export type ProcessLiveKitWebhookArgs = {
    dbClient: DbClient;
    event: WebhookEvent;
};

/**
 * Records and processes one verified LiveKit webhook event.
 */
export async function processLiveKitWebhook(args: ProcessLiveKitWebhookArgs) {
    const roomName = getLiveKitWebhookRoomName(args.event);
    const providerEventId = buildWebhookEventId(args.event);
    const lease = roomName
        ? await getLiveInspectionLeaseByRoomName(args.dbClient, roomName)
        : undefined;
    const inserted = await recordLiveKitWebhookEventOnce(args.dbClient, {
        providerEventId,
        leaseId: lease?.lease_id,
        eventType: args.event.event,
    });

    if (!inserted) {
        return { processed: false, result: 'DUPLICATE' };
    }

    let result = 'IGNORED';

    if (lease) {
        const identity = args.event.participant?.identity ?? '';

        try {
            if (
                args.event.event === 'track_published' &&
                identity === buildLiveKitParticipantIdentity(lease.lease_id, 'publisher') &&
                lease.state === 'PUBLISHER_CONNECTING'
            ) {
                await transitionLiveInspectionLeaseState({
                    dbClient: args.dbClient,
                    leaseId: lease.lease_id,
                    fromState: 'PUBLISHER_CONNECTING',
                    toState: 'PUBLISHER_READY',
                    expectedVersion: lease.version,
                });
                result = 'PUBLISHER_READY';
            } else if (
                args.event.event === 'participant_joined' &&
                identity === buildLiveKitParticipantIdentity(lease.lease_id, 'viewer') &&
                lease.state === 'PUBLISHER_READY'
            ) {
                await transitionLiveInspectionLeaseState({
                    dbClient: args.dbClient,
                    leaseId: lease.lease_id,
                    fromState: 'PUBLISHER_READY',
                    toState: 'LIVE',
                    expectedVersion: lease.version,
                });
                result = 'VIEWER_LIVE';
            } else if (args.event.event === 'room_finished') {
                await terminalizeLiveInspectionLeaseState({
                    dbClient: args.dbClient,
                    leaseId: lease.lease_id,
                    state: 'ENDED',
                    endReason: 'EXAM_ENDED',
                });
                result = 'ROOM_FINISHED';
            } else if (
                [
                    'participant_left',
                    'participant_connection_aborted',
                    'track_unpublished',
                ].includes(args.event.event)
            ) {
                await terminalizeLiveInspectionLeaseState({
                    dbClient: args.dbClient,
                    leaseId: lease.lease_id,
                    state: 'FAILED',
                    endReason:
                        identity === buildLiveKitParticipantIdentity(lease.lease_id, 'publisher')
                            ? 'STUDENT_DISCONNECTED'
                            : 'VIEWER_DISCONNECTED',
                });
                result = 'PARTICIPANT_DISCONNECTED';
            }
        } catch {
            result = 'OUT_OF_ORDER';
        }
    }

    await markLiveKitWebhookEventProcessed(args.dbClient, {
        providerEventId,
        processingResult: result,
    });

    return { processed: true, result };
}

function buildWebhookEventId(event: WebhookEvent) {
    const roomName = event.room?.name ?? 'unknown-room';
    const identity = event.participant?.identity ?? 'none';
    const createdAt = String((event as { createdAt?: number | bigint }).createdAt ?? Date.now());

    return `${event.event}:${roomName}:${identity}:${createdAt}`.slice(0, 160);
}
