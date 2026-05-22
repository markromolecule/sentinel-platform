import { type DbClient } from '@sentinel/db';
import {
    createAnalyticsReportData,
    getAnalyticsDepartmentIntegrityData,
    getAnalyticsIncidentSeverityData,
    getAnalyticsIncidentTypeData,
    getAnalyticsKPIsData,
    getAnalyticsReportsData,
} from './data';
import { mapAnalyticsKPIs } from './services/map-analytics-kpis';
import type {
    AnalyticsKPIsSummary,
    AnalyticsReport,
    DepartmentIntegrityMetric,
    IncidentSeverityDistribution,
    IncidentTypeDistribution,
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
