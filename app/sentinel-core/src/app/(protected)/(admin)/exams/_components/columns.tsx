'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProctorExam } from '@sentinel/shared/types';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableColumnHeader } from '@sentinel/ui';

export const columns: ColumnDef<ProctorExam>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="font-medium">{row.getValue('title')}</span>
                {/* <span className="text-xs text-muted-foreground">{row.original.description}</span> */}
            </div>
        ),
    },
    {
        accessorKey: 'subject',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
    },
    {
        accessorKey: 'createdBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
        cell: ({ row }) => <div>{row.getValue('createdBy') || 'Unknown'}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <StatusBadge status={status} />;
        },
    },
    {
        accessorKey: 'questionCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Questions" />,
    },
    {
        accessorKey: 'scheduledDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = row.getValue('scheduledDate') as string | Date;
            return (
                <div className="text-muted-foreground">
                    {date ? format(new Date(date), 'MMM d, yyyy') : 'Unscheduled'}
                </div>
            );
        },
    },
];
