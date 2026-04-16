import { ExamHistory } from '@sentinel/shared/types';
import { HistoryFilterStatus } from '@sentinel/shared/types';

export interface UseStudentHistoryReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: HistoryFilterStatus;
    setStatusFilter: (status: HistoryFilterStatus) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    paginatedHistory: ExamHistory[];
    totalPages: number;
    hasItems: boolean;
}
