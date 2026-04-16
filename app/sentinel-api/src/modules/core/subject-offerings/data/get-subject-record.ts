import { type DbClient } from '@sentinel/db';

export type GetSubjectRecordDataArgs = {
    dbClient: DbClient;
    subjectId: string;
};

export async function getSubjectRecordData({ dbClient, subjectId }: GetSubjectRecordDataArgs) {
    return await dbClient
        .selectFrom('subjects')
        .select(['subject_id', 'institution_id'])
        .where('subject_id', '=', subjectId)
        .executeTakeFirst();
}
