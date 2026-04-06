import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { unenrollInstructorSubjectSchema } from '../enrollments.dto';
import { EnrollmentService } from '../enrollments.service';

export const unenrollInstructorSubjectRoute = createRoute({
    method: 'delete',
    path: '/{id}/unenroll',
    tags: ['Subjects', 'Instructor'],
    summary: 'Remove an instructor from an offered subject',
    description:
        "Removes an instructor's enrollment requests or active roles for a specific offered subject across selected sections.",
    request: {
        params: unenrollInstructorSubjectSchema.params,
        query: unenrollInstructorSubjectSchema.query,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: unenrollInstructorSubjectSchema.response,
                },
            },
            description: 'Unenrolled successfully',
        },
        400: { description: 'Bad Request' },
        403: { description: 'Forbidden' },
        500: { description: 'Internal Server Error' },
    },
});

export const unenrollInstructorSubjectRouteHandler: AppRouteHandler<
    typeof unenrollInstructorSubjectRoute
> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const userId = c.get('user')?.id || supabaseUser?.id;

        if (!userId) {
            return c.json({ error: 'Unauthorized. User ID not found.' }, 401 as any);
        }

        if (role !== 'instructor') {
            return c.json(
                { error: 'Forbidden. Only instructors can remove their offered-subject assignments.' },
                403 as any,
            );
        }

        const { id: subjectId } = c.req.valid('param');
        const { status } = c.req.valid('query');

        // Hono's query parsing can be tricky with arrays. 
        // We ensure we get an array of UUIDs using queries() or the validated value.
        const rawClassGroupIds = c.req.queries('class_group_ids') || [];
        const validatedClassGroupIds = (c.req.valid('query') as any).class_group_ids || [];
        
        // Merge and deduplicate just to be safe, filtering for valid UUIDs
        const class_group_ids = Array.from(new Set([...rawClassGroupIds, ...validatedClassGroupIds])).filter(
            (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
        );

        await EnrollmentService.unenrollInstructorSubject(
            c.get('dbClient'),
            userId,
            subjectId,
            status,
            class_group_ids,
        );

        return c.json(
            {
                message: 'Instructor successfully unenrolled from subject',
                data: null,
            },
            200,
        );
    } catch (error: any) {
        console.error('Unenroll subject error:', error);
        return c.json({ error: error?.message || 'Internal Server Error' }, 500);
    }
};
