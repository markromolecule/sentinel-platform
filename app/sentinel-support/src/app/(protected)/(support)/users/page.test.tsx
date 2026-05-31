import { render, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupportUsersPage from './page';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    usePathname: () => '/users',
}));

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
    const TabsContext = React.createContext<{
        value: string;
        onValueChange: (value: string) => void;
    } | null>(null);

    return {
        ...actual,
        Tabs: ({
            value,
            onValueChange,
            children,
        }: {
            value: string;
            onValueChange: (value: string) => void;
            children: ReactNode;
        }) => (
            <TabsContext.Provider value={{ value, onValueChange }}>
                <div>{children}</div>
            </TabsContext.Provider>
        ),
        TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        TabsTrigger: ({ value, children }: { value: string; children: ReactNode }) => {
            const context = React.useContext(TabsContext);

            return (
                <button
                    role="tab"
                    aria-selected={context?.value === value}
                    onClick={() => context?.onValueChange(value)}
                >
                    {children}
                </button>
            );
        },
    };
});

vi.mock('@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog', () => ({
    AddSuperAdminDialog: ({ role }: { role: string }) => <div>invite-dialog:superadmin</div>,
}));

vi.mock('@/app/(protected)/(support)/users/_components/views/administrators-list', () => ({
    AdministratorsList: ({ role, isLoading }: { role: string; isLoading?: boolean }) => (
        <div>
            current-role:superadmin
            {isLoading ? ' loading-list' : ''}
        </div>
    ),
}));

describe('SupportUsersPage', () => {
    beforeEach(() => {
        mockUseStableValue.mockImplementation((factory: () => unknown) => factory());
        mockUseDebounce.mockImplementation((value: string) => value);
        mockUseUsersQuery.mockImplementation(() => ({
            data: [],
            isLoading: false,
            error: null,
        }));
    });

    it('renders the administrator management page with both superadmin and support roles', () => {
        render(<SupportUsersPage />);

        expect(mockUseUsersQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                role: ['superadmin', 'support'],
            }),
        );
        expect(screen.getByText(/current-role:superadmin/i)).toBeTruthy();
    });

    it('shows the loading overlay when the list is still loading', () => {
        mockUseUsersQuery.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        });

        render(<SupportUsersPage />);

        expect(screen.getByText(/loading-list/i)).toBeTruthy();
        expect(screen.getByTestId('support-users-loading')).toBeTruthy();
    });
});
