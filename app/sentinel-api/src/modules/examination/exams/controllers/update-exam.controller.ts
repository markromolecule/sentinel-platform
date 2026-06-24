import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { updateExamSchema } from '../exam.dto';
import { ExamService } from '../exam.service';
import { hasActivePermission, requireActivePermission } from '../../../../lib/permissions';

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

// Update an exam
export const updateExamRouteHandler: AppRouteHandler<typeof updateExamRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(c);
    requireActivePermission(c, 'examinations:update');

    // Resolve institution id based on role
    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
        requestedInstitutionId: body.institutionId,
    });

    // Bypass lock permission for superadmin and system role
    const canBypassLock = hasActivePermission(c, 'examinations:bypass_publish_lock');
    const canManageExam = hasActivePermission(c, 'examinations:update');

    const exam = await ExamService.updateExam(
        c.get('dbClient'),
        id,
        body,
        institutionId,
        user.id,
        canBypassLock,
        canManageExam,
        role || undefined,
    );

    return c.json({
        message: 'Exam updated successfully',
        data: exam,
    });
};
