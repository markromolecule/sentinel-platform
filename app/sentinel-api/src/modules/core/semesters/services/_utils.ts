/**
 * Inheritance configuration used by upsertInheritedOverride and hideInheritedRecord
 * to know which table and columns to operate on for semesters (terms).
 */
export const SEMESTER_INHERITANCE_CONFIG = {
    table: 'terms',
    idColumn: 'term_id',
    copyColumns: ['academic_year', 'semester', 'is_active', 'start_date', 'end_date'],
};

/**
 * Builds a human-readable label for a semester from its academic year and term.
 *
 * @param academicYear - e.g. "2024-2025"
 * @param semester - e.g. "1st Semester"
 * @returns Formatted label string
 */
export function buildSemesterLabel(
    academicYear: string | null | undefined,
    semester: string | null | undefined,
) {
    if (academicYear && semester) {
        return `${academicYear} ${semester}`;
    }

    return semester || academicYear || 'Semester';
}

/**
 * Queries a semester summary (for label building) by its ID.
 *
 * @param dbClient - Database client
 * @param id - Term ID
 * @param institutionId - Optional institution context
 */
export async function getSemesterSummaryById(dbClient: any, id: string, institutionId?: string) {
    let query = dbClient
        .selectFrom('terms')
        .select(['term_id', 'academic_year', 'semester', 'institution_id'])
        .where('term_id', '=', id);

    if (institutionId) {
        query = query.where((eb: any) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    return await query.executeTakeFirst();
}
