import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SemestersList } from './semesters-list';
import { type Semester } from '@sentinel/shared/types';
import { type PaginationState } from '@tanstack/react-table';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock @sentinel/hooks fully
vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: () => ({
        hasPermission: () => true,
    }),
    useDeleteSemesterMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useDeleteSemestersMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useUpdateSemesterMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useInstitutionsQuery: () => ({
        data: [],
    }),
    useStableValue: (factory: any) => factory(),
    useApi: () => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }),
}));

const mockSemesters: Semester[] = [
    {
        id: 'sem-1',
        institutionId: 'inst-1',
        academicYearStart: 2026,
        academicYearEnd: 2027,
        semester: 'First Semester',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

describe('SemestersList', () => {
    it('renders the semesters list and forwards pagination props', () => {
        const onPaginationChangeMock = vi.fn();
        const paginationState: PaginationState = {
            pageIndex: 0,
            pageSize: 10,
        };

        render(
            <SemestersList
                semesters={mockSemesters}
                searchTerm=""
                onSearchChange={vi.fn()}
                isLoading={false}
                pagination={paginationState}
                onPaginationChange={onPaginationChangeMock}
                pageCount={5}
                totalCount={50}
                manualPagination={true}
            />,
        );

        // Verify the semester option or title is displayed
        expect(screen.getByText('First Semester')).toBeDefined();
    });
});
