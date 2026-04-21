'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Semester } from '@sentinel/shared/types';
import { Badge, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { SemesterActionsCell } from './semester-actions-cell';
import { format } from 'date-fns';

export const columns: ColumnDef<Semester>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(status) => table.toggleAllPageRowsSelected(!!status)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(status) => row.toggleSelected(!!status)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorFn: (row) => row.institution ?? '',
        id: 'institution',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
        cell: ({ row }) => row.original.institution || '-',
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: 'academicYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Academic Year" />,
    },
    {
        accessorKey: 'semester',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Semester" />,
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: 'startDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
        cell: ({ row }) => {
            const date = row.getValue('startDate') as string;
            return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
        },
    },
    {
        accessorKey: 'endDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
        cell: ({ row }) => {
            const date = row.getValue('endDate') as string;
            return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
        },
    },
    {
        accessorFn: (row) => (row.isActive ? 'Active' : 'Inactive'),
        id: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        },
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
        },
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => {
            const date = row.getValue('updatedAt') as string | null | undefined;
            return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <SemesterActionsCell semester={row.original} />,
    },
];
