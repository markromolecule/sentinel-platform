import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { AnalyticsService } from '../analytics.service';
import {
    getAnalyticsKPIsRoute,
    getAnalyticsKPIsRouteHandler,
} from './get-analytics-kpis.controller';
import {
    getAnalyticsIncidentSeverityRoute,
    getAnalyticsIncidentSeverityRouteHandler,
} from './get-analytics-incident-severity.controller';
import {
    getAnalyticsIncidentTypeRoute,
    getAnalyticsIncidentTypeRouteHandler,
} from './get-analytics-incident-type.controller';
import {
    getAnalyticsDepartmentIntegrityRoute,
    getAnalyticsDepartmentIntegrityRouteHandler,
} from './get-analytics-department-integrity.controller';
import {
    getAnalyticsReportsRoute,
    getAnalyticsReportsRouteHandler,
} from './get-analytics-reports.controller';
import {
    generateAnalyticsReportRoute,
    generateAnalyticsReportRouteHandler,
} from './generate-analytics-report.controller';
import {
    getAnalyticsExamCompletionsRoute,
    getAnalyticsExamCompletionsRouteHandler,
} from './get-exam-completions.controller';
import {
    getAnalyticsIncidentTrendsRoute,
    getAnalyticsIncidentTrendsRouteHandler,
} from './get-incident-trends.controller';

vi.mock('../analytics.service', () => ({
    AnalyticsService: {
        getKPIs: vi.fn(),
        getIncidentSeverity: vi.fn(),
        getIncidentType: vi.fn(),
        getDepartmentIntegrity: vi.fn(),
        getReports: vi.fn(),
        generateReport: vi.fn(),
        getExamCompletions: vi.fn(),
        getIncidentTrends: vi.fn(),
    },
}));

