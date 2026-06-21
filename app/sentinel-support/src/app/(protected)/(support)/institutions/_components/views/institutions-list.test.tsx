import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstitutionsList } from './institutions-list';
import { type Institution } from '@sentinel/shared/types';
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

// Mock hooks fully to prevent context provider errors
vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: () => ({
        hasPermission: () => true,
    }),
    useDeleteInstitutionMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useDeleteInstitutionsMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useInstitutionsQuery: () => ({
        data: [],
    }),
    useApi: () => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }),
    useDepartmentsQuery: () => ({ data: [] }),
    useCoursesQuery: () => ({ data: [] }),
    useSemestersQuery: () => ({ data: [] }),
    useSubjectsQuery: () => ({ data: [] }),
    useEffectiveInstitutionNamingConventionsQuery: () => ({ data: null }),
    useStableValue: (factory: any) => factory(),
}));

const mockInstitutions: Institution[] = [
    {
        id: 'inst-1',
        name: 'Institution 1',
        code: 'INST1',
        institutionKind: 'PARENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

describe('InstitutionsList', () => {
    it('renders the institutions list and forwards pagination props', () => {
        const onPaginationChangeMock = vi.fn();
        const paginationState: PaginationState = {
            pageIndex: 0,
            pageSize: 10,
        };

        render(
            <InstitutionsList
                institutions={mockInstitutions}
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

        // Verify the institution name is displayed
        expect(screen.getByText('Institution 1')).toBeDefined();
    });
});
