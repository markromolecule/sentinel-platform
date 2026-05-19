import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SubjectClassificationPage from './page';

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: string) => value,
    useSubjectClassificationsQuery: () => ({
        data: [
            {
                id: 'class-1',
                name: 'Core Subjects',
                type: 'CORE',
                subjectCount: 2,
                subjects: [{ id: 's1', code: 'CS101' }],
                inheritanceStatus: 'LOCAL',
            }
        ],
        isLoading: false,
        isError: false,
        error: null,
    }),
    isPermissionDeniedError: () => false,
    useActivePermissions: () => ({
        hasPermission: (permission: string) => {
            if (permission === 'subjects:view') return true;
            if (permission === 'subjects:create') return true;
            if (permission === 'subjects:update') return true;
            if (permission === 'subjects:delete') return true;
            if (permission === 'subject_offerings:offer') return true;
            return false;
        },
    }),
    useDeleteSubjectClassificationMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('../_hooks/use-subject-classifications-management', () => ({
    useSubjectClassificationsManagement: () => ({
        searchTerm: '',
        setSearchTerm: vi.fn(),
        dialogOpen: false,
        setDialogOpen: vi.fn(),
        selectedClassification: null,
        selectedOfferingClassification: null,
        setSelectedOfferingClassification: vi.fn(),
        handleCreateOpen: vi.fn(),
        handleEditOpen: vi.fn(),
        handleOfferOpen: vi.fn(),
    }),
}));

vi.mock('../_components', () => ({
    SubjectClassificationsList: ({ classifications }: any) => (
        <div data-testid="classifications-list">
            Classifications: {classifications.map((c: any) => c.name).join(', ')}
        </div>
    ),
    SubjectClassificationDialog: () => <div data-testid="classification-dialog" />,
    OfferClassificationSubjectsDialog: () => <div data-testid="offer-dialog" />,
}));

vi.mock('@sentinel/ui', () => ({
    PageHeader: ({ children, title }: any) => (
        <div data-testid="page-header">
            <h1>{title}</h1>
            {children}
        </div>
    ),
    PermissionDeniedState: () => <div data-testid="permission-denied" />,
    Separator: () => <hr />,
    Button: ({ children, asChild, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('SubjectClassificationPage Permission Gating Test', () => {
    it('renders page header and classifications list with create group action', () => {
        render(<SubjectClassificationPage />);
        expect(screen.getByText('Subject Classification')).toBeTruthy();
        expect(screen.getByText('Create Group')).toBeTruthy();
        expect(screen.getByTestId('classifications-list')).toBeTruthy();
        expect(screen.getByText('Classifications: Core Subjects')).toBeTruthy();
    });
});
