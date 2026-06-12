import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DataTable,
    Button,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { type ClassroomSummary } from '@sentinel/shared/types';
import { ClassroomsEmptyState } from './classrooms-empty-state';
import { useBulkDeleteClassroomsMutation } from '@sentinel/hooks';
import { PermissionGate } from '@/features/administration/shared/permission-gate';
import { Trash2 } from 'lucide-react';

type ClassroomsListProps = {
    classrooms: ClassroomSummary[];
    columns: ColumnDef<ClassroomSummary>[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    isLoading?: boolean;
};

export function ClassroomsList({
    classrooms,
    columns,
    searchTerm,
    onSearchChange,
    onCreateClick,
    isLoading = false,
}: ClassroomsListProps) {
    const router = useRouter();
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const bulkDeleteMutation = useBulkDeleteClassroomsMutation({
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setRowSelection({});
        },
    });

    const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index])
        .map((index) => classrooms[parseInt(index)]?.id)
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            bulkDeleteMutation.mutate(selectedIds);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={classrooms}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search classrooms..."
                isLoading={isLoading}
                onRowClick={(row) => router.push(`/classrooms/${row.id}`)}
                emptyContent={
                    <ClassroomsEmptyState searchTerm={searchTerm} onCreateClick={onCreateClick} />
                }
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={
                    selectedIds.length > 0 ? (
                        <PermissionGate permission="classrooms" action="edit">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteDialogOpen(true);
                                }}
                                className="h-8"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete {selectedIds.length}
                            </Button>
                        </PermissionGate>
                    ) : null
                }
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Classrooms?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected classroom(s)?
                            This action cannot be undone and will permanently remove all roster and enrollment information.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleteMutation.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

