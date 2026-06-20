import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { EnrollmentService } from '../enrollments.service';
import {
    bulkDeleteEnrollmentRoute,
    bulkDeleteEnrollmentRouteHandler,
} from './bulk-unenroll-students.controller';

let mockDbClient: any;
let mockUserRole = 'instructor';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (_c: any, next: any) => {
        await next();
    },
}));

vi.mock('../enrollments.service', () => ({
    EnrollmentService: {
        bulkUnenrollStudents: vi.fn().mockResolvedValue(undefined),
    },
}));

function createQuery(result: unknown) {
    const query: any = {
        innerJoin: vi.fn(() => query),
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        execute: vi.fn(async () => result),
    };
    return query;
}

function createApp() {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', mockDbClient);
        c.set('user', { id: 'instructor-123' } as any);
        c.set('supabaseUser', { user_metadata: { role: mockUserRole } } as any);
        await next();
    });

    app.openapi(bulkDeleteEnrollmentRoute, bulkDeleteEnrollmentRouteHandler);

    return app;
}

describe('Bulk Unenroll Students Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserRole = 'instructor';
    });

    it('allows administrators to unenroll students in bulk bypassing class management checks', async () => {
        mockUserRole = 'admin';
        mockDbClient = {};

        const app = createApp();
        const res = await app.request('/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enrollmentIds: [
                    '11111111-1111-4111-8111-111111111111',
                    '22222222-2222-4222-8222-222222222222',
                ],
            }),
        });

        const payload = await res.json();
        expect(res.status).toBe(200);
        expect(EnrollmentService.bulkUnenrollStudents).toHaveBeenCalledWith(expect.any(Object), [
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
        ]);
        expect(payload).toEqual({
            message: 'Students successfully unenrolled from the class groups',
            data: null,
        });
    });

    it('allows instructors to unenroll students if they manage all target class groups', async () => {
        const enrollmentIds = [
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
        ];

        // 1. Mock DB select for matching enrollments
        const mockEnrollments = [
            { enrollment_id: enrollmentIds[0], class_group_id: 'group-a' },
            { enrollment_id: enrollmentIds[1], class_group_id: 'group-b' },
        ];

        // 2. Mock DB select for authorized class groups
        const mockAuthorizedGroups = [{ class_group_id: 'group-a' }, { class_group_id: 'group-b' }];

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'enrollments') {
                    return createQuery(mockEnrollments);
                }
                if (table === 'class_roles as cr') {
                    return createQuery(mockAuthorizedGroups);
                }
                return createQuery([]);
            }),
        };

        const app = createApp();
        const res = await app.request('/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enrollmentIds }),
        });

        const payload = await res.json();
        expect(res.status).toBe(200);
        expect(EnrollmentService.bulkUnenrollStudents).toHaveBeenCalledWith(
            expect.any(Object),
            enrollmentIds,
        );
        expect(payload.message).toContain('unenrolled');
    });

    it('returns 404 if one or more enrollment IDs are not found in the DB (for instructors)', async () => {
        const enrollmentIds = [
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
        ];

        // DB only returns 1 enrollment
        const mockEnrollments = [{ enrollment_id: enrollmentIds[0], class_group_id: 'group-a' }];

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'enrollments') {
                    return createQuery(mockEnrollments);
                }
                return createQuery([]);
            }),
        };

        const app = createApp();
        const res = await app.request('/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enrollmentIds }),
        });

        expect(res.status).toBe(404);
        expect(EnrollmentService.bulkUnenrollStudents).not.toHaveBeenCalled();
    });

    it('returns 403 if the instructor does not manage at least one of the target class groups', async () => {
        const enrollmentIds = [
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
        ];

        const mockEnrollments = [
            { enrollment_id: enrollmentIds[0], class_group_id: 'group-a' },
            { enrollment_id: enrollmentIds[1], class_group_id: 'group-b' },
        ];

        // Instructor only manages group-a
        const mockAuthorizedGroups = [{ class_group_id: 'group-a' }];

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'enrollments') {
                    return createQuery(mockEnrollments);
                }
                if (table === 'class_roles as cr') {
                    return createQuery(mockAuthorizedGroups);
                }
                return createQuery([]);
            }),
        };

        const app = createApp();
        const res = await app.request('/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enrollmentIds }),
        });

        expect(res.status).toBe(403);
        expect(EnrollmentService.bulkUnenrollStudents).not.toHaveBeenCalled();
    });

    it('returns 403 Forbidden for students', async () => {
        mockUserRole = 'student';
        mockDbClient = {};

        const app = createApp();
        const res = await app.request('/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enrollmentIds: ['11111111-1111-4111-8111-111111111111'],
            }),
        });

        expect(res.status).toBe(403);
        expect(EnrollmentService.bulkUnenrollStudents).not.toHaveBeenCalled();
    });
});
