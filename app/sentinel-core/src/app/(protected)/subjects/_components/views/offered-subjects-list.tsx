'use client';

import { DataTable } from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { type SubjectOffering } from '@sentinel/shared/types';
import { OfferedSubjectsEmptyState } from './offered-subjects-empty-state';
import { offeredSubjectsFacets } from './offered-subjects-facets';

interface OfferedSubjectsListProps {
    offerings: SubjectOffering[];
    columns: ColumnDef<SubjectOffering>[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function OfferedSubjectsList({
    offerings,
    columns,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: OfferedSubjectsListProps) {
    return (
        <DataTable
            columns={columns}
            data={offerings}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search offered subjects..."
            isLoading={isLoading}
            facets={offeredSubjectsFacets}
            emptyContent={<OfferedSubjectsEmptyState searchTerm={searchTerm} />}
        />
    );
}
