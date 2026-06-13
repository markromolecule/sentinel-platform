'use client';

import { ColumnDef } from '@tanstack/react-table';
import { StatusBadge } from '@/components/common/displays/status-badge';
import { DataTableColumnHeader, Avatar, AvatarFallback, AvatarImage } from '@sentinel/ui';
import { type InstructorAssignmentRow } from './assignment-table';

export const columns: ColumnDef<InstructorAssignmentRow>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Exam Title" />,
        cell: ({ row }) => <div className="pl-4 font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'subject',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
    },
    {
        accessorKey: 'scheduledDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = row.getValue('scheduledDate') as string;
            return <div>{date || 'Unscheduled'}</div>;
        },
    },
    {
        accessorKey: 'relationship',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Direction" />,
        cell: ({ row }) =>
            row.original.relationship === 'INBOUND' ? 'Assigned to me' : 'Assigned by me',
    },
    {
        accessorKey: 'assignedInstructor',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Assigned Instructor" />
        ),
        cell: ({ row }) => {
            const instructorName = row.original.assignedInstructor;
            const avatarUrl = row.original.instructorAvatarUrl;
            const initials = instructorName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();

            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={avatarUrl ?? ''} alt={instructorName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {instructorName}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <StatusBadge status={status} />;
        },
    },
];
