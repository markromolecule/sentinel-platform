import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import { useExamCreateForm } from './use-exam-create-form';
import {
    useCreateExamMutation,
    useExaminationConfigurationDefaultsQuery,
} from '@sentinel/hooks';

const mockPush = vi.fn();
const mockSetSetupDraft = vi.fn();
let mockedDefaults: any;

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useCreateExamMutation: vi.fn(),
    useExaminationConfigurationDefaultsQuery: vi.fn(() => ({
        data: mockedDefaults,
    })),
}));

vi.mock('@/features/exams/builder/_stores/use-exam-store', () => ({
    useExamStore: {
        getState: () => ({
            setSetupDraft: mockSetSetupDraft,
        }),
    },
}));

describe('useExamCreateForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedDefaults = undefined;
    });

    it('submits required fields while omitting untouched inherited defaults', async () => {
        const onClose = vi.fn();
        const mockMutateAsync = vi.fn().mockResolvedValue({
            id: 'new-exam-id',
            title: 'Test Exam',
            description: '',
            subjectId: 'subject-uuid-1111',
            scheduledDate: new Date('2026-06-14T08:00').toISOString(),
            endDateTime: new Date('2026-06-14T09:00').toISOString(),
            duration: 60,
            passingScore: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultPassingScore,
            settings: {
                shuffleQuestions: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultShuffleQuestions,
                showCorrectAnswers:
                    DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultShowCorrectAnswers,
                allowReview: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAllowReview,
                randomizeChoices:
                    DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultRandomizeChoices,
            },
        });
        vi.mocked(useCreateExamMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
        } as any);

        const { result } = renderHook(() => useExamCreateForm(onClose));

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
        });

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
            isPublic: false,
        });
        expect(mockSetSetupDraft).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/exams/new-exam-id/builder');
    });

    it('hydrates pristine form defaults when examination defaults load', async () => {
        vi.mocked(useCreateExamMutation).mockReturnValue({
            mutateAsync: vi.fn(),
        } as any);

        const { result, rerender } = renderHook(() => useExamCreateForm(vi.fn()));

        expect(result.current.form.getValues('passingScore')).toBe(
            DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultPassingScore,
        );

        mockedDefaults = {
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
            defaultDurationMinutes: 90,
            defaultPassingScore: 88,
            defaultShuffleQuestions: true,
        };

        rerender();

        await waitFor(() => {
            expect(result.current.form.getValues('passingScore')).toBe(88);
            expect(result.current.form.getValues('durationMinutes')).toBe(90);
            expect(result.current.form.getValues('shuffleQuestions')).toBe(true);
        });
    });

    it('preserves dirty form values when examination defaults load later', async () => {
        vi.mocked(useCreateExamMutation).mockReturnValue({
            mutateAsync: vi.fn(),
        } as any);

        const { result, rerender } = renderHook(() => useExamCreateForm(vi.fn()));

        act(() => {
            result.current.form.setValue('title', 'Do not overwrite me', { shouldDirty: true });
        });

        mockedDefaults = {
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
            defaultPassingScore: 88,
        };

        rerender();

        await waitFor(() => {
            expect(result.current.form.getValues('title')).toBe('Do not overwrite me');
        });
        expect(result.current.form.getValues('passingScore')).toBe(
            DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultPassingScore,
        );
    });
});
