import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { updateExamSectionAssignmentSchema } from '../section-assignments.dto';
import { SectionAssignmentsService } from '../section-assignments.service';

export const updateExamSectionAssignmentRoute = createRoute({
    method: 'patch',
    path: '/:id',
    tags: ['Exam Section Assignments'],
    summary: 'Update an exam section assignment',
    request: {
        params: updateExamSectionAssignmentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateExamSectionAssignmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Exam section assignment updated successfully',
            content: {
                'application/json': {
                    schema: updateExamSectionAssignmentSchema.response,
                },
            },
        },
    },
});

export const updateExamSectionAssignmentRouteHandler: AppRouteHandler<
    typeof updateExamSectionAssignmentRoute
> = async (c) => {
    assertAssessmentAccess(c);
    requireActivePermission(c, 'examinations:assign');
    const { examId, id } = c.req.valid('param');
    const body = c.req.valid('json');

    const assignment = await SectionAssignmentsService.updateExamSectionAssignment({
        dbClient: c.get('dbClient'),
        id,
        examId,
        body,
    });

    return c.json({
        message: 'Exam section assignment updated successfully',
        data: assignment,
    });
};
