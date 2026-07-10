import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamsQuery } from '@sentinel/hooks';
import { useExamList } from './use-exam-list';

vi.mock('@sentinel/hooks', () => ({
    useExamsQuery: vi.fn(),
    useStableValue: (fn: () => unknown) => fn(),
}));

describe('useExamList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('keeps private published exams in grouped results after student status normalization', () => {
        vi.mocked(useExamsQuery).mockReturnValue({
            data: [
                {
                    id: 'exam-private-published',
                    title: 'Private Published Exam',
                    subject: 'Physics',
                    status: 'published',
                    isPublic: false,
                    scheduledDate: null,
                    endDateTime: null,
                    publishedAt: '2099-06-24T08:00:00.000Z',
                    completedAt: null,
                    duration: 60,
                    totalScore: 100,
                    createdAt: '2099-06-24T08:00:00.000Z',
                    classroomId: null,
                    classroomIds: ['classroom-1'],
                    sectionIds: [],
                },
            ],
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useExamList());
        const groupedItems = result.current.groupedExams.flatMap((group) => group.items);

        expect(result.current.hasExams).toBe(true);
        expect(groupedItems).toHaveLength(1);
        expect(groupedItems[0]).toMatchObject({
            id: 'exam-private-published',
            status: 'available',
        });
    });
});
