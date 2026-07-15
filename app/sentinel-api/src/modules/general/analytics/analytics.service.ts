import { type DbClient } from '@sentinel/db';
import {
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
import { resolvePdfReportPeriod } from '../pdf-documents/services/resolve-pdf-report-period';
import { pdfGenerationQueueService } from '../pdf-documents/queue/pdf-generation-queue.service';
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
            startAt: new Date(Date.now() - 5 * 7 * 24 * 3600 * 1000), // Fallback start range for live chart APIs
            endAtExclusive: new Date()
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
                institutionId: r.institutionId,
                failureCode: r.failureCode,
                failureMessage: r.failureMessage,
                expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
                retryCount: r.retryCount,
            })),
            total_records: result.total_records,
            limit: result.limit,
            page: result.page,
        };
    }

    /**
     * Enqueues a new overall analytics PDF generation job and returns the pending database record.
     */
    static async generateReport(args: {
        dbClient: DbClient;
        userId: string;
        title: string;
        institutionId?: string | null;
        period: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'CUSTOM';
        startDate?: string | null;
        endDate?: string | null;
        timezone?: string;
    }): Promise<AnalyticsReport> {
        const { startAt, endAtExclusive } = resolvePdfReportPeriod({
            preset: args.period,
            start_date: args.startDate || undefined,
            end_date: args.endDate || undefined,
        });

        const PERIOD_LABELS: Record<string, string> = {
            LAST_7_DAYS: 'Last 7 Days',
            LAST_30_DAYS: 'Last 30 Days',
            LAST_90_DAYS: 'Last 90 Days',
            CUSTOM: 'Custom Range',
        };
        const periodLabel = PERIOD_LABELS[args.period] ?? args.period;

        // Insert pending report row
        const createdRow = await args.dbClient
            .insertInto('analytics_reports')
            .values({
                title: args.title,
                type: 'ANALYTICS_OVERALL',
                format: 'pdf',
                status: 'PENDING',
                created_by: args.userId,
                institution_id: args.institutionId || null,
                period_start_at: startAt,
                period_end_at: endAtExclusive,
                timezone: args.timezone || 'Asia/Manila',
                retry_count: 0,
                request_snapshot: JSON.stringify({
                    period: args.period,
                    startDate: args.startDate,
                    endDate: args.endDate,
                    timezone: args.timezone,
                    periodLabel
                })
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        // Enqueue the generation task in BullMQ
        await pdfGenerationQueueService.submitPdfJob(createdRow.report_id, 'ANALYTICS_OVERALL');

        // Audit Log if institution scoping is set
        if (createdRow.institution_id) {
            try {
                await LogsService.createLog(args.dbClient, {
                    userId: args.userId,
                    action: 'PDF_EXPORT_REQUESTED',
                    activeInstitutionId: createdRow.institution_id,
                    details: {
                        reportId: createdRow.report_id,
                        period: args.period,
                        periodLabel
                    }
                });
            } catch (logErr) {
                console.error('Failed to log PDF_EXPORT_REQUESTED:', logErr);
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
            institutionId: createdRow.institution_id,
            failureCode: createdRow.failure_code,
            failureMessage: createdRow.failure_message,
            expiresAt: createdRow.expires_at ? createdRow.expires_at.toISOString() : null,
            retryCount: Number(createdRow.retry_count ?? 0)
        };
    }
}
