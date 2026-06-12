import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    archiveClassroomRoute,
    archiveClassroomRouteHandler,
} from './archive-classroom.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        archiveClassroom: vi.fn(),
    },
}));

describe('archiveClassroomRouteHandler', () => {
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
        app.openapi(archiveClassroomRoute, archiveClassroomRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and calls service on successful archiving', async () => {
        vi.mocked(ClassroomService.archiveClassroom).mockResolvedValue(undefined);

        const app = createTestApp();
        const res = await app.request('/11111111-1111-4111-8111-111111111111/archive', {
            method: 'PATCH',
        });

        expect(res.status).toBe(200);
        expect(ClassroomService.archiveClassroom).toHaveBeenCalledWith(expect.any(Object), {
            classGroupId: '11111111-1111-4111-8111-111111111111',
            userId: 'admin-1',
            institutionId: 'institution-1',
            userRole: 'admin',
        });
    });

    it('returns 403 when permissions are missing', async () => {
        const app = createTestApp([]);
        const res = await app.request('/11111111-1111-4111-8111-111111111111/archive', {
            method: 'PATCH',
        });

        expect(res.status).toBe(403);
        expect(ClassroomService.archiveClassroom).not.toHaveBeenCalled();
    });
});
