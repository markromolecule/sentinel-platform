import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssignedInstructorAttemptAccess } from '../../assign/services/exam-access.service';
import {
    type AssessmentAllowedRole,
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
    const supabaseUser = c.get('supabaseUser');
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
        return respondWithAttemptReport(c, {
            dbClient: c.get('dbClient'),
            attemptId,
            institutionId,
            viewerRole: 'student',
            userId: user?.id,
        });
    }

    if (!resolvedRole) {
        throw new HTTPException(403, {
            message: 'Forbidden. Unable to resolve attempt report viewer role.',
        });
    }

    assertAssessmentAccess(resolvedRole);
    const viewerRole = resolvedRole as AssessmentAllowedRole;

    if (resolvedRole === 'instructor') {
        if (!user?.id) {
            throw new HTTPException(403, {
                message:
                    'Forbidden. Instructor report access requires an authenticated instructor.',
            });
        }

        await assertAssignedInstructorAttemptAccess({
            dbClient: c.get('dbClient'),
            attemptId,
            userId: user.id,
            institutionId,
        });
    }

    return respondWithAttemptReport(c, {
        dbClient: c.get('dbClient'),
        attemptId,
        institutionId,
        viewerRole,
        userId: user?.id,
    });
};

type GetAttemptReportRouteContext = Parameters<AppRouteHandler<typeof getAttemptReportRoute>>[0];

async function respondWithAttemptReport(
    c: GetAttemptReportRouteContext,
    args: Parameters<typeof ReportingService.getAttemptReport>[0],
) {
    const data = await ReportingService.getAttemptReport(args);

    return c.json(
        {
            message: 'Attempt report fetched successfully',
            data,
        },
        200,
    );
}
