'use client';

import { useState, useEffect, useRef } from 'react';
import { type PaginationState } from '@tanstack/react-table';

/**
 * Custom hook to manage server-side pagination state, allowing custom initial state
 * and resetting the page index to 0 when any of the watched dependencies change.
 *
 * @param watchDependencies Optional array of dependencies (e.g., search terms, filter states) to watch.
 *                          When any dependency changes, pageIndex is reset to 0.
 * @param initialState Optional initial pagination state. Defaults to { pageIndex: 0, pageSize: 10 }.
 * @returns An object containing pagination state and its setter function.
 */
export function useServerPagination(
    watchDependencies: any[] = [],
    initialState: PaginationState = { pageIndex: 0, pageSize: 10 },
) {
    const [pagination, setPagination] = useState<PaginationState>(initialState);

    // Track if this is the first render to avoid resetting on mount
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setPagination((current) =>
            current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
        );
    }, watchDependencies);

    return { pagination, setPagination };
}
