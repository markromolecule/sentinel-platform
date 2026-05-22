import { type DbClient } from '@sentinel/db';

export type CreateAnalyticsReportDataArgs = {
    title: string;
    type: string;
    format?: string;
    status?: string;
    fileUrl?: string;
    createdBy?: string;
};

export type CreatedAnalyticsReport = {
    report_id: string;
    title: string;
    type: string;
    generated_at: Date | null;
    format: string | null;
    status: string | null;
    file_url: string | null;
    created_by: string | null;
};

/**
 * Creates a new analytics report record in the database.
 */
export async function createAnalyticsReportData(
    dbClient: DbClient,
    args: CreateAnalyticsReportDataArgs,
): Promise<CreatedAnalyticsReport> {
    const {
        title,
        type,
        format = 'pdf',
        status = 'READY',
        fileUrl = null,
        createdBy = null,
    } = args;

    const row = await dbClient
        .insertInto('analytics_reports')
        .values({
            title,
            type,
            format,
            status,
            file_url: fileUrl,
            created_by: createdBy,
            generated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return {
        report_id: row.report_id,
        title: row.title,
        type: row.type,
        generated_at: row.generated_at ? new Date(row.generated_at) : null,
        format: row.format,
        status: row.status,
        file_url: row.file_url,
        created_by: row.created_by,
    };
}
