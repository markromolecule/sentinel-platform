import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '@/modules/examination/assessment/assessment-access';
import { updateExamSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const updateExamRoute = createRoute({
    method: 'put',
    path: '/:id',
    tags: ['Exams'],
    summary: 'Update an exam',
    request: {
        params: updateExamSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateExamSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam updated successfully',
            content: {
                'application/json': {
                    schema: updateExamSchema.response,
                },
            },
        },
    },
});

export const updateExamRouteHandler: AppRouteHandler<typeof updateExamRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = supabaseUser?.user_metadata?.role;

    assertAssessmentAccess(role);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: body.institutionId,
    });

    const exam = await ExamService.updateExam(
        c.get('dbClient'),
        id,
        body,
        institutionId,
        user.id,
    );

    return c.json({
        message: 'Exam updated successfully',
        data: exam,
    });
};
