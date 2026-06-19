import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubjectsPageState } from './index';
import { useSubjectsQuery, useInstitutionsQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useSubjectsQuery: vi.fn(),
    useInstitutionsQuery: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useCreateSubjectMutation: vi.fn(() => ({ mutate: vi.fn() })),
    useUpdateSubjectMutation: vi.fn(() => ({ mutate: vi.fn() })),
    useDeleteSubjectMutation: vi.fn(() => ({ mutate: vi.fn() })),
}));

const mockUseAcademicScope = vi.fn(() => ({
    institutionId: '',
    isLoading: false,
}));

vi.mock('@/hooks', () => ({
    useAcademicScope: () => mockUseAcademicScope(),
}));

describe('useSubjectsPageState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useInstitutionsQuery as any).mockReturnValue({
            data: [
                { id: '1', name: 'Inst 1' },
                { id: '2', name: 'Inst 2', parentInstitutionId: '1' },
            ],
        });
        (useSubjectsQuery as any).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        });
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useSubjectsPageState());
        expect(result.current.searchTerm).toBe('');
        expect(result.current.selectedInstitutionId).toBeUndefined();
    });

    it('updates selectedInstitutionId and handles undefined', () => {
        const { result } = renderHook(() => useSubjectsPageState());
        act(() => {
            result.current.setSelectedInstitutionId('1');
        });
        expect(result.current.selectedInstitutionId).toBe('1');

        act(() => {
            result.current.setSelectedInstitutionId(undefined);
        });
        expect(result.current.selectedInstitutionId).toBeUndefined();
    });

    it('sets default selectedInstitutionId to user institution ID when loaded', () => {
        mockUseAcademicScope.mockReturnValue({
            institutionId: '123-inst',
            isLoading: false,
        });

        const { result } = renderHook(() => useSubjectsPageState());
        expect(result.current.selectedInstitutionId).toBe('123-inst');
    });
});
