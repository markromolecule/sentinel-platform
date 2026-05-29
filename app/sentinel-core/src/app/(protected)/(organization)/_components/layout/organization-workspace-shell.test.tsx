import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrganizationWorkspaceShell } from './organization-workspace-shell';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/departments',
}));

describe('OrganizationWorkspaceShell Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the sidebar title and children correctly', () => {
        render(
            <OrganizationWorkspaceShell>
                <div data-testid="child-element">Test Content</div>
            </OrganizationWorkspaceShell>,
        );

        // Check shell title
        expect(screen.getByText('Organization')).toBeTruthy();

        // Check desktop & mobile navigation links are rendered (2 of each)
        expect(screen.getAllByRole('link', { name: 'Departments' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Semesters' }).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'Rooms' }).length).toBe(2);

        // Check children render
        expect(screen.getByTestId('child-element')).toBeTruthy();
        expect(screen.getByText('Test Content')).toBeTruthy();
    });
});
