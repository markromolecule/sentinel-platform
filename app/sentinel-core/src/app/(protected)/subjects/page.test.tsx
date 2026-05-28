import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SharedSubjectsPage from './page';

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: string) => value,
    useSubjectsQuery: () => ({
        data: [{ id: '1', code: 'CS101', title: 'Intro to CS', units: 3 }],
        isLoading: false,
        isError: false,
        error: null,
    }),
    isPermissionDeniedError: () => false,
    useActivePermissions: () => ({
        hasPermission: (permission: string) => {
            if (permission === 'subjects:view') return true;
            if (permission === 'subjects:create') return true;
            if (permission === 'subjects:delete') return true;
            return false;
        },
    }),
    useStableValue: (fn: () => any) => fn(),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        role: 'superadmin',
        institutionId: 'inst-1',
    }),
}));

vi.mock('./_components', () => ({
    AddSubjectDialog: () => <div data-testid="add-subject-dialog">Add Subject Dialog</div>,
    BulkUploadDialog: () => <div data-testid="bulk-upload-dialog">Bulk Upload Dialog</div>,
    OfferSubjectDialog: () => <div data-testid="offer-subject-dialog">Offer Subject Dialog</div>,
    createMasterColumns: () => [],
    SubjectsList: ({ subjects }: { subjects: any[] }) => (
        <div data-testid="subjects-list">
            Subjects List: {subjects.map((s) => s.title).join(', ')}
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
    Button: ({ children, asChild, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('SharedSubjectsPage Route Permission Gating Test', () => {
    it('renders header, catalog dialogs, and subject list for superadmin with create permission', () => {
        render(<SharedSubjectsPage />);
        expect(screen.getByText('Subject List')).toBeTruthy();
        expect(screen.getByTestId('add-subject-dialog')).toBeTruthy();
        expect(screen.getByTestId('bulk-upload-dialog')).toBeTruthy();
        expect(screen.getByTestId('subjects-list')).toBeTruthy();
        expect(screen.getByText('Subjects List: Intro to CS')).toBeTruthy();
    });
});
