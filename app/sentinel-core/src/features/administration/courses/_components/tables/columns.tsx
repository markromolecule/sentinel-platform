'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Course } from '@sentinel/shared/types';
import { DataTableColumnHeader } from '@sentinel/ui';
import { format } from 'date-fns';
import { CourseDepartmentCell } from './course-department-cell';
import { CourseActionsCell } from './course-actions-cell';
import { Checkbox } from '@sentinel/ui';
import { InheritanceStatusBadge } from '@/components/common/inheritance-status-badge';

/**
 * Centered table column definitions for Course management list.
 * Outlines select check, course code, title, department, origin/badge, audit logs, and actions.
 */
export const columns: ColumnDef<Course>[] = [
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
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('code')}</div>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div className="max-w-[400px] truncate" title={row.getValue('title')}>
                {row.getValue('title')}
            </div>
        ),
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => (
            <CourseDepartmentCell
                departmentId={row.original.departmentId ?? ''}
                departmentName={row.original.departmentName}
                departmentCode={row.original.departmentCode}
            />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: 'inheritanceStatus',
        accessorFn: (row) => row.institutionName ?? 'Unknown',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
        cell: ({ row }) => <InheritanceStatusBadge record={row.original} />,
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: 'createdBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.getValue('createdBy') || '—'}</div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string | null | undefined;
            return (
                <div className="text-muted-foreground">
                    {date ? format(new Date(date), 'MMM d, yyyy') : '—'}
                </div>
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
            const date = row.getValue('updatedAt') as string | null | undefined;
            return (
                <div className="text-muted-foreground">
                    {date ? format(new Date(date), 'MMM d, yyyy') : '—'}
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <CourseActionsCell course={row.original} />,
    },
];
