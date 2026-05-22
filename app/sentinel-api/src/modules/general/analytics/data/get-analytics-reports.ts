import { type DbClient } from '@sentinel/db';

export type GetAnalyticsReportsDataArgs = {
    institutionId?: string;
    limit?: number;
    page?: number;
};

export type AnalyticsReportRecord = {
    reportId: string;
    title: string;
    type: string;
    generatedAt: Date | null;
    format: string | null;
    status: string | null;
    fileUrl: string | null;
    createdBy: string | null;
    creatorFirstName: string | null;
    creatorLastName: string | null;
};

export type GetAnalyticsReportsResult = {
    records: AnalyticsReportRecord[];
    total_records: number;
    limit: number;
    page: number;
};

/**
 * Retrieves a paginated list of generated analytics reports.
 */
export async function getAnalyticsReportsData(
    dbClient: DbClient,
    args: GetAnalyticsReportsDataArgs,
): Promise<GetAnalyticsReportsResult> {
    const { institutionId, limit = 10, page = 1 } = args;
    const offset = (page - 1) * limit;

    let baseQuery = dbClient
        .selectFrom('analytics_reports as ar')
        .leftJoin('user_profiles as up', 'up.user_id', 'ar.created_by');

    if (institutionId) {
        baseQuery = baseQuery.where('up.institution_id', '=', institutionId);
    }

    const countRes = await baseQuery
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();
    const totalRecords = Number(countRes?.count ?? 0);

    const records = await baseQuery
        .select([
            'ar.report_id as reportId',
            'ar.title',
            'ar.type',
            'ar.generated_at as generatedAt',
            'ar.format',
            'ar.status',
            'ar.file_url as fileUrl',
            'ar.created_by as createdBy',
            'up.first_name as creatorFirstName',
            'up.last_name as creatorLastName',
        ])
        .orderBy('ar.generated_at', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();

    // Map Kysely output explicitly to ensure Date types remain clean
    const mappedRecords = records.map((r) => ({
        reportId: r.reportId,
        title: r.title,
        type: r.type,
        generatedAt: r.generatedAt ? new Date(r.generatedAt) : null,
        format: r.format,
        status: r.status,
        fileUrl: r.fileUrl,
        createdBy: r.createdBy,
        creatorFirstName: r.creatorFirstName,
        creatorLastName: r.creatorLastName,
    }));

    return {
        records: mappedRecords,
        total_records: totalRecords,
        limit,
        page,
    };
}
