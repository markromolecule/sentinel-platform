import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExamEditForm } from './use-exam-edit-form';
import { useUpdateExamMutation } from '@sentinel/hooks';
import type { ProctorExam } from '@sentinel/shared/types';

vi.mock('@sentinel/hooks', () => ({
    useUpdateExamMutation: vi.fn(),
}));

describe('useExamEditForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockExam: ProctorExam = {
        id: 'exam-uuid-1111',
        title: 'Original Title',
        description: 'This is a long description with more than twenty characters.',
        duration: 60,
        passingScore: 75,
        status: 'draft',
        subject: 'Math',
        subjectId: 'subject-uuid-1111',
        createdAt: '2026-06-14T08:00:00Z',
        updatedAt: '2026-06-14T08:00:00Z',
        classroomIds: ['classroom-uuid-1111'],
        roomId: 'room-uuid-1111',
        assignedInstructorIds: ['instructor-uuid-1111'],
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        },
    } as any;

    it('initializes form with existing values and submits update payload without nulling them', async () => {
        const onClose = vi.fn();
        const mockMutateAsync = vi.fn().mockResolvedValue({});
        vi.mocked(useUpdateExamMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        } as any);

        const { result } = renderHook(() => useExamEditForm(mockExam, onClose));

        // Form values should be initialized correctly
        expect(result.current.form.getValues().title).toBe('Original Title');
        expect(result.current.form.getValues().classroomIds).toEqual(['classroom-uuid-1111']);
        expect(result.current.form.getValues().roomId).toBe('room-uuid-1111');
        expect(result.current.form.getValues().instructorId).toBe('instructor-uuid-1111');
        expect(result.current.form.getValues().instructorIds).toEqual(['instructor-uuid-1111']);

        // Submit form without modifying anything
        await act(async () => {
            await result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockMutateAsync).toHaveBeenCalledWith({
            id: 'exam-uuid-1111',
            payload: {
                title: 'Original Title',
                description: 'This is a long description with more than twenty characters.',
                subjectId: 'subject-uuid-1111',
                classroomId: 'classroom-uuid-1111',
                classroomIds: ['classroom-uuid-1111'],
                sectionIds: [],
                roomId: 'room-uuid-1111',
                startDateTime: expect.any(String),
                endDateTime: expect.any(String),
                durationMinutes: 60,
                passingScore: 75,
                shuffleQuestions: true,
                showCorrectAnswers: false,
                allowReview: true,
                randomizeChoices: true,
                isPublic: false,
                instructorId: 'instructor-uuid-1111',
                instructorIds: ['instructor-uuid-1111'],
            },
        });
        expect(onClose).toHaveBeenCalled();
    });
});
