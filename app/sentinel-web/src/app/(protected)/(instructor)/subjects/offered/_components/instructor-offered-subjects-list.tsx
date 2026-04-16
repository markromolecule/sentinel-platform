'use client';

import { DataTable, type DataTableFacet } from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { type SubjectOffering } from '@sentinel/shared/types';
import { InstructorOfferedSubjectsEmptyState } from './instructor-offered-subjects-empty-state';

const offeredSubjectsFacets = [
    {
        columnKey: 'status',
        title: 'Status',
        options: [
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Open', value: 'OPEN' },
            { label: 'Closed', value: 'CLOSED' },
            { label: 'Archived', value: 'ARCHIVED' },
        ],
    },
] satisfies DataTableFacet[];

interface InstructorOfferedSubjectsListProps {
    offerings: SubjectOffering[];
    columns: ColumnDef<SubjectOffering>[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function InstructorOfferedSubjectsList({
    offerings,
    columns,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: InstructorOfferedSubjectsListProps) {
    return (
        <DataTable
            columns={columns}
            data={offerings}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search offered subjects..."
            isLoading={isLoading}
            facets={offeredSubjectsFacets}
            emptyContent={<InstructorOfferedSubjectsEmptyState searchTerm={searchTerm} />}
        />
    );
}
