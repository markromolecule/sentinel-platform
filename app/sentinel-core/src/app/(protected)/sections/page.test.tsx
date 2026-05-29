import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminSectionsPage from './page';

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: string) => value,
    useSectionsQuery: () => ({
        data: [
            {
                id: '1',
                name: 'Section A',
                yearLevel: 1,
                departmentId: 'dep-1',
                courseId: 'course-1',
            },
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

vi.mock('@/app/(protected)/sections/_components', () => ({
    AddSectionDialog: () => <div data-testid="add-section-dialog">Add Section Dialog</div>,
    BulkCreateSectionsDialog: () => <div data-testid="bulk-create-sections-dialog">Bulk Create Sections Dialog</div>,
    SectionsList: ({ sections }: { sections: any[] }) => (
        <div data-testid="sections-list">
            Sections List: {sections.map((s) => s.name).join(', ')}
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

vi.mock('@/features/administration/shared/permission-gate', () => ({
    PermissionGate: ({ children }: any) => <div data-testid="permission-gate">{children}</div>,
}));

describe('AdminSectionsPage Route Smoke Test', () => {
    it('renders without throwing and mounts the sections manager components', () => {
        render(<AdminSectionsPage />);
        expect(screen.getByText('Section Management')).toBeTruthy();
        expect(screen.getByTestId('sections-list')).toBeTruthy();
        expect(screen.getByText('Sections List: Section A')).toBeTruthy();
    });
});
