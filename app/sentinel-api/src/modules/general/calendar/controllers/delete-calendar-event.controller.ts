import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteCalendarEventSchema } from '../calendar.dto';
import { CalendarService } from '../calendar.service';

export const deleteCalendarEventRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Calendar'],
    summary: 'Delete calendar event by ID',
    description: 'Permanently deletes a calendar event scoped to the institution.',
    request: {
        params: deleteCalendarEventSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteCalendarEventSchema.response,
                },
            },
            description: 'Calendar event deleted successfully',
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Calendar event not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteCalendarEventRouteHandler: AppRouteHandler<
    typeof deleteCalendarEventRoute
> = async (c) => {
    try {
        const institutionId = c.get('institutionId');
        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'Unauthorized. User not found.' }, 401 as any);
        }
        const userId = user.id;

        const { id } = c.req.valid('param');

        const { hasActivePermission } = await import('../../../../lib/permissions');
        const hasDeletePermission = hasActivePermission(c, 'calendar:delete');

        await CalendarService.deleteCalendarEvent(c.get('dbClient'), {
            eventId: id,
            institutionId,
            userId,
            hasDeletePermission,
        });

        return c.json(
            {
                success: true,
                message: 'Calendar event deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Delete calendar event error:');
    }
};
