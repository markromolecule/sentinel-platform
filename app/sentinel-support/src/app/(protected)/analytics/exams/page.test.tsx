import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExamsAnalyticsPage from './page';

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-123',
        isLoading: false,
    }),
}));

vi.mock('@/data', () => ({
    useAnalyticsExamCompletionsQuery: () => ({
        data: [],
        isLoading: false,
    }),
}));

vi.mock('@/app/(protected)/analytics/_components', () => ({
    ExamCompletionChart: () => <div data-testid="exam-completion-chart">Exam Completion Chart</div>,
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

describe('ExamsAnalyticsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders ExamsAnalyticsPage correctly with its elements', () => {
        render(<ExamsAnalyticsPage />);

        expect(screen.getByTestId('analytics-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Exam Performance' })).toBeTruthy();
        expect(screen.getByTestId('exam-completion-chart')).toBeTruthy();
    });
});
