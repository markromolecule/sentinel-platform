import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { assertAssessmentAccess } from '@/modules/examination/assessment/assessment-access';
import { updateExamStatusSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const updateExamStatusRoute = createRoute({
    method: 'patch',
    path: '/:id/status',
    tags: ['Exams'],
    summary: 'Update exam status',
    request: {
        params: updateExamStatusSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateExamStatusSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam status updated successfully',
            content: {
                'application/json': {
                    schema: updateExamStatusSchema.response,
                },
            },
        },
    },
});

export const updateExamStatusRouteHandler: AppRouteHandler<typeof updateExamStatusRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    const exam = await ExamService.updateExamStatus(
        c.get('dbClient'),
        id,
        body.status,
        c.get('institutionId') || undefined,
        user.id,
    );

    return c.json({
        message: 'Exam status updated successfully',
        data: exam,
    });
};
