import { ExamHistory } from '..';

export type HistoryFilterStatus = 'past_due' | 'turned_in';

export interface HistoryHeaderProps {
    title: string;
    description: string;
}

export interface HistoryFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: HistoryFilterStatus;
    onStatusFilterChange: (status: HistoryFilterStatus) => void;
}

export interface HistoryListProps {
    items: ExamHistory[];
}

export interface HistoryCardProps {
    item: ExamHistory;
}

export interface UseStudentHistoryReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: HistoryFilterStatus;
    setStatusFilter: (status: HistoryFilterStatus) => void;
    filteredHistory: ExamHistory[];
    hasItems: boolean;
}
