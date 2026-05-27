'use client';

import { ColumnDef } from '@tanstack/react-table';
import { type LogRecord } from '@sentinel/services';
import { DataTableColumnHeader } from '@sentinel/ui';
import { format } from 'date-fns';

export const columns: ColumnDef<LogRecord>[] = [
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as string;
            return (
                <div className="font-mono text-xs text-muted-foreground">
                    {date ? format(new Date(date), 'MMM dd, yyyy hh:mm a') : '—'}
                </div>
            );
        },
    },
    {
        id: 'actor',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actor" />,
        cell: ({ row }) => {
            const log = row.original;
            const firstName = log.userFirstName || '';
            const lastName = log.userLastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName ? (
                <div className="font-medium text-foreground">{fullName}</div>
            ) : (
                <span className="text-muted-foreground text-xs font-mono">
                    {log.userId || 'System / Cron'}
                </span>
            );
        },
    },
    {
        accessorKey: 'action',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
        cell: ({ row }) => {
            const action = row.getValue('action') as string;
            return <div className="font-mono text-xs font-medium text-indigo-500">{action}</div>;
        },
    },
    {
        accessorKey: 'resourceType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
        cell: ({ row }) => {
            const log = row.original;
            return log.resourceType ? (
                <div className="text-sm">
                    <span className="text-muted-foreground font-semibold mr-1">
                        {log.resourceType}:
                    </span>
                    <span className="font-mono text-xs">{log.resourceId || '—'}</span>
                </div>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },
    {
        accessorKey: 'details',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Details" />,
        cell: ({ row }) => {
            const details = row.getValue('details');
            const detailsString = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
            return (
                <div className="max-w-[300px] truncate font-mono text-xs" title={detailsString}>
                    {detailsString || '—'}
                </div>
            );
        },
    },
    {
        accessorKey: 'ipAddress',
        header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
        cell: ({ row }) => {
            const ip = row.getValue('ipAddress') as string;
            return <div className="font-mono text-xs text-muted-foreground">{ip || '—'}</div>;
        },
    },
];
