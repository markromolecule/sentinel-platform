import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { createStudentWhitelistSchema } from '../student-whitelist.dto';
import { StudentWhitelistService } from '../student-whitelist.service';

export const createStudentWhitelistRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Student Whitelist'],
    summary: 'Create student whitelist record',
    description: 'Creates a whitelist record within the requester scope.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createStudentWhitelistSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createStudentWhitelistSchema.response,
                },
            },
            description: 'Student whitelist record created successfully',
        },
        400: {
            description: 'Bad Request',
        },
        403: {
            description: 'Forbidden',
        },
        409: {
            description: 'Conflict',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const createStudentWhitelistRouteHandler: AppRouteHandler<
    typeof createStudentWhitelistRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const role = supabaseUser?.user_metadata?.role;

        const record = await StudentWhitelistService.createStudentWhitelist(c.get('dbClient'), {
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
            requesterUserId: user.id,
            values: body,
        });

        return c.json(
            {
                message: 'Student whitelist record created successfully',
                data: record,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create student whitelist error:', error);
        if (error.message.includes('Forbidden')) {
            return c.json({ error: error.message }, 403);
        }
        if (error.message.includes('already exists')) {
            return c.json({ error: error.message }, 409);
        }
        if (
            error.message.includes('required') ||
            error.message.includes('not found') ||
            error.message.includes('does not belong')
        ) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: error.message || 'Internal Server Error' }, 500);
    }
};
