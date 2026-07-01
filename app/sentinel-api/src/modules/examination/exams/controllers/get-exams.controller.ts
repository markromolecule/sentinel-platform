import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentReadAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { EntitlementsRepository } from '../../access/data/entitlements.repository';
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

/**
 * Handles exam list requests and enforces institution-scoped instructor visibility.
 */
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

    if (role === 'instructor' && !institutionId) {
        return c.json({
            message: 'Institution context required',
            data: [],
        });
    }

    const departmentId =
        role === 'admin' ? (user?.user_profiles?.department_id ?? undefined) : undefined;
    const studentProfile = user?.id
        ? await EntitlementsRepository.getStudentProfileByUserId(c.get('dbClient'), user.id)
        : null;

    const exams = await ExamService.getExams(
        c.get('dbClient'),
        query,
        institutionId,
        studentProfile ? user?.id : undefined,
        departmentId,
        role === 'instructor' ? user?.id : undefined,
    );

    return c.json({
        message: 'Exams fetched successfully',
        data: exams,
    });
};
