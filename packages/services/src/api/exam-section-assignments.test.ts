import { describe, expect, it, vi } from 'vitest';
import { createExamSectionAssignmentsBatch } from './exam-section-assignments';

describe('createExamSectionAssignmentsBatch', () => {
    it('sends the selected classroom relationship to the backend', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            message: 'Exam section assignments created successfully',
            data: [],
        });

        await createExamSectionAssignmentsBatch(apiClient as any, {
            examId: 'exam-1',
            payload: {
                assignments: [
                    {
                        sectionId: 'section-1',
                        classGroupId: 'classroom-1',
                        roomId: 'room-1',
                    },
                ],
            },
        });

        expect(apiClient).toHaveBeenCalledWith('/exams/exam-1/section-assignments/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assignments: [
                    {
                        sectionId: 'section-1',
                        classGroupId: 'classroom-1',
                        roomId: 'room-1',
                    },
                ],
            }),
        });
    });
});
