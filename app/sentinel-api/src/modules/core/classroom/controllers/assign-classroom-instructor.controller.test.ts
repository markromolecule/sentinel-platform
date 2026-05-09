import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    assignClassroomInstructorRoute,
    assignClassroomInstructorRouteHandler,
} from './assign-classroom-instructor.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        assignClassroomInstructor: vi.fn(),
    },
}));

describe('assignClassroomInstructorRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'head-1' } as any);
        c.set('institutionId', 'institution-1');
        c.set('activePermissionKeys', ['classrooms:update']);
        await next();
    });

    app.openapi(assignClassroomInstructorRoute, assignClassroomInstructorRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 for invalid request bodies', async () => {
        const res = await app.request('/11111111-1111-4111-8111-111111111111/instructors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instructorUserId: 'not-a-uuid',
            }),
        });

        expect(res.status).toBe(400);
    });

    it('returns 403 when the caller lacks the update permission', async () => {
        const forbiddenApp = new OpenAPIHono();

        forbiddenApp.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'head-1' } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', []);
            await next();
        });

        forbiddenApp.openapi(assignClassroomInstructorRoute, assignClassroomInstructorRouteHandler);

        const res = await forbiddenApp.request(
            '/11111111-1111-4111-8111-111111111111/instructors',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instructorUserId: '22222222-2222-4222-8222-222222222222',
                }),
            },
        );

        expect(res.status).toBe(403);
    });

    it('returns the refreshed instructor list for valid requests', async () => {
        vi.mocked(ClassroomService.assignClassroomInstructor).mockResolvedValue([
            {
                user_id: '11111111-1111-4111-8111-111111111111',
                name: 'Head Instructor',
                is_head: true,
                assigned_at: '2026-05-09T08:00:00.000Z',
                assigned_by_user_id: '11111111-1111-4111-8111-111111111111',
                assigned_by_name: 'Head Instructor',
            },
            {
                user_id: '22222222-2222-4222-8222-222222222222',
                name: 'Assigned Instructor',
                is_head: false,
                assigned_at: '2026-05-09T09:00:00.000Z',
                assigned_by_user_id: '11111111-1111-4111-8111-111111111111',
                assigned_by_name: 'Head Instructor',
            },
        ] as any);

        const res = await app.request('/11111111-1111-4111-8111-111111111111/instructors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instructorUserId: '22222222-2222-4222-8222-222222222222',
            }),
        });

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            message: 'Classroom instructor assigned successfully',
            data: [
                {
                    user_id: '11111111-1111-4111-8111-111111111111',
                    name: 'Head Instructor',
                    is_head: true,
                    assigned_at: '2026-05-09T08:00:00.000Z',
                    assigned_by_user_id: '11111111-1111-4111-8111-111111111111',
                    assigned_by_name: 'Head Instructor',
                },
                {
                    user_id: '22222222-2222-4222-8222-222222222222',
                    name: 'Assigned Instructor',
                    is_head: false,
                    assigned_at: '2026-05-09T09:00:00.000Z',
                    assigned_by_user_id: '11111111-1111-4111-8111-111111111111',
                    assigned_by_name: 'Head Instructor',
                },
            ],
        });
    });
});
