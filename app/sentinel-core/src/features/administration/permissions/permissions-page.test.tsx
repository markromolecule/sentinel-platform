import { render, screen, cleanup } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsPage } from './permissions-page';

const mockUseAccessControlRolesQuery = vi.fn();
const mockUseAccessControlPermissionsQuery = vi.fn();
const mockUseCoreAdminCapabilities = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useAccessControlRolesQuery: () => mockUseAccessControlRolesQuery(),
    useAccessControlPermissionsQuery: () => mockUseAccessControlPermissionsQuery(),
    useCreateAccessControlRoleMutation: () => ({ isPending: false }),
    useUpdateAccessControlRoleMutation: () => ({ isPending: false }),
    useDeleteAccessControlRoleMutation: () => ({ isPending: false }),
    useReplaceAccessControlRolePermissionsMutation: () => ({ isPending: false }),
}));

vi.mock('@/hooks/use-core-admin-capabilities', () => ({
    useCoreAdminCapabilities: () => mockUseCoreAdminCapabilities(),
}));

// Mock DataTable, Dialogs, and PageHeader to avoid rendering table complex elements in page-level test
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
    Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DataTable: ({ data, searchKey }: { data: any[]; searchKey: string }) => (
        <div>
            <span>{`items:${data?.length || 0}`}</span>
            <span>{`search:${searchKey}`}</span>
        </div>
    ),
    Button: ({
        children,
        onClick,
        disabled,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
    }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
        <div className={`alert ${variant || ''}`}>{children}</div>
    ),
    AlertTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Input: () => <input />,
    Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    Textarea: () => <textarea />,
}));

// Mock collocated dialogs to isolate page testing
vi.mock('./_components/role-form-dialog', () => ({
    RoleFormDialog: () => <div data-testid="role-form-dialog">Form Dialog</div>,
}));

describe('PermissionsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it('renders loading state when queries or capabilities are loading', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            canEditPage: () => false,
            isLoading: true,
        });
        mockUseAccessControlRolesQuery.mockReturnValue({ data: [], isLoading: false });
        mockUseAccessControlPermissionsQuery.mockReturnValue({ data: [], isLoading: false });

        render(<PermissionsPage />);

        expect(screen.queryByText('Permissions & Roles')).toBeNull();
    });

    it('renders unauthorized state if the user cannot view the page', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            canEditPage: () => false,
            isLoading: false,
        });
        mockUseAccessControlRolesQuery.mockReturnValue({ data: [], isLoading: false });
        mockUseAccessControlPermissionsQuery.mockReturnValue({ data: [], isLoading: false });

        render(<PermissionsPage />);

        expect(screen.getByText('Unauthorized Access')).toBeTruthy();
        expect(screen.getByText(/You do not possess the required "access_control:view" permission/i)).toBeTruthy();
    });

    it('renders error state if data loading fails', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            canEditPage: () => false,
            isLoading: false,
        });
        mockUseAccessControlRolesQuery.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error('Database connection failed'),
        });
        mockUseAccessControlPermissionsQuery.mockReturnValue({
            data: [],
            isLoading: false,
        });

        render(<PermissionsPage />);

        expect(screen.getByText('Data Fetching Failed')).toBeTruthy();
        expect(screen.getByText('Database connection failed')).toBeTruthy();
    });

    it('renders dynamic hook data and enables Create Role button if editable', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            canEditPage: () => true,
            isLoading: false,
        });
        mockUseAccessControlRolesQuery.mockReturnValue({
            data: [
                {
                    id: 1,
                    name: 'Admin',
                    description: 'Admin role',
                    isSystem: true,
                    permissionIds: [],
                },
            ],
            isLoading: false,
        });
        mockUseAccessControlPermissionsQuery.mockReturnValue({
            data: [
                {
                    id: '1',
                    key: 'users:view',
                    moduleKey: 'users',
                    actionKey: 'view',
                    name: 'View Users',
                    description: 'Can view users',
                },
            ],
            isLoading: false,
        });

        render(<PermissionsPage />);

        expect(screen.getByText('Permissions & Roles')).toBeTruthy();
        expect(screen.getByText('Create Role')).toBeTruthy();
        // Since we mocked DataTable to count items, check roles and permissions counts
        expect(screen.getAllByText('items:1').length).toBe(2);
    });

    it('renders list but hides Create Role button if user has view-only access', () => {
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            canEditPage: () => false,
            isLoading: false,
        });
        mockUseAccessControlRolesQuery.mockReturnValue({ data: [], isLoading: false });
        mockUseAccessControlPermissionsQuery.mockReturnValue({ data: [], isLoading: false });

        render(<PermissionsPage />);

        expect(screen.getByText('Permissions & Roles')).toBeTruthy();
        expect(screen.queryByText('Create Role')).toBeNull();
    });
});
