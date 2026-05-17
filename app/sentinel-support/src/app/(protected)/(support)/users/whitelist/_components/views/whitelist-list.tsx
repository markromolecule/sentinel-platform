'use client';

import { useState } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { useDeleteSelectedStudentWhitelistMutation } from '@sentinel/hooks';
import {
    DataTable,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { type StudentWhitelist } from '@sentinel/shared/types';
import { columns } from '../tables/columns';
import { WhitelistEmptyState } from './whitelist-empty-state';
import { Trash2 } from 'lucide-react';

interface WhitelistListProps {
    records: StudentWhitelist[];
    search?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    facets?: {
        columnKey: string;
        title: string;
        options: { label: string; value: string }[];
    }[];
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}

/**
 * WhitelistList component wraps the DataTable to display whitelist entries,
 * support filters/facets, and manage bulk selection deletion.
 */
export function WhitelistList({
    records,
    search,
    onSearchChange,
    isLoading = false,
    facets = [],
    columnFilters = [],
    onColumnFiltersChange,
}: WhitelistListProps) {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useDeleteSelectedStudentWhitelistMutation({
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setRowSelection({});
        },
    });

    const selectedIndices = Object.keys(rowSelection)
        .filter((index) => rowSelection[index])
        .map((index) => parseInt(index, 10))
        .filter((index) => !isNaN(index));

    const selectedRecords = selectedIndices
        .map((index) => records[index])
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedRecords.length > 0) {
            deleteMutation.mutate(selectedRecords);
        }
    };

    const hasSelectedRows = selectedRecords.length > 0;

    return (
        <>
            <DataTable
                columns={columns}
                data={records}
                searchValue={search}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search student numbers or names..."
                isLoading={isLoading}
                emptyContent={<WhitelistEmptyState search={search} />}
                facets={facets}
                columnFilters={columnFilters}
                onColumnFiltersChange={onColumnFiltersChange}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={
                    hasSelectedRows ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="h-8"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {selectedRecords.length}
                        </Button>
                    ) : null
                }
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Selected Whitelist Entries?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the {selectedRecords.length} selected whitelist entry/entries?
                            This action cannot be undone and claimed records will be skipped.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
