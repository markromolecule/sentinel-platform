import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProctorExams } from './use-proctor-exams';

const mockUseExamsQuery = vi.fn();
const mockUseAcademicScope = vi.fn();

vi.mock('@sentinel/hooks', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/hooks')>('@sentinel/hooks');
    return {
        ...actual,
        useExamsQuery: (...args: any[]) => mockUseExamsQuery(...args),
    };
});

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => mockUseAcademicScope(),
}));

describe('useProctorExams', () => {
    beforeEach(() => {
        mockUseExamsQuery.mockReset();
        mockUseAcademicScope.mockReset();

        mockUseAcademicScope.mockReturnValue({
            institutionId: 'institution-1',
        });
        mockUseExamsQuery.mockReturnValue({
            data: [],
            isLoading: false,
        });
    });

    it('passes the current institution into the exam query', () => {
        renderHook(() => useProctorExams());

        expect(mockUseExamsQuery).toHaveBeenCalledWith({
            institutionId: 'institution-1',
        });
    });
});
