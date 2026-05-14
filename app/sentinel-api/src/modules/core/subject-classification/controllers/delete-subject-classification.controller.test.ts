import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    deleteSubjectClassificationRoute,
    deleteSubjectClassificationRouteHandler,
} from './delete-subject-classification.controller';
import { SubjectClassificationService } from '../subject-classification.service';

vi.mock('../subject-classification.service', () => ({
    SubjectClassificationService: {
        deleteSubjectClassification: vi.fn(),
    },
}));

describe('deleteSubjectClassificationRouteHandler', () => {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('institutionId', '11111111-1111-4111-8111-111111111111');
        c.set('supabaseUser', {
            user_metadata: {
                role: 'support',
            },
        } as any);
        c.set('user', {
            id: '44444444-4444-4444-8444-444444444444',
            user_profiles: {
                department_id: null,
                course_id: null,
            },
        } as any);
        c.set('activePermissionKeys', ['subjects:delete']);
        await next();
    });

    app.openapi(deleteSubjectClassificationRoute, deleteSubjectClassificationRouteHandler);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses the support-provided institution override for deletes', async () => {
        vi.mocked(SubjectClassificationService.deleteSubjectClassification).mockResolvedValue({
            subject_classification_id: '22222222-2222-4222-8222-222222222222',
        } as any);

        const res = await app.request(
            '/22222222-2222-4222-8222-222222222222?institutionId=33333333-3333-4333-8333-333333333333',
            {
                method: 'DELETE',
            },
        );

        expect(res.status).toBe(200);
        expect(SubjectClassificationService.deleteSubjectClassification).toHaveBeenCalledWith(
            {},
            '22222222-2222-4222-8222-222222222222',
            '33333333-3333-4333-8333-333333333333',
            '44444444-4444-4444-8444-444444444444',
        );
    });
});
