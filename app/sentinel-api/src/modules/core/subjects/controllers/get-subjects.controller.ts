import { Context } from 'hono';
import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler, type HonoEnv } from '../../../../types/hono';
import { getSubjectsSchema } from '../subject.dto';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '../../../_shared/academic-scope';
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
        requireActivePermission(c, 'subjects:view', 'Forbidden. Missing subjects:view permission.');
        const role = c.get('role');

        const { search, institutionId: requestedInstitutionId, page, pageSize } = c.req.valid('query');
        const institutionId = c.get('institutionId');

        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: (c.get('user') as any).user_profiles?.department_id ?? null,
            requesterCourseId: (c.get('user') as any).user_profiles?.course_id ?? null,
        });

        const queryScope = resolveAcademicQueryScope(scope, {
            requestedInstitutionId,
        });

        const subjectResult = await SubjectService.getSubjects(
            c.get('dbClient'),
            queryScope.institutionId || undefined,
            search,
            page,
            pageSize,
        );
        const subjects = Array.isArray(subjectResult) ? subjectResult : subjectResult.items;

        const mappedSubjects = subjects.map((subject: any) => ({
            subject_id: subject.subject_id,
            subject_code: subject.subject_code,
            subject_title: subject.subject_title,
            term_id: subject.term_id,
            is_opened: subject.is_opened,
            offering_start_date: subject.offering_start_date,
            offering_end_date: subject.offering_end_date,
            department_ids: toStringArray(subject.department_ids),
            course_ids: toStringArray(subject.course_ids),
            section_ids: toStringArray(subject.section_ids),
            year_levels: toNumberArray(subject.year_levels),
            created_at: subject.created_at,
            updated_at: subject.updated_at,
            created_by: subject.created_by,
            updated_by: subject.updated_by,
            source_record_id: subject.source_record_id,
            inheritance_status: subject.inheritance_status,
            origin_institution_id: subject.origin_institution_id,
            effective_institution_id: subject.effective_institution_id,
            is_local: subject.is_local,
            is_inherited: subject.is_inherited,
            is_overridden: subject.is_overridden,
            is_hidden: subject.is_hidden,
            institution_name: subject.institution_name,
            classifications: toClassificationArray(subject.classifications),
        }));

        return c.json(
            {
                message: 'Subjects retrieved successfully',
                data: mappedSubjects,
                ...(Array.isArray(subjectResult) ? {} : { pagination: subjectResult.pagination }),
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Get subjects error:');
    }
};
