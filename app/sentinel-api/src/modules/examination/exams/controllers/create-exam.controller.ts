import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '@/modules/examination/assessment/assessment-access';
import { createExamSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const createExamRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Exams'],
    summary: 'Create an exam draft',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createExamSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Exam created successfully',
            content: {
                'application/json': {
                    schema: createExamSchema.response,
                },
            },
        },
    },
});

export const createExamRouteHandler: AppRouteHandler<typeof createExamRoute> = async (c) => {
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

    const exam = await ExamService.createExam(
        c.get('dbClient'),
        body,
        institutionId,
        user.id,
    );

    return c.json(
        {
            message: 'Exam created successfully',
            data: exam,
        },
        201,
    );
};
