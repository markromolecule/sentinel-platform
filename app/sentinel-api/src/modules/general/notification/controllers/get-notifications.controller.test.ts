import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { NotificationService } from '../notification.service';
import { getNotificationsRoute, getNotificationsRouteHandler } from './get-notifications.controller';

vi.mock('../notification.service', () => ({
    NotificationService: {
        listNotifications: vi.fn(),
    },
}));

describe('getNotificationsRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'recipient-1' } as any);
        c.set('institutionId', 'institution-1');
        c.set('activePermissionKeys', ['notifications:view']);
        await next();
    });

    app.openapi(getNotificationsRoute, getNotificationsRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the expected notification payload', async () => {
        vi.mocked(NotificationService.listNotifications).mockResolvedValue({
            items: [
                {
                    id: '11111111-1111-1111-1111-111111111111',
                    title: 'New exam assignment',
                    message: 'Jordan assigned you to "Midterm".',
                    status: 'UNREAD',
                    actionType: 'EXAM_ASSIGNMENT_CREATED',
                    institutionId: '22222222-2222-2222-2222-222222222222',
                    actor: {
                        id: '33333333-3333-3333-3333-333333333333',
                        name: 'Jordan Instructor',
                    },
                    resource: {
                        type: 'EXAM_ASSIGNMENT',
                        id: '44444444-4444-4444-4444-444444444444',
                        label: 'Midterm',
                    },
                    metadata: {
                        examId: '44444444-4444-4444-4444-444444444444',
                    },
                    createdAt: '2026-05-09T12:00:00.000Z',
                    readAt: null,
                },
            ],
            unreadCount: 1,
        });

        const res = await app.request('/?limit=5&status=UNREAD');
        const payload = await res.json();

        expect(res.status).toBe(200);
        expect(NotificationService.listNotifications).toHaveBeenCalledWith({
            dbClient: {},
            recipientUserId: 'recipient-1',
            institutionId: 'institution-1',
            status: 'UNREAD',
            limit: 5,
        });
        expect(payload).toMatchObject({
            message: 'Notifications fetched successfully',
            data: {
                unreadCount: 1,
                items: [
                    {
                        id: '11111111-1111-1111-1111-111111111111',
                        actionType: 'EXAM_ASSIGNMENT_CREATED',
                        status: 'UNREAD',
                    },
                ],
            },
        });
    });

    it('returns 403 when the caller lacks notification permissions', async () => {
        const forbiddenApp = new OpenAPIHono();

        forbiddenApp.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'recipient-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', []);
            await next();
        });

        forbiddenApp.openapi(getNotificationsRoute, getNotificationsRouteHandler);

        const res = await forbiddenApp.request('/');

        expect(res.status).toBe(403);
    });
});
