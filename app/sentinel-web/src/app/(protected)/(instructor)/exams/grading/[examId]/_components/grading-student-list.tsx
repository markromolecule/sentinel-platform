'use client';

import { useMemo } from 'react';
import { DataTable } from '@sentinel/ui';
import type { DataTableFacet } from '@sentinel/ui';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { GradingStudent } from '@sentinel/shared/types';
import { studentColumns } from '@/app/(protected)/(instructor)/exams/grading/_components/student-columns';

interface GradingStudentListProps {
    students: GradingStudent[];
    isLoading?: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    availableSections: {
        id: string;
        name: string;
    }[];
    onSectionChange: (sectionId?: string) => void;
}

/**
 * Renders a flat, paginated DataTable of students for a given exam.
 * Section filtering is via a facet (server-side), search is server-side.
 */
export function GradingStudentList({
    students,
    isLoading,
    searchValue,
    onSearchChange,
    availableSections,
    onSectionChange,
}: GradingStudentListProps) {
    /** Build the section facet options from available sections. */
    const sectionFacet: DataTableFacet = useMemo(
        () => ({
            columnKey: 'sectionName',
            title: 'Section',
            options: availableSections.map((s) => ({
                label: s.name,
                value: s.name,
            })),
        }),
        [availableSections],
    );

    /**
     * When the facet filter changes we derive the selected section ID
     * (by matching the chosen name back to availableSections) and notify
     * the parent so it can refetch with the correct sectionId.
     */
    function handleColumnFiltersChange(filters: ColumnFiltersState) {
        const sectionFilter = filters.find((f) => f.id === 'sectionName');
        if (!sectionFilter || !sectionFilter.value) {
            onSectionChange(undefined);
            return;
        }
        // The faceted filter stores selected values as string[]
        const selectedValues = sectionFilter.value as string[];
        if (selectedValues.length === 0) {
            onSectionChange(undefined);
            return;
        }
        // Use the first selected value; map name → id for the API
        const selectedName = selectedValues[0];
        const match = availableSections.find((s) => s.name === selectedName);
        onSectionChange(match?.id);
    }

    return (
        <DataTable
            columns={studentColumns}
            data={students}
            isLoading={isLoading}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search students..."
            facets={[sectionFacet]}
            onColumnFiltersChange={handleColumnFiltersChange}
            emptyContent={
                <div className="text-muted-foreground py-12 text-center text-sm">
                    No students matched the current filters.
                </div>
            }
        />
    );
}
