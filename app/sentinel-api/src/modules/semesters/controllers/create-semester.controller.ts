import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { createSemesterSchema } from '../semesters.dto';
import { SemesterService } from '../semesters.service';

export const createSemesterRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Semesters'],
    summary: 'Create a new semester',
    description: 'Creates a new semester.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createSemesterSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createSemesterSchema.response,
                },
            },
            description: 'Semester created successfully',
        },
        400: {
            description: 'Bad Request',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const createSemesterRouteHandler: AppRouteHandler<typeof createSemesterRoute> = async (
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

        const body = c.req.valid('json');

        const semester = await SemesterService.createSemester(
            c.get('dbClient'),
            body,
            institutionId as string | undefined,
        );

        return c.json(
            {
                message: 'Semester created successfully',
                data: semester,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create semester error:', error);
        if (error.status) {
            return c.json({ error: error.message }, error.status);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
