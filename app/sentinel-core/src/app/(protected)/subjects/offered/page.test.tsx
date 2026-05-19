import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SharedOfferedSubjectsPage from './page';

vi.mock('@sentinel/hooks', () => ({
    findPermissionDeniedError: () => false,
    useActivePermissions: () => ({
        hasPermission: (permission: string) => {
            if (permission === 'subject_offerings:view') return true;
            if (permission === 'subject_offerings:offer') return true;
            if (permission === 'subject_offerings:delete') return true;
            return false;
        },
    }),
    useDebounce: (value: string) => value,
    useSubjectOfferingsQuery: () => ({
        data: [
            {
                id: 'offering-1',
                subjectCode: 'CS101',
                subjectTitle: 'Computer Science I',
                termAcademicYear: '2026-2027',
                termSemester: 'First Semester',
                status: 'ACTIVE',
                yearLevels: [1],
                departmentIds: [],
                courseIds: [],
                sectionIds: [],
            }
        ],
        isLoading: false,
        isError: false,
        error: null,
    }),
    useDepartmentsQuery: () => ({ data: [], error: null }),
    useCoursesQuery: () => ({ data: [], error: null }),
    useSectionsQuery: () => ({ data: [], error: null }),
    useStableIdMap: () => new Map(),
    useStableValue: (fn: () => any) => fn(),
}));

vi.mock('../_components', () => ({
    createSubjectOfferingColumns: () => [],
    OfferSubjectDialog: () => <div data-testid="offer-dialog" />,
    OfferedSubjectsList: ({ offerings }: any) => (
        <div data-testid="offerings-list">
            Offerings: {offerings.map((o: any) => o.subjectTitle).join(', ')}
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
    PermissionDeniedState: () => <div data-testid="permission-denied" />,
    Separator: () => <hr />,
    Button: ({ children, asChild, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('SharedOfferedSubjectsPage Gating Test', () => {
    it('renders the offered subjects page and the list', () => {
        render(<SharedOfferedSubjectsPage />);
        expect(screen.getByText('Offered Subjects')).toBeTruthy();
        expect(screen.getByText('Offer Subject')).toBeTruthy();
        expect(screen.getByTestId('offerings-list')).toBeTruthy();
        expect(screen.getByText('Offerings: Computer Science I')).toBeTruthy();
    });
});
