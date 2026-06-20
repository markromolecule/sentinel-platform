import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubjectClassificationsPageState } from './index';
import {
    useActivePermissions,
    useInstitutionsQuery,
    useSubjectClassificationsQuery,
} from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useInstitutionsQuery: vi.fn(),
    useSubjectClassificationsQuery: vi.fn(),
    useDeleteSubjectClassificationMutation: vi.fn(() => ({
        mutate: vi.fn(),
    })),
    isPermissionDeniedError: vi.fn(() => false),
}));

const mockUseAcademicScope = vi.fn(() => ({
    institutionId: '',
    isLoading: false,
}));

vi.mock('@/hooks', () => ({
    useInstitutionFacet: vi.fn(() => []),
    useAcademicScope: () => mockUseAcademicScope(),
}));

describe('useSubjectClassificationsPageState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useActivePermissions as any).mockReturnValue({
            hasPermission: vi.fn(() => true),
        });
        (useInstitutionsQuery as any).mockReturnValue({
            data: [{ id: 'inst-1', name: 'Institution 1' }],
        });
        (useSubjectClassificationsQuery as any).mockReturnValue({
            data: {
                items: [
                    {
                        id: 'class-1',
                        name: 'Math Class',
                        type: 'GENERAL',
                        inheritanceStatus: 'LOCAL',
                        subjectCount: 2,
                        subjects: [],
                    },
                    {
                        id: 'class-2',
                        name: 'Science Class',
                        type: 'CORE',
                        inheritanceStatus: 'INHERITED',
                        subjectCount: 1,
                        subjects: [],
                    },
                ],
                pagination: { page: 1, limit: 10, total: 2, hasMore: false },
            },
            isLoading: false,
            isError: false,
            error: null,
        });
    });

    it('initializes with default states', () => {
        const { result } = renderHook(() => useSubjectClassificationsPageState());
        expect(result.current.searchTerm).toBe('');
        expect(result.current.dialogOpen).toBe(false);
        expect(result.current.selectedClassification).toBeNull();
        expect(result.current.selectedOfferingClassification).toBeNull();
        expect(result.current.isFiltered).toBe(false);
        expect(result.current.filteredClassifications.length).toBe(2);
    });

    it('filters classifications client-side based on type and origin status', () => {
        const { result } = renderHook(() => useSubjectClassificationsPageState());

        // Filter by GENERAL type
        act(() => {
            result.current.handleSelectType('GENERAL');
        });
        expect(result.current.filteredClassifications.length).toBe(1);
        expect(result.current.filteredClassifications[0].id).toBe('class-1');

        // Filter by INHERITED origin status
        act(() => {
            result.current.handleClearTypes();
            result.current.handleSelectOrigin('INHERITED');
        });
        expect(result.current.filteredClassifications.length).toBe(1);
        expect(result.current.filteredClassifications[0].id).toBe('class-2');
    });

    it('sets proper counts for facets', () => {
        const { result } = renderHook(() => useSubjectClassificationsPageState());
        expect(result.current.typeCounts.get('GENERAL')).toBe(1);
        expect(result.current.typeCounts.get('CORE')).toBe(1);
        expect(result.current.originCounts.get('LOCAL')).toBe(1);
        expect(result.current.originCounts.get('INHERITED')).toBe(1);
    });

    it('sets default institution filter to user institution ID when loaded', () => {
        mockUseAcademicScope.mockReturnValue({
            institutionId: 'inst-123',
            isLoading: false,
        });

        const { result } = renderHook(() => useSubjectClassificationsPageState());
        expect(result.current.selectedInstitutions.has('inst-123')).toBe(true);
        expect(result.current.isFiltered).toBe(true);
    });
});
