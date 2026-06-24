import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondToExamAssignmentSchema } from '../assign.dto';
import { AssignService } from '../assign.service';

export const rejectExamAssignmentRoute = createRoute({
    method: 'post',
    path: '/:assignmentId/reject',
    tags: ['Exam Assignments'],
    summary: 'Reject an exam assignment request',
    request: {
        params: respondToExamAssignmentSchema.params,
    },
    responses: {
        200: {
            description: 'Exam assignment rejected successfully',
            content: {
                'application/json': {
                    schema: respondToExamAssignmentSchema.response,
                },
            },
        },
    },
});

export const rejectExamAssignmentRouteHandler: AppRouteHandler<
    typeof rejectExamAssignmentRoute
> = async (c) => {
    const { assignmentId } = c.req.valid('param');
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
        'Forbidden. You do not have permission to respond to exam assignments.',
    );

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
    });

    const assignment = await AssignService.respondToExamAssignment({
        dbClient: c.get('dbClient'),
        assignmentId,
        institutionId,
        userId: user.id,
        status: 'DECLINED',
    });

    return c.json({
        message: 'Exam assignment rejected successfully',
        data: assignment,
    });
};
