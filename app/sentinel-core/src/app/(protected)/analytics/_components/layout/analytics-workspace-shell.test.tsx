import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsWorkspaceShell } from './analytics-workspace-shell';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/analytics',
}));

describe('AnalyticsWorkspaceShell Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the sidebar title and children correctly', () => {
        render(
            <AnalyticsWorkspaceShell>
                <div data-testid="child-element">Test Content</div>
            </AnalyticsWorkspaceShell>
        );

        // Check shell title is rendered as heading
        expect(screen.getByRole('heading', { level: 1, name: 'Reports & Analytics' })).toBeTruthy();

        // Check desktop & mobile navigation links are rendered (2 of each)
        expect(screen.getAllByRole('link', { name: 'Overview' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Incidents' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Exams' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Integrity' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Reports' }).length).toBe(2);

        // Check children render
        expect(screen.getByTestId('child-element')).toBeTruthy();
        expect(screen.getByText('Test Content')).toBeTruthy();
    });
});