describe('Analytics Controllers', () => {
    // Helper to create test app with injected variables and permissions
    function createTestApp(permissionKeys: string[]) {
        const app = new OpenAPIHono();

        app.use('*', async (c, next) => {
            c.set('dbClient', {} as any);
            c.set('user', { id: 'user-123' } as any);
            c.set('institutionId', 'inst-456');
            c.set('role', 'admin');
            c.set('activePermissionKeys', permissionKeys);
            await next();
        });

        app.openapi(getAnalyticsKPIsRoute, getAnalyticsKPIsRouteHandler);
        app.openapi(getAnalyticsIncidentSeverityRoute, getAnalyticsIncidentSeverityRouteHandler);
        app.openapi(getAnalyticsIncidentTypeRoute, getAnalyticsIncidentTypeRouteHandler);
        app.openapi(
            getAnalyticsDepartmentIntegrityRoute,
            getAnalyticsDepartmentIntegrityRouteHandler,
        );
        app.openapi(getAnalyticsReportsRoute, getAnalyticsReportsRouteHandler);
        app.openapi(generateAnalyticsReportRoute, generateAnalyticsReportRouteHandler);
        app.openapi(getAnalyticsExamCompletionsRoute, getAnalyticsExamCompletionsRouteHandler);
        app.openapi(getAnalyticsIncidentTrendsRoute, getAnalyticsIncidentTrendsRouteHandler);

        return app;
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /kpis', () => {
        it('fetches KPIs successfully when authorized', async () => {
            const mockKPIs = {
                totalExams: 12,
                totalAttempts: 150,
                completedAttempts: 120,
                totalIncidents: 10,
                flaggedAttempts: 6,
                activeExams: 4,
                integrityIndex: 95,
            };
            vi.spyOn(AnalyticsService, 'getKPIs').mockResolvedValue(mockKPIs);

            const app = createTestApp(['dashboard:view_analytics']);
            const res = await app.request('/kpis');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getKPIs).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
            });
            expect(body).toEqual({
                success: true,
                message: 'KPIs fetched successfully',
                data: mockKPIs,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/kpis');

            expect(res.status).toBe(403);
            expect(AnalyticsService.getKPIs).not.toHaveBeenCalled();
        });
    });

    describe('GET /incident-severity', () => {
        it('fetches severity distribution successfully when authorized', async () => {
            const mockData = [
                { severity: 'LOW' as const, count: 2, percentage: 20 },
                { severity: 'MEDIUM' as const, count: 5, percentage: 50 },
                { severity: 'HIGH' as const, count: 3, percentage: 30 },
            ];
            vi.spyOn(AnalyticsService, 'getIncidentSeverity').mockResolvedValue(mockData);

            const app = createTestApp(['dashboard:view_analytics']);
            const res = await app.request('/incident-severity');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getIncidentSeverity).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
            });
            expect(body).toEqual({
                success: true,
                message: 'Incident severity distribution fetched successfully',
                data: mockData,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/incident-severity');

            expect(res.status).toBe(403);
        });
    });

    describe('GET /incident-type', () => {
        it('fetches incident type distribution successfully when authorized', async () => {
            const mockData = [
                { type: 'TAB_SWITCH', count: 15, percentage: 75 },
                { type: 'FACE_NOT_FOUND', count: 5, percentage: 25 },
            ];
            vi.spyOn(AnalyticsService, 'getIncidentType').mockResolvedValue(mockData);

            const app = createTestApp(['dashboard:view_analytics']);
            const res = await app.request('/incident-type');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getIncidentType).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
            });
            expect(body).toEqual({
                success: true,
                message: 'Incident type distribution fetched successfully',
                data: mockData,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/incident-type');

            expect(res.status).toBe(403);
        });
    });

    describe('GET /department-integrity', () => {
        it('fetches department integrity metrics successfully when authorized', async () => {
            const mockData = [{ department: 'Engineering', completed: 80, flagged: 4, dropped: 2 }];
            vi.spyOn(AnalyticsService, 'getDepartmentIntegrity').mockResolvedValue(mockData);

            const app = createTestApp(['dashboard:view_analytics']);
            const res = await app.request('/department-integrity');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getDepartmentIntegrity).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
            });
            expect(body).toEqual({
                success: true,
                message: 'Department integrity metrics fetched successfully',
                data: mockData,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/department-integrity');

            expect(res.status).toBe(403);
        });
    });

    describe('GET /reports', () => {
        it('fetches paginated reports list successfully when authorized', async () => {
            const mockData = {
                records: [
                    {
                        reportId: 'rep-123',
                        title: 'Summary',
                        type: 'completion',
                        generatedAt: '2026-05-22T08:00:00.000Z',
                        format: 'pdf',
                        status: 'READY',
                        fileUrl: 'http://foo.com/rep.pdf',
                        createdBy: 'user-123',
                        creatorFirstName: 'Jane',
                        creatorLastName: 'Smith',
                    },
                ],
                total_records: 1,
                limit: 10,
                page: 1,
            };
            vi.spyOn(AnalyticsService, 'getReports').mockResolvedValue(mockData);

            const app = createTestApp(['reports:view']);
            const res = await app.request('/reports?limit=10&page=1');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getReports).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
                limit: 10,
                page: 1,
            });
            expect(body).toEqual({
                success: true,
                message: 'Reports fetched successfully',
                data: mockData,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/reports');

            expect(res.status).toBe(403);
        });
    });

    describe('POST /reports', () => {
        it('triggers report generation and returns 201 when authorized', async () => {
            const mockCreated = {
                reportId: 'rep-999',
                title: 'New Report',
                type: 'incident',
                generatedAt: '2026-05-22T08:30:00.000Z',
                format: 'pdf',
                status: 'READY',
                fileUrl: null,
                createdBy: 'user-123',
            };
            vi.spyOn(AnalyticsService, 'generateReport').mockResolvedValue(mockCreated);

            const app = createTestApp(['reports:view']);
            const res = await app.request('/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'New Report',
                    type: 'incident',
                    format: 'pdf',
                }),
            });
            const body = await res.json();

            expect(res.status).toBe(201);
            expect(AnalyticsService.generateReport).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                userId: 'user-123',
                title: 'New Report',
                type: 'incident',
                format: 'pdf',
            });
            expect(body).toEqual({
                success: true,
                message: 'Analytics report generated successfully',
                data: mockCreated,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics:view permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'New Report',
                    type: 'incident',
                    format: 'pdf',
                }),
            });

            expect(res.status).toBe(403);
        });
    });

    describe('GET /exam-completions', () => {
        it('fetches exam completions successfully when authorized', async () => {
            const mockCompletions = [
                { name: 'Mon', completed: 5, dropped: 1 },
                { name: 'Tue', completed: 10, dropped: 0 },
            ];
            vi.spyOn(AnalyticsService, 'getExamCompletions').mockResolvedValue(mockCompletions);

            const app = createTestApp(['dashboard:view_analytics']);
            const res = await app.request('/exam-completions');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getExamCompletions).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
            });
            expect(body).toEqual({
                success: true,
                message: 'Exam completions statistics fetched successfully',
                data: mockCompletions,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/exam-completions');

            expect(res.status).toBe(403);
        });
    });

    describe('GET /incident-trends', () => {
        it('fetches incident trends successfully when authorized', async () => {
            const mockTrends = [
                { name: 'Week 1', incidents: 3 },
                { name: 'Week 2', incidents: 8 },
            ];
            vi.spyOn(AnalyticsService, 'getIncidentTrends').mockResolvedValue(mockTrends);

            const app = createTestApp(['reports:view']);
            const res = await app.request('/incident-trends');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(AnalyticsService.getIncidentTrends).toHaveBeenCalledWith({
                dbClient: expect.any(Object),
                institutionId: 'inst-456',
            });
            expect(body).toEqual({
                success: true,
                message: 'Incident trends fetched successfully',
                data: mockTrends,
            });
        });

        it('returns 403 Forbidden if caller lacks analytics permission', async () => {
            const app = createTestApp([]);
            const res = await app.request('/incident-trends');

            expect(res.status).toBe(403);
        });
    });
});
