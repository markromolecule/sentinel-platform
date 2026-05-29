import { type DbClient } from '@sentinel/db';
import {
    createAnalyticsReportData,
    getAnalyticsDepartmentIntegrityData,
    getAnalyticsIncidentSeverityData,
    getAnalyticsIncidentTypeData,
    getAnalyticsKPIsData,
    getAnalyticsReportsData,
    getAnalyticsExamCompletionsData,
    getAnalyticsIncidentTrendsData,
} from './data';
import { mapAnalyticsKPIs } from './services/map-analytics-kpis';
import { LogsService } from '../logs/logs.service';
import type {
    AnalyticsKPIsSummary,
    AnalyticsReport,
    DepartmentIntegrityMetric,
    IncidentSeverityDistribution,
    IncidentTypeDistribution,
    ExamCompletionMetric,
    IncidentTrendMetric,
    PaginatedAnalyticsReports,
} from './analytics.dto';

export class AnalyticsService {
    /**
     * Retrieves analytical KPIs for the institution, including calculated integrity index.
     *
     * @param args - Object containing dbClient and optional institutionId.
     * @returns Mapped KPI summary metrics.
     */
    static async getKPIs(args: {
        dbClient: DbClient;
        institutionId?: string;
    }): Promise<AnalyticsKPIsSummary> {
        const rawKPIs = await getAnalyticsKPIsData(args.dbClient, {
            institutionId: args.institutionId,
        });
        return mapAnalyticsKPIs(rawKPIs);
    }

    /**
     * Retrieves exam completion rates (completed vs dropped counts grouped by day of week).
     *
     * @param args - Object containing dbClient and optional institutionId.
     * @returns Exam completion metric details.
     */
    static async getExamCompletions(args: {
        dbClient: DbClient;
        institutionId?: string;
    }): Promise<ExamCompletionMetric[]> {
        return getAnalyticsExamCompletionsData(args.dbClient, {
            institutionId: args.institutionId,
        });
    }

    /**
     * Retrieves weekly incident counts for the last 5 weeks.
     *
     * @param args - Object containing dbClient and optional institutionId.
     * @returns Incident trend metric details.
     */
    static async getIncidentTrends(args: {
        dbClient: DbClient;
        institutionId?: string;
    }): Promise<IncidentTrendMetric[]> {
        return getAnalyticsIncidentTrendsData(args.dbClient, {
            institutionId: args.institutionId,
        });
    }

    /**
     * Retrieves incident severity distribution metrics.
     *
     * @param args - Object containing dbClient and optional institutionId.
     * @returns Incident severity distribution details.
     */
    static async getIncidentSeverity(args: {
        dbClient: DbClient;
        institutionId?: string;
    }): Promise<IncidentSeverityDistribution[]> {
        return getAnalyticsIncidentSeverityData(args.dbClient, {
            institutionId: args.institutionId,
        });
    }

    /**
     * Retrieves incident type distribution metrics.
     *
     * @param args - Object containing dbClient and optional institutionId.
     * @returns Incident type distribution details.
     */
    static async getIncidentType(args: {
        dbClient: DbClient;
        institutionId?: string;
    }): Promise<IncidentTypeDistribution[]> {
        return getAnalyticsIncidentTypeData(args.dbClient, {
            institutionId: args.institutionId,
        });
    }

    /**
     * Retrieves integrity metrics grouped by department.
     *
     * @param args - Object containing dbClient and optional institutionId.
     * @returns Department-wise integrity metric list.
     */
    static async getDepartmentIntegrity(args: {
        dbClient: DbClient;
        institutionId?: string;
    }): Promise<DepartmentIntegrityMetric[]> {
        return getAnalyticsDepartmentIntegrityData(args.dbClient, {
            institutionId: args.institutionId,
        });
    }

    /**
     * Retrieves a paginated list of generated analytics reports.
     *
     * @param args - Object containing dbClient, institutionId, limit and page.
     * @returns Paginated list of analytics report records.
     */
    static async getReports(args: {
        dbClient: DbClient;
        institutionId?: string;
        limit?: number;
        page?: number;
    }): Promise<PaginatedAnalyticsReports> {
        const result = await getAnalyticsReportsData(args.dbClient, {
            institutionId: args.institutionId,
            limit: args.limit,
            page: args.page,
        });

        return {
            records: result.records.map((r) => ({
                reportId: r.reportId,
                title: r.title,
                type: r.type,
                generatedAt: r.generatedAt ? r.generatedAt.toISOString() : null,
                format: r.format,
                status: r.status,
                fileUrl: r.fileUrl,
                createdBy: r.createdBy,
                creatorFirstName: r.creatorFirstName,
                creatorLastName: r.creatorLastName,
            })),
            total_records: result.total_records,
            limit: result.limit,
            page: result.page,
        };
    }

    /**
     * Generates a new analytics report record in the database.
     *
     * @param args - Object containing dbClient, userId, title, type and format.
     * @returns Newly created report record.
     */
    static async generateReport(args: {
        dbClient: DbClient;
        userId: string;
        title: string;
        type: 'completion' | 'incident' | 'performance';
        format: 'pdf' | 'csv' | 'xlsx';
    }): Promise<AnalyticsReport> {
        const createdRow = await createAnalyticsReportData(args.dbClient, {
            title: args.title,
            type: args.type,
            format: args.format,
            createdBy: args.userId,
            status: 'READY',
        });

        if (typeof args.dbClient.selectFrom === 'function') {
            try {
                const profile = await args.dbClient
                    .selectFrom('user_profiles')
                    .select(['institution_id'])
                    .where('user_id', '=', args.userId)
                    .executeTakeFirst();
                const activeInstitutionId = profile?.institution_id ?? undefined;

                if (activeInstitutionId) {
                    await LogsService.createLog(args.dbClient, {
                        userId: args.userId,
                        action: 'report.generated',
                        resourceType: 'report',
                        resourceId: createdRow.report_id,
                        activeInstitutionId,
                        details: {
                            reportId: createdRow.report_id,
                            title: createdRow.title,
                            type: createdRow.type,
                            format: createdRow.format,
                        },
                    });
                }
            } catch (logErr) {
                console.error('Failed to log report.generated:', logErr);
            }
        }

        return {
            reportId: createdRow.report_id,
            title: createdRow.title,
            type: createdRow.type,
            generatedAt: createdRow.generated_at ? createdRow.generated_at.toISOString() : null,
            format: createdRow.format,
            status: createdRow.status,
            fileUrl: createdRow.file_url,
            createdBy: createdRow.created_by,
        };
    }
}
