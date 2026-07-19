import { type DbClient } from '@sentinel/db';
import { resolveRelatedInstitutions } from '../../notification/helper/resolve-related-institutions';

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
    institutionId: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    expiresAt: Date | null;
    retryCount: number;
};

export type GetAnalyticsReportsResult = {
    records: AnalyticsReportRecord[];
    total_records: number;
    limit: number;
    page: number;
};

/**
 * Retrieves a paginated list of generated analytics reports.
 * Filters directly on analytics_reports.institution_id and excludes legacy null-institution rows.
 */
export async function getAnalyticsReportsData(
    dbClient: DbClient,
    args: GetAnalyticsReportsDataArgs,
): Promise<GetAnalyticsReportsResult> {
    const { institutionId, limit = 10, page = 1 } = args;
    const offset = (page - 1) * limit;

    const institutionIds = institutionId
        ? await resolveRelatedInstitutions(dbClient, institutionId)
        : [];

    let baseQuery = dbClient
        .selectFrom('analytics_reports as ar')
        .leftJoin('user_profiles as up', 'up.user_id', 'ar.created_by');

    if (institutionIds.length > 0) {
        baseQuery = baseQuery.where('ar.institution_id', 'in', institutionIds);
    } else {
        baseQuery = baseQuery.where('ar.institution_id', 'is not', null);
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
            'ar.institution_id as institutionId',
            'ar.failure_code as failureCode',
            'ar.failure_message as failureMessage',
            'ar.expires_at as expiresAt',
            'ar.retry_count as retryCount',
        ])
        .orderBy('ar.generated_at', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();

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
        institutionId: r.institutionId,
        failureCode: r.failureCode,
        failureMessage: r.failureMessage,
        expiresAt: r.expiresAt ? new Date(r.expiresAt) : null,
        retryCount: Number(r.retryCount ?? 0),
    }));

    return {
        records: mappedRecords,
        total_records: totalRecords,
        limit,
        page,
    };
}
