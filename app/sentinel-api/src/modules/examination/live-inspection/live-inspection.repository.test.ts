import { describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import {
    acquireLiveInspectionLease,
    recordLiveKitWebhookEventOnce,
} from './live-inspection.repository';

function createInsertDbClient(args: { result?: unknown; error?: Error }): DbClient {
    const builder: Record<string, any> = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        onConflict: vi.fn().mockImplementation((callback) => {
            callback({
                column: () => ({
                    doNothing: vi.fn(),
                }),
            });
            return builder;
        }),
        executeTakeFirst: vi.fn().mockResolvedValue(args.result),
        executeTakeFirstOrThrow: vi.fn().mockImplementation(() => {
            if (args.error) {
                return Promise.reject(args.error);
            }
            return Promise.resolve(args.result);
        }),
    };

    return {
        insertInto: vi.fn().mockReturnValue(builder),
    } as unknown as DbClient;
}

describe('live inspection repository', () => {
    it('acquires a lease through insert-only persistence', async () => {
        const dbClient = createInsertDbClient({ result: { lease_id: 'lease-1' } });

        await expect(
            acquireLiveInspectionLease(dbClient, {
                examId: 'exam-1',
                attemptId: 'attempt-1',
                studentUserId: 'student-1',
                viewerUserId: 'viewer-1',
                institutionId: 'institution-1',
                providerRoomName: 'room-1',
                expiresAt: new Date(),
            }),
        ).resolves.toEqual({ ok: true, leaseId: 'lease-1' });
    });

    it('maps active attempt and viewer partial-index conflicts safely', async () => {
        await expect(
            acquireLiveInspectionLease(
                createInsertDbClient({
                    error: new Error('live_inspection_leases_active_attempt_key'),
                }),
                {
                    examId: 'exam-1',
                    attemptId: 'attempt-1',
                    studentUserId: 'student-1',
                    viewerUserId: 'viewer-1',
                    institutionId: 'institution-1',
                    providerRoomName: 'room-1',
                    expiresAt: new Date(),
                },
            ),
        ).resolves.toEqual({ ok: false, code: 'INSPECTION_ALREADY_ACTIVE' });

        await expect(
            acquireLiveInspectionLease(
                createInsertDbClient({
                    error: new Error('live_inspection_leases_active_viewer_key'),
                }),
                {
                    examId: 'exam-1',
                    attemptId: 'attempt-1',
                    studentUserId: 'student-1',
                    viewerUserId: 'viewer-1',
                    institutionId: 'institution-1',
                    providerRoomName: 'room-1',
                    expiresAt: new Date(),
                },
            ),
        ).resolves.toEqual({ ok: false, code: 'VIEWER_ALREADY_ACTIVE' });
    });

    it('records webhook events once without storing raw bodies', async () => {
        const dbClient = createInsertDbClient({ result: { provider_event_id: 'evt-1' } });

        await expect(
            recordLiveKitWebhookEventOnce(dbClient, {
                providerEventId: 'evt-1',
                leaseId: 'lease-1',
                eventType: 'participant_joined',
            }),
        ).resolves.toBe(true);

        expect(dbClient.insertInto).toHaveBeenCalledWith('livekit_webhook_events');
    });
});
