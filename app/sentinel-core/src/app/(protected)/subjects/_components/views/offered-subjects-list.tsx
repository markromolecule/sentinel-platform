'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    DataTable,
} from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { type SubjectOffering } from '@sentinel/shared/types';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { deleteSubjectOffering } from '@sentinel/services';
import { OfferedSubjectsEmptyState } from './offered-subjects-empty-state';
import { offeredSubjectsFacets } from './offered-subjects-facets';
import { useState } from 'react';
import { FloatingActionBar } from './floating-action-bar';
import { useApi } from '@sentinel/hooks';
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
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [isBulkUnofferPending, setIsBulkUnofferPending] = useState(false);
    const apiClient = useApi();
    const queryClient = useQueryClient();

    const selectedOfferings = offerings.filter((_, index) => rowSelection[index.toString()]);

    async function handleBulkUnoffer() {
        const ids = selectedOfferings.map((o) => o.id);

        if (ids.length === 0 || isBulkUnofferPending) return;

        try {
            setIsBulkUnofferPending(true);
            await Promise.all(ids.map((id) => deleteSubjectOffering(apiClient, id)));
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all }),
            ]);
            setRowSelection({});
            setBulkDeleteOpen(false);
            toast.success(`Successfully removed ${ids.length} offered subjects`);
        } catch {
            toast.error('Failed to remove some offered subjects. Please try again.');
        } finally {
            setIsBulkUnofferPending(false);
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
                onUnoffer={() => setBulkDeleteOpen(true)}
                isPending={isBulkUnofferPending}
            />

            <AlertDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (isBulkUnofferPending) return;

                    setBulkDeleteOpen(open);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unoffer selected subjects?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove {selectedOfferings.length} selected offered subject
                            {selectedOfferings.length === 1 ? '' : 's'} from their assigned term
                            audiences. The master subject records will remain in the catalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBulkUnofferPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isBulkUnofferPending || selectedOfferings.length === 0}
                            onClick={async (event) => {
                                event.preventDefault();
                                await handleBulkUnoffer();
                            }}
                        >
                            {isBulkUnofferPending
                                ? 'Removing...'
                                : `Unoffer Selected (${selectedOfferings.length})`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
