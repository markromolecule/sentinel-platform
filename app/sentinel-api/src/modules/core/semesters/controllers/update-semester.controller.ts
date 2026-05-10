import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateSemesterSchema } from '../semesters.dto';
import { SemesterService } from '../semesters.service';

export const updateSemesterRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Semesters'],
    summary: 'Update an existing semester',
    description: 'Updates an existing semester.',
    request: {
        params: updateSemesterSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateSemesterSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateSemesterSchema.response,
                },
            },
            description: 'Semester updated successfully',
        },
        400: {
            description: 'Bad Request',
        },
        404: {
            description: 'Semester not found',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const updateSemesterRouteHandler: AppRouteHandler<typeof updateSemesterRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'semesters:update',
            'Forbidden. Missing semesters:update permission.',
        );
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        const { id } = c.req.valid('param');
        const body = c.req.valid('json');

        // Only enforce institutionId if the user is NOT a support role
        const enforcedId = role === 'support' ? undefined : (institutionId as string | undefined);

        const semester = await SemesterService.updateSemester(
            c.get('dbClient'),
            id,
            body,
            enforcedId,
            user?.id,
        );

        return c.json(
            {
                message: 'Semester updated successfully',
                data: semester,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Update semester error:');
    }
};
