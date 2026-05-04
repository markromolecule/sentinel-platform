'use client';

import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { type MasterSubject } from '@sentinel/shared/types';
import { Badge, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { MasterSubjectActionsCell } from './master-subject-actions-cell';
import { InheritanceStatusBadge } from '@/components/common/inheritance-status-badge';

export function createMasterColumns({
    canManageCatalog = true,
}: {
    canManageCatalog?: boolean;
} = {}): ColumnDef<MasterSubject>[] {
    return [
        ...(canManageCatalog
            ? [
                {
                    id: 'select',
                    header: ({ table }) => (
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && 'indeterminate')
                            }
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all subjects"
                        />
                    ),
                    cell: ({ row }) => (
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select subject"
                        />
                    ),
                    enableSorting: false,
                    enableHiding: false,
                } satisfies ColumnDef<MasterSubject>,
            ]
            : []),
        {
            accessorKey: 'code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
        },
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description / Title" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate" title={row.original.title.trim()}>
                    {row.original.title.trim()}
                </div>
            ),
        },
        {
            id: 'classifications',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Classifications" />
            ),
            cell: ({ row }) => {
                const classifications = row.original.classifications ?? [];

                if (classifications.length === 0) {
                    return <span className="text-muted-foreground">Unclassified</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {classifications.map((classification) => (
                            <Badge
                                key={classification.id}
                                variant="outline"
                                className="border-[#323d8f]/20 bg-[#323d8f]/5 text-[#323d8f]"
                            >
                                {classification.name}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            id: 'inheritanceStatus',
            accessorFn: (row) => row.inheritanceStatus ?? 'LOCAL',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
            cell: ({ row }) => <InheritanceStatusBadge record={row.original} />,
            filterFn: (row, id, value) => {
                return value.includes(String(row.getValue(id)));
            },
        },
        {
            accessorKey: 'createdBy',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
            cell: ({ row }) => row.original.createdBy || '—',
        },
        {
            accessorKey: 'updatedAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
            cell: ({ row }) => {
                const date = row.original.updatedAt;
                if (!date) return <span className="text-muted-foreground">None</span>;
                return format(new Date(date), 'MMM d, yyyy');
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <MasterSubjectActionsCell
                    subject={row.original}
                    canManageCatalog={canManageCatalog}
                />
            ),
        },
    ];
}

export const masterColumns: ColumnDef<MasterSubject>[] = createMasterColumns();
