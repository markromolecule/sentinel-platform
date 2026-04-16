import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type HasTermsUpdatedAtColumnDataArgs = {
    dbClient: DbClient;
};

export async function hasTermsUpdatedAtColumnData({ dbClient }: HasTermsUpdatedAtColumnDataArgs) {
    const result = await sql<{ exists: boolean }>`
        select exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
                and table_name = 'terms'
                and column_name = 'updated_at'
        ) as exists
    `.execute(dbClient);

    return Boolean(result.rows[0]?.exists);
}
