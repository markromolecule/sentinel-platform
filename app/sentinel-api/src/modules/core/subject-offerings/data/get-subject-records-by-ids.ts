import { type DbClient } from '@sentinel/db';

export type GetSubjectRecordsByIdsDataArgs = {
    dbClient: DbClient;
    subjectIds: string[];
};

export async function getSubjectRecordsByIdsData({
    dbClient,
    subjectIds,
}: GetSubjectRecordsByIdsDataArgs) {
    if (subjectIds.length === 0) {
        return [];
    }

    return await dbClient
        .selectFrom('subjects')
        .select(['subject_id', 'institution_id'])
        .where('subject_id', 'in', subjectIds)
        .execute();
}
