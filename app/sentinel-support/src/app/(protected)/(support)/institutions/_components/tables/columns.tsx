'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Institution } from '@sentinel/shared/types';
import { Badge, Checkbox, DataTableColumnHeader } from '@sentinel/ui';
import { InstitutionActionsCell } from './institution-actions-cell';

const kindLabels = {
    PARENT: 'Parent',
    CHILD: 'Branch',
    STANDALONE: 'Standalone',
};

// columns for the data table
export function createInstitutionColumns(
    institutions: Institution[] = [],
): ColumnDef<Institution>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(status) => table.toggleAllPageRowsSelected(!!status)}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(status) => row.toggleSelected(!!status)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('code') || 'N/A'}</div>,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Institution Name" />
            ),
            cell: ({ row }) => <div>{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'institutionKind',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Kind" />,
            cell: ({ row }) => {
                const kind = row.original.institutionKind ?? 'STANDALONE';
                return <Badge variant="secondary">{kindLabels[kind]}</Badge>;
            },
        },
        {
            accessorKey: 'parentInstitutionId',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Parent" />,
            cell: ({ row }) => {
                if (row.original.institutionKind !== 'CHILD') {
                    return <div className="text-muted-foreground text-sm">—</div>;
                }

                const parentInstitution = institutions.find(
                    (institution) => institution.id === row.original.parentInstitutionId,
                );

                return (
                    <div className="text-muted-foreground max-w-[180px] truncate text-sm">
                        {parentInstitution?.name ?? row.original.parentInstitutionId ?? 'Unlinked'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'createdBy',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm">
                    {row.getValue('createdBy') || '—'}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
            cell: ({ row }) => {
                const date = row.getValue<string | Date>('createdAt');
                if (!date) return <div className="text-muted-foreground">—</div>;
                return (
                    <div className="text-muted-foreground">
                        {format(new Date(date), 'MMM d, yyyy')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'updatedBy',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated By" />,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm">
                    {row.getValue('updatedBy') || '—'}
                </div>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
            cell: ({ row }) => {
                const date = row.getValue<string | Date>('updatedAt');
                if (!date) return <div className="text-muted-foreground">—</div>;
                return (
                    <div className="text-muted-foreground">
                        {format(new Date(date), 'MMM d, yyyy')}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <InstitutionActionsCell institution={row.original} institutions={institutions} />
            ),
        },
    ];
}

export const columns = createInstitutionColumns();
