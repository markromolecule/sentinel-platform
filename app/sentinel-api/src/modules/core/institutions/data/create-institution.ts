import { type DbClient } from '@sentinel/db';
import { type CreateInstitutionBody } from '../institution.dto';

export type CreateInstitutionDataArgs = {
    dbClient: DbClient;
    values: CreateInstitutionBody & {
        created_by: string;
    };
};

export async function createInstitutionData({ dbClient, values }: CreateInstitutionDataArgs) {
    const createdRecord = await dbClient
        .insertInto('institutions')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
    return createdRecord;
}

export type CreateInstitutionDataResponse = Awaited<ReturnType<typeof createInstitutionData>>;
