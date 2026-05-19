'use client';

import { useState } from 'react';
import { useDeleteClassroomStudentMutation } from '@sentinel/hooks';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { type ClassroomStudent } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { PermissionGate } from '@/features/administration/shared/permission-gate';

type ClassroomStudentActionCellProps = {
    classroomId: string;
    student: ClassroomStudent;
};

export function ClassroomStudentActionCell({
    classroomId,
    student,
}: ClassroomStudentActionCellProps) {
    const [open, setOpen] = useState(false);
    const deleteStudentMutation = useDeleteClassroomStudentMutation({
        onSuccess: () => {
            setOpen(false);
            toast.success('Student unenrolled successfully');
        },
    });

    return (
        <>
            <PermissionGate permission="classrooms" action="edit">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open student actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => setOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Unenroll
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </PermissionGate>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unenroll this student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{' '}
                            {student.fullName || student.studentNumber || 'this student'} from the
                            classroom roster.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteStudentMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deleteStudentMutation.mutate({
                                    classroomId,
                                    studentId: student.studentId,
                                })
                            }
                            disabled={deleteStudentMutation.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleteStudentMutation.isPending ? 'Removing...' : 'Unenroll'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
