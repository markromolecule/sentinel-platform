import { ColumnDef } from '@tanstack/react-table';
import { Course, Department, Section } from '@sentinel/shared/types';
import { Button, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { Edit2, Trash2 } from 'lucide-react';
import { OriginStatusBadge } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { getOriginStatusLabel } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { PermissionGuard } from '@sentinel/hooks';

export type SectionColumnsProps = {
    departments: Department[];
    courses: Course[];
    onEdit: (section: Section) => void;
    onDelete: (section: Section) => void;
    onRevert: (section: Section) => void;
};

export const getSectionColumns = ({
    departments,
    courses,
    onEdit,
    onDelete,
    onRevert,
}: SectionColumnsProps): ColumnDef<Section>[] => [
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
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
        cell: ({ row }) => (
            <div className="max-w-[300px] truncate font-medium" title={row.original.name.trim()}>
                {row.original.name.trim()}
            </div>
        ),
    },
    {
        accessorKey: 'yearLevel',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
        cell: ({ row }) => row.original.yearLevel ?? '—',
    },
    {
        id: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => {
            const code =
                row.original.departmentName ||
                departments.find((d) => d.id === row.original.departmentId)?.name ||
                '—';
            return <div className="font-medium">{code}</div>;
        },
    },
    {
        id: 'course',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ row }) => {
            const title =
                row.original.courseCode ||
                row.original.courseTitle ||
                courses.find((c) => c.id === row.original.courseId)?.title ||
                '—';
            return <div className="font-medium">{title}</div>;
        },
    },
    {
        accessorFn: (row) => row.institutionId ?? '',
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
                    <PermissionGuard permission="sections:update">
                        <Button variant="outline" size="sm" onClick={() => onRevert(row.original)}>
                            Revert
                        </Button>
                    </PermissionGuard>
                ) : null}
                <PermissionGuard permission="sections:update">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit section</span>
                    </Button>
                </PermissionGuard>
                <PermissionGuard permission="sections:delete">
                    <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete section</span>
                    </Button>
                </PermissionGuard>
            </div>
        ),
    },
];
