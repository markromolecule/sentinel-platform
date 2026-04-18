import { useState } from 'react';
import { useExamsQuery } from '@sentinel/hooks';
import { useStableValue } from '@sentinel/hooks';
import { groupItemsByDate } from '@/app/(protected)/student/_lib/student-exam-listing';

export function useExamList() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: exams = [], isLoading } = useExamsQuery();

    const filteredExams = useStableValue(() => {
        return exams.filter((exam) => {
            const matchesSearch =
                exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.subject.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch && exam.status === 'upcoming';
        });
    }, [exams, searchQuery]);

    const groupedExams = useStableValue(() => {
        return groupItemsByDate({
            items: filteredExams,
            getDate: (exam) => exam.scheduledDate ?? exam.endDateTime ?? exam.publishedAt ?? null,
            sortDirection: 'asc',
        });
    }, [filteredExams]);

    return {
        searchQuery,
        setSearchQuery,
        groupedExams,
        hasExams: filteredExams.length > 0,
        isLoading,
    };
}
