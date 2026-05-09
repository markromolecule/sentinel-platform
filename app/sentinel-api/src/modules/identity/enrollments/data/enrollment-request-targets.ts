import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { type EnrollInstructorSubjectBody } from '../enrollments.dto';

export type NormalizedEnrollmentRequestScope = {
    departmentIds: string[];
    courseIds: string[];
    yearLevels: number[];
    sectionIds: string[];
};

type ResolvedSubjectOffering = {
    subject_offering_id: string;
    subject_id: string;
    term_id: string;
    institution_id: string;
    status: string;
    classification_type: string | null;
    subject_code: string | null;
    subject_title: string | null;
};

function uniqueValues<T>(values: T[]) {
    return Array.from(new Set(values));
}

export function getNormalizedEnrollmentRequestScope(
    payload: EnrollInstructorSubjectBody,
): NormalizedEnrollmentRequestScope {
    const departmentIds =
        payload.department_ids.length > 0
            ? payload.department_ids
            : payload.department_id
              ? [payload.department_id]
              : [];
    const courseIds =
        payload.course_ids.length > 0
            ? payload.course_ids
            : payload.course_id
              ? [payload.course_id]
              : [];
    const yearLevels =
        payload.year_levels.length > 0
            ? payload.year_levels
            : typeof payload.year_level === 'number'
              ? [payload.year_level]
              : [];

    return {
        departmentIds: uniqueValues(departmentIds),
        courseIds: uniqueValues(courseIds),
        yearLevels: uniqueValues(yearLevels),
        sectionIds: uniqueValues(payload.section_ids),
    };
}

export async function resolveEnrollmentRequestTargets({
    dbClient,
    payload,
    instructorDepartmentId,
}: {
    dbClient: DbClient;
    payload: EnrollInstructorSubjectBody;
    instructorDepartmentId?: string | null;
}) {
    const subjectOffering = await dbClient
        .selectFrom('subject_offerings as so')
        .innerJoin('subjects as sub', 'sub.subject_id', 'so.subject_id')
        .leftJoin('subject_classification_subjects as scs', 'scs.subject_id', 'sub.subject_id')
        .leftJoin(
            'subject_classifications as scl',
            'scl.subject_classification_id',
            'scs.subject_classification_id',
        )
        .select([
            'so.subject_offering_id',
            'so.subject_id',
            'so.term_id',
            'so.institution_id',
            'so.status',
            'scl.classification_type',
            'sub.subject_code',
            'sub.subject_title',
        ])
        .where('so.subject_offering_id', '=', payload.subject_offering_id)
        .executeTakeFirst();

    if (!subjectOffering) {
        throw new HTTPException(404, { message: 'Offered subject not found' });
    }

    if (subjectOffering.status === 'CLOSED' || subjectOffering.status === 'ARCHIVED') {
        throw new HTTPException(400, {
            message: 'This offered subject is no longer open for enrollment',
        });
    }

    if (subjectOffering.classification_type === 'CORE' && instructorDepartmentId) {
        const hasAccess = await dbClient
            .selectFrom('subject_offering_departments')
            .where('subject_offering_id', '=', subjectOffering.subject_offering_id)
            .where('department_id', '=', instructorDepartmentId)
            .select('subject_offering_id')
            .executeTakeFirst();

        const isMultiDept = await dbClient
            .selectFrom('subject_offering_departments')
            .where('subject_offering_id', '=', subjectOffering.subject_offering_id)
            .select((eb) => eb.fn.count('department_id').as('count'))
            .executeTakeFirst();

        const multiDeptCount = Number(isMultiDept?.count ?? 0);

        if (!hasAccess && multiDeptCount <= 1) {
            throw new HTTPException(403, {
                message: 'Forbidden. This core subject is not available to your department.',
            });
        }
    }

    const normalizedScope = getNormalizedEnrollmentRequestScope(payload);
    const allowedSectionRows = await dbClient
        .selectFrom('subject_offering_sections as sos')
        .innerJoin('sections as sec', 'sec.section_id', 'sos.section_id')
        .select([
            'sos.section_id as section_id',
            'sec.department_id as department_id',
            'sec.course_id as course_id',
            'sec.year_level as year_level',
        ])
        .where('sos.subject_offering_id', '=', subjectOffering.subject_offering_id)
        .execute();

    const allowedSectionIds = new Set(allowedSectionRows.map((row) => row.section_id));
    let resolvedSectionIds = normalizedScope.sectionIds;

    if (resolvedSectionIds.length === 0) {
        resolvedSectionIds = allowedSectionRows
            .filter((row) => {
                const matchesDepartment =
                    normalizedScope.departmentIds.length === 0 ||
                    (row.department_id
                        ? normalizedScope.departmentIds.includes(row.department_id)
                        : false);
                const matchesCourse =
                    normalizedScope.courseIds.length === 0 ||
                    (row.course_id ? normalizedScope.courseIds.includes(row.course_id) : false);
                const matchesYear =
                    normalizedScope.yearLevels.length === 0 ||
                    (typeof row.year_level === 'number' &&
                        normalizedScope.yearLevels.includes(row.year_level));

                return matchesDepartment && matchesCourse && matchesYear;
            })
            .map((row) => row.section_id);
    }

    resolvedSectionIds = uniqueValues(resolvedSectionIds);

    const invalidSectionIds = resolvedSectionIds.filter(
        (sectionId) => !allowedSectionIds.has(sectionId),
    );

    if (invalidSectionIds.length > 0) {
        throw new HTTPException(400, {
            message: 'One or more selected sections do not belong to this offered subject',
        });
    }

    if (resolvedSectionIds.length === 0) {
        throw new HTTPException(400, {
            message: 'No offered sections matched the selected request audience',
        });
    }

    return {
        subjectOffering: subjectOffering as ResolvedSubjectOffering,
        normalizedScope,
        resolvedSectionIds,
    };
}

