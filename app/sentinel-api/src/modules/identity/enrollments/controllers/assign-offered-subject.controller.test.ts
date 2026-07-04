import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    assignOfferedSubjectRoute,
    assignOfferedSubjectRouteHandler,
} from './assign-offered-subject.controller';
import { EnrollmentService } from '../enrollments.service';

vi.mock('../enrollments.service', () => ({
    EnrollmentService: {
        assignOfferedSubject: vi.fn(),
    },
}));

describe('assignOfferedSubjectRouteHandler', () => {
    const createTestApp = (permissions = ['subjects:update']) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'admin-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissions);
            await next();
        });
        app.openapi(assignOfferedSubjectRoute, assignOfferedSubjectRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and assigns subject for permitted administrators', async () => {
        vi.mocked(EnrollmentService.assignOfferedSubject).mockResolvedValue({
            assignedClassGroupIds: ['class-group-1'],
            enrollmentRequestIds: ['request-1'],
            classRoleIds: ['role-1'],
        });

        const app = createTestApp();
        const res = await app.request('/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instructorId: '11111111-1111-4111-8111-111111111111',
                subjectOfferingId: '22222222-2222-4222-8222-222222222222',
            }),
        });

        expect(res.status).toBe(200);
        expect(EnrollmentService.assignOfferedSubject).toHaveBeenCalledWith(
            expect.any(Object),
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
            'admin-1',
        );
    });

    it('returns 403 when the subjects:update permission is missing', async () => {
        const app = createTestApp([]);
        const res = await app.request('/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instructorId: '11111111-1111-4111-8111-111111111111',
                subjectOfferingId: '22222222-2222-4222-8222-222222222222',
            }),
        });

        expect(res.status).toBe(403);
        expect(EnrollmentService.assignOfferedSubject).not.toHaveBeenCalled();
    });
});
