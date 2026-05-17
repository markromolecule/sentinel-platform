'use client';

import { useEffect, useRef } from 'react';
import { UseDataTableFilterSyncArgs } from './_types';

/**
 * Hook to sync DataTable column filters to external state (like API query params).
 */
export function useDataTableFilterSync({
    columnFilters,
    onFilterChange,
    syncKeys,
}: UseDataTableFilterSyncArgs) {
    const prevFiltersRef = useRef(columnFilters);

    useEffect(() => {
        const prevFilters = prevFiltersRef.current;

        syncKeys.forEach((key) => {
            const currentFilter = columnFilters.find((f) => f.id === key);
            const prevFilter = prevFilters.find((f) => f.id === key);

            // If the filter value changed (or was added/removed)
            const currentValue = (currentFilter?.value as string[])?.[0]; // Support single select from facet for now
            const prevValue = (prevFilter?.value as string[])?.[0];

            if (currentValue !== prevValue) {
                onFilterChange(key, currentValue);
            }
        });

        prevFiltersRef.current = columnFilters;
    }, [columnFilters, onFilterChange, syncKeys]);
}
