import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Updateable } from 'kysely';
import { omitSubjectOfferingFields } from '../helper/subject-offering-compat';

export type UpdateSubjectDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['subjects']>;
    includeOfferingFields?: boolean;
};

export async function updateSubjectData({
    dbClient,
    id,
    values,
    includeOfferingFields = true,
}: UpdateSubjectDataArgs) {
    const updatedRecord = await dbClient
        .updateTable('subjects')
        .set(includeOfferingFields ? values : omitSubjectOfferingFields(values))
        .where('subject_id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateSubjectDataResponse = Awaited<ReturnType<typeof updateSubjectData>>;
