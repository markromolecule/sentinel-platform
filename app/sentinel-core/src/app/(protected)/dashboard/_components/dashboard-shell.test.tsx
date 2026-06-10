// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { DashboardShell } from './dashboard-shell';

afterEach(() => {
    cleanup();
});

// Mock DashboardSidebar so it doesn't need its hook dependencies
vi.mock('./dashboard-sidebar', () => ({
    DashboardSidebar: () => <div data-testid="dashboard-sidebar">Sidebar</div>,
}));

describe('DashboardShell', () => {
    it('renders children content in the main area', () => {
        render(
            <DashboardShell>
                <p>Main dashboard content</p>
            </DashboardShell>,
        );
        expect(screen.getByText('Main dashboard content')).toBeDefined();
    });

    it('renders DashboardSidebar alongside children', () => {
        render(
            <DashboardShell>
                <p>Content</p>
            </DashboardShell>,
        );
        // Both desktop and mobile sidebar instances are rendered (display toggled via CSS)
        const sidebars = screen.getAllByTestId('dashboard-sidebar');
        expect(sidebars.length).toBeGreaterThanOrEqual(1);
    });
});
