import { type DbClient } from '@sentinel/db';

export type CreateLogDataArgs = {
    dbClient: DbClient;
    values: {
        user_id?: string | null;
        action: string;
        resource_type?: string | null;
        resource_id?: string | null;
        details?: any;
        ip_address?: string | null;
        institution_id?: string | null;
        branch_id?: string | null;
        created_at?: Date;
    };
};

/**
 * Inserts a structured audit log entry into the database.
 * Ensures the details object is correctly formatted as a stringified JSON.
 *
 * @param args database client and record values
 * @returns the created audit log entry
 */
export async function createLogData({ dbClient, values }: CreateLogDataArgs) {
    const detailsVal = values.details
        ? typeof values.details === 'string'
            ? values.details
            : JSON.stringify(values.details)
        : null;

    return await dbClient
        .insertInto('audit_logs')
        .values({
            user_id: values.user_id ?? null,
            action: values.action,
            resource_type: values.resource_type ?? null,
            resource_id: values.resource_id ?? null,
            details: detailsVal as any,
            ip_address: values.ip_address ?? null,
            institution_id: values.institution_id ?? null,
            branch_id: values.branch_id ?? null,
            created_at: values.created_at ?? new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}
