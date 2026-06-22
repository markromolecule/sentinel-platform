import { ColumnDef } from '@tanstack/react-table';
import { Course } from '@sentinel/shared/types';
import { Button, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { Edit2, Layers, Trash2 } from 'lucide-react';
import { OriginStatusBadge } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { getOriginStatusLabel } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { PermissionGuard } from '@sentinel/hooks';


export type CourseColumnsProps = {
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
    onRevert: (course: Course) => void;
    onManageSections: (course: Course) => void;
};

export const getCourseColumns = ({
    onEdit,
    onDelete,
    onRevert,
    onManageSections,
}: CourseColumnsProps): ColumnDef<Course>[] => [
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
        cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
        accessorKey: 'departmentCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => row.original.departmentCode || '—',
    },
    {
        accessorKey: 'institutionId',
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
                    <PermissionGuard permission="courses:update">
                        <Button variant="outline" size="sm" onClick={() => onRevert(row.original)}>
                            Revert
                        </Button>
                    </PermissionGuard>
                ) : null}
                <Button
                    variant="ghost"
                    size="icon"
                    title="Manage Sections"
                    onClick={() => onManageSections(row.original)}
                >
                    <Layers className="text-primary h-4 w-4" />
                    <span className="sr-only">Manage sections</span>
                </Button>
                <PermissionGuard permission="courses:update">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit course</span>
                    </Button>
                </PermissionGuard>
                <PermissionGuard permission="courses:delete">
                    <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete course</span>
                    </Button>
                </PermissionGuard>
            </div>
        ),
    },
];
