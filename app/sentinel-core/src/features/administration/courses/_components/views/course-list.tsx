'use client';

import {
    useDepartmentsQuery,
    useDeleteCoursesMutation,
    useActivePermissions,
} from '@sentinel/hooks';
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
import { type Course } from '@sentinel/shared/types';
import { type PaginationState } from '@tanstack/react-table';
import { columns } from '../tables/columns';
import { CoursesEmptyState } from './courses-empty-state';
import { buildCourseFacets } from './course-facets';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAcademicScope } from '@/hooks/use-academic-scope';

interface CourseListProps {
    courses: Course[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    pageCount?: number;
    totalCount?: number;
    manualPagination?: boolean;
}

/**
 * CourseList component that renders the table of courses with search, facets, pagination, and bulk delete actions.
 */
export function CourseList({
    courses,
    searchTerm,
    onSearchChange,
    isLoading = false,
    pagination,
    onPaginationChange,
    pageCount,
    totalCount,
    manualPagination = false,
}: CourseListProps) {
    const { data: departments = [] } = useDepartmentsQuery();
    const { hasPermission } = useActivePermissions();
    const { isReadOnlyFor } = useAcademicScope();
    const [rowSelection, setRowSelection] = useState({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const deleteCoursesMutation = useDeleteCoursesMutation({
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

    const facets = buildCourseFacets({ departments });
    const isCoursesReadOnly = isReadOnlyFor('courses');
    const canDelete = hasPermission('courses:delete') && !isCoursesReadOnly;

    const selectedIds = Object.keys(rowSelection)
        .filter((index) => rowSelection[index as keyof typeof rowSelection])
        .map((index) => courses[parseInt(index)]?.id)
        .filter(Boolean);

    const handleBulkDelete = () => {
        if (selectedIds.length > 0) {
            deleteCoursesMutation.mutate(selectedIds);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={courses}
                facets={facets}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search courses..."
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                pageCount={pageCount}
                totalCount={totalCount}
                manualPagination={manualPagination}
                emptyContent={<CoursesEmptyState searchTerm={searchTerm} />}
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
                        <DialogTitle>Delete Selected Courses?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected course(s)?
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
                            disabled={deleteCoursesMutation.isPending}
                        >
                            {deleteCoursesMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Delete Courses</AlertDialogTitle>
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
