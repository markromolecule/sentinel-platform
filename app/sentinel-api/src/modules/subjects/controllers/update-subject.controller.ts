import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { updateSubjectSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';
import { extractErrorCode } from '../helper/error-utils';

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

export const updateSubjectRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Subjects'],
    summary: 'Update a subject',
    description: 'Updates an existing subject.',
    request: {
        params: updateSubjectSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateSubjectSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateSubjectSchema.response,
                },
            },
            description: 'Subject updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Subject not found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateSubjectRouteHandler: AppRouteHandler<typeof updateSubjectRoute> = async (c) => {
    try {
        const { id } = c.req.valid('param');
        const body = c.req.valid('json');
        const user = c.get('user');

        const rawSubject = await SubjectService.updateSubject(c.get('dbClient'), id, {
            code: body.code,
            title: body.title,
            department_ids: body.department_ids,
            course_ids: body.course_ids,
            section_ids: body.section_ids,
            year_levels: body.year_levels,
            updated_by: user.id,
        });

        const subject = {
            subject_id: rawSubject.subject_id,
            subject_code: rawSubject.subject_code,
            subject_title: rawSubject.subject_title,
            department_ids: toStringArray(rawSubject.department_ids),
            course_ids: toStringArray(rawSubject.course_ids),
            section_ids: toStringArray(rawSubject.section_ids),
            year_levels: toNumberArray(rawSubject.year_levels),
            created_at: rawSubject.created_at,
            updated_at: rawSubject.updated_at,
            created_by: rawSubject.creator_first_name
                ? `${rawSubject.creator_first_name} ${rawSubject.creator_last_name}`
                : rawSubject.created_by,
            updated_by: rawSubject.updater_first_name
                ? `${rawSubject.updater_first_name} ${rawSubject.updater_last_name}`
                : rawSubject.updated_by,
        };

        return c.json(
            {
                message: 'Subject updated successfully',
                data: subject,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update subject error:', error);
        const code = extractErrorCode(error);
        if (code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Subject not found' }, 404);
        }
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Subject code already exists' }, 409);
        }
        if (code === 'INVALID_SUBJECT_PAYLOAD') {
            return c.json({ error: error?.message ?? 'Invalid subject payload' }, 400);
        }
        if (code === '23503' || code === '22P02') {
            return c.json(
                {
                    error: 'Some selected departments, courses, sections, or year levels are invalid',
                },
                400,
            );
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
