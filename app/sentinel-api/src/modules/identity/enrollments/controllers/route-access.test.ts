import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import enrollmentsRoutes from '../enrollments.routes';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
        await next();
    },
}));

vi.mock('./get-enrolled-subjects.controller', () => ({
    getEnrolledSubjectsRoute: { method: 'get', path: '/enrolled' },
    getEnrolledSubjectsRouteHandler: async (c: any) =>
        c.json({
            message: 'Enrolled subjects retrieved successfully',
            data: [{ subject_id: 'subject-1' }],
            pagination: { page: 1, limit: 1, total: 2, hasMore: true },
        }),
}));

vi.mock('./get-enrollment-requests.controller', () => ({
    getEnrollmentRequestsRoute: { method: 'get', path: '/requests' },
    getEnrollmentRequestsRouteHandler: async (c: any) =>
        c.json({
            message: 'Enrollment requests fetched successfully',
            data: [{ request_id: 'request-1' }],
            pagination: { page: 2, limit: 1, total: 3, hasMore: true },
        }),
}));

vi.mock('./enroll-subject.controller', () => ({
    enrollSubjectRoute: { method: 'post', path: '/enroll' },
    enrollSubjectRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./update-enrollment-request.controller', () => ({
    updateEnrollmentRequestRoute: { method: 'patch', path: '/requests' },
    updateEnrollmentRequestRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./approve-enrollment-request.controller', () => ({
    approveEnrollmentRequestRoute: { method: 'post', path: '/requests/approve' },
    approveEnrollmentRequestRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./reject-enrollment-request.controller', () => ({
    rejectEnrollmentRequestRoute: { method: 'post', path: '/requests/reject' },
    rejectEnrollmentRequestRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./unapprove-enrollment-request.controller', () => ({
    unapproveEnrollmentRequestRoute: { method: 'post', path: '/requests/unapprove' },
    unapproveEnrollmentRequestRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./delete-enrollment-requests.controller', () => ({
    deleteEnrollmentRequestsRoute: { method: 'delete', path: '/requests' },
    deleteEnrollmentRequestsRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./unenroll-instructor-subject.controller', () => ({
    unenrollInstructorSubjectRoute: { method: 'delete', path: '/instructor-subjects/:id' },
    unenrollInstructorSubjectRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./enroll-students.controller', () => ({
    enrollStudentsRoute: { method: 'post', path: '/students' },
    enrollStudentsRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./preview-student-enrollment.controller', () => ({
    previewStudentEnrollmentRoute: { method: 'post', path: '/students/preview' },
    previewStudentEnrollmentRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./get-student-classrooms.controller', () => ({
    getStudentClassroomsRoute: { method: 'get', path: '/student-classrooms' },
    getStudentClassroomsRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./unenroll-student.controller', () => ({
    unenrollStudentRoute: { method: 'delete', path: '/students/:id' },
    unenrollStudentRouteHandler: async (c: any) => c.json({}),
}));

vi.mock('./bulk-unenroll-students.controller', () => ({
    bulkDeleteEnrollmentRoute: { method: 'delete', path: '/bulk' },
    bulkDeleteEnrollmentRouteHandler: async (c: any) => c.json({}),
}));

describe('Enrollments Route Access', () => {
    const makeAppWithContext = (role: string, permissionKeys: string[]) => {
        const app = new OpenAPIHono();
        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'user-1', user_profiles: {} } as any);
            c.set('supabaseUser', { user_metadata: { role } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });
        app.route('/enrollments', enrollmentsRoutes);
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns pagination metadata for enrolled subjects when requested', async () => {
        const app = makeAppWithContext('instructor', ['subject_requests:view']);
        const res = await app.request('/enrollments/enrolled?page=1&limit=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            page: 1,
            limit: 1,
            total: 2,
            hasMore: true,
        });
    });

    it('returns pagination metadata for enrollment requests when requested', async () => {
        const app = makeAppWithContext('admin', ['subject_requests:view']);
        const res = await app.request('/enrollments/requests?page=2&limit=1', { method: 'GET' });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            page: 2,
            limit: 1,
            total: 3,
            hasMore: true,
        });
    });
});
