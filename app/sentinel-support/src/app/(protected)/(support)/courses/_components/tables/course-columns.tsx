'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Course } from '@sentinel/shared/types';
import { Button, DataTableColumnHeader } from '@sentinel/ui';
import { Edit2, Layers, Trash2 } from 'lucide-react';
import { OriginStatusBadge } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { getOriginStatusLabel } from '@/app/(protected)/(support)/_components/origin-status-badge';

export type CourseColumnsProps = {
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
    onRevert: (course: Course) => void;
    onManageSections: (courseId: string) => void;
};

export const getCourseColumns = ({
    onEdit,
    onDelete,
    onRevert,
    onManageSections,
}: CourseColumnsProps): ColumnDef<Course>[] => [
        {
            accessorKey: 'code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
            cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
        },
        {
            accessorKey: 'title',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate" title={row.original.title.trim()}>
                    {row.original.title.trim()}
                </div>
            ),
        },
        {
            accessorKey: 'departmentName',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Department" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.original.departmentName?.trim() || '—'}>
                    {row.original.departmentName?.trim() || '—'}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.institutionName ?? '',
            id: 'institution',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
            cell: ({ row }) => row.original.institutionName || '-',
            filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
        },
        {
            id: 'origin',
            accessorFn: (row) => getOriginStatusLabel(row),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
            cell: ({ row }) => <OriginStatusBadge record={row.original} />,
            filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    {row.original.isOverridden ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRevert(row.original)}
                        >
                            Revert
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Manage Sections"
                        onClick={() => onManageSections(row.original.id)}
                    >
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="sr-only">Manage sections</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.original)}
                    >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit course</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete course</span>
                    </Button>
                </div>
            ),
        },
    ];
