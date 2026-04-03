import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { assertAssessmentAccess } from '../../_shared/assessment-access';
import { getExamByIdSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const getExamRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Exams'],
    summary: 'Get an exam',
    request: {
        params: getExamByIdSchema.params,
    },
    responses: {
        200: {
            description: 'Exam fetched successfully',
            content: {
                'application/json': {
                    schema: getExamByIdSchema.response,
                },
            },
        },
    },
});

export const getExamRouteHandler: AppRouteHandler<typeof getExamRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const exam = await ExamService.getExamById(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Exam fetched successfully',
        data: exam,
    });
};
