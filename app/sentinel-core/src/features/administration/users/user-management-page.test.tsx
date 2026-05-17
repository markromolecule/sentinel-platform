import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManagementPage } from './user-management-page';

const mockUseDebounce = vi.fn();
const mockUsePresence = vi.fn();
const mockUseUsersQuery = vi.fn();
const mockUseAcademicScope = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: string) => mockUseDebounce(value),
    usePresence: () => mockUsePresence(),
    useUsersQuery: (args: unknown) => mockUseUsersQuery(args),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => mockUseAcademicScope(),
}));

vi.mock('../shared/permission-gate', () => ({
    PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@sentinel/ui', () => ({
    PageHeader: ({
        title,
        description,
        children,
    }: {
        title: string;
        description: string;
        children?: React.ReactNode;
    }) => (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
            <div>{children}</div>
        </div>
    ),
    Separator: () => <hr />,
}));

vi.mock('@/app/(protected)/(admin)/users/_components', () => ({
    UserManagementTable: ({
        users,
        search,
        onSearchChange,
    }: {
        users: Array<{ email: string }>;
        search?: string;
        onSearchChange?: (value: string) => void;
    }) => (
        <div>
            <span>{`users:${users.length}`}</span>
            <span>{`search:${search ?? ''}`}</span>
            <button onClick={() => onSearchChange?.('sam@example.com')}>Change Search</button>
        </div>
    ),
}));

vi.mock('@/app/(protected)/(superadmin)/administrators/_components', () => ({
    AdministratorsList: ({
        administrators,
    }: {
        administrators: Array<{ email: string }>;
    }) => <span>{`administrators:${administrators.length}`}</span>,
}));

describe('UserManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseDebounce.mockImplementation((value: string) => value);
        mockUsePresence.mockReturnValue({ onlineUserIds: new Set(['user-1']) });
        mockUseAcademicScope.mockReturnValue({
            institutionId: 'institution-1',
            isLoading: false,
        });
    });

    it('renders the shared user-management variant and updates the search query args', () => {
        mockUseUsersQuery.mockReturnValue({
            data: [{ email: 'sam@example.com' }],
            isLoading: false,
            error: null,
        });

        render(
            <UserManagementPage
                title="User Management"
                description="Manage users"
                actions={<button>Add User</button>}
                scopeMode="global"
                variant="users"
            />,
        );

        expect(screen.getByText('users:1')).toBeTruthy();
        expect(mockUseUsersQuery).toHaveBeenLastCalledWith({
            search: '',
            role: undefined,
            institutionId: undefined,
            enabled: true,
        });

        fireEvent.click(screen.getByText('Change Search'));

        expect(mockUseUsersQuery).toHaveBeenLastCalledWith({
            search: 'sam@example.com',
            role: undefined,
            institutionId: undefined,
            enabled: true,
        });
    });

    it('shows the institution-scope empty state when administrators have no institution context', () => {
        mockUseAcademicScope.mockReturnValue({
            institutionId: '',
            isLoading: false,
        });
        mockUseUsersQuery.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        });

        render(
            <UserManagementPage
                title="Administrator Management"
                description="Manage admins"
                actions={<button>Add Admin</button>}
                scopeMode="institution"
                variant="administrators"
                roleFilter="admin"
            />,
        );

        expect(screen.getByText('No institution assigned.')).toBeTruthy();
        expect(mockUseUsersQuery).toHaveBeenCalledWith({
            search: '',
            role: 'admin',
            institutionId: '',
            enabled: false,
        });
    });

    it('renders the administrator error state when the shared query fails', () => {
        mockUseUsersQuery.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error('boom'),
        });

        render(
            <UserManagementPage
                title="Administrator Management"
                description="Manage admins"
                actions={<button>Add Admin</button>}
                scopeMode="institution"
                variant="administrators"
                roleFilter="admin"
            />,
        );

        expect(screen.getByText('Failed to load administrators.')).toBeTruthy();
    });
});
