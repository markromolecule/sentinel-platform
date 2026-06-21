import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCoursesPageState } from './index';
import { useCoursesQuery, useInstitutionsQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useCoursesQuery: vi.fn(),
    useInstitutionsQuery: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useDeleteCourseMutation: vi.fn(() => ({
        mutate: vi.fn(),
    })),
    useDeleteCoursesMutation: vi.fn(() => ({
        mutate: vi.fn(),
    })),
    useDepartmentsQuery: vi.fn(() => ({ data: [] })),
    useServerPagination: vi.fn((watchDeps, initialState = { pageIndex: 0, pageSize: 10 }) => {
        const [pagination, setPagination] = require('react').useState(initialState);
        return { pagination, setPagination };
    }),
}));

describe('useCoursesPageState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useInstitutionsQuery as any).mockReturnValue({
            data: [
                { id: '1', name: 'Inst 1' },
                { id: '2', name: 'Inst 2', parentInstitutionId: '1' },
            ],
        });
        (useCoursesQuery as any).mockImplementation((args: any) => {
            if (args && args.page !== undefined && args.limit !== undefined) {
                return {
                    data: {
                        items: [
                            { id: 'course-1', title: 'Course 1', code: 'C1' }
                        ],
                        pagination: {
                            total: 15,
                            page: 1,
                            pageSize: 10,
                            totalPages: 2,
                        }
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
        const { result } = renderHook(() => useCoursesPageState());
        expect(result.current.searchTerm).toBe('');
        expect(result.current.selectedInstitutionId).toBeUndefined();
        expect(result.current.pagination).toEqual({
            pageIndex: 0,
            pageSize: 10,
        });
        expect(result.current.courses).toEqual([
            { id: 'course-1', title: 'Course 1', code: 'C1' }
        ]);
        expect(result.current.pageCount).toBe(2);
        expect(result.current.totalCount).toBe(15);
    });

    it('updates searchTerm', () => {
        const { result } = renderHook(() => useCoursesPageState());
        act(() => {
            result.current.setSearchTerm('math');
        });
        expect(result.current.searchTerm).toBe('math');
    });

    it('updates selectedInstitutionId', () => {
        const { result } = renderHook(() => useCoursesPageState());
        act(() => {
            result.current.setSelectedInstitutionId('1');
        });
        expect(result.current.selectedInstitutionId).toBe('1');
    });

    it('handles undefined selectedInstitutionId', () => {
        const { result } = renderHook(() => useCoursesPageState());
        act(() => {
            result.current.setSelectedInstitutionId(undefined);
        });
        expect(result.current.selectedInstitutionId).toBeUndefined();
    });
});
