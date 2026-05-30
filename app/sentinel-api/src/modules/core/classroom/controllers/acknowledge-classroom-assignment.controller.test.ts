import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    acknowledgeClassroomAssignmentRoute,
    acknowledgeClassroomAssignmentRouteHandler,
} from './acknowledge-classroom-assignment.controller';
import { ClassroomService } from '../classroom.service';

vi.mock('../classroom.service', () => ({
    ClassroomService: {
        acknowledgeClassroomAssignment: vi.fn(),
    },
}));

describe('acknowledgeClassroomAssignmentRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'instructor-1' } as any);
        c.set('institutionId', 'institution-1');
        c.set('activePermissionKeys', ['classrooms:update']);
        await next();
    });

    app.openapi(acknowledgeClassroomAssignmentRoute, acknowledgeClassroomAssignmentRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 and calls service on successful acknowledgment', async () => {
        vi.mocked(ClassroomService.acknowledgeClassroomAssignment).mockResolvedValue(undefined);

        const res = await app.request('/11111111-1111-4111-8111-111111111111/instructors/acknowledge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                justification: 'Ready to teach!',
            }),
        });

        expect(res.status).toBe(200);
        expect(ClassroomService.acknowledgeClassroomAssignment).toHaveBeenCalledWith(expect.any(Object), {
            classGroupId: '11111111-1111-4111-8111-111111111111',
            instructorUserId: 'instructor-1',
            justification: 'Ready to teach!',
        });
    });
});
