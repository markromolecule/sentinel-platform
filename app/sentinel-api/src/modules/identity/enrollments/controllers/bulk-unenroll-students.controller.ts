import { createRoute } from '@hono/zod-openapi';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { bulkDeleteEnrollmentSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

/**
 * OpenAPI route definition for bulk student unenrollment.
 */
export const bulkDeleteEnrollmentRoute = createRoute({
    method: 'delete',
    path: '/bulk',
    tags: ['Enrollments', 'Instructor'],
    summary: 'Bulk unenroll students from specific class groups',
    description:
        'Allows an instructor or administrator to remove multiple students from subjects and sections they manage in bulk.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: bulkDeleteEnrollmentSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: bulkDeleteEnrollmentSchema.response,
                },
            },
            description: 'Selected students unenrolled successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Enrollment not found' },
        500: { description: 'Internal Server Error' },
    },
});

/**
 * Route handler for bulk student unenrollment.
 * Validates role and permissions, ensures instructors only unenroll from class groups they manage,
 * and calls the unenroll service.
 *
 * @param c - Hono context
 */
export const bulkDeleteEnrollmentRouteHandler: AppRouteHandler<
    typeof bulkDeleteEnrollmentRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id || supabaseUser?.id;

        if (role !== 'instructor' && role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { enrollmentIds } = c.req.valid('json');
        const dbClient = c.get('dbClient');

        // If instructor, verify they manage the class groups for all selected enrollments
        if (role === 'instructor') {
            const enrollments = await dbClient
                .selectFrom('enrollments')
                .select(['enrollment_id', 'class_group_id'])
                .where('enrollment_id', 'in', enrollmentIds)
                .execute();

            if (enrollments.length !== enrollmentIds.length) {
                return c.json(
                    { error: 'Forbidden. One or more enrollment records not found.' },
                    404 as any,
                );
            }

            const classGroupIds = Array.from(new Set(enrollments.map((e) => e.class_group_id)));

            const authorizedGroups = await dbClient
                .selectFrom('class_roles as cr')
                .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
                .select(['cr.class_group_id'])
                .where('cr.class_group_id', 'in', classGroupIds)
                .where('cr.user_id', '=', userId)
                .where('r.role_name', '=', 'instructor')
                .execute();

            if (authorizedGroups.length !== classGroupIds.length) {
                return c.json(
                    { error: 'Forbidden. You do not manage all selected enrollments.' },
                    403 as any,
                );
            }
        }

        await EnrollmentService.bulkUnenrollStudents(dbClient, enrollmentIds);

        return c.json(
            {
                message: 'Students successfully unenrolled from the class groups',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Bulk unenroll student error:');
    }
};
