import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AuthLogsPage from './page';

vi.mock('../_components', () => ({
    AuthLogTable: () => <div data-testid="auth-log-table">Auth Log Table</div>,
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

describe('AuthLogsPage Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders AuthLogsPage correctly wrapped in LogsPageShell', () => {
        render(<AuthLogsPage />);

        expect(screen.getByTestId('logs-page-shell')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 1, name: 'Authentication Logs' })).toBeTruthy();
        expect(screen.getByText(/Live audit trail of user login attempts/)).toBeTruthy();
        expect(screen.getByTestId('auth-log-table')).toBeTruthy();
    });
});
