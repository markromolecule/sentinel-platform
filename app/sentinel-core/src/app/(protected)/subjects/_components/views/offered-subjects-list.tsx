'use client';

import { DataTable } from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { type SubjectOffering } from '@sentinel/shared/types';
import { OfferedSubjectsEmptyState } from './offered-subjects-empty-state';
import { offeredSubjectsFacets } from './offered-subjects-facets';
import { useState } from 'react';
import { FloatingActionBar } from './floating-action-bar';
import { useDeleteSubjectOfferingMutation } from '@sentinel/hooks';
import { toast } from 'sonner';

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
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const deleteMutation = useDeleteSubjectOfferingMutation();

    const selectedRows = Object.keys(rowSelection);
    const selectedOfferings = offerings.filter((_, index) => rowSelection[index.toString()]);

    async function handleBulkUnoffer() {
        const ids = selectedOfferings.map((o) => o.id);

        try {
            await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
            setRowSelection({});
            toast.success(`Successfully removed ${ids.length} offered subjects`);
        } catch (error) {
            toast.error('Failed to remove some offered subjects. Please try again.');
        }
    }

    return (
        <div className="relative">
            <DataTable
                columns={columns}
                data={offerings}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search offered subjects..."
                isLoading={isLoading}
                facets={offeredSubjectsFacets}
                emptyContent={<OfferedSubjectsEmptyState searchTerm={searchTerm} />}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
            />

            <FloatingActionBar
                selectedCount={selectedOfferings.length}
                onClear={() => setRowSelection({})}
                onUnoffer={handleBulkUnoffer}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
