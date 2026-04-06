import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createUserSchema } from '../user.dto';
import { UserService } from '../user.service';
import {
    buildRequesterAcademicScope,
    resolveScopedUserMutationValues,
} from '../../../_shared/academic-scope';

export const createUserRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Users'],
    summary: 'Create a user',
    description: 'Creates a new user.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createUserSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createUserSchema.response,
                },
            },
            description: 'User created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'User already exists' },
        500: { description: 'Internal Server Error' },
    },
});

export const createUserRouteHandler: AppRouteHandler<typeof createUserRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const requester = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: requester.user_profiles?.department_id ?? null,
            requesterCourseId: requester.user_profiles?.course_id ?? null,
        });
        const scopedBody = await resolveScopedUserMutationValues(c.get('dbClient'), scope, body);
        const createdUser = await UserService.createUser(c.get('dbClient'), scopedBody);

        return c.json(
            {
                message: 'User created successfully',
                data: createdUser,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create user error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, error?.status || 500);
    }
};
