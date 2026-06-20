import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentHistory } from './index';
import { useInfiniteExamHistoryQuery, useExamsQuery } from '@sentinel/hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

vi.mock('@sentinel/hooks', () => ({
    useInfiniteExamHistoryQuery: vi.fn(),
    useExamsQuery: vi.fn(),
    useStableValue: (fn: () => any) => fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
}));

describe('useStudentHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns available, upcoming, and in-progress exams under the available tab', () => {
        vi.mocked(usePathname).mockReturnValue('/student/exam');
        vi.mocked(useSearchParams).mockReturnValue({
            get: () => null,
        } as any);

        const mockExams = [
            {
                id: 'exam-1',
                title: 'Available Exam',
                subject: 'Math',
                scheduledDate: '2026-06-20T10:00:00Z',
                endDateTime: '2026-06-20T12:00:00Z',
                status: 'available',
                duration: 60,
                totalScore: 100,
            },
            {
                id: 'exam-2',
                title: 'Upcoming Exam',
                subject: 'Science',
                scheduledDate: '2026-06-21T10:00:00Z',
                endDateTime: '2026-06-21T12:00:00Z',
                status: 'upcoming',
                duration: 90,
                totalScore: 100,
            },
            {
                id: 'exam-3',
                title: 'In Progress Exam',
                subject: 'History',
                scheduledDate: '2026-06-20T08:00:00Z',
                endDateTime: '2026-06-20T10:00:00Z',
                status: 'in-progress',
                duration: 45,
                totalScore: 50,
            },
            {
                id: 'exam-4',
                title: 'Past Due Exam',
                subject: 'History',
                scheduledDate: '2026-06-19T08:00:00Z',
                endDateTime: '2026-06-19T10:00:00Z',
                status: 'past_due',
                duration: 45,
                totalScore: 50,
            },
        ];

        vi.mocked(useExamsQuery).mockReturnValue({
            data: mockExams,
            isLoading: false,
        } as any);
        vi.mocked(useInfiniteExamHistoryQuery).mockReturnValue({
            data: { pages: [{ items: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } }] },
            isLoading: false,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        } as any);

        const { result } = renderHook(() => useStudentHistory());

        expect(result.current.statusFilter).toBe('available');
        expect(result.current.groupedHistory).toHaveLength(2); // Grouped by dates (e.g. June 20, June 21)

        // Flatten items from grouped history to verify contents
        const allItems = result.current.groupedHistory.flatMap((g) => g.items);
        expect(allItems).toHaveLength(3); // available, upcoming, and in-progress included (past_due excluded)
        expect(allItems.map((i) => i.id)).toContain('exam-1');
        expect(allItems.map((i) => i.id)).toContain('exam-2');
        expect(allItems.map((i) => i.id)).toContain('exam-3');
    });

    it('returns history items for turned_in status', () => {
        vi.mocked(usePathname).mockReturnValue('/student/history');
        vi.mocked(useSearchParams).mockReturnValue({
            get: (param: string) => (param === 'tab' ? 'turned_in' : null),
        } as any);

        const mockHistory = [
            {
                id: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Math Exam',
                subject: 'Math',
                status: 'turned_in',
                completedAt: '2026-06-20T11:00:00Z',
                dueAt: '2026-06-20T12:00:00Z',
            },
            {
                id: 'attempt-2',
                examId: 'exam-2',
                examTitle: 'Science Exam',
                subject: 'Science',
                status: 'past_due',
                completedAt: null,
                dueAt: '2026-06-19T10:00:00Z',
            },
        ];

        vi.mocked(useExamsQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);
        const turnedInHistory = mockHistory.filter((h) => h.status === 'turned_in');
        vi.mocked(useInfiniteExamHistoryQuery).mockReturnValue({
            data: { pages: [{ items: turnedInHistory, pagination: { page: 1, limit: 10, total: turnedInHistory.length, hasMore: false } }] },
            isLoading: false,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        } as any);

        const { result } = renderHook(() => useStudentHistory());

        expect(result.current.statusFilter).toBe('turned_in');
        const allItems = result.current.groupedHistory.flatMap((g) => g.items);
        expect(allItems).toHaveLength(1);
        expect(allItems[0].id).toBe('attempt-1');
    });

    it('returns history items for past_due status', () => {
        vi.mocked(usePathname).mockReturnValue('/student/history');
        vi.mocked(useSearchParams).mockReturnValue({
            get: (param: string) => (param === 'tab' ? 'past_due' : null),
        } as any);

        const mockHistory = [
            {
                id: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Math Exam',
                subject: 'Math',
                status: 'turned_in',
                completedAt: '2026-06-20T11:00:00Z',
                dueAt: '2026-06-20T12:00:00Z',
            },
            {
                id: 'attempt-2',
                examId: 'exam-2',
                examTitle: 'Science Exam',
                subject: 'Science',
                status: 'past_due',
                completedAt: null,
                dueAt: '2026-06-19T10:00:00Z',
            },
        ];

        vi.mocked(useExamsQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);
        const pastDueHistory = mockHistory.filter((h) => h.status === 'past_due');
        vi.mocked(useInfiniteExamHistoryQuery).mockReturnValue({
            data: { pages: [{ items: pastDueHistory, pagination: { page: 1, limit: 10, total: pastDueHistory.length, hasMore: false } }] },
            isLoading: false,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        } as any);

        const { result } = renderHook(() => useStudentHistory());

        expect(result.current.statusFilter).toBe('past_due');
        const allItems = result.current.groupedHistory.flatMap((g) => g.items);
        expect(allItems).toHaveLength(1);
        expect(allItems[0].id).toBe('attempt-2');
    });

    it('sets status filters correctly by changing route', () => {
        vi.mocked(usePathname).mockReturnValue('/student/exam');
        vi.mocked(useSearchParams).mockReturnValue({
            get: () => null,
        } as any);
        vi.mocked(useExamsQuery).mockReturnValue({ data: [], isLoading: false } as any);
        vi.mocked(useInfiniteExamHistoryQuery).mockReturnValue({
            data: { pages: [{ items: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } }] },
            isLoading: false,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        } as any);

        const { result } = renderHook(() => useStudentHistory());

        result.current.setStatusFilter('past_due');
        expect(mockPush).toHaveBeenCalledWith('/student/history?tab=past_due');

        result.current.setStatusFilter('available');
        expect(mockPush).toHaveBeenCalledWith('/student/exam');
    });
});
