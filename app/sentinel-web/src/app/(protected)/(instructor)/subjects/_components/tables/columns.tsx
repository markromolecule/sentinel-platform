import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { type Subject } from '@sentinel/shared/types';
import { Badge, DataTableColumnHeader } from '@sentinel/ui';
import { SubjectActionsCell } from '@/app/(protected)/(instructor)/subjects/_components/tables/subject-actions-cell';

function renderCompactBadges(labels: string[], emptyLabel = 'N/A', limit = 3) {
    if (labels.length === 0) {
        return (
            <span className="text-muted-foreground text-xs font-normal italic">{emptyLabel}</span>
        );
    }

    const displayedLabels = labels.slice(0, limit);
    const remainingCount = labels.length - limit;

    return (
        <div className="flex flex-wrap gap-1">
            {displayedLabels.map((label) => (
                <Badge
                    key={label}
                    variant="secondary"
                    className="border-primary/20 bg-primary/5 text-primary h-5 px-1.5 text-[11px] font-medium"
                >
                    {label}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge
                    variant="outline"
                    className="text-muted-foreground h-5 px-1.5 text-[10px] font-normal"
                >
                    +{remainingCount} more
                </Badge>
            )}
        </div>
    );
}

export const columns = (): ColumnDef<Subject>[] => [
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <div className="text-sm font-medium">{row.getValue('code')}</div>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div className="max-w-[180px] truncate text-sm" title={row.getValue('title')}>
                {row.getValue('title')}
            </div>
        ),
    },
    {
        id: 'term',
        accessorFn: (row) => `${row.termAcademicYear || ''} ${row.termSemester || ''}`.trim(),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Term" />,
        cell: ({ row }) => {
            const { termAcademicYear, termSemester } = row.original;

            return (
                <div className="max-w-[150px] text-sm">
                    {termAcademicYear || termSemester ? (
                        <>
                            <div className="font-medium">{termAcademicYear || 'Term'}</div>
                            <div className="text-muted-foreground text-xs">
                                {termSemester || 'Semester not set'}
                            </div>
                        </>
                    ) : (
                        <span className="text-muted-foreground text-xs font-normal italic">
                            N/A
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'department_code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dept" />,
        cell: ({ row }) => {
            const code = row.original.department_code;

            return (
                <div className="max-w-[100px] truncate text-sm font-semibold" title={code || 'N/A'}>
                    {code || (
                        <span className="text-muted-foreground text-xs font-normal italic">
                            N/A
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'course_code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ row }) => {
            const code = row.original.course_code;

            return (
                <div className="max-w-[110px] truncate text-sm font-semibold" title={code || 'N/A'}>
                    {code || (
                        <span className="text-muted-foreground text-xs font-normal italic">
                            N/A
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: 'yearLevels',
        accessorFn: (row) => (row.yearLevels || []).join(', '),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
        cell: ({ row }) => renderCompactBadges(row.original.yearLevels || [], 'N/A', 2),
    },
    {
        accessorKey: 'sections',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sections" />,
        cell: ({ row }) => {
            const sections = (row.original.sections || []) as Array<
                string | { id: string; name: string }
            >;
            const labels = sections.map((section) =>
                typeof section === 'string' ? section : section.name,
            );

            return <div className="max-w-[240px]">{renderCompactBadges(labels, 'N/A', 3)}</div>;
        },
    },
    {
        accessorKey: 'requested_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requested At" />,
        cell: ({ row }) => {
            const date = row.original.requested_at;

            return (
                <div className="text-muted-foreground text-xs font-medium">
                    {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                </div>
            );
        },
    },
    {
        accessorKey: 'approved_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Approved At" />,
        cell: ({ row }) => {
            const date = row.original.approved_at;

            return (
                <div className="text-muted-foreground text-xs font-medium">
                    {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                </div>
            );
        },
    },
    {
        accessorKey: 'approved_by',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Approved By" />,
        cell: ({ row }) => {
            const approver = row.original.approved_by;

            return (
                <div className="max-w-[100px] truncate text-xs font-medium" title={approver || ''}>
                    {approver || '-'}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.original.status || 'APPROVED';

            return (
                <Badge
                    variant={
                        status === 'PENDING'
                            ? 'secondary'
                            : status === 'APPROVED'
                              ? 'default'
                              : status === 'REJECTED'
                                ? 'destructive'
                                : 'default'
                    }
                    className="h-5 text-[10px] font-bold tracking-wider uppercase"
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <SubjectActionsCell subject={row.original} />,
    },
];
