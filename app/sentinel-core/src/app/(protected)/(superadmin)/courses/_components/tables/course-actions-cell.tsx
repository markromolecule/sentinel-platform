'use client';

import { useDeleteCourseMutation } from '@/data';
import { useActivePermissions } from '@sentinel/hooks';
import { ApiError } from '@sentinel/services';
import { useState } from 'react';
import { Edit2, Layers, MoreHorizontal, Trash2 } from 'lucide-react';
import { Course } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import { EditCourseDialog } from '@/app/(protected)/(superadmin)/courses/_components/dialogs/edit-course-dialog';
import { CourseSectionsDialog } from '@/app/(protected)/(superadmin)/courses/_components/dialogs/course-sections-dialog';
import { isParentOwnedRecord } from '@/components/common/inheritance-status-badge';
import { useDepartmentsQuery } from '@/data';

export type CourseActionsCellProps = {
    course: Course;
};

export function CourseActionsCell({ course }: CourseActionsCellProps) {
    const { hasPermission } = useActivePermissions();
    const deleteCourse = useDeleteCourseMutation();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [sectionsOpen, setSectionsOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { data: departments = [] } = useDepartmentsQuery('', course.institutionId || undefined);

    const canUpdateCourse = hasPermission('courses:update');
    const canDeleteCourse = hasPermission('courses:delete');
    const isInheritedCourse = isParentOwnedRecord(course);
    const deleteTitle = isInheritedCourse ? 'Hide inherited course?' : 'Are you absolutely sure?';
    const deleteDescription = isInheritedCourse
        ? `This will create a local hide for "${course.title}" in your branch only. The parent course will remain unchanged for other branches.`
        : `This action cannot be undone. This will permanently delete the course "${course.title}".`;
    const deleteButtonLabel = deleteCourse.isPending
        ? isInheritedCourse
            ? 'Hiding...'
            : 'Deleting...'
        : isInheritedCourse
          ? 'Hide Locally'
          : 'Delete';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(course.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canUpdateCourse && (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            {isInheritedCourse ? 'Create Local Override' : 'Edit Details'}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setSectionsOpen(true)}>
                        <Layers className="mr-2 h-4 w-4" />
                        Manage Sections
                    </DropdownMenuItem>
                    {canDeleteCourse && (
                        <DropdownMenuItem
                            onClick={() => setDeleteOpen(true)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isInheritedCourse ? 'Hide Locally' : 'Delete Course'}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {canUpdateCourse ? (
                <EditCourseDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    courseToEdit={course}
                />
            ) : null}

            {canDeleteCourse ? (
                <>
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent className="animate-none transition-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none">
                            <DialogHeader>
                                <DialogTitle>{deleteTitle}</DialogTitle>
                                <DialogDescription>{deleteDescription}</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        deleteCourse.mutate(course.id, {
                                            onSuccess: () => setDeleteOpen(false),
                                            onError: (error) => {
                                                if (
                                                    error instanceof ApiError &&
                                                    error.status === 409
                                                ) {
                                                    setErrorMessage(error.message);
                                                    setErrorDialogOpen(true);
                                                    setDeleteOpen(false);
                                                }
                                            },
                                        });
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {deleteButtonLabel}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cannot Delete Course</AlertDialogTitle>
                                <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                                    OK
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            ) : null}

            <CourseSectionsDialog
                open={sectionsOpen}
                onOpenChange={setSectionsOpen}
                courseId={course.id}
                courseTitle={course.title}
                institutionId={course.institutionId || ''}
                departments={departments}
            />
        </>
    );
}
