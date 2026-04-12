import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
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
            description: 'Institution created succ`essfully',
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
        requireActivePermission(
            c,
            'institutions:create',
            'Forbidden. Missing institutions:create permission.',
        );
        const createdBy = c.get('user')?.id;

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
        return respondWithRouteError(c, error, 'Create institution error:');
    }
};
