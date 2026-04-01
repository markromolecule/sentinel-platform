import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
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
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (role !== 'admin' && role !== 'superadmin' && role !== 'instructor') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { id } = c.req.valid('param');
        const body = c.req.valid('json');

        const semester = await SemesterService.updateSemester(
            c.get('dbClient'),
            id,
            body,
            institutionId as string | undefined,
        );

        return c.json(
            {
                message: 'Semester updated successfully',
                data: semester,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update semester error:', error);
        if (error.status) {
            return c.json({ error: error.message }, error.status);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
