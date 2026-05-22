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
                { type: 'MULTIPLE_PEOPLE', count: 12, percentage: 60 },
                { type: 'TAB_SWITCH', count: 8, percentage: 40 },
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
                { department: 'Computer Science', completed: 45, flagged: 2, dropped: 1 },
                { department: 'Information Technology', completed: 30, flagged: 4, dropped: 2 },
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
                    },
                ],
                total_records: 1,
                limit: 10,
                page: 1,
            });
        });
    });

    describe('generateReport', () => {
        it('should call createAnalyticsReportData and return the newly generated report record in camelCase', async () => {
            const date = new Date('2026-05-22T09:00:00.000Z');
            vi.mocked(createAnalyticsReportData).mockResolvedValue({
                report_id: 'new-rep-1',
                title: 'New Security Review',
                type: 'incident',
                generated_at: date,
                format: 'pdf',
                status: 'READY',
                file_url: null,
                created_by: 'user-1',
            });

            const result = await AnalyticsService.generateReport({
                dbClient,
                userId: 'user-1',
                title: 'New Security Review',
                type: 'incident',
                format: 'pdf',
            });

            expect(createAnalyticsReportData).toHaveBeenCalledWith(dbClient, {
                title: 'New Security Review',
                type: 'incident',
                format: 'pdf',
                createdBy: 'user-1',
                status: 'READY',
            });

            expect(result).toEqual({
                reportId: 'new-rep-1',
                title: 'New Security Review',
                type: 'incident',
                generatedAt: '2026-05-22T09:00:00.000Z',
                format: 'pdf',
                status: 'READY',
                fileUrl: null,
                createdBy: 'user-1',
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
            });
            expect(result).toEqual(mockTrends);
        });
    });
});
