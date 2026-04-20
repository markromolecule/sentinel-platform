import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getReportingExamContext } from '../../reporting/services/get-reporting-exam-context';
import { updateExamRuntimeAccessSchema } from '../runtime-access.dto';
import { RuntimeAccessService } from '../runtime-access.service';

export const updateExamRuntimeAccessRoute = createRoute({
    method: 'patch',
    path: '/:id/runtime-access',
    tags: ['Exams'],
    summary: 'Update the runtime access state for an exam',
    request: {
        params: updateExamRuntimeAccessSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateExamRuntimeAccessSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam runtime access updated successfully',
            content: {
                'application/json': {
                    schema: updateExamRuntimeAccessSchema.response,
                },
            },
        },
    },
});

export const updateExamRuntimeAccessRouteHandler: AppRouteHandler<
    typeof updateExamRuntimeAccessRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);
    const role = resolvedRole as AssessmentAllowedRole;
    const exam = await getReportingExamContext({
        dbClient: c.get('dbClient'),
        examId: id,
        institutionId: resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
        viewerRole: role,
        userId: user?.id,
    });

    const runtimeAccess = await RuntimeAccessService.updateExamRuntimeAccess({
        dbClient: c.get('dbClient'),
        examId: id,
        body,
        updatedBy: user?.id,
        scheduledDate: exam.scheduledDate,
        endDateTime: exam.endDateTime,
        durationMinutes: exam.durationMinutes,
    });

    return c.json({
        message: 'Exam runtime access updated successfully',
        data: runtimeAccess,
    });
};
