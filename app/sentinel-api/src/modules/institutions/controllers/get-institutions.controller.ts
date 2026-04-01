import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getInstitutionsSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const getInstitutionsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Institutions'],
    summary: 'Get all institutions',
    description: 'Retrieves all institutions.',
    request: getInstitutionsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstitutionsSchema.response,
                },
            },
            description: 'Institutions fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getInstitutionsRouteHandler: AppRouteHandler<typeof getInstitutionsRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'superadmin' && role !== 'support') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { search } = c.req.valid('query');
    const institutions = await InstitutionService.getInstitutions(c.get('dbClient'), search);

        return c.json(
            {
                message: 'Institutions fetched successfully',
                data: institutions,
            },
            200
        );
    } catch (error: any) {
        console.error('Fetch institutions error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
