import { type DbClient } from '@sentinel/db';

export type GetTermRecordDataArgs = {
    dbClient: DbClient;
    termId: string;
};

export async function getTermRecordData({ dbClient, termId }: GetTermRecordDataArgs) {
    return await dbClient
        .selectFrom('terms')
        .select(['term_id', 'institution_id', 'start_date', 'end_date'])
        .where('term_id', '=', termId)
        .executeTakeFirst();
}
