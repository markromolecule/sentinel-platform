import { DateGroup } from '@/app/(protected)/student/_lib/student-exam-listing';
import { ExamHistory } from '@sentinel/shared/types';
import { HistoryFilterStatus } from '@sentinel/shared/types';

export interface UseStudentHistoryReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: HistoryFilterStatus;
    setStatusFilter: (status: HistoryFilterStatus) => void;
    groupedHistory: DateGroup<ExamHistory>[];
    hasItems: boolean;
    isLoading: boolean;
}
