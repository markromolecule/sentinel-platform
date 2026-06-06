import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccessControlNav } from './control-nav';

describe('AccessControlNav', () => {
    it('renders all navigation group groups and items', () => {
        const onActiveSectionChange = vi.fn();
        render(
            <AccessControlNav
                activeSection="overview"
                onActiveSectionChange={onActiveSectionChange}
            />,
        );

        // Verify group headers
        expect(screen.getByText('Overview')).toBeDefined();
        expect(screen.getByText('Authorization')).toBeDefined();
        expect(screen.getByText('Configure')).toBeDefined();

        // Verify items
        expect(screen.getByText('Dashboard')).toBeDefined();
        expect(screen.getByText('Assignments')).toBeDefined();
        expect(screen.getByText('Roles')).toBeDefined();
        expect(screen.getByText('Role Matrix')).toBeDefined();
        expect(screen.getByText('Permissions')).toBeDefined();
        expect(screen.getByText('System Settings')).toBeDefined();
    });

    it('triggers callback on active section change when navigation button is clicked', () => {
        const onActiveSectionChange = vi.fn();
        render(
            <AccessControlNav
                activeSection="overview"
                onActiveSectionChange={onActiveSectionChange}
            />,
        );

        const rolesButton = screen.getByText('Roles');
        fireEvent.click(rolesButton);

        expect(onActiveSectionChange).toHaveBeenCalledWith('roles');

        const roleMatrixButton = screen.getByText('Role Matrix');
        fireEvent.click(roleMatrixButton);

        expect(onActiveSectionChange).toHaveBeenCalledWith('role-matrix');
    });
});
