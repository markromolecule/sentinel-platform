'use client';

import {
    useInstitutionsQuery,
    useDeleteDepartmentsMutation,
    useStableValue,
} from '@sentinel/hooks';
import { ApiError } from '@sentinel/services';
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
import { PermissionGuard } from '@sentinel/hooks';
import { type Department } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(support)/departments/_components/tables/columns';
import { DepartmentsEmptyState } from './departments-empty-state';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useInstitutionFacet, useDataTableFilterSync } from '@/hooks';
import { ColumnFiltersState, type PaginationState } from '@tanstack/react-table';

// interface for the departments list
interface DepartmentsListProps {
    departments: Department[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    selectedInstitutionId?: string;
    onInstitutionChange?: (id: string | undefined) => void;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    pageCount?: number;
    totalCount?: number;
    manualPagination?: boolean;
}

export function DepartmentsList({
    departments,
    searchTerm,
    onSearchChange,
    isLoading = false,
    selectedInstitutionId,
    onInstitutionChange,
    pagination,
    onPaginationChange,
    pageCount,
    totalCount,
    manualPagination,
}: DepartmentsListProps) {
    const { data: institutions = [] } = useInstitutionsQuery();
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        selectedInstitutionId ? [{ id: 'institution', value: [selectedInstitutionId] }] : [],
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const institutionOptions = useInstitutionFacet({ institutions });

    useDataTableFilterSync({
        columnFilters,
        syncKeys: ['institution'],
        onFilterChange: (key, value) => {
            if (key === 'institution') {
                onInstitutionChange?.(value);
            }
        },
    });

    const deleteDepartmentsMutation = useDeleteDepartmentsMutation({
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
                options: institutionOptions,
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
        [institutionOptions],
    );

    const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index as keyof typeof rowSelection])
        .map((index) => departments[parseInt(index)]?.id)
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            deleteDepartmentsMutation.mutate(selectedIds);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={departments}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                searchPlaceholder="Search departments or institutions..."
                facets={facets}
                isLoading={isLoading}
                emptyContent={<DepartmentsEmptyState searchTerm={searchTerm} />}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                pageCount={pageCount}
                totalCount={totalCount}
                manualPagination={manualPagination}
                toolbarActions={
                    selectedIds.length > 0 ? (
                        <PermissionGuard permission="departments:delete">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="h-8"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete {selectedIds.length}
                            </Button>
                        </PermissionGuard>
                    ) : null
                }
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Selected Departments?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected
                            department(s)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={deleteDepartmentsMutation.isPending}
                        >
                            {deleteDepartmentsMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Departments</AlertDialogTitle>
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
