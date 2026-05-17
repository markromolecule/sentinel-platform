import { render, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupportManagementPage from './page';

const { mockUseUsersQuery, mockUseStableValue, mockUseDebounce } = vi.hoisted(() => ({
    mockUseUsersQuery: vi.fn(),
    mockUseStableValue: vi.fn(),
    mockUseDebounce: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useUsersQuery: mockUseUsersQuery,
    useStableValue: mockUseStableValue,
    useDebounce: mockUseDebounce,
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
    };
});

vi.mock('@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog', () => ({
    AddSuperAdminDialog: ({ role }: { role: string }) => <div>invite-dialog:{role}</div>,
}));

vi.mock('@/app/(protected)/(support)/users/_components/views/administrators-list', () => ({
    AdministratorsList: ({ role, isLoading }: { role: string; isLoading?: boolean }) => (
        <div>
            current-role:{role}
            {isLoading ? ' loading-list' : ''}
        </div>
    ),
}));

describe('SupportManagementPage', () => {
    beforeEach(() => {
        mockUseStableValue.mockImplementation((factory: () => unknown) => factory());
        mockUseDebounce.mockImplementation((value: string) => value);
        mockUseUsersQuery.mockImplementation(() => ({
            data: [],
            isLoading: false,
            error: null,
        }));
    });

    it('renders the support management page with only support role', () => {
        render(<SupportManagementPage />);

        expect(mockUseUsersQuery).toHaveBeenCalledWith(expect.objectContaining({
            role: ['support']
        }));
        expect(screen.getByText(/invite-dialog:support/i)).toBeTruthy();
        expect(screen.getByText(/current-role:support/i)).toBeTruthy();
        expect(screen.getByText(/Support Management/i)).toBeTruthy();
    });

    it('shows the loading overlay when the list is still loading', () => {
        mockUseUsersQuery.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        });

        render(<SupportManagementPage />);

        expect(screen.getByText(/loading-list/i)).toBeTruthy();
        expect(screen.getByTestId('support-users-loading')).toBeTruthy();
    });
});
