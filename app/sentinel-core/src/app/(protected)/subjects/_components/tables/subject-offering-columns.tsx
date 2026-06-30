'use client';

import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { type SubjectOffering } from '@sentinel/shared/types';
import { Badge, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/status-badge';
import { SubjectOfferingActionsCell } from './subject-offering-actions-cell';
import { InheritanceStatusBadge } from '@/components/common/inheritance-status-badge';

interface CreateSubjectOfferingColumnsArgs {
    departmentLabelMap: Map<string, string>;
    courseLabelMap: Map<string, string>;
    sectionLabelMap: Map<string, string>;
    canDeleteOfferings?: boolean;
    onViewDetails?: (offering: SubjectOffering) => void;
}

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
            {labels.length > 2 && (
                <span className="text-muted-foreground self-center text-xs">
                    +{labels.length - 2} more
                </span>
            )}
        </div>
    );
}

function mapLabels(ids: string[], labelMap: Map<string, string>) {
    return ids.map((id) => labelMap.get(id)).filter((label): label is string => Boolean(label));
}

function formatInstructorLabels(offering: SubjectOffering) {
    return (offering.instructors ?? [])
        .map((instructor) =>
            [instructor.firstName, instructor.lastName].filter(Boolean).join(' ').trim(),
        )
        .filter(Boolean);
}

export function createSubjectOfferingColumns({
    departmentLabelMap,
    courseLabelMap,
    sectionLabelMap,
    canDeleteOfferings = false,
    onViewDetails,
}: CreateSubjectOfferingColumnsArgs): ColumnDef<SubjectOffering>[] {
    const columns: ColumnDef<SubjectOffering>[] = [];

    columns.push({
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
    });

    columns.push(
        {
            accessorKey: 'subjectCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
            cell: ({ row }) => (
                <span
                    className="cursor-pointer font-medium text-[#323d8f] hover:underline"
                    onClick={() => onViewDetails?.(row.original)}
                >
                    {row.original.subjectCode}
                </span>
            ),
        },
        {
            accessorKey: 'subjectTitle',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description / Title" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate" title={row.original.subjectTitle.trim()}>
                    {row.original.subjectTitle.trim()}
                </div>
            ),
        },
        {
            id: 'term',
            accessorFn: (row) => `${row.termAcademicYear} • ${row.termSemester}`,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Term" />,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">
                        {row.original.termAcademicYear} • {row.original.termSemester}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {row.original.termStartDate || row.original.termEndDate
                            ? `${row.original.termStartDate ? format(new Date(row.original.termStartDate), 'MMM d, yyyy') : 'TBD'} - ${row.original.termEndDate ? format(new Date(row.original.termEndDate), 'MMM d, yyyy') : 'TBD'}`
                            : 'Dates not set'}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
            id: 'departments',
            accessorFn: (row) =>
                (row.departments ?? [])
                    .map((d) => d.code?.trim() || d.name)
                    .filter(Boolean)
                    .join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Departments" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={(row.original.departments ?? [])
                        .map((d) => d.code?.trim() || d.name)
                        .filter(Boolean)}
                    emptyLabel="No departments"
                />
            ),
        },
        {
            id: 'courses',
            accessorFn: (row) =>
                (row.courses ?? [])
                    .map((c) => c.code?.trim() || c.title)
                    .filter(Boolean)
                    .join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Courses" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={(row.original.courses ?? [])
                        .map((c) => c.code?.trim() || c.title)
                        .filter(Boolean)}
                    emptyLabel="No courses"
                />
            ),
        },
        {
            id: 'yearLevels',
            accessorFn: (row) => row.yearLevels.map((level) => `Year ${level}`).join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Year Levels" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={row.original.yearLevels.map((level) => `Year ${level}`)}
                    emptyLabel="No year levels"
                />
            ),
        },
        {
            id: 'sections',
            accessorFn: (row) => mapLabels(row.sectionIds, sectionLabelMap).join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sections" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={mapLabels(row.original.sectionIds, sectionLabelMap)}
                    emptyLabel="No sections"
                />
            ),
        },
        {
            id: 'classrooms',
            accessorFn: (row) =>
                (row.sections ?? [])
                    .filter((section) => section.classGroupId)
                    .map((section) => section.name)
                    .join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Classrooms" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={(row.original.sections ?? [])
                        .filter((section) => section.classGroupId)
                        .map((section) => section.name)}
                    emptyLabel="No classrooms"
                />
            ),
        },
        {
            id: 'assignedInstructors',
            accessorFn: (row) => formatInstructorLabels(row).join(', '),
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Assigned Instructors" />
            ),
            cell: ({ row }) => (
                <SummaryBadges
                    labels={formatInstructorLabels(row.original)}
                    emptyLabel="No assigned instructors"
                />
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
            cell: ({ row }) => {
                const date = row.original.updatedAt;
                if (!date) {
                    return <span className="text-muted-foreground">None</span>;
                }

                return format(new Date(date), 'MMM d, yyyy');
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <SubjectOfferingActionsCell offering={row.original} onViewDetails={onViewDetails} />
            ),
        },
    );

    return columns;
}
