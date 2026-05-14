import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    getSubjectClassificationRoute,
    getSubjectClassificationRouteHandler,
} from './get-subject-classification.controller';
import { SubjectClassificationService } from '../subject-classification.service';

vi.mock('../subject-classification.service', () => ({
    SubjectClassificationService: {
        getSubjectClassification: vi.fn(),
    },
}));

describe('getSubjectClassificationRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('institutionId', '11111111-1111-4111-8111-111111111111');
        c.set('supabaseUser', {
            user_metadata: {
                role: 'support',
            },
        } as any);
        c.set('activePermissionKeys', ['subjects:view']);
        await next();
    });

    app.openapi(getSubjectClassificationRoute, getSubjectClassificationRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses the support-provided institution override for detail fetches', async () => {
        vi.mocked(SubjectClassificationService.getSubjectClassification).mockResolvedValue({
            subject_classification_id: '22222222-2222-4222-8222-222222222222',
            name: 'Shared General Subjects',
            classification_type: 'GENERAL',
            description: null,
            subject_count: 0,
            subjects: [],
            course_ids: [],
            institution_id: '33333333-3333-4333-8333-333333333333',
            inheritance_status: 'LOCAL',
        } as any);

        const res = await app.request(
            '/22222222-2222-4222-8222-222222222222?institutionId=33333333-3333-4333-8333-333333333333',
        );

        expect(res.status).toBe(200);
        expect(SubjectClassificationService.getSubjectClassification).toHaveBeenCalledWith(
            {},
            '22222222-2222-4222-8222-222222222222',
            '33333333-3333-4333-8333-333333333333',
        );
    });
});
