import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExamCreateForm } from './use-exam-create-form';
import { useCreateExamMutation } from '@sentinel/hooks';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useCreateExamMutation: vi.fn(),
}));

describe('useExamCreateForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits form and calls createExamMutation', async () => {
        const onClose = vi.fn();
        const mockMutateAsync = vi
            .fn()
            .mockResolvedValue({ id: 'new-exam-id', title: 'Test Exam' });
        vi.mocked(useCreateExamMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
        } as any);

        const { result } = renderHook(() => useExamCreateForm(onClose));

        // Set minimal valid form fields
        act(() => {
            result.current.form.setValue('title', 'Exam Title');
            result.current.form.setValue(
                'description',
                'This is a long description with more than twenty characters.',
            );
            result.current.form.setValue('subjectId', 'subject-uuid-1111');
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

        expect(mockMutateAsync).toHaveBeenCalledWith({
            title: 'Exam Title',
            description: 'This is a long description with more than twenty characters.',
            subjectId: 'subject-uuid-1111',
            startDateTime: new Date('2026-06-14T08:00').toISOString(),
            endDateTime: new Date('2026-06-14T09:00').toISOString(),
            durationMinutes: 60,
            passingScore: 75,
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
            isPublic: false,
        });
        expect(onClose).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
