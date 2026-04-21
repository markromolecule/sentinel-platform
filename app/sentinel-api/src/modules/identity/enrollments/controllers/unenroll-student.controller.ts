import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteEnrollmentSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const unenrollStudentRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Enrollments', 'Instructor'],
    summary: 'Unenroll a student from a specific class group',
    description:
        'Allows an instructor to remove a student from a specific subject and section (class group) they manage.',
    request: {
        params: deleteEnrollmentSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteEnrollmentSchema.response,
                },
            },
            description: 'Unenrolled successfully',
        },
        403: { description: 'Forbidden' },
        404: { description: 'Enrollment not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const unenrollStudentRouteHandler: AppRouteHandler<typeof unenrollStudentRoute> = async (
    c,
) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id || supabaseUser?.id;

        if (role !== 'instructor' && role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { id: enrollmentId } = c.req.valid('param');
        const dbClient = c.get('dbClient');

        // If instructor, verify they manage the class group
        if (role === 'instructor') {
            const enrollment = await dbClient
                .selectFrom('enrollments')
                .select(['class_group_id'])
                .where('enrollment_id', '=', enrollmentId)
                .executeTakeFirst();

            if (!enrollment) {
                return c.json({ error: 'Enrollment record not found.' }, 404 as any);
            }

            const isAuthorized = await dbClient
                .selectFrom('class_roles as cr')
                .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
                .select(['cr.class_group_id'])
                .where('cr.class_group_id', '=', enrollment.class_group_id)
                .where('cr.user_id', '=', userId)
                .where('r.role_name', '=', 'instructor')
                .executeTakeFirst();

            if (!isAuthorized) {
                return c.json(
                    { error: 'Forbidden. You do not manage this enrollment.' },
                    403 as any,
                );
            }
        }

        await EnrollmentService.unenrollStudent(dbClient, enrollmentId);

        return c.json(
            {
                message: 'Student successfully unenrolled from the class group',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Unenroll student error:');
    }
};
