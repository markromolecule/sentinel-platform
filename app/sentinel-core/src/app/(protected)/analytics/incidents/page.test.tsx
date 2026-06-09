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
    useAnalyticsIncidentTypeQuery: () => ({
        data: [
            { type: 'TAB_SWITCH', count: 5, percentage: 50 },
            { type: 'GAZE', count: 3, percentage: 30 },
            { type: 'AUDIO_DETECTED', count: 2, percentage: 20 },
        ],
        isLoading: false,
    }),
}));

vi.mock('./_components/incident-analytics-overview', () => ({
    IncidentAnalyticsOverview: () => <div data-testid="incident-overview">Incident Overview</div>,
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

    it('renders IncidentsAnalyticsPage correctly with its incident overview', () => {
        render(<IncidentsAnalyticsPage />);

        expect(screen.getByTestId('analytics-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Incident Analytics' })).toBeTruthy();
        expect(screen.getByTestId('incident-overview')).toBeTruthy();
    });
});
