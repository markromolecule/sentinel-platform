import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getSemestersSchema } from '../semesters.dto';
import { SemesterService } from '../semesters.service';

export const getSemestersRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Semesters'],
    summary: 'Get all semesters',
    description: 'Retrieves all semesters.',
    request: getSemestersSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSemestersSchema.response,
                },
            },
            description: 'Semesters fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getSemestersRouteHandler: AppRouteHandler<typeof getSemestersRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'semesters:view',
            'Forbidden. Missing semesters:view permission.',
        );
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        const { search, institutionId: queryInstitutionId } = c.req.valid('query');

        // Use institutionId from query if support, otherwise use from context, but allow global view if no query param is provided
        const finalInstitutionId =
            role === 'support' ? queryInstitutionId || undefined : institutionId || undefined;

        const semesters = await SemesterService.getSemesters(
            c.get('dbClient'),
            finalInstitutionId as string | undefined,
            search,
        );

        return c.json(
            {
                message: 'Semesters fetched successfully',
                data: semesters,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch semesters error:');
    }
};
