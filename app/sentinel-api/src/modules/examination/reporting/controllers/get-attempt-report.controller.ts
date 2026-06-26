import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssignedInstructorAttemptAccess } from '../../assign/services/exam-access';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { getAttemptReportSchema } from '../reporting.dto';
import { ReportingService } from '../reporting.service';

export const getAttemptReportRoute = createRoute({
    method: 'get',
    path: '/attempts/:attemptId/report',
    tags: ['Exams'],
    summary: 'Get the finalized attempt report for instructor or student views',
    request: {
        params: getAttemptReportSchema.params,
    },
    responses: {
        200: {
            description: 'Attempt report fetched successfully',
            content: {
                'application/json': {
                    schema: getAttemptReportSchema.response,
                },
            },
        },
    },
});

export const getAttemptReportRouteHandler: AppRouteHandler<typeof getAttemptReportRoute> = async (
    c,
) => {
    const { attemptId } = c.req.valid('param');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    const institutionId = resolveAssessmentInstitutionId({
        role: resolvedRole,
        contextInstitutionId: c.get('institutionId'),
    });

    if (resolvedRole === 'student') {
        const data = await ReportingService.getAttemptReport({
            dbClient: c.get('dbClient'),
            attemptId,
            institutionId,
            viewerRole: 'student',
            userId: user?.id,
        });

        return c.json({
            message: 'Attempt report fetched successfully',
            data,
        });
    }

    assertAssessmentAccess(resolvedRole);

    if (resolvedRole === 'instructor' && user?.id) {
        await assertAssignedInstructorAttemptAccess({
            dbClient: c.get('dbClient'),
            attemptId,
            userId: user.id,
            institutionId,
        });
    }

    const data = await ReportingService.getAttemptReport({
        dbClient: c.get('dbClient'),
        attemptId,
        institutionId,
        viewerRole: resolvedRole,
        userId: user?.id,
    });

    return c.json({
        message: 'Attempt report fetched successfully',
        data,
    });
};
