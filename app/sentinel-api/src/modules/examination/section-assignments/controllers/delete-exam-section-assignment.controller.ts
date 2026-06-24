import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { deleteExamSectionAssignmentSchema } from '../section-assignments.dto';
import { SectionAssignmentsService } from '../section-assignments.service';

export const deleteExamSectionAssignmentRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Exam Section Assignments'],
    summary: 'Delete an exam section assignment',
    request: {
        params: deleteExamSectionAssignmentSchema.params,
    },
    responses: {
        200: {
            description: 'Exam section assignment deleted successfully',
            content: {
                'application/json': {
                    schema: deleteExamSectionAssignmentSchema.response,
                },
            },
        },
    },
});

export const deleteExamSectionAssignmentRouteHandler: AppRouteHandler<
    typeof deleteExamSectionAssignmentRoute
> = async (c) => {
    assertAssessmentAccess(c);
    requireActivePermission(c, 'examinations:assign');
    const { examId, id } = c.req.valid('param');

    const deletedId = await SectionAssignmentsService.deleteExamSectionAssignment({
        dbClient: c.get('dbClient'),
        id,
        examId,
    });

    return c.json({
        message: 'Exam section assignment deleted successfully',
        data: {
            id: deletedId || id,
        },
    });
};
