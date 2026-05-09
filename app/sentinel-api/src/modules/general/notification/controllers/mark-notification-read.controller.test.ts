import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { NotificationService } from '../notification.service';
import {
    markNotificationReadRoute,
    markNotificationReadRouteHandler,
} from './mark-notification-read.controller';

vi.mock('../notification.service', () => ({
    NotificationService: {
        markNotificationRead: vi.fn(),
    },
}));

describe('markNotificationReadRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'recipient-1' } as any);
        c.set('activePermissionKeys', ['notifications:view']);
        await next();
    });

    app.openapi(markNotificationReadRoute, markNotificationReadRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('marks a notification as read for the current user', async () => {
        vi.mocked(NotificationService.markNotificationRead).mockResolvedValue({
            id: '11111111-1111-1111-1111-111111111111',
            title: 'New exam assignment',
            message: 'Jordan assigned you to "Midterm".',
            status: 'READ',
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
            readAt: '2026-05-09T12:05:00.000Z',
        });

        const res = await app.request('/11111111-1111-4111-8111-111111111111/read', {
            method: 'POST',
        });
        const payload = await res.json();

        expect(res.status).toBe(200);
        expect(NotificationService.markNotificationRead).toHaveBeenCalledWith({
            dbClient: {},
            notificationId: '11111111-1111-4111-8111-111111111111',
            recipientUserId: 'recipient-1',
        });
        expect(payload).toMatchObject({
            message: 'Notification marked as read successfully',
            data: {
                id: '11111111-1111-1111-1111-111111111111',
                status: 'READ',
                actionType: 'EXAM_ASSIGNMENT_CREATED',
            },
        });
    });

    it('returns 403 when the caller lacks notification permissions', async () => {
        const forbiddenApp = new OpenAPIHono();

        forbiddenApp.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'recipient-1' } as any);
            c.set('activePermissionKeys', []);
            await next();
        });

        forbiddenApp.openapi(markNotificationReadRoute, markNotificationReadRouteHandler);

        const res = await forbiddenApp.request('/11111111-1111-4111-8111-111111111111/read', {
            method: 'POST',
        });

        expect(res.status).toBe(403);
    });
});
