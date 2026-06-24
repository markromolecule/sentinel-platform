import { useState } from 'react';
import { useExamsQuery } from '@sentinel/hooks';
import { useStableValue } from '@sentinel/hooks';
import { groupItemsByDate } from '@/app/(protected)/student/_lib/student-exam-listing';
import { normalizeStudentExam } from '@/app/(protected)/student/_lib/normalize-student-exam';

/**
 * Builds the student exam list grouped by scheduled availability date.
 */
export function useExamList() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: exams = [], isLoading } = useExamsQuery(undefined, {
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    const filteredExams = useStableValue(() => {
        return exams.map(normalizeStudentExam).filter((exam) => {
            const matchesSearch =
                exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.subject.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch && (exam.status === 'upcoming' || exam.status === 'available');
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
