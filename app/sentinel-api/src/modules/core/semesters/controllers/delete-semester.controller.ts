import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { deleteSemesterSchema } from '../semesters.dto';
import { SemesterService } from '../semesters.service';

export const deleteSemesterRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Semesters'],
    summary: 'Delete a semester',
    description: 'Deletes a semester.',
    request: {
        params: deleteSemesterSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteSemesterSchema.response,
                },
            },
            description: 'Semester deleted successfully',
        },
        404: {
            description: 'Semester not found',
        },
        409: {
            description: 'Conflict (Used by class groups)',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const deleteSemesterRouteHandler: AppRouteHandler<typeof deleteSemesterRoute> = async (
    c,
) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (role !== 'support') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { id } = c.req.valid('param');

        // Only enforce institutionId if the user is NOT a support role
        const enforcedId = (role === 'support')
            ? undefined
            : (institutionId as string | undefined);

        await SemesterService.deleteSemester(
            c.get('dbClient'),
            id,
            enforcedId,
        );

        return c.json(
            {
                message: 'Semester deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Delete semester error:', error);
        if (error.status) {
            return c.json({ error: error.message }, error.status);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
