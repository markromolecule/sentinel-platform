import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentReadAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getExamsSchema } from '../exam.dto';
import { ExamService } from '../exam.service';

export const getExamsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exams'],
    summary: 'List exams',
    request: getExamsSchema.request,
    responses: {
        200: {
            description: 'Exams fetched successfully',
            content: {
                'application/json': {
                    schema: getExamsSchema.response,
                },
            },
        },
    },
});

export const getExamsRouteHandler: AppRouteHandler<typeof getExamsRoute> = async (c) => {
    const query = c.req.valid('query');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentReadAccess(c);

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: query.institutionId,
    });

    const departmentId =
        role === 'admin' ? (user?.user_profiles?.department_id ?? undefined) : undefined;

    const exams = await ExamService.getExams(
        c.get('dbClient'),
        query,
        institutionId,
        role === 'student' ? user?.id : undefined,
        departmentId,
    );

    return c.json({
        message: 'Exams fetched successfully',
        data: exams,
    });
};
