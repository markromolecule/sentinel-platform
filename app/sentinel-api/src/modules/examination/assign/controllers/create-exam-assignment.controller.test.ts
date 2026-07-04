import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    createExamAssignmentRoute,
    createExamAssignmentRouteHandler,
} from './create-exam-assignment.controller';
import { AssignService } from '../assign.service';

vi.mock('../assign.service', () => ({
    AssignService: {
        createExamAssignment: vi.fn(),
    },
}));

describe('createExamAssignmentRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'assigner-1' } as any);
        c.set('supabaseUser', { user_metadata: { role: 'instructor' } } as any);
        c.set('institutionId', 'institution-1');
        c.set('activePermissionKeys', ['examinations:view', 'examinations:assign']);
        await next();
    });

    app.openapi(createExamAssignmentRoute, createExamAssignmentRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 for invalid request bodies', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examId: 'not-a-uuid',
                assigneeId: 'also-not-a-uuid',
            }),
        });

        expect(res.status).toBe(400);
    });

    it('returns 403 when the caller lacks examination permissions', async () => {
        const forbiddenApp = new OpenAPIHono();

        forbiddenApp.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'assigner-1' } as any);
            c.set('supabaseUser', { user_metadata: { role: 'instructor' } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', []);
            await next();
        });

        forbiddenApp.openapi(createExamAssignmentRoute, createExamAssignmentRouteHandler);

        const res = await forbiddenApp.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examId: '22222222-2222-4222-8222-222222222222',
                assigneeId: '44444444-4444-4444-8444-444444444444',
            }),
        });

        expect(res.status).toBe(403);
    });

    it('returns the expected response shape for valid requests', async () => {
        vi.mocked(AssignService.createExamAssignment).mockResolvedValue({
            id: '11111111-1111-4111-8111-111111111111',
            relationship: 'OUTBOUND',
            exam: {
                id: '22222222-2222-4222-8222-222222222222',
                title: 'Midterm Exam',
                subjectTitle: 'Physics',
                scheduledDate: '2026-05-10T08:00:00.000Z',
                endDateTime: '2026-05-10T10:00:00.000Z',
            },
            assigner: {
                id: '33333333-3333-4333-8333-333333333333',
                name: 'Jordan Instructor',
            },
            assignee: {
                id: '44444444-4444-4444-8444-444444444444',
                name: 'Alex Instructor',
            },
            status: 'PENDING',
            scheduledAt: '2026-05-10T08:00:00.000Z',
            createdAt: '2026-05-09T12:00:00.000Z',
            updatedAt: '2026-05-09T12:00:00.000Z',
        } as any);

        const res = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examId: '22222222-2222-4222-8222-222222222222',
                assigneeId: '44444444-4444-4444-8444-444444444444',
            }),
        });

        expect(res.status).toBe(201);
        await expect(res.json()).resolves.toEqual({
            message: 'Exam assignment created successfully',
            data: {
                id: '11111111-1111-4111-8111-111111111111',
                relationship: 'OUTBOUND',
                exam: {
                    id: '22222222-2222-4222-8222-222222222222',
                    title: 'Midterm Exam',
                    subjectTitle: 'Physics',
                    scheduledDate: '2026-05-10T08:00:00.000Z',
                    endDateTime: '2026-05-10T10:00:00.000Z',
                },
                assigner: {
                    id: '33333333-3333-4333-8333-333333333333',
                    name: 'Jordan Instructor',
                },
                assignee: {
                    id: '44444444-4444-4444-8444-444444444444',
                    name: 'Alex Instructor',
                },
                status: 'PENDING',
                scheduledAt: '2026-05-10T08:00:00.000Z',
                createdAt: '2026-05-09T12:00:00.000Z',
                updatedAt: '2026-05-09T12:00:00.000Z',
            },
        });
    });
});
