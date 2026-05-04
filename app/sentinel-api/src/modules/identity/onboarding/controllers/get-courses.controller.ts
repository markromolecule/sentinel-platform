import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getCoursesSchema } from '../onboarding.dto';
import { OnboardingService } from '../onboarding.service';

export const getOnboardingCoursesRoute = createRoute({
    method: 'get',
    path: '/courses',
    tags: ['Onboarding'],
    summary: 'Get list of courses during onboarding',
    description: 'Retrieves courses for a specific department or institution.',
    request: {
        query: getCoursesSchema.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getCoursesSchema.response,
                },
            },
            description: 'Courses fetched successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const getOnboardingCoursesRouteHandler: AppRouteHandler<
    typeof getOnboardingCoursesRoute
> = async (c) => {
    try {
        const { departmentId, institutionId } = c.req.valid('query');
        const rawCourses = await OnboardingService.getCourses(
            c.get('dbClient'),
            departmentId,
            institutionId,
        );

        const courses = rawCourses.map((course) => ({
            course_id: course.course_id,
            code: course.code,
            title: course.title,
            department_id: course.department_id,
            institution_id: course.institution_id,
            created_at: course.created_at,
            source_record_id: course.source_record_id ?? null,
            inheritance_status: course.inheritanceStatus ?? course.inheritance_status ?? 'LOCAL',
            origin_institution_id: course.originInstitutionId ?? course.institution_id ?? null,
            effective_institution_id:
                course.effectiveInstitutionId ?? course.institution_id ?? null,
            is_local: course.isLocal ?? false,
            is_inherited: course.isInherited ?? false,
            is_overridden: course.isOverridden ?? false,
            is_hidden: course.isHidden ?? false,
        }));

        return c.json(
            {
                message: 'Courses fetched successfully',
                data: courses,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch courses error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
