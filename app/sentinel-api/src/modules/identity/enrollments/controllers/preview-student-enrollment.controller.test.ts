import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    previewStudentEnrollmentRoute,
    previewStudentEnrollmentRouteHandler,
} from './preview-student-enrollment.controller';
import { EnrollmentService } from '../enrollments.service';

vi.mock('../enrollments.service', () => ({
    EnrollmentService: {
        previewStudentEnrollment: vi.fn(),
    },
}));

describe('previewStudentEnrollmentRouteHandler', () => {
    const createTestApp = (permissions = ['classrooms:preview_student_enrollment']) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'admin-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissions);
            await next();
        });
        app.openapi(previewStudentEnrollmentRoute, previewStudentEnrollmentRouteHandler);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and delegates preview generation for permitted administrators', async () => {
        vi.mocked(EnrollmentService.previewStudentEnrollment).mockResolvedValue([
            {
                studentNumber: '20260001',
                claimStatus: 'CLAIMED',
                reason: null,
            },
        ]);

        const app = createTestApp();
        const res = await app.request('/enroll/students/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentNumbers: ['20260001'],
                classGroupId: '11111111-1111-4111-8111-111111111111',
            }),
        });

        expect(res.status).toBe(200);
        expect(EnrollmentService.previewStudentEnrollment).toHaveBeenCalledWith(
            expect.any(Object),
            'institution-1',
            'admin-1',
            'admin',
            ['20260001'],
            '11111111-1111-4111-8111-111111111111',
        );
    });

    it('returns 403 when the preview permission is missing', async () => {
        const app = createTestApp([]);
        const res = await app.request('/enroll/students/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentNumbers: ['20260001'],
            }),
        });

        expect(res.status).toBe(403);
        expect(EnrollmentService.previewStudentEnrollment).not.toHaveBeenCalled();
    });
});
