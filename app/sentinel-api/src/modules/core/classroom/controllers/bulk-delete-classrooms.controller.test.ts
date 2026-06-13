import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    bulkDeleteClassroomsRoute,
    bulkDeleteClassroomsRouteHandler,
} from './bulk-delete-classrooms.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        bulkDeleteClassrooms: vi.fn(),
    },
}));

describe('bulkDeleteClassroomsRouteHandler', () => {
    const createTestApp = (permissions = ['classrooms:delete']) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'instructor-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('role', 'instructor');
            c.set('activePermissionKeys', permissions);
            await next();
        });
        app.openapi(bulkDeleteClassroomsRoute, bulkDeleteClassroomsRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and calls service on successful deletion', async () => {
        vi.mocked(ClassroomService.bulkDeleteClassrooms).mockResolvedValue(undefined);

        const app = createTestApp();
        const res = await app.request('/bulk-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: [
                    '11111111-1111-4111-8111-111111111111',
                    '22222222-2222-4222-8222-222222222222',
                ],
            }),
        });

        expect(res.status).toBe(200);
        expect(ClassroomService.bulkDeleteClassrooms).toHaveBeenCalledWith(expect.any(Object), {
            classGroupIds: [
                '11111111-1111-4111-8111-111111111111',
                '22222222-2222-4222-8222-222222222222',
            ],
            userId: 'instructor-1',
            institutionId: 'institution-1',
            userRole: 'instructor',
        });
    });

    it('returns 403 when permissions are missing', async () => {
        const app = createTestApp([]);
        const res = await app.request('/bulk-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: ['11111111-1111-4111-8111-111111111111'],
            }),
        });

        expect(res.status).toBe(403);
        expect(ClassroomService.bulkDeleteClassrooms).not.toHaveBeenCalled();
    });

    it('returns 400 when request body payload is invalid', async () => {
        const app = createTestApp();
        const res = await app.request('/bulk-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: ['invalid-uuid'],
            }),
        });

        expect(res.status).toBe(400);
        expect(ClassroomService.bulkDeleteClassrooms).not.toHaveBeenCalled();
    });
});
