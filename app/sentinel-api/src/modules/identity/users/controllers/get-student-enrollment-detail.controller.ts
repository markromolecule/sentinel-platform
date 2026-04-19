import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getStudentEnrollmentDetailSchema } from '../user.dto';
import { UserService } from '../user.service';

export const getStudentEnrollmentDetailRoute = createRoute({
    method: 'get',
    path: '/:id/enrollments',
    tags: ['Users'],
    summary: 'Get student enrollment detail',
    description: 'Retrieves all classroom enrollments for a single student.',
    request: {
        params: getStudentEnrollmentDetailSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getStudentEnrollmentDetailSchema.response,
                },
            },
            description: 'Student enrollment detail fetched successfully',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getStudentEnrollmentDetailRouteHandler: AppRouteHandler<
    typeof getStudentEnrollmentDetailRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (role !== 'admin' && role !== 'superadmin' && role !== 'support') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        if (role === 'admin' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this admin',
                    data: [],
                },
                200,
            );
        }

        const { id } = c.req.valid('param');
        const scopedInstitutionId =
            role === 'superadmin' || role === 'support'
                ? undefined
                : (institutionId as string | undefined);

        const records = await UserService.getStudentEnrollmentDetail(
            c.get('dbClient'),
            scopedInstitutionId,
            id,
        );

        return c.json(
            {
                message: 'Student enrollment detail fetched successfully',
                data: records,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch student enrollment detail error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
