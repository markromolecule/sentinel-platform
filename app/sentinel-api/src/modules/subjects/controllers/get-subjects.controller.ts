import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { getSubjectsSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';

function toStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
}

function toNumberArray(value: unknown): number[] {
    return Array.isArray(value)
        ? value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
        : [];
}

export const getSubjectsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Subjects'],
    summary: 'Get all subjects',
    description: 'Retrieves a list of all subjects.',
    request: getSubjectsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSubjectsSchema.response,
                },
            },
            description: 'Subjects retrieved successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const getSubjectsRouteHandler: AppRouteHandler<typeof getSubjectsRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;

        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        const { search } = c.req.valid('query');
        const rawSubjects = await SubjectService.getSubjects(c.get('dbClient'), search);

        const subjects = rawSubjects.map((subject: any) => ({
            subject_id: subject.subject_id,
            subject_code: subject.subject_code,
            subject_title: subject.subject_title,
            department_ids: toStringArray(subject.department_ids),
            course_ids: toStringArray(subject.course_ids),
            section_ids: toStringArray(subject.section_ids),
            year_levels: toNumberArray(subject.year_levels),
            created_at: subject.created_at,
            updated_at: subject.updated_at,
            created_by: subject.created_by,
            updated_by: subject.updated_by,
        }));

        return c.json(
            {
                message: 'Subjects retrieved successfully',
                data: subjects,
            },
            200,
        );
    } catch (error: any) {
        console.error('Get subjects error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
