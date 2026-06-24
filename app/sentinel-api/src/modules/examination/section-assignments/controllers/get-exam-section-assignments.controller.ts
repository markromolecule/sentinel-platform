import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { assertAssessmentReadAccess } from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { getExamSectionAssignmentsSchema } from '../section-assignments.dto';
import { SectionAssignmentsService } from '../section-assignments.service';

export const getExamSectionAssignmentsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Exam Section Assignments'],
    summary: 'List section assignments for an exam',
    request: {
        params: getExamSectionAssignmentsSchema.params,
    },
    responses: {
        200: {
            description: 'Exam section assignments fetched successfully',
            content: {
                'application/json': {
                    schema: getExamSectionAssignmentsSchema.response,
                },
            },
        },
    },
});

export const getExamSectionAssignmentsRouteHandler: AppRouteHandler<
    typeof getExamSectionAssignmentsRoute
> = async (c) => {
    assertAssessmentReadAccess(c);
    requireActivePermission(c, 'examinations:assign');
    const { examId } = c.req.valid('param');

    const assignments = await SectionAssignmentsService.getExamSectionAssignments({
        dbClient: c.get('dbClient'),
        examId,
    });

    return c.json({
        message: 'Exam section assignments fetched successfully',
        data: assignments,
    });
};
