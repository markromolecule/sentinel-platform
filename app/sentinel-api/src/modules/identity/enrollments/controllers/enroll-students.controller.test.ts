import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { enrollStudentsRoute, enrollStudentsRouteHandler } from './enroll-students.controller';
import { EnrollmentService } from '../enrollments.service';

vi.mock('../enrollments.service', () => ({
    EnrollmentService: {
        enrollStudents: vi.fn(),
    },
}));

describe('enrollStudentsRouteHandler', () => {
    const createTestApp = (permissions = ['classrooms:enroll_students']) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'admin-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissions);
            await next();
        });
        app.openapi(enrollStudentsRoute, enrollStudentsRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and delegates enrollment for permitted administrators', async () => {
        vi.mocked(EnrollmentService.enrollStudents).mockResolvedValue({
            enrolledCount: 1,
            failedCount: 0,
            results: [{ studentNumber: '20260001', status: 'SUCCESS' }],
        });

        const app = createTestApp();
        const res = await app.request('/enroll/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentNumbers: ['20260001'],
                classGroupId: '11111111-1111-4111-8111-111111111111',
            }),
        });

        expect(res.status).toBe(200);
        expect(EnrollmentService.enrollStudents).toHaveBeenCalledWith(
            expect.any(Object),
            'institution-1',
            'admin-1',
            'admin',
            {
                studentNumbers: ['20260001'],
                classGroupId: '11111111-1111-4111-8111-111111111111',
            },
        );
    });

    it('returns 403 when the enroll permission is missing', async () => {
        const app = createTestApp([]);
        const res = await app.request('/enroll/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentNumbers: ['20260001'],
                classGroupId: '11111111-1111-4111-8111-111111111111',
            }),
        });

        expect(res.status).toBe(403);
        expect(EnrollmentService.enrollStudents).not.toHaveBeenCalled();
    });
});
