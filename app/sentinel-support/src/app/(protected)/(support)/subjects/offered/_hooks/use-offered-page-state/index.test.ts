import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOfferedPageState } from './index';
import { useSubjectOfferingsQuery, useInstitutionsQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useSubjectOfferingsQuery: vi.fn(),
    useInstitutionsQuery: vi.fn(),
    useDebounce: vi.fn((val) => val),
}));

describe('useOfferedPageState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useInstitutionsQuery as any).mockReturnValue({
            data: [
                { id: '1', name: 'Inst 1' },
                { id: '2', name: 'Inst 2' },
            ],
        });
        (useSubjectOfferingsQuery as any).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        });
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useOfferedPageState());
        expect(result.current.searchTerm).toBe('');
        expect(result.current.selectedInstitutionId).toBeUndefined();
    });

    it('updates selectedInstitutionId', () => {
        const { result } = renderHook(() => useOfferedPageState());
        act(() => {
            result.current.setSelectedInstitutionId('1');
        });
        expect(result.current.selectedInstitutionId).toBe('1');
    });

    it('handles undefined selectedInstitutionId', () => {
        const { result } = renderHook(() => useOfferedPageState());
        act(() => {
            result.current.setSelectedInstitutionId(undefined);
        });
        expect(result.current.selectedInstitutionId).toBeUndefined();
    });
});
