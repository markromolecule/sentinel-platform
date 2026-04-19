import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamHistoryDetailSchema } from '../history.dto';
import { HistoryService } from '../history.service';

export const getExamHistoryDetailRoute = createRoute({
    method: 'get',
    path: '/:attemptId',
    tags: ['Exams'],
    summary: 'Get a student exam history record',
    request: {
        params: getExamHistoryDetailSchema.params,
    },
    responses: {
        200: {
            description: 'Exam history detail fetched successfully',
            content: {
                'application/json': {
                    schema: getExamHistoryDetailSchema.response,
                },
            },
        },
    },
});

export const getExamHistoryDetailRouteHandler: AppRouteHandler<
    typeof getExamHistoryDetailRoute
> = async (c) => {
    const { attemptId } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    if (role !== 'student' || !user?.id) {
        throw new HTTPException(403, {
            message: 'Forbidden. Student history is only available to students.',
        });
    }

    const historyItem = await HistoryService.getStudentHistoryDetail(
        c.get('dbClient'),
        attemptId,
        user.id,
        resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
    );

    return c.json({
        message: 'Exam history detail fetched successfully',
        data: historyItem,
    });
};
