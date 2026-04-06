import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { deleteCourseSchema } from '../courses.dto';
import { CourseService } from '../courses.service';
import {
    assertCourseMutationAccess,
    assertCourseRecordInScope,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

export const deleteCourseRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Courses'],
    summary: 'Delete course',
    description: 'Deletes an existing course.',
    request: {
        params: deleteCourseSchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: deleteCourseSchema.response,
                },
            },
            description: 'Course deleted successfully',
        },
        404: {
            description: 'Course not found',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const deleteCourseRouteHandler: AppRouteHandler<typeof deleteCourseRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertCourseMutationAccess(scope);
        await assertCourseRecordInScope(c.get('dbClient'), scope, id);

        await CourseService.deleteCourse(c.get('dbClient'), id);

        return c.json(
            {
                message: 'Course deleted successfully',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        if (error?.status) {
            return c.json({ error: error.message }, error.status);
        }
        if (error.message === 'Course not found') {
            return c.json({ error: error.message }, 404);
        }
        console.error('Delete course error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
