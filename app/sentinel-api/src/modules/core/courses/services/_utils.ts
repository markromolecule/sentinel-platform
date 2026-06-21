import { type DbClient } from '@sentinel/db';

export const COURSE_INHERITANCE_CONFIG = {
    table: 'courses',
    idColumn: 'course_id',
    copyColumns: ['code', 'title', 'department_id', 'description', 'created_by', 'updated_by'],
};

/**
 * Builds a human-readable label for a course from its code and title.
 */
export function buildCourseLabel(
    code: string | null | undefined,
    title: string | null | undefined,
) {
    if (code && title) {
        return `${code} - ${title}`;
    }

    return title || code || 'Course';
}

/**
 * Fetches a minimal course summary by ID, optionally scoped to an institution.
 */
export async function getCourseSummaryById(
    dbClient: DbClient,
    id: string,
    institutionId?: string,
) {
    let query = dbClient
        .selectFrom('courses')
        .select(['course_id', 'code', 'title', 'institution_id'])
        .where('course_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    return await query.executeTakeFirst();
}
