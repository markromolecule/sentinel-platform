import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateStudentWhitelistSchema } from '../student-whitelist.dto';
import { StudentWhitelistService } from '../student-whitelist.service';
import { resolveRequesterRole } from '../../../../lib/resolve-requester-role';

export const updateStudentWhitelistRoute = createRoute({
    method: 'patch',
    path: '/:id',
    tags: ['Student Whitelist'],
    summary: 'Update student whitelist record',
    description: 'Updates a whitelist record within the requester scope.',
    request: {
        params: updateStudentWhitelistSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateStudentWhitelistSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateStudentWhitelistSchema.response,
                },
            },
            description: 'Student whitelist record updated successfully',
        },
        400: {
            description: 'Bad Request',
        },
        403: {
            description: 'Forbidden',
        },
        404: {
            description: 'Not Found',
        },
        409: {
            description: 'Conflict',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const updateStudentWhitelistRouteHandler: AppRouteHandler<
    typeof updateStudentWhitelistRoute
> = async (c) => {
    try {
        const params = c.req.valid('param');
        const body = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const role = resolveRequesterRole(supabaseUser);

        const record = await StudentWhitelistService.updateStudentWhitelist(c.get('dbClient'), {
            id: params.id,
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
            requesterUserId: user.id,
            values: body,
        });

        return c.json(
            {
                message: 'Student whitelist record updated successfully',
                data: record,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update student whitelist error:', error);
        if (error.message.includes('Forbidden')) {
            return c.json({ error: error.message }, 403);
        }
        if (error.message.includes('not found')) {
            return c.json({ error: error.message }, 404);
        }
        if (error.message.includes('already exists')) {
            return c.json({ error: error.message }, 409);
        }
        if (error.message.includes('required') || error.message.includes('does not belong')) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: error.message || 'Internal Server Error' }, 500);
    }
};
