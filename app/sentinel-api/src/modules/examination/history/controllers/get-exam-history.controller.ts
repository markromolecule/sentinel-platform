import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { EntitlementsRepository } from '../../access/data/entitlements.repository';
import { getExamHistorySchema } from '../history.dto';
import { HistoryService } from '../history.service';

export const getExamHistoryRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exams'],
    summary: 'List student exam history',
    request: getExamHistorySchema.request,
    responses: {
        200: {
            description: 'Exam history fetched successfully',
            content: {
                'application/json': {
                    schema: getExamHistorySchema.response,
                },
            },
        },
    },
});

export const getExamHistoryRouteHandler: AppRouteHandler<typeof getExamHistoryRoute> = async (
    c,
) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    if (!user?.id) {
        throw new HTTPException(403, {
            message: 'Forbidden. Student history is only available to students.',
        });
    }

    const studentProfile = await EntitlementsRepository.getStudentProfileByUserId(
        c.get('dbClient'),
        user.id,
    );

    if (!studentProfile) {
        throw new HTTPException(403, {
            message: 'Forbidden. Student history is only available to students.',
        });
    }

    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    const query = c.req.valid('query');
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { status, search } = query;

    const { items, total, hasMore } = await HistoryService.getStudentHistory(
        c.get('dbClient'),
        user.id,
        resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
        { page, limit, status, search },
    );

    return c.json({
        message: 'Exam history fetched successfully',
        data: items,
        pagination: {
            page,
            limit,
            total,
            hasMore,
        },
    });
};
