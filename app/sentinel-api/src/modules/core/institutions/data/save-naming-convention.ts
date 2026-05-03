import { type DbClient } from '@sentinel/db';

export type SaveNamingConventionDataArgs = {
    dbClient: DbClient;
    values: {
        institution_id: string;
        section_code_format?: string | null;
        room_code_format?: string | null;
        naming_rules: unknown;
        created_by?: string | null;
        updated_by?: string | null;
    };
};

export async function saveNamingConventionData({
    dbClient,
    values,
}: SaveNamingConventionDataArgs) {
    return await dbClient
        .insertInto('institution_naming_conventions')
        .values({
            institution_id: values.institution_id,
            section_code_format: values.section_code_format ?? null,
            room_code_format: values.room_code_format ?? null,
            naming_rules: values.naming_rules,
            created_by: values.created_by ?? null,
            updated_by: values.updated_by ?? null,
            updated_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
            oc.column('institution_id').doUpdateSet({
                section_code_format: values.section_code_format ?? null,
                room_code_format: values.room_code_format ?? null,
                naming_rules: values.naming_rules,
                updated_by: values.updated_by ?? null,
                updated_at: new Date().toISOString(),
            }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();
}

export type SaveNamingConventionDataResponse = Awaited<
    ReturnType<typeof saveNamingConventionData>
>;
