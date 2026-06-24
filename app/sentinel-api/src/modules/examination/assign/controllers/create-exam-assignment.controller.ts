import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { createExamAssignmentSchema } from '../assign.dto';
import { AssignService } from '../assign.service';

export const createExamAssignmentRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Exam Assignments'],
    summary: 'Create an exam assignment request',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createExamAssignmentSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Exam assignment created successfully',
            content: {
                'application/json': {
                    schema: createExamAssignmentSchema.response,
                },
            },
        },
    },
});

export const createExamAssignmentRouteHandler: AppRouteHandler<
    typeof createExamAssignmentRoute
> = async (c) => {
    const body = c.req.valid('json');
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
        'Forbidden. You do not have permission to manage exam assignments.',
    );

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: c.get('institutionId'),
    });

    const assignment = await AssignService.createExamAssignment({
        dbClient: c.get('dbClient'),
        body,
        institutionId,
        userId: user.id,
    });

    return c.json(
        {
            message: 'Exam assignment created successfully',
            data: assignment,
        },
        201,
    );
};
