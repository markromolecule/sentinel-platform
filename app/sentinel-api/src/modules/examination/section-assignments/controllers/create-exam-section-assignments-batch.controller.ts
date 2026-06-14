import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { HTTPException } from 'hono/http-exception';
import { assertAssessmentAccess } from '../../assessment/assessment-access';
import { createExamSectionAssignmentsBatchSchema } from '../section-assignments.dto';
import { SectionAssignmentsService } from '../section-assignments.service';

export const createExamSectionAssignmentsBatchRoute = createRoute({
    method: 'post',
    path: '/batch',
    tags: ['Exam Section Assignments'],
    summary: 'Create batch exam section assignments',
    request: {
        params: createExamSectionAssignmentsBatchSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: createExamSectionAssignmentsBatchSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Exam section assignments created successfully',
            content: {
                'application/json': {
                    schema: createExamSectionAssignmentsBatchSchema.response,
                },
            },
        },
    },
});

export const createExamSectionAssignmentsBatchRouteHandler: AppRouteHandler<
    typeof createExamSectionAssignmentsBatchRoute
> = async (c) => {
    assertAssessmentAccess(c);
    const { examId } = c.req.valid('param');
    const { assignments } = c.req.valid('json');

    try {
        const result = await SectionAssignmentsService.createExamSectionAssignmentsBatch({
            dbClient: c.get('dbClient'),
            examId,
            body: { assignments },
        });

        return c.json(
            {
                message: 'Exam section assignments created successfully',
                data: result,
            },
            201,
        );
    } catch (err) {
        const code = (err as any).code;
        const message = (err as any).message || '';
        if (code === 'P2002' || code === '23505' || message.includes('23505')) {
            throw new HTTPException(409, {
                message: 'One or more sections are already assigned to the exam.',
            });
        }
        throw err;
    }
};
