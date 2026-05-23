import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import AnalyticsPage from './page';

// Mock ResizeObserver globally for JSDOM
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock Recharts ResponsiveContainer to prevent size calculation errors in JSDOM
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal<typeof import('recharts')>();
    return {
        ...original,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="mock-responsive-container">{children}</div>
        ),
    };
});

// Mock UI elements that might use complex icons or sub-components
vi.mock('@sentinel/ui', async (importOriginal) => {
    const original = await importOriginal<typeof import('@sentinel/ui')>();
    return {
        ...original,
        PageHeader: ({
            title,
            description,
        }: {
            title: React.ReactNode;
            description?: React.ReactNode;
        }) => (
            <div data-testid="page-header">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        ),
    };
});

// Mock the core hook data layer
vi.mock('@/data', () => {
    return {
        useAnalyticsKPIsQuery: vi.fn(() => ({
            data: {
                totalExams: 10,
                totalAttempts: 1500,
                completedAttempts: 1400,
                totalIncidents: 45,
                flaggedAttempts: 32,
                activeExams: 2,
                integrityIndex: 96.5,
            },
            isLoading: false,
        })),
        useAnalyticsIncidentSeverityQuery: vi.fn(() => ({
            data: [
                { severity: 'HIGH', count: 10, percentage: 22.2 },
                { severity: 'MEDIUM', count: 15, percentage: 33.3 },
                { severity: 'LOW', count: 20, percentage: 44.4 },
            ],
            isLoading: false,
        })),
        useAnalyticsIncidentTypeQuery: vi.fn(() => ({
            data: [
                { type: 'TAB_SWITCH', count: 20, percentage: 50 },
                { type: 'GAZE', count: 20, percentage: 50 },
            ],
            isLoading: false,
        })),
        useAnalyticsDepartmentIntegrityQuery: vi.fn(() => ({
            data: [{ department: 'Computer Science', completed: 100, flagged: 5, dropped: 2 }],
            isLoading: false,
        })),
        useAnalyticsReportsQuery: vi.fn(() => ({
            data: {
                records: [
                    {
                        reportId: '1',
                        title: 'Test Incident Report',
                        type: 'incident',
                        generatedAt: '2026-05-22T10:00:00Z',
                        format: 'pdf',
                        status: 'ready',
                        fileUrl: 'http://example.com/report1.pdf',
                        createdBy: 'admin-id',
                    },
                ],
                total_records: 1,
                limit: 10,
                page: 1,
            },
            isLoading: false,
        })),
        useGenerateAnalyticsReportMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false,
        })),
        useAnalyticsExamCompletionsQuery: vi.fn(() => ({
            data: [
                { name: 'Mon', completed: 10, dropped: 1 },
                { name: 'Tue', completed: 15, dropped: 2 },
            ],
            isLoading: false,
        })),
        useAnalyticsIncidentTrendsQuery: vi.fn(() => ({
            data: [
                { name: 'Week 1', incidents: 5 },
                { name: 'Week 2', incidents: 10 },
            ],
            isLoading: false,
        })),
    };
});

// Mock academic scope hook to provide a dummy institutionId
vi.mock('@/hooks/use-academic-scope', () => {
    return {
        useAcademicScope: vi.fn(() => ({
            institutionId: 'inst-123',
            isLoading: false,
            role: 'admin',
        })),
    };
});

describe('Analytics Dashboard Page Route Smoke Test', () => {
    it('renders the header correctly with title and description', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('System Reports & Analytics').length).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText(
                'Real-time telemetry, session metrics, and integrity insights for the sentinel proctoring system.',
            ).length,
        ).toBeGreaterThanOrEqual(1);
    });

    it('renders key KPI cards correctly with labels and mocked values', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('Total Exams').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Monitored Sessions').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Flagged Incidents').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Flagged Attempts').length).toBeGreaterThanOrEqual(1);

        // Check values defined in our mock telemetry data
        expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('1,500').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('45').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('32').length).toBeGreaterThanOrEqual(1);
    });

    it('renders visual chart cards successfully', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('Exam Completion Rates').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Incident Trends').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Incidents by Violation Type').length).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText('Department Integrity Distribution').length,
        ).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Incident Severity Proportions').length).toBeGreaterThanOrEqual(
            1,
        );
    });

    it('renders generated reports list successfully with mocked row', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('Available Reports').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Test Incident Report').length).toBeGreaterThanOrEqual(1);
    });
});
