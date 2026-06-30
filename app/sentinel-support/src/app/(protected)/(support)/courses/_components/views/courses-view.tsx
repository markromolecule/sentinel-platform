'use client';

import { useEffect, useMemo, useState } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { DataTable, PageHeader, PermissionDeniedState, Separator, Button } from '@sentinel/ui';
import { RevertPreviewDialog } from '@/app/(protected)/(support)/_components/revert-preview-dialog';
import { CourseSectionsDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/course-sections';
import { useCoursesPageState } from '@/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index';
import { getCourseColumns } from '@/app/(protected)/(support)/courses/_components/tables/course-columns';
import { EditCourseDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/edit-course-dialog';
import { AddCourseDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/add-course-dialog';
import { BulkDeleteCoursesDialog } from '@/app/(protected)/(support)/courses/_components/dialogs/bulk-delete-courses-dialog';
import { isPermissionDeniedError, useStableValue, PermissionGuard } from '@sentinel/hooks';
import { useInstitutionFacet, useDataTableFilterSync } from '@/hooks';
import { Trash2 } from 'lucide-react';

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
        managedCourse,
        setManagedCourse,
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
        rowSelection,
        setRowSelection,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        deleteCoursesMutation,
        selectedIds,
        handleBulkDelete,
        pagination,
        setPagination,
        pageCount,
        totalCount,
    } = useCoursesPageState();

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        selectedInstitutionId ? [{ id: 'institution', value: [selectedInstitutionId] }] : [],
    );

    useEffect(() => {
        setColumnFilters(
            selectedInstitutionId ? [{ id: 'institution', value: [selectedInstitutionId] }] : [],
        );
    }, [selectedInstitutionId]);

    const isViewDenied = isPermissionDeniedError(error, 'courses:view');

    const columns = useMemo(
        () =>
            getCourseColumns({
                onEdit: handleEdit,
                onDelete: handleDelete,
                onRevert: setCourseToRevert,
                onManageSections: setManagedCourse,
            }),
        [handleEdit, handleDelete, setCourseToRevert, setManagedCourse],
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
            <PageHeader title="Program Management" description="Manage parent template program.">
                {!isViewDenied && <AddCourseDialog institutionId={selectedInstitutionId ?? ''} />}
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="courses" className="h-[360px]" />
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={courses}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        searchPlaceholder="Search courses..."
                        facets={facets}
                        isLoading={isLoading}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        totalCount={totalCount}
                        manualPagination={true}
                        toolbarActions={
                            selectedIds.length > 0 ? (
                                <PermissionGuard permission="courses:delete">
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
                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-32 items-center justify-center rounded-md border">
                            Error loading courses. Contact support if this continues.
                        </div>
                    ) : null}
                </>
            )}

            <BulkDeleteCoursesDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                selectedCount={selectedIds.length}
                onConfirm={handleBulkDelete}
                isPending={deleteCoursesMutation.isPending}
            />

            {courseToEdit && (
                <EditCourseDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    course={courseToEdit}
                    institutionId={selectedInstitutionId ?? ''}
                />
            )}

            <RevertPreviewDialog
                open={Boolean(courseToRevert)}
                onOpenChange={(open) => {
                    if (!open) setCourseToRevert(null);
                }}
                title="Revert program override?"
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

            {managedCourse && (
                <CourseSectionsDialog
                    open={Boolean(managedCourse)}
                    onOpenChange={(open) => {
                        if (!open) setManagedCourse(null);
                    }}
                    courseId={managedCourse.id}
                    courseTitle={managedCourse.title}
                    institutionId={
                        managedCourse.effectiveInstitutionId ??
                        managedCourse.institutionId ??
                        selectedInstitutionId ??
                        ''
                    }
                />
            )}
        </div>
    );
}
