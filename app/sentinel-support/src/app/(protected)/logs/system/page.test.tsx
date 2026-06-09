import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SystemLogsPage from './page';

vi.mock('../_components', () => ({
    SystemLogTable: () => <div data-testid="system-log-table">System Log Table</div>,
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

describe('SystemLogsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders SystemLogsPage correctly wrapped in LogsPageShell', () => {
        render(<SystemLogsPage />);

        expect(screen.getByTestId('logs-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'System Logs' })).toBeTruthy();
        expect(screen.getByText(/Audit trail of internal background tasks/)).toBeTruthy();
        expect(screen.getByTestId('system-log-table')).toBeTruthy();
    });
});
