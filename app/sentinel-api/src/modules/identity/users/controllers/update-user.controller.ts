import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { updateUserSchema } from '../user.dto';
import { UserService } from '../user.service';
import {
    buildRequesterAcademicScope,
    resolveScopedUserMutationValues,
} from '@/modules/_shared/academic-scope';

export const updateUserRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    tags: ['Users'],
    summary: 'Update a user',
    description: 'Updates an existing user.',
    request: {
        params: updateUserSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateUserSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateUserSchema.response,
                },
            },
            description: 'User updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'User not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateUserRouteHandler: AppRouteHandler<typeof updateUserRoute> = async (c) => {
    try {
        const params = c.req.valid('param');
        const body = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const requester = c.get('user');
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: requester.user_profiles?.department_id ?? null,
            requesterCourseId: requester.user_profiles?.course_id ?? null,
        });
        const scopedBody = await resolveScopedUserMutationValues(c.get('dbClient'), scope, body, {
            forceAdminCourse: false,
        });

        const updatedUser = await UserService.updateUser(
            c.get('dbClient'),
            params.id,
            scopedBody,
            role,
            institutionId,
            requester.user_profiles?.department_id ?? null,
            requester.user_profiles?.course_id ?? null,
        );

        return c.json(
            {
                message: 'User updated successfully',
                data: updatedUser,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update user error:', error);

        if (error?.status === 404 || error?.message === 'User profile not found after update') {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
