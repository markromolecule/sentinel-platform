import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogsWorkspaceShell } from './logs-workspace-shell';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/logs/auth',
}));

describe('LogsWorkspaceShell Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the sidebar title and children correctly', () => {
        render(
            <LogsWorkspaceShell>
                <div data-testid="child-element">Test Content</div>
            </LogsWorkspaceShell>
        );

        // Check shell title is rendered as heading
        expect(screen.getByRole('heading', { level: 1, name: 'System Logs' })).toBeTruthy();

        // Check desktop & mobile navigation links are rendered (2 of each)
        expect(screen.getAllByRole('link', { name: 'Auth Logs' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Activity Logs' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'System Logs' }).length).toBe(2);

        // Check children render
        expect(screen.getByTestId('child-element')).toBeTruthy();
        expect(screen.getByText('Test Content')).toBeTruthy();
    });
});

