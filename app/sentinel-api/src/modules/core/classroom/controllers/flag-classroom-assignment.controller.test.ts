import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    flagClassroomAssignmentRoute,
    flagClassroomAssignmentRouteHandler,
} from './flag-classroom-assignment.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        flagClassroomAssignment: vi.fn(),
    },
}));

describe('flagClassroomAssignmentRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'instructor-1' } as any);
        c.set('institutionId', 'institution-1');
        c.set('activePermissionKeys', ['classrooms:update']);
        await next();
    });

    app.openapi(flagClassroomAssignmentRoute, flagClassroomAssignmentRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and calls service on successful flagging', async () => {
        vi.mocked(ClassroomService.flagClassroomAssignment).mockResolvedValue(undefined);

        const res = await app.request('/11111111-1111-4111-8111-111111111111/instructors/flag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                flagReason: 'Workload limit exceeded',
                justification: 'I am handling 6 courses already.',
            }),
        });

        expect(res.status).toBe(200);
        expect(ClassroomService.flagClassroomAssignment).toHaveBeenCalledWith(expect.any(Object), {
            classGroupId: '11111111-1111-4111-8111-111111111111',
            instructorUserId: 'instructor-1',
            flagReason: 'Workload limit exceeded',
            justification: 'I am handling 6 courses already.',
        });
    });

    it('returns 400 when flagReason is missing', async () => {
        const res = await app.request('/11111111-1111-4111-8111-111111111111/instructors/flag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                justification: 'Missing reason',
            }),
        });

        expect(res.status).toBe(400);
    });
});
