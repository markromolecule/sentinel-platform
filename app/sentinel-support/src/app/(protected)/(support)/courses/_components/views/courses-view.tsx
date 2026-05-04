'use client';

import {
    Button,
    DataTable,
    PageHeader,
    PermissionDeniedState,
    Separator,
} from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { TemplateContextToolbar } from '@/app/(protected)/(support)/_components/template-context-toolbar';
import { RevertPreviewDialog } from '@/app/(protected)/(support)/_components/revert-preview-dialog';
import { CourseSectionsDialog } from '@/app/(protected)/(support)/courses/_components/course-sections-dialog';
import { useCoursesPageState } from '@/app/(protected)/(support)/courses/_hooks/use-courses-page-state';
import { getCourseColumns } from '@/app/(protected)/(support)/courses/_components/tables/course-columns';
import { CourseFormDialog } from '@/app/(protected)/(support)/courses/_components/forms/course-form-dialog';
import { isPermissionDeniedError, useStableValue } from '@sentinel/hooks';

export function CoursesView() {
    const {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        formOpen,
        setFormOpen,
        form,
        setForm,
        courseToRevert,
        setCourseToRevert,
        managedCourseId,
        setManagedCourseId,
        institutions,
        courses,
        isLoading,
        isError,
        error,
        departments,
        parentCourse,
        handleEdit,
        handleDelete,
        handleRevert,
        submitForm,
        createCourseMutation,
        updateCourseMutation,
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
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
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

            <CourseFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                form={form}
                setForm={setForm}
                departments={departments}
                onSubmit={submitForm}
                isPending={createCourseMutation.isPending || updateCourseMutation.isPending}
            />

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
                    departments={departments}
                />
            )}
        </div>
    );
}
