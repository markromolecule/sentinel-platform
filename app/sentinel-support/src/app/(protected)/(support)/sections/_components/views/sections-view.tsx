'use client';

import { DataTable, PageHeader, PermissionDeniedState, Separator, Button } from '@sentinel/ui';
import { useMemo } from 'react';
import { TemplateContextToolbar } from '@/app/(protected)/(support)/_components/template-context-toolbar';
import { RevertPreviewDialog } from '@/app/(protected)/(support)/_components/revert-preview-dialog';
import { useSectionsPageState } from '@/app/(protected)/(support)/sections/_hooks/use-sections-page-state';
import { getSectionColumns } from '@/app/(protected)/(support)/sections/_components/tables/section-columns';
import { SectionFormDialog } from '@/app/(protected)/(support)/sections/_components/forms/section-form-dialog';
import { BulkCreateSectionsDialog } from '@/app/(protected)/(support)/sections/_components/dialogs/bulk-create-sections-dialog';
import { isPermissionDeniedError, useStableValue } from '@sentinel/hooks';

export function SectionsView() {
    const {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        formOpen,
        setFormOpen,
        editingSectionId,
        setEditingSectionId,
        sectionToRevert,
        setSectionToRevert,
        form,
        namingConvention,
        institutions,
        sections,
        isLoading,
        isError,
        error,
        departments,
        courses,
        parentSection,
        handleEdit,
        handleDelete,
        handleRevert,
        onSubmit,
        createSectionMutation,
        updateSectionMutation,
        deleteSectionMutation,
    } = useSectionsPageState();

    const isViewDenied = isPermissionDeniedError(error, 'sections:view');

    const columns = useMemo(
        () =>
            getSectionColumns({
                departments,
                courses,
                onEdit: handleEdit,
                onDelete: handleDelete,
                onRevert: setSectionToRevert,
            }),
        [departments, courses, handleEdit, handleDelete, setSectionToRevert],
    );

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
                options: institutions.map((institution) => ({
                    label: institution.name,
                    value: institution.name,
                })),
            },
        ],
        [institutions],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader title="Section Management" description="Manage template sections.">
                {!isViewDenied && (
                    <div className="flex items-center gap-2">
                        <BulkCreateSectionsDialog defaultInstitutionId={selectedInstitutionId} />
                        <Button
                            onClick={() => {
                                setEditingSectionId(null);
                                form.reset();
                                setFormOpen(true);
                            }}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            Add Section
                        </Button>
                    </div>
                )}
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="sections" className="h-[360px]" />
            ) : (
                <>
                    <TemplateContextToolbar
                        institutions={institutions}
                        selectedInstitutionId={selectedInstitutionId}
                        onInstitutionChange={setSelectedInstitutionId}
                    />

                    <DataTable
                        columns={columns}
                        data={sections}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search sections..."
                        facets={facets}
                        isLoading={isLoading}
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading sections. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            <SectionFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                editingSectionId={editingSectionId}
                form={form}
                departments={departments}
                courses={courses}
                namingConvention={namingConvention}
                isPending={createSectionMutation.isPending || updateSectionMutation.isPending}
                onSubmit={onSubmit}
            />

            <RevertPreviewDialog
                open={Boolean(sectionToRevert)}
                onOpenChange={(open) => {
                    if (!open) setSectionToRevert(null);
                }}
                title="Revert section override?"
                description="Review the parent template value that will become effective after this local override is removed."
                fields={[
                    {
                        label: 'Section',
                        currentValue: sectionToRevert?.name,
                        parentValue: parentSection?.name,
                    },
                    {
                        label: 'Year level',
                        currentValue: sectionToRevert?.yearLevel,
                        parentValue: parentSection?.yearLevel,
                    },
                    {
                        label: 'Department',
                        currentValue:
                            sectionToRevert?.departmentName ||
                            departments.find(
                                (department) => department.id === sectionToRevert?.departmentId,
                            )?.name ||
                            sectionToRevert?.departmentId,
                        parentValue:
                            departments.find(
                                (department) => department.id === parentSection?.departmentId,
                            )?.name ?? parentSection?.departmentId,
                    },
                    {
                        label: 'Course',
                        currentValue:
                            sectionToRevert?.courseTitle ||
                            sectionToRevert?.courseCode ||
                            courses.find((course) => course.id === sectionToRevert?.courseId)
                                ?.title ||
                            sectionToRevert?.courseId,
                        parentValue:
                            courses.find((course) => course.id === parentSection?.courseId)
                                ?.title ?? parentSection?.courseId,
                    },
                ]}
                isPending={deleteSectionMutation.isPending}
                onConfirm={handleRevert}
            />
        </div>
    );
}
