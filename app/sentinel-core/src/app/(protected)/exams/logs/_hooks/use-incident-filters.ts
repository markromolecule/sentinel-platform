import { useState, useMemo } from 'react';
import { useDebounce } from '@sentinel/hooks';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { type ApiGetExamIncidentsQuery } from '@sentinel/services';

/**
 * Hook to manage incident table search, column filters, and compilation of queryParams.
 */
export function useIncidentFilters() {
    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const debouncedSearch = useDebounce(search, 300);

    const queryParams = useMemo(() => {
        const q: Omit<ApiGetExamIncidentsQuery, 'page'> = {
            limit: 50,
        };

        if (debouncedSearch.trim() !== '') {
            q.studentId = debouncedSearch.trim();
        }

        columnFilters.forEach((filter) => {
            const val = filter.value as string[] | undefined;
            if (!val || val.length === 0) return;

            const firstVal = val[0];

            if (filter.id === 'sectionName') {
                q.sectionId = firstVal;
            } else if (filter.id === 'severity') {
                q.severity = firstVal as ApiGetExamIncidentsQuery['severity'];
            } else if (filter.id === 'incidentType') {
                q.type = firstVal;
            } else if (filter.id === 'status') {
                q.status = firstVal as ApiGetExamIncidentsQuery['status'];
            }
        });

        return q;
    }, [debouncedSearch, columnFilters]);

    return {
        search,
        setSearch,
        columnFilters,
        setColumnFilters,
        queryParams,
    };
}
