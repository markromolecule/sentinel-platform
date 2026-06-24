import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { HTTPException } from 'hono/http-exception';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';
import { createExamSectionAssignmentSchema } from '../section-assignments.dto';
import { SectionAssignmentsService } from '../section-assignments.service';

export const createExamSectionAssignmentRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Exam Section Assignments'],
    summary: 'Create an exam section assignment',
    request: {
        params: createExamSectionAssignmentSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: createExamSectionAssignmentSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Exam section assignment created successfully',
            content: {
                'application/json': {
                    schema: createExamSectionAssignmentSchema.response,
                },
            },
        },
    },
});

export const createExamSectionAssignmentRouteHandler: AppRouteHandler<
    typeof createExamSectionAssignmentRoute
> = async (c) => {
    assertAssessmentAccess(c);
    requireActivePermission(c, 'examinations:assign');
    const { examId } = c.req.valid('param');
    const body = c.req.valid('json');

    try {
        const assignment = await SectionAssignmentsService.createExamSectionAssignment({
            dbClient: c.get('dbClient'),
            examId,
            body,
        });

        return c.json(
            {
                message: 'Exam section assignment created successfully',
                data: assignment,
            },
            201,
        );
    } catch (err) {
        const code = (err as any).code;
        const message = (err as any).message || '';
        if (code === 'P2002' || code === '23505' || message.includes('23505')) {
            throw new HTTPException(409, {
                message: 'This section is already assigned to the exam.',
            });
        }
        throw err;
    }
};
