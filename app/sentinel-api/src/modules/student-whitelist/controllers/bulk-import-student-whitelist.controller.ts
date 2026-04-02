import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { bulkImportStudentWhitelistSchema } from '../student-whitelist.dto';
import { StudentWhitelistService } from '../student-whitelist.service';

export const bulkImportStudentWhitelistRoute = createRoute({
    method: 'post',
    path: '/bulk',
    tags: ['Student Whitelist'],
    summary: 'Bulk import student whitelist records',
    description:
        'Creates multiple student whitelist records in one request with server-side validation.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: bulkImportStudentWhitelistSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: bulkImportStudentWhitelistSchema.response,
                },
            },
            description: 'Student whitelist import processed successfully',
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

export const bulkImportStudentWhitelistRouteHandler: AppRouteHandler<
    typeof bulkImportStudentWhitelistRoute
> = async (c) => {
    try {
        const body = c.req.valid('json');
        const supabaseUser = c.get('supabaseUser') as any;
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const role = supabaseUser?.user_metadata?.role;

        const result = await StudentWhitelistService.bulkImportStudentWhitelist(c.get('dbClient'), {
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
            requesterUserId: user.id,
            values: body,
        });

        return c.json(
            {
                message: 'Student whitelist import processed successfully',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        console.error('Bulk import student whitelist error:', error);
        if (error.message.includes('Forbidden')) {
            return c.json({ error: error.message }, 403);
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
