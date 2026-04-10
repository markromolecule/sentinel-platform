import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteStudentWhitelistSchema } from '../student-whitelist.dto';
import { StudentWhitelistService } from '../student-whitelist.service';
import { resolveRequesterRole } from '../../../../lib/resolve-requester-role';

export const deleteStudentWhitelistRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Student Whitelist'],
    summary: 'Delete student whitelist record',
    description: 'Deletes an unclaimed whitelist record within the requester scope.',
    request: {
        params: deleteStudentWhitelistSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteStudentWhitelistSchema.response,
                },
            },
            description: 'Student whitelist record deleted successfully',
        },
        403: {
            description: 'Forbidden',
        },
        404: {
            description: 'Not Found',
        },
        409: {
            description: 'Conflict',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const deleteStudentWhitelistRouteHandler: AppRouteHandler<
    typeof deleteStudentWhitelistRoute
> = async (c) => {
    try {
        const params = c.req.valid('param');
        const supabaseUser = c.get('supabaseUser') as any;
        const institutionId = c.get('institutionId');
        const role = resolveRequesterRole(supabaseUser);

        await StudentWhitelistService.deleteStudentWhitelist(c.get('dbClient'), {
            id: params.id,
            requesterRole: role,
            requesterInstitutionId: institutionId,
        });

        return c.json(
            {
                message: 'Student whitelist record deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete student whitelist error:', error);
        if (error.message.includes('Forbidden')) {
            return c.json({ error: error.message }, 403);
        }
        if (error.message.includes('not found')) {
            return c.json({ error: error.message }, 404);
        }
        if (error.message.includes('Cannot delete a claimed')) {
            return c.json({ error: error.message }, 409);
        }
        return c.json({ error: error.message || 'Internal Server Error' }, 500);
    }
};
