import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { createCalendarEventSchema } from '../calendar.dto';
import { CalendarService } from '../calendar.service';
import { requireActivePermission } from '../../../../lib/permissions';

export const createCalendarEventRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Calendar'],
    summary: 'Create a new calendar event',
    description: 'Creates a calendar event scoped to the institution.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createCalendarEventSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createCalendarEventSchema.response,
                },
            },
            description: 'Calendar event created successfully',
        },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const createCalendarEventRouteHandler: AppRouteHandler<
    typeof createCalendarEventRoute
> = async (c) => {
    try {
        requireActivePermission(
            c,
            'calendar:create',
            'Forbidden. You do not have permission to create calendar events.',
        );

        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (!institutionId) {
            return c.json({ error: 'Unauthorized. Institution ID not found.' }, 401 as any);
        }

        const payload = c.req.valid('json');

        const event = await CalendarService.createCalendarEvent(c.get('dbClient'), {
            payload,
            userId: user.id,
            institutionId,
        });

        return c.json(
            {
                success: true,
                message: 'Calendar event created successfully',
                data: event as any,
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Create calendar event error:');
    }
};
