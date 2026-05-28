import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import IncidentsAnalyticsPage from './page';

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-123',
        isLoading: false,
    }),
}));

vi.mock('@/data', () => ({
    useAnalyticsIncidentSeverityQuery: () => ({
        data: [],
        isLoading: false,
    }),
    useAnalyticsIncidentTypeQuery: () => ({
        data: [],
        isLoading: false,
    }),
    useAnalyticsIncidentTrendsQuery: () => ({
        data: [],
        isLoading: false,
    }),
}));

vi.mock('@/app/(protected)/analytics/_components', () => ({
    IncidentTrendsChart: () => <div data-testid="trends-chart">Incident Trends Chart</div>,
    IncidentSeverityChart: () => <div data-testid="severity-chart">Incident Severity Chart</div>,
    IncidentByTypeChart: () => <div data-testid="by-type-chart">Incident By Type Chart</div>,
}));

vi.mock('../_components/layout', () => ({
    AnalyticsPageShell: ({
        children,
        title,
        description,
    }: {
        children: React.ReactNode;
        title: string;
        description: string;
    }) => (
        <div data-testid="analytics-page-shell">
            <h1>{title}</h1>
            <p>{description}</p>
            {children}
        </div>
    ),
}));

describe('IncidentsAnalyticsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders IncidentsAnalyticsPage correctly with its specific incident charts', () => {
        render(<IncidentsAnalyticsPage />);

        expect(screen.getByTestId('analytics-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Incident Analytics' })).toBeTruthy();
        expect(screen.getByTestId('trends-chart')).toBeTruthy();
        expect(screen.getByTestId('severity-chart')).toBeTruthy();
        expect(screen.getByTestId('by-type-chart')).toBeTruthy();
    });
});
