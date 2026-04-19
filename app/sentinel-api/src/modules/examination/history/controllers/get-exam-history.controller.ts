import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamHistorySchema } from '../history.dto';
import { HistoryService } from '../history.service';

export const getExamHistoryRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exams'],
    summary: 'List student exam history',
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

export const getExamHistoryRouteHandler: AppRouteHandler<typeof getExamHistoryRoute> = async (c) => {
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

    const history = await HistoryService.getStudentHistory(
        c.get('dbClient'),
        user.id,
        resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
    );

    return c.json({
        message: 'Exam history fetched successfully',
        data: history,
    });
};
