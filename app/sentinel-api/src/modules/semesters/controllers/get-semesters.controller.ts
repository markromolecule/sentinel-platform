import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
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

export const getSemestersRouteHandler: AppRouteHandler<typeof getSemestersRoute> = async (
    c,
) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (
            role !== 'admin' &&
            role !== 'superadmin' &&
            role !== 'instructor' &&
            role !== 'support'
        ) {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { search, institutionId: queryInstitutionId } = c.req.valid('query');
        
        // Use institutionId from query if superadmin, otherwise use from context
        const finalInstitutionId =
            role === 'superadmin' || role === 'support'
                ? (queryInstitutionId || institutionId)
                : institutionId;

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
        console.error('Fetch semesters error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
