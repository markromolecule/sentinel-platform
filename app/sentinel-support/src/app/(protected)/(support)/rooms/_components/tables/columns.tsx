'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Room } from '@sentinel/shared/types';
import { DataTableColumnHeader } from '@sentinel/ui';
import { RoomActionsCell } from './room-actions-cell';

// columns for the data table
export const columns: ColumnDef<Room>[] = [
    {
        accessorFn: (row) => row.institution ?? '',
        id: 'institution',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
        cell: ({ row }) => <div>{row.original.institution || '—'}</div>,
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('code') || 'N/A'}</div>,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Room Name" />,
        cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'room_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
            const type = row.original.room_type;
            const isLaboratory = type === 'LABORATORY';
            const isVirtual = type === 'VIRTUAL';

            let badgeStyles = 'bg-blue-100 text-blue-700 border border-blue-200';
            let label = 'Lecture Room';

            if (isLaboratory) {
                badgeStyles = 'bg-purple-100 text-purple-700 border border-purple-200';
                label = 'Laboratory';
            } else if (isVirtual) {
                badgeStyles = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                label = 'Virtual Room';
            }

            return (
                <div
                    className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${badgeStyles}`}
                >
                    {label}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground text-sm">
                {row.getValue('createdBy') || 'System'}
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const date = row.getValue<string | Date>('createdAt');
            if (!date) return <div className="text-muted-foreground">—</div>;
            return (
                <div className="text-muted-foreground">{format(new Date(date), 'MMM d, yyyy')}</div>
            );
        },
    },
    {
        accessorKey: 'updatedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated By" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground text-sm">{row.getValue('updatedBy') || '—'}</div>
        ),
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => {
            const date = row.getValue<string | Date>('updatedAt');
            if (!date) return <div className="text-muted-foreground">—</div>;
            return (
                <div className="text-muted-foreground">{format(new Date(date), 'MMM d, yyyy')}</div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <RoomActionsCell room={row.original} />,
    },
];
