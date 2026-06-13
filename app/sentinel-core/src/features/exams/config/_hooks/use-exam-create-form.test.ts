import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExamCreateForm } from './use-exam-create-form';
import {
    useClassroomsQuery,
    useCreateExamMutation,
    useRoomsQuery,
    useAssignExamMutation,
} from '@sentinel/hooks';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useClassroomsQuery: vi.fn(() => ({ data: [] })),
    useRoomsQuery: vi.fn(() => ({ data: [] })),
    useCreateExamMutation: vi.fn(),
    useAssignExamMutation: vi.fn(),
}));

describe('useExamCreateForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits form without proctor assignment and does not redirect to builder', async () => {
        const onClose = vi.fn();
        const mockMutateAsync = vi
            .fn()
            .mockResolvedValue({ id: 'new-exam-id', title: 'Test Exam' });
        vi.mocked(useCreateExamMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
        } as any);
        vi.mocked(useAssignExamMutation).mockReturnValue({
            mutateAsync: vi.fn(),
        } as any);

        const { result } = renderHook(() => useExamCreateForm(onClose));

        // Set minimal valid form fields
        act(() => {
            result.current.form.setValue('title', 'Exam Title');
            result.current.form.setValue(
                'description',
                'This is a long description with more than twenty characters.',
            );
            result.current.form.setValue('classroomIds', ['classroom-uuid-1111']);
            result.current.form.setValue('startDateTime', '2026-06-14T08:00');
            result.current.form.setValue('endDateTime', '2026-06-14T09:00');
            result.current.form.setValue('durationMinutes', 60);
            result.current.form.setValue('passingScore', 75);
            result.current.form.setValue('shuffleQuestions', true);
            result.current.form.setValue('showCorrectAnswers', false);
            result.current.form.setValue('allowReview', true);
            result.current.form.setValue('randomizeChoices', true);
        });

        // Submit form
        await act(async () => {
            await result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockMutateAsync).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('submits form with proctor assignment and does not redirect', async () => {
        const onClose = vi.fn();
        const mockMutateAsync = vi
            .fn()
            .mockResolvedValue({ id: 'new-exam-id', title: 'Test Exam' });
        const mockAssignMutateAsync = vi.fn().mockResolvedValue({});
        vi.mocked(useCreateExamMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
        } as any);
        vi.mocked(useAssignExamMutation).mockReturnValue({
            mutateAsync: mockAssignMutateAsync,
        } as any);

        const { result } = renderHook(() => useExamCreateForm(onClose));

        // Set form fields with instructorId
        act(() => {
            result.current.form.setValue('title', 'Exam Title');
            result.current.form.setValue(
                'description',
                'This is a long description with more than twenty characters.',
            );
            result.current.form.setValue('classroomIds', ['classroom-uuid-1111']);
            result.current.form.setValue('startDateTime', '2026-06-14T08:00');
            result.current.form.setValue('endDateTime', '2026-06-14T09:00');
            result.current.form.setValue('durationMinutes', 60);
            result.current.form.setValue('passingScore', 75);
            result.current.form.setValue('shuffleQuestions', true);
            result.current.form.setValue('showCorrectAnswers', false);
            result.current.form.setValue('allowReview', true);
            result.current.form.setValue('randomizeChoices', true);
            result.current.form.setValue('instructorId', 'instructor-uuid-2222');
        });

        // Submit form
        await act(async () => {
            await result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockMutateAsync).toHaveBeenCalled();
        expect(mockAssignMutateAsync).toHaveBeenCalledWith({
            examId: 'new-exam-id',
            assigneeId: 'instructor-uuid-2222',
        });
        expect(onClose).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
