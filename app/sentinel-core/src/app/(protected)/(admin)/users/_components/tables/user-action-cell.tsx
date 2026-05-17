'use client';

import { useState } from 'react';
import { type User } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { StudentEnrollmentDetailDialog } from '@/app/(protected)/(admin)/users/_components/dialogs/student-enrollment-detail-dialog';
import { PermissionGate } from '@/features/administration/shared/permission-gate';

type UserActionCellProps = {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
};

export function UserActionCell({ user, onEdit, onDelete }: UserActionCellProps) {
    const [open, setOpen] = useState(false);
    const canViewEnrollments = user.role === 'student';

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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                        Copy User ID
                    </DropdownMenuItem>
                    {canViewEnrollments ? (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Enrollments
                            </DropdownMenuItem>
                        </>
                    ) : null}
                    <DropdownMenuSeparator />
                    <PermissionGate permission="users" action="edit">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Details
                        </DropdownMenuItem>
                    </PermissionGate>
                    <PermissionGate permission="users" action="edit">
                        <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={() => onDelete(user)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Suspend/Delete User
                        </DropdownMenuItem>
                    </PermissionGate>
                </DropdownMenuContent>
            </DropdownMenu>

            {canViewEnrollments ? (
                <StudentEnrollmentDetailDialog open={open} onOpenChange={setOpen} user={user} />
            ) : null}
        </>
    );
}
