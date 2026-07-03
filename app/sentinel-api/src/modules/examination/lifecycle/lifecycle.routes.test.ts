import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { registerLifecycleRoutes } from './lifecycle.routes';
import { lockExamAttempt } from './services/lock-exam-attempt';

vi.mock('./services/lock-exam-attempt', () => ({
    lockExamAttempt: vi.fn(),
}));

describe('registerLifecycleRoutes', () => {
    function createApp(activePermissionKeys: string[] = ['examinations:update']) {
        const app = new OpenAPIHono();

        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'actor-1' } as any);
            c.set('supabaseUser', { user_metadata: { role: 'admin' } } as any);
            c.set('institutionId', 'institution-1');
            c.set('activePermissionKeys', activePermissionKeys);
            await next();
        });

        registerLifecycleRoutes(app);

        return app;
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 403 when the caller lacks examination update permissions', async () => {
        const app = createApp([]);
        const response = await app.request(
            '/11111111-1111-4111-8111-111111111111/attempts/22222222-2222-4222-8222-222222222222/lifecycle/lock',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reasonCode: 'PROCTOR_LOCK',
                }),
            },
        );

        expect(response.status).toBe(403);
    });

    it('returns 404 when the attempt is not found', async () => {
        vi.mocked(lockExamAttempt).mockRejectedValue(
            new HTTPException(404, {
                message: 'Exam attempt not found for this exam.',
            }),
        );

        const app = createApp();
        const response = await app.request(
            '/11111111-1111-4111-8111-111111111111/attempts/22222222-2222-4222-8222-222222222222/lifecycle/lock',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reasonCode: 'PROCTOR_LOCK',
                }),
            },
        );

        expect(response.status).toBe(404);
    });

    it('returns 404 when the attempt belongs to a different exam', async () => {
        vi.mocked(lockExamAttempt).mockRejectedValue(
            new HTTPException(404, {
                message: 'Exam attempt not found for this exam.',
            }),
        );

        const app = createApp();
        const response = await app.request(
            '/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/attempts/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/lifecycle/lock',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reasonCode: 'PROCTOR_LOCK',
                }),
            },
        );

        expect(response.status).toBe(404);
    });

    it('returns the expected response shape on success', async () => {
        vi.mocked(lockExamAttempt).mockResolvedValue({
            attempt: {
                attemptId: '22222222-2222-4222-8222-222222222222',
                examId: '11111111-1111-4111-8111-111111111111',
                studentId: '33333333-3333-4333-8333-333333333333',
                lifecycleState: 'LOCKED',
                lifecycleReason: 'PROCTOR_LOCK',
                lifecycleNote: 'Paused for review.',
                lockedAt: '2026-07-03T16:00:00.000Z',
                lockedBy: 'actor-1',
                reopenedUntil: null,
                closedAt: null,
                closedBy: null,
                closedReason: null,
                supersededByAttemptId: null,
                supersededAt: null,
                supersededBy: null,
                finalizedAt: null,
                finalizedBy: null,
                scoreState: 'DRAFT',
                events: [],
            },
            latestEvent: {
                eventId: 'event-1',
                attemptId: '22222222-2222-4222-8222-222222222222',
                examId: '11111111-1111-4111-8111-111111111111',
                studentId: '33333333-3333-4333-8333-333333333333',
                eventType: 'LOCKED',
                previousState: 'IN_PROGRESS',
                nextState: 'LOCKED',
                actorUserId: 'actor-1',
                reasonCode: 'PROCTOR_LOCK',
                notes: 'Paused for review.',
                relatedIncidentIds: [],
                relatedOverrideId: null,
                metadata: null,
                createdAt: '2026-07-03T16:00:00.000Z',
            },
        });

        const app = createApp();
        const response = await app.request(
            '/11111111-1111-4111-8111-111111111111/attempts/22222222-2222-4222-8222-222222222222/lifecycle/lock',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reasonCode: 'PROCTOR_LOCK',
                    notes: 'Paused for review.',
                }),
            },
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            message: 'Exam attempt locked successfully',
            data: {
                attempt: {
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    examId: '11111111-1111-4111-8111-111111111111',
                    studentId: '33333333-3333-4333-8333-333333333333',
                    lifecycleState: 'LOCKED',
                    lifecycleReason: 'PROCTOR_LOCK',
                    lifecycleNote: 'Paused for review.',
                    lockedAt: '2026-07-03T16:00:00.000Z',
                    lockedBy: 'actor-1',
                    reopenedUntil: null,
                    closedAt: null,
                    closedBy: null,
                    closedReason: null,
                    supersededByAttemptId: null,
                    supersededAt: null,
                    supersededBy: null,
                    finalizedAt: null,
                    finalizedBy: null,
                    scoreState: 'DRAFT',
                    events: [],
                },
                latestEvent: {
                    eventId: 'event-1',
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    examId: '11111111-1111-4111-8111-111111111111',
                    studentId: '33333333-3333-4333-8333-333333333333',
                    eventType: 'LOCKED',
                    previousState: 'IN_PROGRESS',
                    nextState: 'LOCKED',
                    actorUserId: 'actor-1',
                    reasonCode: 'PROCTOR_LOCK',
                    notes: 'Paused for review.',
                    relatedIncidentIds: [],
                    relatedOverrideId: null,
                    metadata: null,
                    createdAt: '2026-07-03T16:00:00.000Z',
                },
            },
        });
    });
});
