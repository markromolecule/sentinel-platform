import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getAnalyticsKPIsDataMock,
    getAnalyticsIncidentSeverityDataMock,
    getAnalyticsIncidentTypeDataMock,
    getAnalyticsDepartmentIntegrityDataMock,
} = vi.hoisted(() => ({
    getAnalyticsKPIsDataMock: vi.fn(),
    getAnalyticsIncidentSeverityDataMock: vi.fn(),
    getAnalyticsIncidentTypeDataMock: vi.fn(),
    getAnalyticsDepartmentIntegrityDataMock: vi.fn(),
}));

vi.mock('../data/get-analytics-kpis', () => ({
    getAnalyticsKPIsData: getAnalyticsKPIsDataMock,
}));

vi.mock('../data/get-analytics-incident-severity', () => ({
    getAnalyticsIncidentSeverityData: getAnalyticsIncidentSeverityDataMock,
}));

vi.mock('../data/get-analytics-incident-type', () => ({
    getAnalyticsIncidentTypeData: getAnalyticsIncidentTypeDataMock,
}));

vi.mock('../data/get-analytics-department-integrity', () => ({
    getAnalyticsDepartmentIntegrityData: getAnalyticsDepartmentIntegrityDataMock,
}));

import { BuildOverallAnalyticsSnapshotService } from './build-overall-analytics-snapshot.service';

describe('BuildOverallAnalyticsSnapshotService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('maps KPI and department metrics into the PDF snapshot', async () => {
        getAnalyticsKPIsDataMock.mockResolvedValue({
            totalExams: 10,
            totalAttempts: 32,
            completedAttempts: 16,
            totalIncidents: 7,
            flaggedAttempts: 3,
            activeExams: 4,
            averageScore: 81.4,
            passRate: 75,
        });
        getAnalyticsIncidentSeverityDataMock.mockResolvedValue([]);
        getAnalyticsIncidentTypeDataMock.mockResolvedValue([]);
        getAnalyticsDepartmentIntegrityDataMock.mockResolvedValue([
            {
                department: 'Engineering',
                completed: 10,
                flagged: 2,
                dropped: 1,
                courseCount: 3,
                studentCount: 24,
                averageScore: 83.2,
            },
        ]);

        const dbClient = {
            selectFrom: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        executeTakeFirst: vi.fn().mockResolvedValue({ name: 'Sentinel University' }),
                    }),
                }),
            }),
        } as any;

        const result = await BuildOverallAnalyticsSnapshotService.buildSnapshot({
            dbClient,
            institutionId: 'inst-1',
            startAt: new Date('2026-07-01T00:00:00.000Z'),
            endAtExclusive: new Date('2026-08-01T00:00:00.000Z'),
            periodLabel: 'Last 30 Days',
        });

        expect(result.kpis.averageScore).toBe(81.4);
        expect(result.kpis.passRate).toBe(75);
        expect(result.departments[0]).toMatchObject({
            departmentName: 'Engineering',
            courseCount: 3,
            studentCount: 24,
            averageScore: 83.2,
            integrityRate: 80,
        });
    });
});
