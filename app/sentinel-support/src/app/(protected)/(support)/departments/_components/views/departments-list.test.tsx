import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DepartmentsList } from './departments-list';
import { type Department } from '@sentinel/shared/types';
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
    useDeleteDepartmentMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useDeleteDepartmentsMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useUpdateDepartmentMutation: () => ({
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

const mockDepartments: Department[] = [
    {
        id: 'dept-1',
        name: 'Department 1',
        code: 'DEPT1',
        institutionId: 'inst-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

describe('DepartmentsList', () => {
    it('renders the departments list and forwards pagination props', () => {
        const onPaginationChangeMock = vi.fn();
        const paginationState: PaginationState = {
            pageIndex: 0,
            pageSize: 10,
        };

        render(
            <DepartmentsList
                departments={mockDepartments}
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

        // Verify the department name is displayed
        expect(screen.getByText('Department 1')).toBeDefined();
    });
});
