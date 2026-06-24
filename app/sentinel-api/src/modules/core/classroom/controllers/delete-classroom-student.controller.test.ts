import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    deleteClassroomStudentRoute,
    deleteClassroomStudentRouteHandler,
} from './delete-classroom-student.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        deleteClassroomStudent: vi.fn(),
    },
}));

describe('deleteClassroomStudentRouteHandler', () => {
    const createTestApp = (permissions = ['classrooms:unenroll_students']) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'admin-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissions);
            await next();
        });
        app.openapi(deleteClassroomStudentRoute, deleteClassroomStudentRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and delegates unenrollment for permitted administrators', async () => {
        vi.mocked(ClassroomService.deleteClassroomStudent).mockResolvedValue(undefined);

        const app = createTestApp();
        const res = await app.request(
            '/11111111-1111-4111-8111-111111111111/students/22222222-2222-4222-8222-222222222222',
            {
                method: 'DELETE',
            },
        );

        expect(res.status).toBe(200);
        expect(ClassroomService.deleteClassroomStudent).toHaveBeenCalledWith(expect.any(Object), {
            classGroupId: '11111111-1111-4111-8111-111111111111',
            studentId: '22222222-2222-4222-8222-222222222222',
            userId: 'admin-1',
            institutionId: 'institution-1',
            userRole: 'admin',
        });
    });

    it('returns 403 when the unenroll permission is missing', async () => {
        const app = createTestApp([]);
        const res = await app.request(
            '/11111111-1111-4111-8111-111111111111/students/22222222-2222-4222-8222-222222222222',
            {
                method: 'DELETE',
            },
        );

        expect(res.status).toBe(403);
        expect(ClassroomService.deleteClassroomStudent).not.toHaveBeenCalled();
    });
});
