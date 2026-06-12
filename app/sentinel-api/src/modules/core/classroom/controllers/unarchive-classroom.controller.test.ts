import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    unarchiveClassroomRoute,
    unarchiveClassroomRouteHandler,
} from './unarchive-classroom.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        unarchiveClassroom: vi.fn(),
    },
}));

describe('unarchiveClassroomRouteHandler', () => {
    const createTestApp = (permissions = ['classrooms:archive']) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'admin-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissions);
            await next();
        });
        app.openapi(unarchiveClassroomRoute, unarchiveClassroomRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and calls service on successful unarchiving', async () => {
        vi.mocked(ClassroomService.unarchiveClassroom).mockResolvedValue(undefined);

        const app = createTestApp();
        const res = await app.request('/11111111-1111-4111-8111-111111111111/unarchive', {
            method: 'PATCH',
        });

        expect(res.status).toBe(200);
        expect(ClassroomService.unarchiveClassroom).toHaveBeenCalledWith(expect.any(Object), {
            classGroupId: '11111111-1111-4111-8111-111111111111',
            userId: 'admin-1',
            institutionId: 'institution-1',
            userRole: 'admin',
        });
    });

    it('returns 403 when permissions are missing', async () => {
        const app = createTestApp([]);
        const res = await app.request('/11111111-1111-4111-8111-111111111111/unarchive', {
            method: 'PATCH',
        });

        expect(res.status).toBe(403);
        expect(ClassroomService.unarchiveClassroom).not.toHaveBeenCalled();
    });
});
