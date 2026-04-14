import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { createSubjectSchema } from '../subject.dto';
import { SubjectService } from '../subject.service';
import { extractErrorCode } from '../helper/error-utils';
import {
    assertSubjectCatalogWriteAccess,
    buildRequesterAcademicScope,
} from '../../../_shared/academic-scope';

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

function toClassificationArray(value: unknown) {
    return Array.isArray(value)
        ? value
              .map((item: any) => ({
                  id: item?.id,
                  name: item?.name,
                  type: item?.type,
              }))
              .filter(
                  (item) =>
                      typeof item.id === 'string' &&
                      typeof item.name === 'string' &&
                      typeof item.type === 'string',
              )
        : [];
}

export const createSubjectRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Subjects'],
    summary: 'Create a subject',
    description: 'Creates a new subject.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createSubjectSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createSubjectSchema.response,
                },
            },
            description: 'Subject created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createSubjectRouteHandler: AppRouteHandler<typeof createSubjectRoute> = async (c) => {
    try {
        requireActivePermission(
            c,
            'subjects:create',
            'Forbidden. Missing subjects:create permission.',
        );
        const body = c.req.valid('json');
        const user = c.get('user');
        const supabaseUser = c.get('supabaseUser') as any;
        const scope = buildRequesterAcademicScope({
            requesterRole: supabaseUser?.user_metadata?.role,
            requesterInstitutionId: c.get('institutionId'),
            requesterDepartmentId: user.user_profiles?.department_id ?? null,
            requesterCourseId: user.user_profiles?.course_id ?? null,
        });

        assertSubjectCatalogWriteAccess(scope);

        const rawSubject = await SubjectService.createSubject(c.get('dbClient'), {
            code: body.code,
            title: body.title,
            created_by: user.id,
            institution_id: scope.requesterInstitutionId || null,
        });

        const subject = {
            subject_id: rawSubject.subject_id,
            subject_code: rawSubject.subject_code,
            subject_title: rawSubject.subject_title,
            term_id: rawSubject.term_id,
            is_opened: rawSubject.is_opened,
            offering_start_date: rawSubject.offering_start_date,
            offering_end_date: rawSubject.offering_end_date,
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
            classifications: toClassificationArray(rawSubject.classifications),
        };

        return c.json(
            {
                message: 'Subject created successfully',
                data: subject,
            },
            201,
        );
    } catch (error: any) {
        const code = extractErrorCode(error);
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Subject code already exists' }, 409);
        }
        if (code === 'INVALID_SUBJECT_PAYLOAD') {
            return c.json({ error: error?.message ?? 'Invalid subject payload' }, 400);
        }
        return respondWithRouteError(c, error, 'Create subject error:');
    }
};
