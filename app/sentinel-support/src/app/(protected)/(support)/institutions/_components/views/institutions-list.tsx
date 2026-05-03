'use client';

import { useDeleteInstitutionsMutation, useStableValue } from '@sentinel/hooks';
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
import { useRouter } from 'next/navigation';
import { type Institution } from '@sentinel/shared/types';
import { createInstitutionColumns } from '@/app/(protected)/(support)/institutions/_components/tables/columns';
import { InstitutionsEmptyState } from './institutions-empty-state';
import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface InstitutionsListProps {
    institutions: Institution[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function InstitutionsList({
    institutions,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: InstitutionsListProps) {
    const [rowSelection, setRowSelection] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const deleteInstitutionsMutation = useDeleteInstitutionsMutation({
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

    const facets = useStableValue(() => [], []);
    const columns = useMemo(() => createInstitutionColumns(institutions), [institutions]);

    const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index as keyof typeof rowSelection])
        .map((index) => institutions[parseInt(index)]?.id)
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            deleteInstitutionsMutation.mutate(selectedIds);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={institutions}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search institutions..."
                facets={facets}
                isLoading={isLoading}
                emptyContent={<InstitutionsEmptyState searchTerm={searchTerm} />}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                onRowClick={(row) => {
                    if (row.institutionKind === 'PARENT') {
                        router.push(`/institutions?parentId=${row.id}`);
                    }
                }}
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
                        <DialogTitle>Delete Selected Institutions?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected
                            institution(s)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={deleteInstitutionsMutation.isPending}
                        >
                            {deleteInstitutionsMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Institutions</AlertDialogTitle>
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
