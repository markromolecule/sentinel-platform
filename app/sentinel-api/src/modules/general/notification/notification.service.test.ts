import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { NotificationService } from './notification.service';
import { createNotificationData } from './data/create-notification';
import { deleteNotificationsData } from './data/delete-notifications';
import { getNotificationsData } from './data/get-notifications';
import { markNotificationReadData } from './data/mark-notification-read';
import { getNotificationTableSupport } from './helper/notification-schema-compat';

vi.mock('./data/create-notification', () => ({
    createNotificationData: vi.fn(),
}));

vi.mock('./data/get-notifications', () => ({
    getNotificationsData: vi.fn(),
}));

vi.mock('./data/delete-notifications', () => ({
    deleteNotificationsData: vi.fn(),
}));

vi.mock('./data/mark-notification-read', () => ({
    markNotificationReadData: vi.fn(),
}));

vi.mock('./helper/notification-schema-compat', () => ({
    getNotificationTableSupport: vi.fn(),
}));

describe('NotificationService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getNotificationTableSupport).mockResolvedValue({
            hasNotificationsTable: true,
        });
    });

    it('lists notifications with unread counts', async () => {
        vi.mocked(getNotificationsData).mockResolvedValue({
            items: [
                {
                    id: '11111111-1111-1111-1111-111111111111',
                    title: 'New exam assignment',
                    message: 'Jordan assigned you to "Midterm".',
                    status: 'UNREAD',
                    actionType: 'EXAM_ASSIGNMENT_CREATED',
                    institutionId: '22222222-2222-2222-2222-222222222222',
                    actorId: '33333333-3333-3333-3333-333333333333',
                    actorName: 'Jordan Instructor',
                    resourceType: 'EXAM_ASSIGNMENT',
                    resourceId: '44444444-4444-4444-4444-444444444444',
                    resourceLabel: 'Midterm',
                    metadata: { examId: '44444444-4444-4444-4444-444444444444' },
                    createdAt: new Date('2026-05-09T12:00:00.000Z'),
                    readAt: null,
                },
            ],
            unreadCount: 1,
        });

        const result = await NotificationService.listNotifications({
            dbClient,
            recipientUserId: 'recipient-1',
            institutionId: 'institution-1',
            limit: 10,
        });

        expect(getNotificationsData).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            institutionId: 'institution-1',
            limit: 10,
        });
        expect(result.unreadCount).toBe(1);
        expect(result.items[0]).toMatchObject({
            title: 'New exam assignment',
            actor: {
                id: '33333333-3333-3333-3333-333333333333',
                name: 'Jordan Instructor',
            },
            resource: {
                type: 'EXAM_ASSIGNMENT',
                label: 'Midterm',
            },
        });
    });

    it('keeps mixed-role recipients scoped to the active institution context', async () => {
        vi.mocked(getNotificationsData).mockImplementation(async (args) => {
            if (args.institutionId === 'institution-a') {
                return {
                    items: [
                        {
                            id: 'notif-a',
                            title: 'Institution A update',
                            message: 'A-only notification',
                            status: 'UNREAD',
                            actionType: 'SECTION_CREATED',
                            institutionId: 'institution-a',
                            actorId: 'actor-a',
                            actorName: 'Admin A',
                            resourceType: 'SECTION',
                            resourceId: 'section-a',
                            resourceLabel: 'BSCS 1A',
                            metadata: null,
                            createdAt: new Date('2026-05-10T09:00:00.000Z'),
                            readAt: null,
                        },
                    ],
                    unreadCount: 1,
                };
            }

            return {
                items: [
                    {
                        id: 'notif-b',
                        title: 'Institution B update',
                        message: 'B-only notification',
                        status: 'UNREAD',
                        actionType: 'SECTION_CREATED',
                        institutionId: 'institution-b',
                        actorId: 'actor-b',
                        actorName: 'Admin B',
                        resourceType: 'SECTION',
                        resourceId: 'section-b',
                        resourceLabel: 'BSIT 2B',
                        metadata: null,
                        createdAt: new Date('2026-05-10T10:00:00.000Z'),
                        readAt: null,
                    },
                ],
                unreadCount: 1,
            };
        });

        const institutionAResult = await NotificationService.listNotifications({
            dbClient,
            recipientUserId: 'multi-role-user',
            institutionId: 'institution-a',
        });

        const institutionBResult = await NotificationService.listNotifications({
            dbClient,
            recipientUserId: 'multi-role-user',
            institutionId: 'institution-b',
        });

        expect(institutionAResult.items).toHaveLength(1);
        expect(institutionAResult.items[0]).toMatchObject({
            id: 'notif-a',
            institutionId: 'institution-a',
            title: 'Institution A update',
        });
        expect(institutionBResult.items).toHaveLength(1);
        expect(institutionBResult.items[0]).toMatchObject({
            id: 'notif-b',
            institutionId: 'institution-b',
            title: 'Institution B update',
        });
        expect(getNotificationsData).toHaveBeenNthCalledWith(1, {
            dbClient,
            recipientUserId: 'multi-role-user',
            institutionId: 'institution-a',
        });
        expect(getNotificationsData).toHaveBeenNthCalledWith(2, {
            dbClient,
            recipientUserId: 'multi-role-user',
            institutionId: 'institution-b',
        });
    });

    it('marks a notification as read for the recipient', async () => {
        vi.mocked(markNotificationReadData).mockResolvedValue({
            notification_id: '11111111-1111-1111-1111-111111111111',
            title: 'New exam assignment',
            message: 'Jordan assigned you to "Midterm".',
            status: 'READ',
            action_type: 'EXAM_ASSIGNMENT_CREATED',
            institution_id: '22222222-2222-2222-2222-222222222222',
            actor_user_id: '33333333-3333-3333-3333-333333333333',
            resource_type: 'EXAM_ASSIGNMENT',
            resource_id: '44444444-4444-4444-4444-444444444444',
            resource_label: 'Midterm',
            metadata: { examId: '44444444-4444-4444-4444-444444444444' },
            created_at: new Date('2026-05-09T12:00:00.000Z'),
            updated_at: new Date('2026-05-09T12:05:00.000Z'),
            read_at: new Date('2026-05-09T12:05:00.000Z'),
        } as any);

        const result = await NotificationService.markNotificationRead({
            dbClient,
            notificationId: '11111111-1111-1111-1111-111111111111',
            recipientUserId: 'recipient-1',
        });

        expect(markNotificationReadData).toHaveBeenCalledWith({
            dbClient,
            notificationId: '11111111-1111-1111-1111-111111111111',
            recipientUserId: 'recipient-1',
        });
        expect(result.status).toBe('READ');
        expect(result.readAt).toBe('2026-05-09T12:05:00.000Z');
    });

    it('raises not found when a notification cannot be marked as read', async () => {
        vi.mocked(markNotificationReadData).mockResolvedValue(undefined);

        await expect(
            NotificationService.markNotificationRead({
                dbClient,
                notificationId: '11111111-1111-1111-1111-111111111111',
                recipientUserId: 'recipient-1',
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });

    it('returns an empty notification state when the table is unavailable', async () => {
        vi.mocked(getNotificationTableSupport).mockResolvedValue({
            hasNotificationsTable: false,
        });

        const result = await NotificationService.listNotifications({
            dbClient,
            recipientUserId: 'recipient-1',
        });

        expect(result).toEqual({
            items: [],
            unreadCount: 0,
        });
        expect(getNotificationsData).not.toHaveBeenCalled();
    });

    it('returns not found when marking read without a notifications table', async () => {
        vi.mocked(getNotificationTableSupport).mockResolvedValue({
            hasNotificationsTable: false,
        });

        await expect(
            NotificationService.markNotificationRead({
                dbClient,
                notificationId: '11111111-1111-1111-1111-111111111111',
                recipientUserId: 'recipient-1',
            }),
        ).rejects.toBeInstanceOf(HTTPException);
        expect(markNotificationReadData).not.toHaveBeenCalled();
    });

    it('deletes only notifications owned by the current recipient', async () => {
        vi.mocked(deleteNotificationsData).mockResolvedValue({
            deleted_count: 2,
        });

        const result = await NotificationService.deleteNotifications({
            dbClient,
            recipientUserId: 'recipient-1',
            notificationIds: [
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
            ],
        });

        expect(deleteNotificationsData).toHaveBeenCalledWith({
            dbClient,
            recipientUserId: 'recipient-1',
            notificationIds: [
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
            ],
        });
        expect(result).toBe(2);
    });

    it('returns zero when the notifications table is unavailable for delete', async () => {
        vi.mocked(getNotificationTableSupport).mockResolvedValue({
            hasNotificationsTable: false,
        });

        const result = await NotificationService.deleteNotifications({
            dbClient,
            recipientUserId: 'recipient-1',
            notificationIds: ['11111111-1111-1111-1111-111111111111'],
        });

        expect(result).toBe(0);
        expect(deleteNotificationsData).not.toHaveBeenCalled();
    });
});
