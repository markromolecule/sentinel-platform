import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentWhitelistForm } from './use-student-whitelist-form';

const {
    mockUseUser,
    mockUseUserQuery,
    mockUseCreateStudentWhitelistMutation,
    mockUseUpdateStudentWhitelistMutation,
} = vi.hoisted(() => ({
    mockUseUser: vi.fn(),
    mockUseUserQuery: vi.fn(),
    mockUseCreateStudentWhitelistMutation: vi.fn(),
    mockUseUpdateStudentWhitelistMutation: vi.fn(),
}));

vi.mock('@/hooks/use-user', () => ({
    useUser: mockUseUser,
}));

vi.mock('@sentinel/hooks', () => ({
    useUserQuery: mockUseUserQuery,
    useCreateStudentWhitelistMutation: mockUseCreateStudentWhitelistMutation,
    useUpdateStudentWhitelistMutation: mockUseUpdateStudentWhitelistMutation,
}));

describe('useStudentWhitelistForm', () => {
    const mockCreateMutate = vi.fn();
    const mockUpdateMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseUser.mockReturnValue({
            data: { id: 'admin-123', role: 'support' },
        });

        mockUseUserQuery.mockReturnValue({
            data: {
                id: 'admin-123',
                role: 'support',
                institutionId: 'inst-1',
                departmentId: 'dept-1',
            },
        });

        mockUseCreateStudentWhitelistMutation.mockReturnValue({
            mutate: mockCreateMutate,
            isPending: false,
        });

        mockUseUpdateStudentWhitelistMutation.mockReturnValue({
            mutate: mockUpdateMutate,
            isPending: false,
        });
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useStudentWhitelistForm());

        expect(result.current.form.getValues()).toEqual(
            expect.objectContaining({
                institution_id: '',
                department_id: '',
                course_id: '',
                student_number: '',
                last_name: '',
                first_name: '',
                status: 'ACTIVE',
            }),
        );
    });

    it('submits a new entry correctly', async () => {
        const { result } = renderHook(() => useStudentWhitelistForm());

        await act(async () => {
            result.current.form.setValue('institution_id', 'inst-1');
            result.current.form.setValue('department_id', 'dept-1');
            result.current.form.setValue('course_id', 'course-1');
            result.current.form.setValue('student_number', '2024-00001');
            result.current.form.setValue('last_name', 'Dela Cruz');
            result.current.form.setValue('first_name', 'Juan');
        });

        await act(async () => {
            result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockCreateMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                institution_id: 'inst-1',
                department_id: 'dept-1',
                course_id: 'course-1',
                student_number: '2024-00001',
                last_name: 'Dela Cruz',
                first_name: 'Juan',
                status: 'ACTIVE',
            }),
            expect.any(Object),
        );
    });

    it('submits update mutations when a record is passed', async () => {
        const existingRecord = {
            id: 'whitelist-123',
            institutionId: 'inst-1',
            departmentId: 'dept-1',
            courseId: 'course-1',
            studentNumber: '2024-00001',
            lastName: 'Dela Cruz',
            firstName: 'Juan',
            status: 'ACTIVE' as const,
            claimedUserId: null,
            createdAt: '2026-05-17',
            updatedAt: '2026-05-17',
        };

        const { result } = renderHook(() => useStudentWhitelistForm({ record: existingRecord }));

        await act(async () => {
            result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockUpdateMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'whitelist-123',
                payload: expect.objectContaining({
                    student_number: '',
                    last_name: '',
                }),
            }),
            expect.any(Object),
        );
    });
});
