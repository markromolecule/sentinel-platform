import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { purgeStudentWhitelistSchema } from '../student-whitelist.dto';
import { StudentWhitelistService } from '../student-whitelist.service';

export const purgeStudentWhitelistRoute = createRoute({
    method: 'post',
    path: '/purge',
    tags: ['Student Whitelist'],
    summary: 'Purge student whitelist records',
    description:
        'Deletes whitelist records within the requester scope. Claimed records are skipped unless explicitly included.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: purgeStudentWhitelistSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: purgeStudentWhitelistSchema.response,
                },
            },
            description: 'Student whitelist records purged successfully',
        },
        403: {
            description: 'Forbidden',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const purgeStudentWhitelistRouteHandler: AppRouteHandler<
    typeof purgeStudentWhitelistRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const role = supabaseUser?.user_metadata?.role;

        const result = await StudentWhitelistService.purgeStudentWhitelist(c.get('dbClient'), {
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
            values: body,
        });

        return c.json(
            {
                message: 'Student whitelist records purged successfully',
                data: {
                    deleted_count: result.deletedCount,
                    skipped_claimed_count: result.skippedClaimedCount,
                },
            },
            200,
        );
    } catch (error: any) {
        console.error('Purge student whitelist error:', error);
        if (error.message.includes('Forbidden')) {
            return c.json({ error: error.message }, 403);
        }
        return c.json({ error: error.message || 'Internal Server Error' }, 500);
    }
};
