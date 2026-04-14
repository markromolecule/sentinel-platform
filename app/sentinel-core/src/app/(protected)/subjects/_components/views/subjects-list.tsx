'use client';

import { useState } from 'react';
import { DataTable } from '@sentinel/ui';
import { type ColumnDef, type RowSelectionState } from '@tanstack/react-table';
import { type MasterSubject } from '@sentinel/shared/types';
import { useDeleteSelectedSubjectsMutation, useStableValue } from '@sentinel/hooks';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
} from '@sentinel/ui';
import { Loader2, Trash2 } from 'lucide-react';
import { columns as defaultColumns } from '../tables/columns';
import { SubjectsEmptyState } from './subjects-empty-state';

type SubjectsListProps = {
    subjects: MasterSubject[];
    columns?: ColumnDef<MasterSubject>[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    canCreateSubjects?: boolean;
    canDeleteSubjects?: boolean;
};

export function SubjectsList({
    subjects,
    columns = defaultColumns,
    searchTerm,
    onSearchChange,
    isLoading = false,
    canCreateSubjects = true,
    canDeleteSubjects = true,
}: SubjectsListProps) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [deleteOpen, setDeleteOpen] = useState(false);

    const selectedSubjects = useStableValue(
        () => subjects.filter((_, index) => rowSelection[String(index)]),
        [subjects, rowSelection],
    );
    const selectedSubjectIds = useStableValue(
        () =>
            selectedSubjects.map((subject) => subject.id).filter((id): id is string => Boolean(id)),
        [selectedSubjects],
    );

    const deleteSelectedSubjects = useDeleteSelectedSubjectsMutation({
        onSuccess: () => {
            setDeleteOpen(false);
            setRowSelection({});
        },
    });

    const toolbarActions = useStableValue(
        () =>
            canDeleteSubjects && selectedSubjectIds.length > 0 ? (
                <Button
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedSubjectIds.length})
                </Button>
            ) : null,
        [canDeleteSubjects, selectedSubjectIds.length],
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={subjects}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search subjects..."
                isLoading={isLoading}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={toolbarActions}
                emptyContent={
                    <SubjectsEmptyState
                        searchTerm={searchTerm}
                        canManageCatalog={canCreateSubjects}
                    />
                }
            />

            {canDeleteSubjects && (
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete selected subjects?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete {selectedSubjectIds.length} selected
                                subject
                                {selectedSubjectIds.length === 1 ? '' : 's'}. If any selected
                                subject still has offered records, the delete will be blocked until
                                those offerings are removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteSelectedSubjects.isPending}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90 text-white"
                                disabled={deleteSelectedSubjects.isPending}
                                onClick={(event) => {
                                    event.preventDefault();
                                    deleteSelectedSubjects.mutate(selectedSubjectIds);
                                }}
                            >
                                {deleteSelectedSubjects.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    `Delete Selected (${selectedSubjectIds.length})`
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}
