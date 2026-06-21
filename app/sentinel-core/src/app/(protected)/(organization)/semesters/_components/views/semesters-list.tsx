'use client';

import { useInstitutionsQuery, useDeleteSemestersMutation, useStableValue } from '@sentinel/hooks';
import { ApiError } from '@sentinel/services';
import { Semester } from '@sentinel/shared/types';
import {
    DataTable,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import { columns } from '../tables/columns';
import { SemestersEmptyState } from './semesters-empty-state';
import { SEMESTER_OPTIONS } from '../dialogs/constants';
import { useState } from 'react';
import { type PaginationState } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

interface SemestersListProps {
    semesters: Semester[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    pageCount?: number;
    totalCount?: number;
    manualPagination?: boolean;
}

export function SemestersList({
    semesters,
    searchTerm,
    onSearchChange,
    isLoading = false,
    pagination,
    onPaginationChange,
    pageCount,
    totalCount,
    manualPagination = false,
}: SemestersListProps) {
    const { data: institutions = [] } = useInstitutionsQuery();
    const [rowSelection, setRowSelection] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const deleteSemestersMutation = useDeleteSemestersMutation({
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setRowSelection({});
        },
        onError: (error) => {
            if (error instanceof ApiError && error.status === 409) {
                setErrorMessage(error.message);
                setIsErrorDialogOpen(true);
                setIsDeleteDialogOpen(false);
            }
        },
    });

    const facets = useStableValue(
        () => [
            {
                columnKey: 'institution',
                title: 'Institution',
                options: institutions.map((institution) => ({
                    label: institution.name,
                    value: institution.name,
                })),
            },
            {
                columnKey: 'semester',
                title: 'Semester',
                options: SEMESTER_OPTIONS.map((semester) => ({
                    label: semester,
                    value: semester,
                })),
            },
            {
                columnKey: 'status',
                title: 'Status',
                options: [
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' },
                ],
            },
            {
                columnKey: 'origin',
                title: 'Origin',
                options: ['Inherited', 'Local', 'Overridden'].map((origin) => ({
                    label: origin,
                    value: origin,
                })),
            },
        ],
        [institutions],
    );

    const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index as keyof typeof rowSelection])
        .map((index) => semesters[parseInt(index)]?.id)
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            deleteSemestersMutation.mutate(selectedIds);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={semesters}
                facets={facets}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search institution, academic year, or semester..."
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                pageCount={pageCount}
                totalCount={totalCount}
                manualPagination={manualPagination}
                emptyContent={<SemestersEmptyState searchTerm={searchTerm} />}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={
                    selectedIds.length > 0 ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="h-8"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {selectedIds.length}
                        </Button>
                    ) : null
                }
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Selected Semesters?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected
                            semester(s)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={deleteSemestersMutation.isPending}
                        >
                            {deleteSemestersMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Semesters</AlertDialogTitle>
                        <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsErrorDialogOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
