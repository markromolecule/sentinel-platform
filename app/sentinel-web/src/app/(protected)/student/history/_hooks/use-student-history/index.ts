import { useState, useMemo } from 'react';
import { useInfiniteExamHistoryQuery, useExamsQuery } from '@sentinel/hooks';
import { useStableValue } from '@sentinel/hooks';
import { HistoryFilterStatus, ExamHistory } from '@sentinel/shared/types';
import { groupItemsByDate } from '@/app/(protected)/student/_lib/student-exam-listing';
import { UseStudentHistoryReturn } from '@/app/(protected)/student/history/_hooks/use-student-history/_types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useStudentHistory(): UseStudentHistoryReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');

    // Derive status from URL
    const statusFilter = useMemo<HistoryFilterStatus>(() => {
        if (pathname.includes('/student/exam')) return 'available';
        const tab = searchParams.get('tab');
        if (tab === 'past_due') return 'past_due';
        return 'turned_in';
    }, [pathname, searchParams]);

    const setStatusFilter = (status: HistoryFilterStatus) => {
        if (status === 'available') {
            router.push('/student/exam');
        } else {
            router.push(`/student/history?tab=${status}`);
        }
    };

    const {
        data: historyData,
        isLoading: isHistoryLoading,
        fetchNextPage,
        hasNextPage = false,
        isFetchingNextPage = false,
    } = useInfiniteExamHistoryQuery(
        statusFilter !== 'available'
            ? {
                  status: statusFilter,
                  search: searchQuery || undefined,
                  limit: 10,
              }
            : undefined,
    );

    const { data: exams = [], isLoading: isExamsLoading } = useExamsQuery();

    const history = useMemo(() => {
        if (!historyData) return [];
        return historyData.pages.flatMap((page) => page.items);
    }, [historyData]);

    const filteredHistory = useStableValue(() => {
        if (statusFilter === 'available') {
            return exams
                .filter((exam) => {
                    const matchesSearch =
                        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                        matchesSearch &&
                        (exam.status === 'upcoming' ||
                            exam.status === 'available' ||
                            exam.status === 'in-progress')
                    );
                })
                .map((exam) => ({
                    id: exam.id,
                    examId: exam.id,
                    examTitle: exam.title,
                    subject: exam.subject,
                    availableAt: exam.scheduledDate ?? exam.publishedAt,
                    dueAt: exam.endDateTime,
                    status: exam.status,
                    durationMinutes: exam.duration,
                    totalScore: exam.totalScore,
                }));
        }

        return history;
    }, [history, exams, searchQuery, statusFilter]);

    const groupedHistory = useStableValue(() => {
        return groupItemsByDate({
            items: filteredHistory as ExamHistory[],
            getDate: (item) =>
                statusFilter === 'turned_in'
                    ? (item.completedAt ?? item.dueAt ?? item.availableAt)
                    : (item.dueAt ?? item.completedAt ?? item.availableAt),
            sortDirection: statusFilter === 'available' ? 'asc' : 'desc',
        });
    }, [filteredHistory, statusFilter]);

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        groupedHistory,
        hasItems: filteredHistory.length > 0,
        isLoading: isHistoryLoading || isExamsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    };
}
