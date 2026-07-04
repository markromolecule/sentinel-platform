import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { completeSessionRoute, completeSessionRouteHandler } from './complete-session.controller';
import { SessionManagerService } from '../flow.service';
import { EntitlementsRepository } from '../../access/data/entitlements.repository';

vi.mock('../flow.service', () => ({
    SessionManagerService: {
        completeSession: vi.fn(),
    },
}));

vi.mock('../../access/data/entitlements.repository', () => ({
    EntitlementsRepository: {
        getStudentProfileByUserId: vi.fn(),
    },
}));

describe('completeSessionRouteHandler', () => {
    function createApp(user?: { id: string } | null) {
        const app = new OpenAPIHono();

        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', user ?? null);
            c.set('supabaseUser', {
                user_metadata: {
                    role: 'instructor',
                },
            } as any);
            await next();
        });

        app.openapi(completeSessionRoute, completeSessionRouteHandler);

        return app;
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows authenticated students to complete even when the claimed role is stale', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'student-1',
            institution_id: 'institution-1',
        } as any);
        vi.mocked(SessionManagerService.completeSession).mockResolvedValue({
            attemptId: 'attempt-1',
            completedAt: '2026-06-24T12:00:00.000Z',
            score: 10,
            totalScore: 10,
            percentage: 100,
            answeredCount: 5,
            autoGradableQuestionCount: 5,
            manualReviewQuestionCount: 0,
            requiresManualReview: false,
        } as any);

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: '11111111-1111-4111-8111-111111111111',
                answers: {},
                elapsedSeconds: 120,
            }),
        });

        expect(response.status).toBe(200);
        expect(SessionManagerService.completeSession).toHaveBeenCalledWith(
            expect.any(Object),
            'user-1',
            expect.objectContaining({
                sessionId: '11111111-1111-4111-8111-111111111111',
            }),
        );
    });

    it('rejects non-student accounts', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue(undefined);

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: '11111111-1111-4111-8111-111111111111',
                answers: {},
                elapsedSeconds: 120,
            }),
        });

        expect(response.status).toBe(403);
        expect(SessionManagerService.completeSession).not.toHaveBeenCalled();
    });

    it.each([
        ['LOCKED', 'This exam attempt is locked and cannot be submitted right now.'],
        ['CLOSED', 'This exam attempt has been closed and can no longer be submitted.'],
        [
            'SUPERSEDED',
            'This exam attempt was replaced by a newer attempt and can no longer be submitted.',
        ],
    ])('returns 409 when a %s attempt cannot be submitted', async (_state, message) => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'student-1',
            institution_id: 'institution-1',
        } as any);
        vi.mocked(SessionManagerService.completeSession).mockRejectedValue(
            new HTTPException(409, { message }),
        );

        const app = createApp({ id: 'user-1' });
        const response = await app.request('/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: '11111111-1111-4111-8111-111111111111',
                answers: {},
                elapsedSeconds: 120,
            }),
        });

        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toMatchObject({
            error: message,
        });
    });
});
