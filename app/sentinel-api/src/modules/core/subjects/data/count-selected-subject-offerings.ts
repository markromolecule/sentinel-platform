import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { supportsSubjectOfferingTables } from '../../subject-offerings/helper/subject-offering-compat';

export async function countSelectedSubjectOfferingsData(dbClient: DbClient, ids: string[]) {
    const subjectOfferingTablesSupported = await supportsSubjectOfferingTables(dbClient);

    if (!subjectOfferingTablesSupported) {
        return 0;
    }

    const result = await dbClient
        .selectFrom('subject_offerings')
        .select(sql<number>`count(*)::int`.as('count'))
        .where('subject_id', 'in', ids)
        .executeTakeFirst();

    return result?.count ?? 0;
}
