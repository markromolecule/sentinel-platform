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

type StudentActionCellProps = {
    student: Student;
};

export function StudentActionCell({ student }: StudentActionCellProps) {
    const [open, setOpen] = useState(false);

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
        </>
    );
}
