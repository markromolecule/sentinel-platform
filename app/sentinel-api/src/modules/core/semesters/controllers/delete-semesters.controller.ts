import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteSemestersSchema } from '../semesters.dto';
import { SemesterService } from '../semesters.service';

export const deleteSemestersRoute = createRoute({
    method: 'post',
    path: '/bulk-delete',
    tags: ['Semesters', 'Support'],
    summary: 'Bulk delete semesters',
    description: 'Deletes multiple semesters at once.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: deleteSemestersSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSemestersSchema.response,
                },
            },
            description: 'Semesters deleted successfully',
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        409: { description: 'Conflict (Semesters in use)' },
        500: { description: 'Internal Server Error' },
    },
});

export const deleteSemestersRouteHandler: AppRouteHandler<typeof deleteSemestersRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'semesters:delete',
            'Forbidden. Missing semesters:delete permission.',
        );

        const { ids } = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        const enforcedId = role === 'support' ? undefined : (institutionId as string | undefined);

        await SemesterService.deleteSemesters(c.get('dbClient'), ids, enforcedId, user?.id);

        return c.json(
            {
                message: 'Semesters deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk delete semesters error:');
    }
};
