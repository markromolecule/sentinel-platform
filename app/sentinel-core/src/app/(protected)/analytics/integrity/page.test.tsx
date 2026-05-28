import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import IntegrityAnalyticsPage from './page';

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-123',
        isLoading: false,
    }),
}));

vi.mock('@/data', () => ({
    useAnalyticsDepartmentIntegrityQuery: () => ({
        data: [
            { department: 'Engineering', completed: 150, flagged: 5, dropped: 2 },
            { department: 'Business', completed: 100, flagged: 15, dropped: 5 },
        ],
        isLoading: false,
    }),
}));

vi.mock('@/app/(protected)/analytics/_components', () => ({
    DepartmentIntegrityChart: () => <div data-testid="department-chart">Department Integrity Chart</div>,
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

describe('IntegrityAnalyticsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders IntegrityAnalyticsPage correctly with chart and summary table', () => {
        render(<IntegrityAnalyticsPage />);

        expect(screen.getByTestId('analytics-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Integrity by Department' })).toBeTruthy();
        expect(screen.getByTestId('department-chart')).toBeTruthy();

        // Check departments in sorting table
        expect(screen.getByText('Engineering')).toBeTruthy();
        expect(screen.getByText('Business')).toBeTruthy();

        // Check trust ratings are computed:
        // Engineering: (150 - 5) / 150 = 97%
        // Business: (100 - 15) / 100 = 85%
        expect(screen.getByText('97%')).toBeTruthy();
        expect(screen.getByText('85%')).toBeTruthy();
    });
});
