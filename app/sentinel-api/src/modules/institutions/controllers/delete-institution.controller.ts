import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { deleteInstitutionSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const deleteInstitutionRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Institutions'],
    summary: 'Delete an institution',
    description: 'Deletes an existing institution.',
    request: {
        params: deleteInstitutionSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteInstitutionSchema.response,
                },
            },
            description: 'Institution deleted successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const deleteInstitutionRouteHandler: AppRouteHandler<typeof deleteInstitutionRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'superadmin' && role !== 'support') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { id } = c.req.valid('param');

        await InstitutionService.deleteInstitution(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Institution deleted successfully',
                data: null,
            },
            200
        );
    } catch (error: any) {
        console.error('Delete institution error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