export async function ensureClassGroupsForResolvedSections({
    dbClient,
    subjectOffering,
    resolvedSectionIds,
}: {
    dbClient: DbClient;
    subjectOffering: ResolvedSubjectOffering;
    resolvedSectionIds: string[];
}) {
    const classGroups: Array<{ class_group_id: string; subject_offering_id: string | null }> = [];

    for (const sectionId of resolvedSectionIds) {
        let classGroup = await dbClient
            .selectFrom('class_groups')
            .select(['class_group_id', 'subject_offering_id'])
            .where('subject_id', '=', subjectOffering.subject_id)
            .where('section_id', '=', sectionId)
            .where('term_id', '=', subjectOffering.term_id)
            .where('institution_id', '=', subjectOffering.institution_id)
            .executeTakeFirst();

        if (!classGroup) {
            const inserted = await dbClient
                .insertInto('class_groups')
                .values({
                    subject_id: subjectOffering.subject_id,
                    subject_offering_id: subjectOffering.subject_offering_id,
                    section_id: sectionId,
                    term_id: subjectOffering.term_id,
                    institution_id: subjectOffering.institution_id,
                })
                .onConflict((conflict) =>
                    conflict
                        .columns(['subject_id', 'section_id', 'term_id', 'institution_id'])
                        .doNothing(),
                )
                .returning(['class_group_id', 'subject_offering_id'])
                .executeTakeFirst();

            if (inserted?.class_group_id) {
                classGroup = inserted;
            } else {
                classGroup = await dbClient
                    .selectFrom('class_groups')
                    .select(['class_group_id', 'subject_offering_id'])
                    .where('subject_id', '=', subjectOffering.subject_id)
                    .where('section_id', '=', sectionId)
                    .where('term_id', '=', subjectOffering.term_id)
                    .where('institution_id', '=', subjectOffering.institution_id)
                    .executeTakeFirstOrThrow();
            }
        }

        if (classGroup.subject_offering_id !== subjectOffering.subject_offering_id) {
            await dbClient
                .updateTable('class_groups')
                .set({
                    subject_offering_id: subjectOffering.subject_offering_id,
                })
                .where('class_group_id', '=', classGroup.class_group_id)
                .execute();

            classGroup.subject_offering_id = subjectOffering.subject_offering_id;
        }

        classGroups.push(classGroup);
    }

    return classGroups;
}
