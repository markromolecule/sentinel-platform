import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CoreDepartmentsPage from './page';

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: string) => value,
    useDepartmentsQuery: () => ({
        data: [
            { id: '1', name: 'Department of Computing', code: 'DOC', institutionId: 'inst-1', isInherited: false }
        ],
        isLoading: false,
        isError: false,
        error: null,
    }),
    isPermissionDeniedError: () => false,
    useActivePermissions: () => ({
        hasPermission: () => true,
    }),
}));

vi.mock('@/app/(protected)/departments/_components', () => ({
    AddDepartmentDialog: () => <div data-testid="add-dialog">Add Dialog</div>,
    BulkCreateDepartmentsDialog: () => <div data-testid="bulk-dialog">Bulk Dialog</div>,
    DepartmentsList: ({ departments }: { departments: any[] }) => (
        <div data-testid="departments-list">
            Departments: {departments.map(d => d.name).join(', ')}
        </div>
    ),
}));

vi.mock('@sentinel/ui', () => ({
    PageHeader: ({ children, title }: any) => (
        <div data-testid="page-header">
            <h1>{title}</h1>
            {children}
        </div>
    ),
    PermissionDeniedState: () => <div data-testid="permission-denied">Access Denied</div>,
    Separator: () => <hr />,
}));

describe('CoreDepartmentsPage Route Smoke Test', () => {
    it('renders without throwing and mounts the departments page layout', () => {
        render(<CoreDepartmentsPage />);
        expect(screen.getByText('Department Management')).toBeTruthy();
        expect(screen.getByTestId('departments-list')).toBeTruthy();
        expect(screen.getByText('Departments: Department of Computing')).toBeTruthy();
    });
});
