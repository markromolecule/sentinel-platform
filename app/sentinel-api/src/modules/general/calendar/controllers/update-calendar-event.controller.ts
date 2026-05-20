import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateCalendarEventSchema } from '../calendar.dto';
import { CalendarService } from '../calendar.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const updateCalendarEventRoute = createRoute({
    method: 'patch',
    path: '/:id',
    tags: ['Calendar'],
    summary: 'Update calendar event by ID',
    description: 'Modifies details for a single calendar event scoped to the institution.',
    request: {
        params: updateCalendarEventSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateCalendarEventSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateCalendarEventSchema.response,
                },
            },
            description: 'Calendar event updated successfully',
        },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Calendar event not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateCalendarEventRouteHandler: AppRouteHandler<typeof updateCalendarEventRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'calendar:update',
            'Forbidden. You do not have permission to update calendar events.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const { id } = c.req.valid('param');
        const payload = c.req.valid('json');

        const event = await CalendarService.updateCalendarEvent(c.get('dbClient'), {
            eventId: id,
            payload,
            userId: user.id,
            institutionId,
        });

        return c.json(
            {
                success: true,
                message: 'Calendar event updated successfully',
                data: event as any,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Update calendar event error:');
    }
};
