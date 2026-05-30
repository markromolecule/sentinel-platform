import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getClassroomsRoute, getClassroomsRouteHandler } from './get-classrooms.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        getClassrooms: vi.fn(),
    },
}));

describe('getClassroomsRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'admin-1' } as any);
        c.set('institutionId', 'institution-1');
        c.set('role', 'admin');
        c.set('activePermissionKeys', ['classrooms:view']);
        await next();
    });

    app.openapi(getClassroomsRoute, getClassroomsRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('forwards search and department scope to the classroom service', async () => {
        vi.mocked(ClassroomService.getClassrooms).mockResolvedValue([] as any);

        const res = await app.request('/?search=physics&departmentId=11111111-1111-4111-8111-111111111111');

        expect(res.status).toBe(200);
        expect(ClassroomService.getClassrooms).toHaveBeenCalledWith(expect.any(Object), {
            userId: 'admin-1',
            institutionId: 'institution-1',
            search: 'physics',
            departmentId: '11111111-1111-4111-8111-111111111111',
            userRole: 'admin',
        });
    });

    it('returns unauthorized when the active institution is missing', async () => {
        const unauthorizedApp = new OpenAPIHono();

        unauthorizedApp.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'admin-1' } as any);
            c.set('activePermissionKeys', ['classrooms:view']);
            await next();
        });

        unauthorizedApp.openapi(getClassroomsRoute, getClassroomsRouteHandler);

        const res = await unauthorizedApp.request('/');

        expect(res.status).toBe(401);
        expect(ClassroomService.getClassrooms).not.toHaveBeenCalled();
    });
});
