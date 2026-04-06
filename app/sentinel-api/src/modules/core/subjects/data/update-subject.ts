import { type DbClient } from '@sentinel/db';
import type { DB } from '@sentinel/db';
import { type Updateable } from 'kysely';
import { omitSubjectOfferingFields } from '../helper/subject-offering-compat';

export type UpdateSubjectDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['subjects']>;
    institutionId?: string;
    includeOfferingFields?: boolean;
};

export async function updateSubjectData({
    dbClient,
    id,
    values,
    institutionId,
    includeOfferingFields = true,
}: UpdateSubjectDataArgs) {
    let query = dbClient
        .updateTable('subjects')
        .set(includeOfferingFields ? values : omitSubjectOfferingFields(values))
        .where('subject_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const updatedRecord = await query.returningAll().executeTakeFirstOrThrow();

    return updatedRecord;
}

export type UpdateSubjectDataResponse = Awaited<ReturnType<typeof updateSubjectData>>;
