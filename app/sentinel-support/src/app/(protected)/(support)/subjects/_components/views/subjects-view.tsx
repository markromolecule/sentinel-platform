'use client';

import { useState, useMemo, useEffect } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import {
    DataTable,
    PermissionDeniedState,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { RevertPreviewDialog } from '@/app/(protected)/(support)/_components/revert-preview-dialog';
import { useSubjectsPageState } from '@/app/(protected)/(support)/subjects/_hooks/use-subjects-page-state';
import { getSubjectColumns } from '@/app/(protected)/(support)/subjects/_components/tables/subject-columns';
import { SubjectFormDialog } from '@/app/(protected)/(support)/subjects/_components/forms/subject-form-dialog';
import {
    isPermissionDeniedError,
    useStableValue,
    useDeleteSelectedSubjectsMutation,
} from '@sentinel/hooks';
import { useInstitutionFacet, useDataTableFilterSync } from '@/hooks';
import { getSubjectId } from '@/app/(protected)/(support)/subjects/_hooks/use-subjects-page-state/_types';
import { Trash2 } from 'lucide-react';

export function SubjectsView() {
    const {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        formOpen,
        setFormOpen,
        form,
        setForm,
        subjectToRevert,
        setSubjectToRevert,
        institutions,
        subjects,
        isLoading,
        isError,
        error,
        parentSubject,
        handleEdit,
        handleDelete,
        handleRevert,
        submitForm,
        createSubjectMutation,
        updateSubjectMutation,
        deleteSubjectMutation,
    } = useSubjectsPageState();

    const [rowSelection, setRowSelection] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteSelectedSubjectsMutation = useDeleteSelectedSubjectsMutation({
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setRowSelection({});
        },
    });

    const selectedIds = useMemo(() => {
        return Object.keys(rowSelection)
            .filter((index) => rowSelection[index as keyof typeof rowSelection])
            .map((index) => {
                const subject = subjects[parseInt(index)];
                return getSubjectId(subject);
            })
            .filter(Boolean) as string[];
    }, [rowSelection, subjects]);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            deleteSelectedSubjectsMutation.mutate(selectedIds);
        }
    };

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        selectedInstitutionId ? [{ id: 'institution', value: [selectedInstitutionId] }] : [],
    );

    const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

    useEffect(() => {
        if (selectedInstitutionId && !hasInitializedFilters) {
            setColumnFilters([{ id: 'institution', value: [selectedInstitutionId] }]);
            setHasInitializedFilters(true);
        }
    }, [selectedInstitutionId, hasInitializedFilters]);

    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');

    const columns = useMemo(
        () =>
            getSubjectColumns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                onRevert: setSubjectToRevert,
            }),
        [handleEdit, handleDelete, setSubjectToRevert],
    );

    const institutionOptions = useInstitutionFacet({ institutions });

    useDataTableFilterSync({
        columnFilters,
        syncKeys: ['institution'],
        onFilterChange: (key, value) => {
            if (key === 'institution') {
                setSelectedInstitutionId(value);
            }
        },
    });

    const facets = useStableValue(
        () => [
            {
                columnKey: 'origin',
                title: 'Origin',
                options: ['Inherited', 'Local', 'Overridden'].map((origin) => ({
                    label: origin,
                    value: origin,
                })),
            },
            {
                columnKey: 'institution',
                title: 'Institution',
                options: institutionOptions,
            },
        ],
        [institutionOptions],
    );

    return (
        <>
            {isViewDenied ? (
                <PermissionDeniedState resourceName="subjects" className="h-[360px]" />
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={subjects}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        searchPlaceholder="Search subjects..."
                        facets={facets}
                        isLoading={isLoading}
                        initialColumnVisibility={{ institution: false }}
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
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading subjects. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Selected Subjects?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected
                            subject(s)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={deleteSelectedSubjectsMutation.isPending}
                        >
                            {deleteSelectedSubjectsMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SubjectFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                form={form}
                setForm={setForm}
                onSubmit={submitForm}
                isPending={createSubjectMutation.isPending || updateSubjectMutation.isPending}
            />

            <RevertPreviewDialog
                open={Boolean(subjectToRevert)}
                onOpenChange={(open) => {
                    if (!open) setSubjectToRevert(null);
                }}
                title="Revert subject override?"
                description="Review the parent template value that will become effective after this local override is removed."
                fields={[
                    {
                        label: 'Code',
                        currentValue: subjectToRevert?.code,
                        parentValue: parentSubject?.code,
                    },
                    {
                        label: 'Title',
                        currentValue: subjectToRevert?.title,
                        parentValue: parentSubject?.title,
                    },
                    {
                        label: 'Classifications',
                        currentValue: subjectToRevert?.classifications
                            ?.map((classification) => classification.name)
                            .join(', '),
                        parentValue: parentSubject?.classifications
                            ?.map((classification) => classification.name)
                            .join(', '),
                    },
                ]}
                isPending={deleteSubjectMutation.isPending}
                onConfirm={handleRevert}
            />
        </>
    );
}
