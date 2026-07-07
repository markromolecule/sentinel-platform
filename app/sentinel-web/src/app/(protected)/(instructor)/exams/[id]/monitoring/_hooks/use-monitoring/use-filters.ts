'use client';

import { useState } from 'react';
import { useDebounce, useStableValue } from '@sentinel/hooks';
import type { StudentSession } from '@sentinel/shared/types';

/**
 * useFilters manages the search and filter state for student sessions
 * and derives the filtered list of students.
 *
 * @param students - The array of student sessions to filter.
 */
export function useFilters(students?: StudentSession[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [page, setPage] = useState(1);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const filteredStudents = useStableValue(() => {
        const studentsList = students ?? [];

        return studentsList.filter((student) => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                student.studentNo.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [students, debouncedSearchQuery, filterStatus]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleFilterChange = (value: string) => {
        setFilterStatus(value);
        setPage(1);
    };

    return {
        searchQuery,
        filterStatus,
        page,
        filteredStudents,
        handleSearchChange,
        handleFilterChange,
        setPage,
    };
}
export type UseFiltersReturn = ReturnType<typeof useFilters>;
