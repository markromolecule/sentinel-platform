'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SubjectOffering } from '@sentinel/shared/types';
import { Badge, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { OriginStatusBadge } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { getOriginStatusLabel } from '@/app/(protected)/(support)/_components/origin-status-badge';

function SummaryBadges({ labels, emptyLabel }: { labels: string[]; emptyLabel: string }) {
    if (labels.length === 0) {
        return <span className="text-muted-foreground text-sm">{emptyLabel}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {labels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="font-medium">
                    {label}
                </Badge>
            ))}
            {labels.length > 2 ? (
                <span className="text-muted-foreground self-center text-xs">
                    +{labels.length - 2} more
                </span>
            ) : null}
        </div>
    );
}

export const offeredColumns: ColumnDef<SubjectOffering>[] = [
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
        accessorKey: 'subjectCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
        cell: ({ row }) => <span className="font-medium">{row.original.subjectCode}</span>,
    },
    {
        accessorKey: 'subjectTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ row }) => (
            <div className="max-w-[400px]" title={row.original.subjectTitle.trim()}>
                {row.original.subjectTitle.trim()}
            </div>
        ),
    },
    {
        id: 'term',
        accessorFn: (row) => `${row.termAcademicYear} ${row.termSemester}`,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Term" />,
        cell: ({ row }) => (
            <div className="space-y-1">
                <div className="font-medium">{row.original.termAcademicYear}</div>
                <div className="text-muted-foreground text-xs">{row.original.termSemester}</div>
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorFn: (row) => row.originInstitutionId ?? '',
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
        id: 'departments',
        accessorFn: (row) =>
            (row.departments ?? [])
                .map((department) => department.code?.trim() || department.name)
                .filter(Boolean)
                .join(', '),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Departments" />,
        cell: ({ row }) => (
            <SummaryBadges
                labels={(row.original.departments ?? [])
                    .map((department) => department.code?.trim() || department.name)
                    .filter(Boolean)}
                emptyLabel="No departments"
            />
        ),
    },
    {
        id: 'courses',
        accessorFn: (row) =>
            (row.courses ?? [])
                .map((course) => course.code?.trim() || course.title)
                .filter(Boolean)
                .join(', '),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Courses" />,
        cell: ({ row }) => (
            <SummaryBadges
                labels={(row.original.courses ?? [])
                    .map((course) => course.code?.trim() || course.title)
                    .filter(Boolean)}
                emptyLabel="No courses"
            />
        ),
    },
    {
        id: 'sections',
        accessorFn: (row) => row.sections.map((section) => section.name).join(', '),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sections" />,
        cell: ({ row }) => (
            <SummaryBadges
                labels={row.original.sections.map((section) => section.name)}
                emptyLabel="No sections"
            />
        ),
    },
];
