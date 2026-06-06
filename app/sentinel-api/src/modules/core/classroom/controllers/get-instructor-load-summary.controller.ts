import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { instructorLoadSummarySchema } from '../classroom.dto';
import { ClassroomService } from '../classroom.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getInstructorLoadSummaryRoute = createRoute({
    method: 'get',
    path: '/dashboard/instructor-loads',
    tags: ['Classrooms'],
    summary: 'Get instructor workload counts',
    description:
        'Retrieves active classroom assignment workload loads for all instructors in the institution.',
    request: {
        query: instructorLoadSummarySchema.request.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: instructorLoadSummarySchema.response,
                },
            },
            description: 'Instructor workloads summary retrieved successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const getInstructorLoadSummaryRouteHandler: AppRouteHandler<
    typeof getInstructorLoadSummaryRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'classrooms:view',
            'Forbidden. You do not have permission to view instructor loads.',
        );

        const institutionId = c.get('institutionId');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const query = c.req.valid('query');

        const summary = await ClassroomService.getInstructorLoadSummary(c.get('dbClient'), {
            institutionId,
            termId: query.termId,
        });

        return c.json({
            message: 'Instructor workloads summary retrieved successfully',
            data: summary as any,
        });
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get instructor loads summary error:');
    }
};
