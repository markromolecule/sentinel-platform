'use client';

import { useState, useMemo } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { DataTable, PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { FolderTree } from 'lucide-react';
import { RevertPreviewDialog } from '@/app/(protected)/(support)/_components/revert-preview-dialog';
import { useSubjectsPageState } from '@/app/(protected)/(support)/subjects/_hooks/use-subjects-page-state';
import { getSubjectColumns } from '@/app/(protected)/(support)/subjects/_components/tables/subject-columns';
import { SubjectFormDialog } from '@/app/(protected)/(support)/subjects/_components/forms/subject-form-dialog';
import { isPermissionDeniedError, useStableValue } from '@sentinel/hooks';
import { useInstitutionFacet, useDataTableFilterSync } from '@/hooks';

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

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        selectedInstitutionId ? [{ id: 'institution', value: [selectedInstitutionId] }] : [],
    );

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
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Subject Management" description="Manage template subjects.">
                <a
                    href="/subjects/classifications"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-[#323d8f]/20 px-4 text-sm font-medium text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <FolderTree className="mr-2 h-4 w-4" />
                    Subject Classifications
                </a>
            </PageHeader>
            <Separator />

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
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading subjects. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

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
        </div>
    );
}
