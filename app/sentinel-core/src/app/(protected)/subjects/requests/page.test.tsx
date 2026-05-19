import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SharedEnrollmentRequestsPage from './page';

vi.mock('@sentinel/hooks', () => ({
    findPermissionDeniedError: () => false,
    useEnrollmentRequestsQuery: () => ({
        data: [
            {
                instructor_name: 'Dr. John Doe',
                subject_code: 'CS101',
                subject_title: 'Intro to CS',
                status: 'PENDING',
                sections: [{ request_id: 'req-1', section_name: 'Sec A' }],
            }
        ],
        isLoading: false,
        isError: false,
        error: null,
    }),
    useDepartmentsQuery: () => ({ data: [], error: null }),
    useCoursesQuery: () => ({ data: [], error: null }),
    useSectionsQuery: () => ({ data: [], error: null }),
    useActivePermissions: () => ({
        hasPermission: (permission: string) => {
            if (permission === 'subject_offerings:view') return true;
            if (permission === 'subject_offerings:approve') return true;
            return false;
        },
    }),
    useStableValue: (fn: () => any) => fn(),
    useDeleteEnrollmentRequestsMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('../_components/requests/enrollment-requests-list', () => ({
    EnrollmentRequestsList: ({ requests }: any) => (
        <div data-testid="requests-list">
            Requests: {requests.map((r: any) => r.instructor_name).join(', ')}
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
}));

describe('SharedEnrollmentRequestsPage Gating Test', () => {
    it('renders the header and requests list', () => {
        render(<SharedEnrollmentRequestsPage />);
        expect(screen.getByText('Enrollment Requests')).toBeTruthy();
        expect(screen.getByTestId('requests-list')).toBeTruthy();
        expect(screen.getByText('Requests: Dr. John Doe')).toBeTruthy();
    });
});
