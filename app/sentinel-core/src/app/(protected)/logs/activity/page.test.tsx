import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ActivityLogsPage from './page';

vi.mock('../_components', () => ({
    ActivityLogTable: () => <div data-testid="activity-log-table">Activity Log Table</div>,
}));

vi.mock('../_components/layout', () => ({
    LogsPageShell: ({
        children,
        title,
        description,
    }: {
        children: React.ReactNode;
        title: string;
        description: string;
    }) => (
        <div data-testid="logs-page-shell">
            <h1>{title}</h1>
            <p>{description}</p>
            {children}
        </div>
    ),
}));

describe('ActivityLogsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders ActivityLogsPage correctly wrapped in LogsPageShell', () => {
        render(<ActivityLogsPage />);

        expect(screen.getByTestId('logs-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Activity Logs' })).toBeTruthy();
        expect(screen.getByText(/Audit trail of standard database modifications/)).toBeTruthy();
        expect(screen.getByTestId('activity-log-table')).toBeTruthy();
    });
});
