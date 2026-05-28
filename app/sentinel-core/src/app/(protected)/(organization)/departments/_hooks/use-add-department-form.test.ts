import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddDepartmentForm } from './use-add-department-form';
import { useCreateDepartmentMutation } from '@/data';
import { useProfileQuery } from '@sentinel/hooks';

vi.mock('@/data', () => ({
    useCreateDepartmentMutation: vi.fn().mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
    }),
    notifyPermissionDenied: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useProfileQuery: vi.fn().mockReturnValue({
        profile: null,
        isLoading: false,
    }),
}));

describe('useAddDepartmentForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with default empty values', () => {
        const onSuccess = vi.fn();
        const { result } = renderHook(() => useAddDepartmentForm(onSuccess));

        expect(result.current.form.getValues()).toEqual({
            institution_id: '',
            name: '',
            code: '',
        });
    });

    it('auto-fills institution_id if profile.institutionId is present', () => {
        const onSuccess = vi.fn();
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                id: 'user-1',
                email: 'admin@sentinel.edu',
                role: 'admin',
                institutionId: 'inst-999',
                status: 'ACTIVE',
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useAddDepartmentForm(onSuccess));

        expect(result.current.form.getValues('institution_id')).toBe('inst-999');
    });

    it('submits form values on submit', async () => {
        const onSuccess = vi.fn();
        const mockMutate = vi.fn();
        vi.mocked(useCreateDepartmentMutation).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any);

        const { result } = renderHook(() => useAddDepartmentForm(onSuccess));

        // Fill form fields
        act(() => {
            result.current.form.setValue('institution_id', 'inst-123');
            result.current.form.setValue('name', 'Computer Science');
            result.current.form.setValue('code', 'CS');
        });

        // Submit form
        act(() => {
            result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockMutate).toHaveBeenCalledWith({
            institution_id: 'inst-123',
            name: 'Computer Science',
            code: 'CS',
        });
    });
});
