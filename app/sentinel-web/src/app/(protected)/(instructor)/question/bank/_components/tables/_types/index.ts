import { PaginationState, ColumnFiltersState } from '@tanstack/react-table';
import { QuestionTableItem } from '../columns';

export interface QuestionsTableProps {
    questions: QuestionTableItem[];
    isLoading?: boolean;
    searchValue?: string;
    totalCount?: number;
    pageCount?: number;
    pagination?: PaginationState;
    columnFilters?: ColumnFiltersState;
    onSearchChange?: (value: string) => void;
    onPaginationChange?: (pagination: PaginationState) => void;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
    readOnly?: boolean;
    onEdit?: (question: QuestionTableItem) => void;
    onDuplicate?: (question: QuestionTableItem) => Promise<void>;
    onDelete?: (question: QuestionTableItem) => Promise<void>;
    onDeleteSelected?: (questions: QuestionTableItem[]) => Promise<void>;
    isDeleting?: boolean;
}
