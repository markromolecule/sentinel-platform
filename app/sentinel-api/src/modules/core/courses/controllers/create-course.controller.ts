import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { createCourseSchema } from '../courses.dto';
import { CourseService } from '../courses.service';
import {
    assertCourseMutationAccess,
    buildRequesterAcademicScope,
    resolveCourseDepartmentForMutation,
} from '../../../_shared/academic-scope';
import { requireActivePermission } from '../../../../lib/permissions';

export const createCourseRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Courses'],
    summary: 'Create course',
    description: 'Creates a new course.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createCourseSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createCourseSchema.response,
                },
            },
            description: 'Course created successfully',
        },
        409: {
            description: 'Conflict: Course code already exists',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const createCourseRouteHandler: AppRouteHandler<typeof createCourseRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');
        const institutionId = c.get('institutionId');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const targetInstitutionId =
            role === 'support' ? (body.institution_id ?? institutionId) : institutionId;
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: targetInstitutionId,
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        requireActivePermission(
            c,
            'courses:create',
            'Forbidden. Missing courses:create permission.',
        );
        assertCourseMutationAccess(scope);
        const departmentId = await resolveCourseDepartmentForMutation(
            c.get('dbClient'),
            scope,
            body.department_id,
        );

        const newCourse = await CourseService.createCourse(c.get('dbClient'), {
            code: body.code,
            title: body.title,
            department_id: departmentId,
            description: body.description,
            created_by: user.id,
            institutionId: targetInstitutionId,
        });

        return c.json(
            {
                message: 'Course created successfully',
                data: {
                    course_id: newCourse.course_id,
                    code: newCourse.code,
                    title: newCourse.title,
                    department_id: newCourse.department_id,
                    description: newCourse.description,
                    created_at: newCourse.created_at,
                    updated_at: newCourse.updated_at,
                    created_by: newCourse.created_by,
                },
            },
            201,
        );
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            return c.json({ error: error.message }, 409);
        }
        return respondWithRouteError(c, error, 'Create course error:');
    }
};
