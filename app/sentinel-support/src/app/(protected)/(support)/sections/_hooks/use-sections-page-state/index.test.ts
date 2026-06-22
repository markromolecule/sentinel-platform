import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSectionsPageState } from './index';
import { useSectionsQuery, useInstitutionsQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useSectionsQuery: vi.fn(),
    useInstitutionsQuery: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useCreateSectionMutation: vi.fn(() => ({ mutate: vi.fn() })),
    useUpdateSectionMutation: vi.fn(() => ({ mutate: vi.fn() })),
    useDeleteSectionMutation: vi.fn(() => ({ mutate: vi.fn() })),
    useDepartmentsQuery: vi.fn(() => ({ data: [] })),
    useCoursesQuery: vi.fn(() => ({ data: [] })),
    useEffectiveInstitutionNamingConventionsQuery: vi.fn(() => ({ data: null })),
    useServerPagination: vi.fn((watchDeps, initialState = { pageIndex: 0, pageSize: 10 }) => {
        const [pagination, setPagination] = require('react').useState(initialState);
        return { pagination, setPagination };
    }),
}));

describe('useSectionsPageState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useInstitutionsQuery as any).mockReturnValue({
            data: [
                { id: '1', name: 'Inst 1' },
                { id: '2', name: 'Inst 2', parentInstitutionId: '1' },
            ],
        });
        (useSectionsQuery as any).mockImplementation((args: any) => {
            if (args && args.page !== undefined && args.limit !== undefined) {
                return {
                    data: {
                        items: [{ id: 'sec-1', name: 'Section 1', yearLevel: 1 }],
                        pagination: {
                            total: 25,
                            page: 1,
                            pageSize: 10,
                            totalPages: 3,
                        },
                    },
                    isLoading: false,
                    isError: false,
                    error: null,
                };
            }
            return {
                data: [],
                isLoading: false,
                isError: false,
                error: null,
            };
        });
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useSectionsPageState());
        expect(result.current.searchTerm).toBe('');
        expect(result.current.selectedInstitutionId).toBe('');
        expect(result.current.pagination).toEqual({
            pageIndex: 0,
            pageSize: 10,
        });
        expect(result.current.sections).toEqual([{ id: 'sec-1', name: 'Section 1', yearLevel: 1 }]);
        expect(result.current.pageCount).toBe(3);
        expect(result.current.totalCount).toBe(25);
    });

    it('updates selectedInstitutionId and handles undefined', () => {
        const { result } = renderHook(() => useSectionsPageState());
        act(() => {
            result.current.setSelectedInstitutionId('1');
        });
        expect(result.current.selectedInstitutionId).toBe('1');

        act(() => {
            result.current.setSelectedInstitutionId(undefined);
        });
        expect(result.current.selectedInstitutionId).toBeUndefined();
    });
});
