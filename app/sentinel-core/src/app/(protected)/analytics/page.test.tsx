import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AnalyticsPage from './page';

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-123',
        isLoading: false,
    }),
}));

vi.mock('@/data', () => ({
    useAnalyticsKPIsQuery: () => ({
        data: {
            violationsCount: 12,
            activeExamsCount: 5,
            flaggedSessionsCount: 3,
            integrityIndex: 94.5,
        },
        isLoading: false,
    }),
}));

vi.mock('./_utils/map-analytics-kpis', () => ({
    mapAnalyticsKPIs: () => [
        { label: 'Integrity Index', value: '94.5%', change: '+1.2%', changeType: 'increase' },
        { label: 'Active Exams', value: '5', change: '+25%', changeType: 'increase' },
        { label: 'Flagged Incidents', value: '3', change: '-10%', changeType: 'decrease' },
        { label: 'Total Violations', value: '12', change: '0%', changeType: 'neutral' },
    ],
}));

vi.mock('@/app/(protected)/analytics/_components', () => ({
    AnalyticsKPICards: () => <div data-testid="kpi-cards">KPI Cards Component</div>,
}));

vi.mock('./_components/layout', () => ({
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

describe('AnalyticsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the analytics overview page correctly with KPIs and domain quick links', () => {
        render(<AnalyticsPage />);

        // Assert shell and title
        expect(screen.getByTestId('analytics-page-shell')).toBeTruthy();
        expect(screen.getByText('System Reports & Analytics')).toBeTruthy();

        // Assert KPI Cards
        expect(screen.getByTestId('kpi-cards')).toBeTruthy();

        // Assert domain quick links render
        expect(screen.getByText('Analytics Telemetry Domains')).toBeTruthy();
        expect(screen.getByText('Incident Analytics')).toBeTruthy();
        expect(screen.getByText('Exam Performance')).toBeTruthy();
        expect(screen.getByText('Integrity by Department')).toBeTruthy();
        expect(screen.getByText('Generated Reports')).toBeTruthy();
    });
});
