import { useCoursesQuery, useDepartmentsQuery, useDeleteSectionsMutation, useActivePermissions } from '@sentinel/hooks';
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
import { type Section } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(admin)/sections/_components/tables/columns';
import { SectionsEmptyState } from './sections-empty-state';
import { buildSectionsFacets } from './sections-facets';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface SectionsListProps {
    sections: Section[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function SectionsList({
    sections,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: SectionsListProps) {
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { hasPermission } = useActivePermissions();
    const [rowSelection, setRowSelection] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const deleteSectionsMutation = useDeleteSectionsMutation({
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

    const facets = buildSectionsFacets({ departments, courses });
    const canDelete = hasPermission('sections:delete');
    
    const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index as keyof typeof rowSelection])
        .map((index) => sections[parseInt(index)]?.id)
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            deleteSectionsMutation.mutate(selectedIds);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={sections}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search sections..."
                facets={facets}
                isLoading={isLoading}
                emptyContent={<SectionsEmptyState searchTerm={searchTerm} />}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={
                    selectedIds.length > 0 && canDelete ? (
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
                        <DialogTitle>Delete Selected Sections?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected section(s)? 
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={deleteSectionsMutation.isPending}
                        >
                            {deleteSectionsMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Sections</AlertDialogTitle>
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
