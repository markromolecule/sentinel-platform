import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { assertAssessmentAccess } from '@/modules/examination/assessment/assessment-access';
import { deleteExamSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const deleteExamRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Exams'],
    summary: 'Delete an exam',
    request: {
        params: deleteExamSchema.params,
    },
    responses: {
        200: {
            description: 'Exam deleted successfully',
            content: {
                'application/json': {
                    schema: deleteExamSchema.response,
                },
            },
        },
    },
});

export const deleteExamRouteHandler: AppRouteHandler<typeof deleteExamRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;

    assertAssessmentAccess(supabaseUser?.user_metadata?.role);

    await ExamService.deleteExam(
        c.get('dbClient'),
        id,
        c.get('institutionId') || undefined,
    );

    return c.json({
        message: 'Exam deleted successfully',
        data: null,
    });
};
