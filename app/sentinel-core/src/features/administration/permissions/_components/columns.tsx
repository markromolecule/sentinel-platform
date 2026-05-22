'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { AccessControlPermission } from '@sentinel/shared/types';
import { DataTableColumnHeader, Badge } from '@sentinel/ui';

export const columns: ColumnDef<AccessControlPermission>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Permission Name" />,
        cell: ({ row }) => <div className="text-sm font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'key',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Permission Key" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground font-mono text-xs">{row.getValue('key')}</div>
        ),
    },
    {
        accessorKey: 'moduleKey',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Module" />,
        cell: ({ row }) => <Badge variant="outline">{row.getValue('moduleKey')}</Badge>,
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground max-w-md truncate text-sm">
                {row.getValue('description')}
            </div>
        ),
    },
];
