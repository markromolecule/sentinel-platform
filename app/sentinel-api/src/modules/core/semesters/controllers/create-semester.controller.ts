import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
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
        requireActivePermission(
            c,
            'semesters:create',
            'Forbidden. Missing semesters:create permission.',
        );
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        const body = c.req.valid('json');

        // Only enforce institutionId if the user is NOT a support role
        // For support role, we want them to be able to create semesters for ANY institution (passed in body)
        const enforcedId = role === 'support' ? undefined : (institutionId as string | undefined);

        const semester = await SemesterService.createSemester(c.get('dbClient'), body, enforcedId);

        return c.json(
            {
                message: 'Semester created successfully',
                data: semester,
            },
            201,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Create semester error:');
    }
};
