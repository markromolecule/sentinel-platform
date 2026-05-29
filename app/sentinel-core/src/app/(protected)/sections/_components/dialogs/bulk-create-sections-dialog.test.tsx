import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { BulkCreateSectionsDialog } from './bulk-create-sections-dialog';
import { useBulkSectionForm } from '../../_hooks/use-bulk-section-form';
import { parseSectionManualText } from '../../_utils';
import {
    useCreateSectionsMutation,
    useDepartmentsQuery,
    useCoursesQuery,
} from '@sentinel/hooks';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import React from 'react';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useCreateSectionsMutation: vi.fn(),
    useDepartmentsQuery: vi.fn(() => ({ data: [] })),
    useCoursesQuery: vi.fn(() => ({ data: [] })),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: vi.fn(),
}));

describe('parseSectionManualText Utility', () => {
    it('parses valid CSV lines into structured rows', () => {
        const input = 'Section-A, 1\nSection-B, 2\nSection-C';
        const result = parseSectionManualText(input);

        expect(result.rows).toHaveLength(3);
        expect(result.rows[0]).toEqual({ name: 'Section-A', year_level: 1 });
        expect(result.rows[1]).toEqual({ name: 'Section-B', year_level: 2 });
        expect(result.rows[2]).toEqual({ name: 'Section-C', year_level: undefined });
        expect(result.errors).toHaveLength(0);
    });

    it('collects error for empty lines or names missing', () => {
        const input = ', 2';
        const result = parseSectionManualText(input);

        expect(result.rows).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('Section name is required');
    });
});

describe('useBulkSectionForm Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('manages form state and submits mutation correctly', () => {
        const mutateMock = vi.fn();
        vi.mocked(useCreateSectionsMutation).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
        } as any);

        const onSuccessMock = vi.fn();
        
        const { result } = renderHook(() => useBulkSectionForm('inst-id', onSuccessMock));

        act(() => {
            result.current.setInput('Section-1, 1');
        });

        expect(result.current.preview.rows).toHaveLength(1);
        expect(result.current.preview.rows[0]).toEqual({ name: 'Section-1', year_level: 1 });

        act(() => {
            result.current.onSubmit();
        });

        expect(mutateMock).toHaveBeenCalledWith({
            payload: {
                institution_id: 'inst-id',
                department_id: null,
                course_id: null,
                sections: [{ name: 'Section-1', year_level: 1 }],
            },
        });
    });
});

describe('BulkCreateSectionsDialog Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAcademicScope).mockReturnValue({
            institutionId: 'inst-1',
            isLoading: false,
        } as any);
        vi.mocked(useCreateSectionsMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as any);
    });

    it('renders the trigger button and bulk dialog details', async () => {
        render(<BulkCreateSectionsDialog />);

        const triggerButton = screen.getByRole('button', { name: /Bulk Upload/i });
        expect(triggerButton).toBeDefined();

        // Open Dialog
        fireEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByText('Bulk Create Sections')).toBeDefined();
            expect(screen.getByPlaceholderText(/INF231, 3/i)).toBeDefined();
        });
    });
});
