import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { createInstitutionSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const createInstitutionRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Institutions'],
    summary: 'Create an institution',
    description: 'Creates a new institution.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createInstitutionSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createInstitutionSchema.response,
                },
            },
            description: 'Institution created successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const createInstitutionRouteHandler: AppRouteHandler<typeof createInstitutionRoute> = async (
    c,
) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const createdBy = c.get('user')?.id;

        if (role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const body = c.req.valid('json');

        const newInstitution = await InstitutionService.createInstitution(
            c.get('dbClient'),
            body,
            createdBy,
        );

        return c.json(
            {
                message: 'Institution created successfully',
                data: newInstitution,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create institution error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
