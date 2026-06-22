import { type DbClient } from '@sentinel/db';

/**
 * Ensures that class groups are correctly generated for active subject offering sections.
 *
 * @param dbClient - The database client instance.
 */
export async function ensureClassGroupsForSubjectOfferings(dbClient: DbClient) {
    const missingClassGroups = await dbClient
        .selectFrom('subject_offering_sections as sos')
        .innerJoin('subject_offerings as so', 'so.subject_offering_id', 'sos.subject_offering_id')
        .leftJoin('class_groups as cg', (join) =>
            join
                .onRef('cg.subject_offering_id', '=', 'sos.subject_offering_id')
                .onRef('cg.section_id', '=', 'sos.section_id'),
        )
        .select([
            'sos.subject_offering_id',
            'sos.section_id',
            'so.subject_id',
            'so.term_id',
            'so.institution_id',
        ])
        .where('cg.class_group_id', 'is', null)
        .execute();

    if (missingClassGroups.length > 0) {
        await dbClient
            .insertInto('class_groups')
            .values(
                missingClassGroups.map((row) => ({
                    subject_id: row.subject_id,
                    subject_offering_id: row.subject_offering_id,
                    section_id: row.section_id,
                    term_id: row.term_id,
                    institution_id: row.institution_id,
                })),
            )
            .onConflict((conflict) =>
                conflict
                    .columns(['subject_id', 'section_id', 'term_id', 'institution_id'])
                    .doNothing(),
            )
            .execute();
    }
}
