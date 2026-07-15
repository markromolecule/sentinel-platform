import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';
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

vi.mock('./data', () => ({
    getAnalyticsKPIsData: vi.fn(),
    getAnalyticsIncidentSeverityData: vi.fn(),
    getAnalyticsIncidentTypeData: vi.fn(),
    getAnalyticsDepartmentIntegrityData: vi.fn(),
    getAnalyticsReportsData: vi.fn(),
    createAnalyticsReportData: vi.fn(),
    getAnalyticsExamCompletionsData: vi.fn(),
    getAnalyticsIncidentTrendsData: vi.fn(),
}));

vi.mock('../pdf-documents/queue/pdf-generation-queue.service', () => ({
    pdfGenerationQueueService: {
        submitPdfJob: vi.fn(),
    },
}));

vi.mock('../logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn(),
    },
}));

describe('AnalyticsService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getKPIs', () => {
        it('should fetch raw KPIs and return them mapped with calculated integrityIndex', async () => {
            vi.mocked(getAnalyticsKPIsData).mockResolvedValue({
                totalExams: 10,
                totalAttempts: 100,
                completedAttempts: 80,
                totalIncidents: 20,
                flaggedAttempts: 8,
                activeExams: 5,
            });

            const result = await AnalyticsService.getKPIs({
                dbClient,
                institutionId: 'inst-1',
            });

            expect(getAnalyticsKPIsData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
            });

            expect(result).toEqual({
                totalExams: 10,
                totalAttempts: 100,
                completedAttempts: 80,
                totalIncidents: 20,
                flaggedAttempts: 8,
                activeExams: 5,
                // integrityIndex = ((80 - 8) / 80) * 100 = (72 / 80) * 100 = 90
                integrityIndex: 90,
            });
        });

        it('should handle zero completed attempts gracefully returning 100% integrity index', async () => {
            vi.mocked(getAnalyticsKPIsData).mockResolvedValue({
                totalExams: 0,
                totalAttempts: 0,
                completedAttempts: 0,
                totalIncidents: 0,
                flaggedAttempts: 0,
                activeExams: 0,
            });

            const result = await AnalyticsService.getKPIs({
                dbClient,
            });

            expect(result.integrityIndex).toBe(100);
        });
    });

    describe('getIncidentSeverity', () => {
        it('should return incident severity distribution metrics', async () => {
            const mockMetrics = [
                { severity: 'LOW' as const, count: 5, percentage: 25 },
                { severity: 'MEDIUM' as const, count: 10, percentage: 50 },
                { severity: 'HIGH' as const, count: 5, percentage: 25 },
            ];
            vi.mocked(getAnalyticsIncidentSeverityData).mockResolvedValue(mockMetrics);

            const result = await AnalyticsService.getIncidentSeverity({
                dbClient,
                institutionId: 'inst-1',
            });

            expect(getAnalyticsIncidentSeverityData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
            });
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getIncidentType', () => {
        it('should return incident type distribution metrics', async () => {
            const mockMetrics = [
                { type: 'TAB_SWITCH', count: 8, percentage: 80 },
                { type: 'CAMERA_BLOCKED', count: 2, percentage: 20 },
            ];
            vi.mocked(getAnalyticsIncidentTypeData).mockResolvedValue(mockMetrics);

            const result = await AnalyticsService.getIncidentType({
                dbClient,
                institutionId: 'inst-1',
            });

            expect(getAnalyticsIncidentTypeData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
            });
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getDepartmentIntegrity', () => {
        it('should return department integrity metrics', async () => {
            const mockMetrics = [
                { department: 'CS', completed: 10, flagged: 1, dropped: 0 },
            ];
            vi.mocked(getAnalyticsDepartmentIntegrityData).mockResolvedValue(mockMetrics);

            const result = await AnalyticsService.getDepartmentIntegrity({
                dbClient,
                institutionId: 'inst-1',
            });

            expect(getAnalyticsDepartmentIntegrityData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
            });
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getReports', () => {
        it('should return paginated list of analytics report records with generatedAt mapped to ISO string', async () => {
            const date = new Date('2026-05-22T08:00:00.000Z');
            vi.mocked(getAnalyticsReportsData).mockResolvedValue({
                records: [
                    {
                        reportId: 'rep-1',
                        title: 'Weekly Summary',
                        type: 'completion',
                        generatedAt: date,
                        format: 'pdf',
                        status: 'READY',
                        fileUrl: 'http://cdn.com/rep-1.pdf',
                        createdBy: 'user-1',
                        creatorFirstName: 'John',
                        creatorLastName: 'Doe',
                        institutionId: 'inst-1',
                        failureCode: null,
                        failureMessage: null,
                        expiresAt: null,
                        retryCount: 0,
                    },
                ],
                total_records: 1,
                limit: 10,
                page: 1,
            });

            const result = await AnalyticsService.getReports({
                dbClient,
                institutionId: 'inst-1',
                limit: 10,
                page: 1,
            });

            expect(getAnalyticsReportsData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
                limit: 10,
                page: 1,
            });

            expect(result).toEqual({
                records: [
                    {
                        reportId: 'rep-1',
                        title: 'Weekly Summary',
                        type: 'completion',
                        generatedAt: '2026-05-22T08:00:00.000Z',
                        format: 'pdf',
                        status: 'READY',
                        fileUrl: 'http://cdn.com/rep-1.pdf',
                        createdBy: 'user-1',
                        creatorFirstName: 'John',
                        creatorLastName: 'Doe',
                        institutionId: 'inst-1',
                        failureCode: null,
                        failureMessage: null,
                        expiresAt: null,
                        retryCount: 0,
                    },
                ],
                total_records: 1,
                limit: 10,
                page: 1,
            });
        });
    });

    describe('generateReport', () => {
        it('should insert pending report row and enqueue a job to BullMQ', async () => {
            const date = new Date('2026-05-22T09:00:00.000Z');
            const mockInsertedRow = {
                report_id: 'new-rep-1',
                title: 'New Security Review',
                type: 'ANALYTICS_OVERALL',
                generated_at: date,
                format: 'pdf',
                status: 'PENDING',
                file_url: null,
                created_by: 'user-1',
                institution_id: 'inst-1',
                failure_code: null,
                failure_message: null,
                expires_at: null,
                retry_count: 0,
            };

            const mockDbClient = {
                insertInto: () => ({
                    values: () => ({
                        returningAll: () => ({
                            executeTakeFirstOrThrow: vi.fn().mockResolvedValue(mockInsertedRow),
                        }),
                    }),
                }),
            } as any;

            const result = await AnalyticsService.generateReport({
                dbClient: mockDbClient,
                userId: 'user-1',
                title: 'New Security Review',
                institutionId: 'inst-1',
                period: 'LAST_30_DAYS',
            });

            expect(result).toEqual({
                reportId: 'new-rep-1',
                title: 'New Security Review',
                type: 'ANALYTICS_OVERALL',
                generatedAt: '2026-05-22T09:00:00.000Z',
                format: 'pdf',
                status: 'PENDING',
                fileUrl: null,
                createdBy: 'user-1',
                institutionId: 'inst-1',
                failureCode: null,
                failureMessage: null,
                expiresAt: null,
                retryCount: 0,
            });
        });
    });

    describe('getExamCompletions', () => {
        it('should return exam completions grouped by day of week', async () => {
            const mockCompletions = [
                { name: 'Mon', completed: 5, dropped: 1 },
                { name: 'Tue', completed: 8, dropped: 0 },
            ];
            vi.mocked(getAnalyticsExamCompletionsData).mockResolvedValue(mockCompletions);

            const result = await AnalyticsService.getExamCompletions({
                dbClient,
                institutionId: 'inst-1',
            });

            expect(getAnalyticsExamCompletionsData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
            });
            expect(result).toEqual(mockCompletions);
        });
    });

    describe('getIncidentTrends', () => {
        it('should return incident weekly trend metrics', async () => {
            const mockTrends = [
                { name: 'Week 1', incidents: 4 },
                { name: 'Week 2', incidents: 7 },
            ];
            vi.mocked(getAnalyticsIncidentTrendsData).mockResolvedValue(mockTrends);

            const result = await AnalyticsService.getIncidentTrends({
                dbClient,
                institutionId: 'inst-1',
            });

            expect(getAnalyticsIncidentTrendsData).toHaveBeenCalledWith(dbClient, {
                institutionId: 'inst-1',
                startAt: expect.any(Date),
                endAtExclusive: expect.any(Date),
            });
            expect(result).toEqual(mockTrends);
        });
    });
});
