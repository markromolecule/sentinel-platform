import { createRoute, z } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';
import { getTosMatrixData } from '../data/get-tos-matrix';

const bloomLevelSchema = z.enum([
    'REMEMBERING',
    'UNDERSTANDING',
    'APPLYING',
    'ANALYZING',
    'EVALUATING',
    'CREATING',
]);

const tosMatrixRowSchema = z.object({
    topic: z.string(),
    counts: z.record(bloomLevelSchema, z.number()),
    total: z.number(),
});

const tosMatrixResponseSchema = z.object({
    message: z.string(),
    data: z.object({
        rows: z.array(tosMatrixRowSchema),
        columnTotals: z.record(bloomLevelSchema, z.number()),
        grandTotal: z.number(),
        activeCount: z.number(),
        retiredCount: z.number(),
    }),
});

export const getTosMatrixRoute = createRoute({
    method: 'get',
    path: '/tos-matrix',
    tags: ['Question Bank'],
    summary: "Get TOS matrix — question counts by topic and Bloom's cognitive level",
    request: {
        query: z.object({
            institutionId: z.string().uuid().optional(),
        }),
    },
    responses: {
        200: {
            description: 'TOS matrix fetched successfully',
            content: {
                'application/json': {
                    schema: tosMatrixResponseSchema,
                },
            },
        },
    },
});

export const getTosMatrixRouteHandler: AppRouteHandler<typeof getTosMatrixRoute> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(c);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: query.institutionId,
    });

    const matrix = await getTosMatrixData({
        dbClient: c.get('dbClient'),
        institutionId,
    });

    return c.json({
        message: 'TOS matrix fetched successfully',
        data: matrix,
    });
};
