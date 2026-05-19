'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type ClassroomSummary } from '@sentinel/shared/types';
import { DataTableColumnHeader } from '@sentinel/ui';
import { ClassroomActionCell } from './classroom-action-cell';

export function createClassroomColumns(): ColumnDef<ClassroomSummary>[] {
    return [
        {
            accessorKey: 'className',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Classroom" />,
            cell: ({ row }) => (
                <div className="max-w-[18rem] space-y-1">
                    <div
                        className="truncate font-medium"
                        title={row.original.className || 'Unnamed classroom'}
                    >
                        {row.original.className || 'Unnamed classroom'}
                    </div>
                    <div
                        className="text-muted-foreground truncate text-xs"
                        title={row.original.scopeSummary.subjectLabel}
                    >
                        {row.original.scopeSummary.subjectLabel}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'sectionName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
            cell: ({ row }) => (
                <div className="max-w-[13rem] space-y-1">
                    <div className="truncate" title={row.original.sectionName || 'Unassigned'}>
                        {row.original.sectionName || 'Unassigned'}
                    </div>
                    <div
                        className="text-muted-foreground truncate text-xs"
                        title={row.original.scopeSummary.termLabel}
                    >
                        {row.original.scopeSummary.termLabel}
                    </div>
                </div>
            ),
        },
        {
            id: 'students',
            accessorFn: (row) => row.studentCount,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Students" />,
            cell: ({ row }) => <span className="font-medium">{row.original.studentCount}</span>,
        },
        {
            id: 'scope',
            accessorFn: (row) => row.departmentCode ?? row.scopeSummary.departmentLabel ?? '',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm">
                    <span className="bg-muted inline-flex rounded-full px-2.5 py-1 text-xs font-medium tracking-wide uppercase">
                        {row.original.departmentCode ||
                            row.original.scopeSummary.departmentLabel ||
                            'No code'}
                    </span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => <ClassroomActionCell classroom={row.original} />,
        },
    ];
}
