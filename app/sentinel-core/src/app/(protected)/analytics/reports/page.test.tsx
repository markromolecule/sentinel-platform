import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReportsAnalyticsPage from './page';

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-123',
        isLoading: false,
    }),
}));

vi.mock('@/data', () => ({
    useAnalyticsReportsQuery: () => ({
        data: { records: [] },
        isLoading: false,
    }),
    useGenerateAnalyticsReportMutation: () => ({
        mutate: vi.fn(),
    }),
}));

vi.mock('@/app/(protected)/analytics/_components', () => ({
    AnalyticsReportsList: () => <div data-testid="reports-list">Reports List Component</div>,
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

describe('ReportsAnalyticsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders ReportsAnalyticsPage correctly with its elements', () => {
        render(<ReportsAnalyticsPage />);

        expect(screen.getByTestId('analytics-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Generated Reports' })).toBeTruthy();
        expect(screen.getByTestId('reports-list')).toBeTruthy();
    });
});
