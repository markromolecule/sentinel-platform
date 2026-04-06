import { type DbClient } from '@sentinel/db';

export type GetSubjectOfferingBaseRecordDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string | null;
};

export async function getSubjectOfferingBaseRecordData({
    dbClient,
    id,
    institutionId,
}: GetSubjectOfferingBaseRecordDataArgs) {
    let query = dbClient
        .selectFrom('subject_offerings')
        .select(['subject_offering_id', 'subject_id', 'term_id', 'institution_id', 'status'])
        .where('subject_offering_id', '=', id);

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
