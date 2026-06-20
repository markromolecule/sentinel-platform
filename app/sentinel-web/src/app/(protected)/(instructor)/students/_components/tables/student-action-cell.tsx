'use client';

import { useState } from 'react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { Eye, Mail, MoreHorizontal, Trash2 } from 'lucide-react';
import { type Student } from '@sentinel/shared/types';
import { StudentEnrollmentDetailDialog } from '@/app/(protected)/(instructor)/students/_components/dialogs/student-enrollment-detail-dialog';
import { useUnenrollStudent } from '@/app/(protected)/(instructor)/students/_hooks/use-unenroll-student';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';

type StudentActionCellProps = {
    student: Student;
};

export function StudentActionCell({ student }: StudentActionCellProps) {
    const [open, setOpen] = useState(false);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
    const { mutate: unenroll, isPending: isRemoving } = useUnenrollStudent();

    const enrollmentIds = student.enrollmentIds
        ? student.enrollmentIds
              .split(',')
              .map((id) => id.trim())
              .filter(Boolean)
        : [];
    const isMultiEnrollment = enrollmentIds.length > 1;
    const targetEnrollmentId = enrollmentIds[0] || student.id;

    const handleRemove = () => {
        unenroll(targetEnrollmentId);
        setConfirmRemoveOpen(false);
    };

    return (
        <>
            <div className="pr-4 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open student actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setOpen(true)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => {
                                if (isMultiEnrollment) {
                                    toast.info(
                                        "This student is enrolled in multiple subjects. Please use the 'View' action to remove them from a specific subject.",
                                    );
                                } else {
                                    setConfirmRemoveOpen(true);
                                }
                            }}
                            disabled={isRemoving}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <StudentEnrollmentDetailDialog
                open={open}
                onOpenChangeAction={setOpen}
                student={student}
            />

            <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{' '}
                            <strong>
                                {student.firstName} {student.lastName}
                            </strong>{' '}
                            from the subject <strong>{student.subject}</strong> for the section{' '}
                            <strong>{student.section}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
