import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getQuestionTypeCountsRoute, getQuestionTypeCountsRouteHandler } from './get-question-type-counts.controller';
import { getQuestionTypeCountsService } from '../services/get-question-type-counts.service';

vi.mock('../../../../middleware/auth', () => ({
    authMiddleware: async (_c: any, next: any) => {
        await next();
    },
}));

vi.mock('../../../examination/assessment/assessment-access', () => ({
    assertAssessmentAccess: vi.fn(),
    resolveAssessmentInstitutionId: vi.fn(() => 'resolved-inst-1'),
}));

vi.mock('../services/get-question-type-counts.service', () => ({
    getQuestionTypeCountsService: vi.fn().mockResolvedValue({
        items: [{ type: 'MULTIPLE_CHOICE', count: 10 }],
        total: 10,
    }),
}));

function createApp() {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', { mockDb: true } as any);
        c.set('user', { id: 'viewer-1' } as any);
        c.set('institutionId', 'inst-1');
        c.set('supabaseUser', { user_metadata: { role: 'instructor' } } as any);
        await next();
    });

    app.openapi(getQuestionTypeCountsRoute, getQuestionTypeCountsRouteHandler);

    return app;
}

describe('getQuestionTypeCountsController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('successfully calls getQuestionTypeCountsService and returns 200 response with counts', async () => {
        const app = createApp();
        const res = await app.request('/type-counts?search=geometry');

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.message).toBe('Question type counts fetched successfully');
        expect(body.data.total).toBe(10);
        expect(getQuestionTypeCountsService).toHaveBeenCalledWith({
            dbClient: { mockDb: true },
            filters: { search: 'geometry' },
            institutionId: 'resolved-inst-1',
            userId: 'viewer-1',
        });
    });
});
