import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { getExamAssignmentsSchema } from '../assign.dto';
import { AssignService } from '../assign.service';

export const getExamAssignmentsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exam Assignments'],
    summary: 'List exam assignments for the current instructor',
    responses: {
        200: {
            description: 'Exam assignments fetched successfully',
            content: {
                'application/json': {
                    schema: getExamAssignmentsSchema.response,
                },
            },
        },
    },
});

export const getExamAssignmentsRouteHandler: AppRouteHandler<
    typeof getExamAssignmentsRoute
> = async (c) => {
    const user = c.get('user');
    const supabaseUser = c.get('supabaseUser') as any;
    const role = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(role);
    requireActivePermission(
        c,
        'examinations:assign',
        'Forbidden. You do not have permission to view exam assignments.',
    );

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
    });

    const assignments = await AssignService.getExamAssignments({
        dbClient: c.get('dbClient'),
        userId: user.id,
        institutionId,
    });

    return c.json({
        message: 'Exam assignments fetched successfully',
        data: assignments,
    });
};
