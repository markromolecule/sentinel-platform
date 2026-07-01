import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import {
    createFeedbackRoute,
    createFeedbackRouteHandler,
} from './create-feedback.controller';
import { FeedbackService } from '../feedback.service';

vi.mock('../feedback.service', () => ({
    FeedbackService: {
        createFeedback: vi.fn(),
    },
}));

function createApp(user?: { id: string } | null) {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', user ?? null);
        c.set('activePermissionKeys', [] as any);
        await next();
    });

    app.openapi(createFeedbackRoute, createFeedbackRouteHandler);

    return app;
}

describe('createFeedbackRouteHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows authenticated students to submit feedback even without active permissions', async () => {
        vi.mocked(FeedbackService.createFeedback).mockResolvedValue({
            feedbackId: '11111111-1111-4111-8111-111111111111',
            attemptId: '22222222-2222-4222-8222-222222222222',
            examId: '33333333-3333-4333-8333-333333333333',
            examTitle: 'Midterm Exam',
            studentId: '44444444-4444-4444-8444-444444444444',
            studentUserId: '55555555-5555-4555-8555-555555555555',
            studentNumber: '2026-0001',
            studentName: 'Test Student',
            studentEmail: 'student@sentinel.test',
            institutionId: '66666666-6666-4666-8666-666666666666',
            institutionName: 'Sentinel Academy',
            rating: 5,
            experience: 'Everything felt smooth.',
            createdAt: '2026-07-01T10:00:00.000Z',
            updatedAt: '2026-07-01T10:00:00.000Z',
        });

        const app = createApp({ id: '55555555-5555-4555-8555-555555555555' });
        const response = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attemptId: '22222222-2222-4222-8222-222222222222',
                rating: 5,
                experience: 'Everything felt smooth.',
            }),
        });

        expect(response.status).toBe(201);
        expect(FeedbackService.createFeedback).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                userId: '55555555-5555-4555-8555-555555555555',
                payload: expect.objectContaining({
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    rating: 5,
                }),
            }),
        );
    });

    it('rejects requests without an authenticated user id', async () => {
        const app = createApp(null);
        const response = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attemptId: '22222222-2222-4222-8222-222222222222',
                rating: 4,
            }),
        });

        expect(response.status).toBe(403);
        expect(FeedbackService.createFeedback).not.toHaveBeenCalled();
    });

    it('returns duplicate feedback conflicts from the service layer', async () => {
        vi.mocked(FeedbackService.createFeedback).mockRejectedValue(
            new HTTPException(409, {
                message: 'Feedback for this attempt has already been submitted.',
            }),
        );

        const app = createApp({ id: '55555555-5555-4555-8555-555555555555' });
        const response = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attemptId: '22222222-2222-4222-8222-222222222222',
                rating: 4,
            }),
        });

        expect(response.status).toBe(409);
        expect(await response.json()).toEqual({
            error: 'Feedback for this attempt has already been submitted.',
        });
    });
});
