import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getStudentLiveInspectionDirectiveSchema } from '../live-inspection.dto';
import { getStudentLiveInspectionDirective } from '../services/get-student-live-inspection-directive.service';

export const getStudentLiveInspectionDirectiveRoute = createRoute({
    method: 'post',
    path: '/live-inspections/directive',
    tags: ['Live Inspection'],
    request: {
        body: {
            content: {
                'application/json': { schema: getStudentLiveInspectionDirectiveSchema.body },
            },
        },
    },
    responses: {
        200: {
            description: 'Student live inspection directive',
            content: {
                'application/json': { schema: getStudentLiveInspectionDirectiveSchema.response },
            },
        },
    },
});

export const getStudentLiveInspectionDirectiveRouteHandler: AppRouteHandler<
    typeof getStudentLiveInspectionDirectiveRoute
> = async (c) => {
    const { sessionId } = c.req.valid('json');
    const directive = await getStudentLiveInspectionDirective({
        dbClient: c.get('dbClient'),
        sessionId,
        studentUserId: c.get('user').id,
    });

    return c.json({ message: 'Live inspection directive fetched.', data: directive });
};
