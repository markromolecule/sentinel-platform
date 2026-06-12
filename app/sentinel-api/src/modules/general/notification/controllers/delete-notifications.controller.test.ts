import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../notification.service';
import {
    deleteNotificationsRoute,
    deleteNotificationsRouteHandler,
} from './delete-notifications.controller';

vi.mock('../notification.service', () => ({
    NotificationService: {
        deleteNotifications: vi.fn(),
    },
}));

function createContext(overrides?: { permissionKeys?: string[]; notificationIds?: string[] }) {
    const permissionKeys = overrides?.permissionKeys ?? ['notifications:view'];
    const notificationIds = overrides?.notificationIds ?? [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
    ];

    const json = vi.fn((body: unknown, status = 200) => ({
        body,
        status,
    }));

    return {
        get: vi.fn((key: string) => {
            if (key === 'dbClient') {
                return {};
            }

            if (key === 'user') {
                return { id: 'recipient-1' };
            }

            if (key === 'activePermissionKeys') {
                return permissionKeys;
            }

            return undefined;
        }),
        req: {
            valid: vi.fn((input: string) => {
                if (input === 'json') {
                    return { notificationIds };
                }

                return {};
            }),
        },
        json,
    } as any;
}

describe('deleteNotificationsRouteHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('declares the bulk delete route contract', () => {
        expect(deleteNotificationsRoute.method).toBe('delete');
        expect(deleteNotificationsRoute.path).toBe('/bulk');
        expect(deleteNotificationsRoute.responses).toHaveProperty('200');
    });

    it('deletes selected notifications for the current user', async () => {
        vi.mocked(NotificationService.deleteNotifications).mockResolvedValue(2);
        const c = createContext();

        const res = await deleteNotificationsRouteHandler(c);

        expect(NotificationService.deleteNotifications).toHaveBeenCalledWith({
            dbClient: {},
            recipientUserId: 'recipient-1',
            notificationIds: [
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
            ],
        });
        expect(c.req.valid).toHaveBeenCalledWith('json');
        expect(res).toEqual({
            body: {
                message: 'Notifications deleted successfully',
                count: 2,
            },
            status: 200,
        });
    });

    it('returns 403 when the caller lacks notification permissions', async () => {
        const c = createContext({
            permissionKeys: [],
        });

        const res = await deleteNotificationsRouteHandler(c);

        expect(NotificationService.deleteNotifications).not.toHaveBeenCalled();
        expect(res).toEqual({
            body: {
                error: 'Forbidden. You do not have permission to delete notifications.',
            },
            status: 403,
        });
    });
});
