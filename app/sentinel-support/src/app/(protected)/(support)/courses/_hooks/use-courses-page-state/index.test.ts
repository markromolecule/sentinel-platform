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
    useDepartmentsQuery: vi.fn(() => ({ data: [] })),
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
        (useCoursesQuery as any).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        });
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useCoursesPageState());
        expect(result.current.searchTerm).toBe('');
        expect(result.current.selectedInstitutionId).toBe('');
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
