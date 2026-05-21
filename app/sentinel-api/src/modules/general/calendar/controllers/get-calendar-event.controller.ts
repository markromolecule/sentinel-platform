import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getCalendarEventSchema } from '../calendar.dto';
import { CalendarService } from '../calendar.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const getCalendarEventRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Calendar'],
    summary: 'Get calendar event by ID',
    description: 'Retrieves details for a single calendar event scoped to the institution.',
    request: {
        params: getCalendarEventSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getCalendarEventSchema.response,
                },
            },
            description: 'Calendar event fetched successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Calendar event not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getCalendarEventRouteHandler: AppRouteHandler<typeof getCalendarEventRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'calendar:view',
            'Forbidden. You do not have permission to view calendar events.',
        );

        const institutionId = c.get('institutionId');
        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');

        const event = await CalendarService.getCalendarEventById(c.get('dbClient'), {
            eventId: id,
            institutionId,
        });

        return c.json(
            {
                success: true,
                message: 'Calendar event fetched successfully',
                data: event as any,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get calendar event error:');
    }
};
