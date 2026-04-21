'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { type Section } from '@sentinel/shared/types';
import { Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { SectionDepartmentCell } from './section-department-cell';
import { SectionCourseCell } from './section-course-cell';
import { SectionActionsCell } from './section-actions-cell';

export const columns: ColumnDef<Section>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
        cell: ({ row }) => <div className="font-semibold">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'departmentId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => <SectionDepartmentCell departmentId={row.getValue('departmentId')} />,
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: 'courseId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ row }) => <SectionCourseCell courseId={row.getValue('courseId')} />,
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: 'yearLevel',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year Level" />,
        cell: ({ row }) => {
            const val = row.getValue<number | undefined>('yearLevel');
            return (
                <div className="text-muted-foreground text-sm font-medium">
                    {val ? `Year ${val}` : 'N/A'}
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
        size: 150,
    },
    {
        accessorKey: 'createdBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground text-sm font-medium">
                {row.getValue('createdBy') || '—'}
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const date = row.getValue<string | Date>('createdAt');
            if (!date) return <div className="text-muted-foreground">None</div>;
            return (
                <div className="text-muted-foreground">{format(new Date(date), 'MMM d, yyyy')}</div>
            );
        },
    },
    {
        accessorKey: 'updatedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated By" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.getValue('updatedBy') || '—'}</div>
        ),
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => {
            const date = row.getValue<string | Date>('updatedAt');
            if (!date) return <div className="text-muted-foreground">None</div>;
            return (
                <div className="text-muted-foreground">{format(new Date(date), 'MMM d, yyyy')}</div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <SectionActionsCell section={row.original} />,
    },
];
