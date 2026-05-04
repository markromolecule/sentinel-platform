'use client';

import {
    DataTable,
    PageHeader,
    PermissionDeniedState,
    Separator,
} from '@sentinel/ui';
import { useMemo } from 'react';
import { TemplateContextToolbar } from '@/app/(protected)/(support)/_components/template-context-toolbar';
import { RevertPreviewDialog } from '@/app/(protected)/(support)/_components/revert-preview-dialog';
import { CourseSectionsDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/course-sections';
import { useCoursesPageState } from '@/app/(protected)/(support)/courses/_hooks/use-courses-page-state';
import { getCourseColumns } from '@/app/(protected)/(support)/courses/_components/tables/course-columns';
import { AddCourseDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/add-course-dialog';
import { EditCourseDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/edit-course-dialog';
import { isPermissionDeniedError, useStableValue } from '@sentinel/hooks';

export function CoursesView() {
    const {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        courseToEdit,
        editDialogOpen,
        setEditDialogOpen,
        courseToRevert,
        setCourseToRevert,
        managedCourseId,
        setManagedCourseId,
        institutions,
        courses,
        isLoading,
        isError,
        error,
        parentCourse,
        handleEdit,
        handleDelete,
        handleRevert,
        deleteCourseMutation,
    } = useCoursesPageState();

    const isViewDenied = isPermissionDeniedError(error, 'courses:view');

    const columns = useMemo(
        () =>
            getCourseColumns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                onRevert: setCourseToRevert,
                onManageSections: setManagedCourseId,
            }),
        [handleEdit, handleDelete, setCourseToRevert, setManagedCourseId],
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
            <PageHeader title="Course Management" description="Manage parent template courses.">
                <AddCourseDialog institutionId={selectedInstitutionId} />
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="courses" className="h-[360px]" />
            ) : (
                <>
                    <TemplateContextToolbar
                        institutions={institutions}
                        selectedInstitutionId={selectedInstitutionId}
                        onInstitutionChange={setSelectedInstitutionId}
                    />

                    <DataTable
                        columns={columns}
                        data={courses}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search courses..."
                        facets={facets}
                        isLoading={isLoading}
                    />
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading courses. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            {courseToEdit && (
                <EditCourseDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    course={courseToEdit}
                    institutionId={selectedInstitutionId}
                />
            )}

            <RevertPreviewDialog
                open={Boolean(courseToRevert)}
                onOpenChange={(open) => {
                    if (!open) setCourseToRevert(null);
                }}
                title="Revert course override?"
                description="Review the parent template value that will become effective after this local override is removed."
                fields={[
                    {
                        label: 'Code',
                        currentValue: courseToRevert?.code,
                        parentValue: parentCourse?.code,
                    },
                    {
                        label: 'Title',
                        currentValue: courseToRevert?.title,
                        parentValue: parentCourse?.title,
                    },
                    {
                        label: 'Department',
                        currentValue: courseToRevert?.departmentName,
                        parentValue: parentCourse?.departmentName,
                    },
                    {
                        label: 'Description',
                        currentValue: courseToRevert?.description,
                        parentValue: parentCourse?.description,
                    },
                ]}
                isPending={deleteCourseMutation.isPending}
                onConfirm={handleRevert}
            />

            {managedCourseId && (
                <CourseSectionsDialog
                    open={Boolean(managedCourseId)}
                    onOpenChange={(open) => {
                        if (!open) setManagedCourseId(null);
                    }}
                    courseId={managedCourseId}
                    courseTitle={
                        courses.find((c) => c.id === managedCourseId)?.title ?? ''
                    }
                    institutionId={selectedInstitutionId}
                />
            )}
        </div>
    );
}
