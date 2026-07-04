import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SubjectClassificationPage from './page';

const handleEditOpen = vi.fn();
const subjectClassificationsListSpy = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useServerPagination: () => ({
        pagination: { pageIndex: 0, pageSize: 10 },
        setPagination: vi.fn(),
    }),
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
                isInherited: false,
            },
            {
                id: 'class-2',
                name: 'Inherited Subjects',
                type: 'GENERAL',
                subjectCount: 1,
                subjects: [{ id: 's2', code: 'GE101' }],
                inheritanceStatus: 'INHERITED',
                isInherited: true,
            },
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

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => ({
        institutionId: 'inst-1',
        role: 'admin',
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
        handleEditOpen,
        handleOfferOpen: vi.fn(),
    }),
}));

vi.mock('../_components', () => ({
    SubjectClassificationsList: (props: any) => {
        subjectClassificationsListSpy(props);
        return (
            <div data-testid="classifications-list">
                Classifications: {props.classifications.map((c: any) => c.name).join(', ')}
            </div>
        );
    },
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
    beforeEach(() => {
        handleEditOpen.mockClear();
        subjectClassificationsListSpy.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('does not forward inherited classifications into edit flow from the page handler', () => {
        render(<SubjectClassificationPage />);

        const props = subjectClassificationsListSpy.mock.calls.at(-1)?.[0];
        expect(props).toBeTruthy();

        props.onEdit({
            id: 'class-2',
            name: 'Inherited Subjects',
            type: 'GENERAL',
            subjectCount: 1,
            subjects: [{ id: 's2', code: 'GE101' }],
            inheritanceStatus: 'INHERITED',
            isInherited: true,
        });

        props.onEdit({
            id: 'class-1',
            name: 'Core Subjects',
            type: 'CORE',
            subjectCount: 2,
            subjects: [{ id: 's1', code: 'CS101' }],
            inheritanceStatus: 'LOCAL',
            isInherited: false,
        });

        expect(handleEditOpen).toHaveBeenCalledTimes(1);
        expect(handleEditOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'class-1' }));
    });

    it('renders page header and classifications list with create group action', () => {
        render(<SubjectClassificationPage />);
        expect(screen.getAllByText('Subject Classifications').length).toBeGreaterThan(0);
        expect(screen.getByText('Create Group')).toBeTruthy();
        expect(screen.getByTestId('classifications-list')).toBeTruthy();
        expect(screen.getByText('Classifications: Core Subjects, Inherited Subjects')).toBeTruthy();
    });
});
