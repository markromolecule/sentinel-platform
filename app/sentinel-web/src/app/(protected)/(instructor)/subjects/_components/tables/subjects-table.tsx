'use client';

import { DataTable } from '@sentinel/ui';
import { type Subject } from '@sentinel/shared/types';
import { type ColumnDef } from '@tanstack/react-table';
import { columns as defaultColumns } from '@/app/(protected)/(instructor)/subjects/_components/tables/columns';

interface SubjectsTableProps {
    data: Subject[];
    columns?: () => ColumnDef<Subject>[];
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    facets?: {
        columnKey: string;
        title: string;
        options: {
            label: string;
            value: string;
            icon?: React.ComponentType<{ className?: string }>;
        }[];
    }[];
}

export function SubjectsTable({
    data,
    columns = defaultColumns,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search subjects...',
    facets,
}: SubjectsTableProps) {
    return (
        <DataTable
            columns={columns()}
            data={data}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            facets={facets}
        />
    );
}
