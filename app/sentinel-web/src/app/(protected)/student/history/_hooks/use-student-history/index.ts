import { useState } from 'react';
import { useExamHistoryQuery } from '@sentinel/hooks';
import { useStableValue } from '@sentinel/hooks';
import { HistoryFilterStatus } from '@sentinel/shared/types';
import { groupItemsByDate } from '@/app/(protected)/student/_lib/student-exam-listing';
import { UseStudentHistoryReturn } from '@/app/(protected)/student/history/_hooks/use-student-history/_types';

export function useStudentHistory(): UseStudentHistoryReturn {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<HistoryFilterStatus>('turned_in');
    const { data: history = [], isLoading } = useExamHistoryQuery();

    const filteredHistory = useStableValue(() => {
        return history.filter((item) => {
            const matchesSearch =
                item.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subject.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [history, searchQuery, statusFilter]);

    const groupedHistory = useStableValue(() => {
        return groupItemsByDate({
            items: filteredHistory,
            getDate: (item) =>
                item.status === 'turned_in'
                    ? item.completedAt ?? item.dueAt ?? item.availableAt
                    : item.dueAt ?? item.completedAt ?? item.availableAt,
            sortDirection: 'desc',
        });
    }, [filteredHistory, statusFilter]);

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        groupedHistory,
        hasItems: filteredHistory.length > 0,
        isLoading,
    };
}
