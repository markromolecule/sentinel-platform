import { ColumnFiltersState } from '@tanstack/react-table';

export interface UseDataTableFilterSyncArgs {
    columnFilters: ColumnFiltersState;
    onFilterChange: (key: string, value: string | undefined) => void;
    syncKeys: string[];
}
