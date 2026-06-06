'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Announcement } from '@sentinel/services';
import { Badge } from '@sentinel/ui';
import { DataTableColumnHeader } from '@sentinel/ui';

export const columns: ColumnDef<Announcement>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div className="flex flex-col pl-4">
                <span className="font-medium">{row.getValue('title')}</span>
                <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                    {row.original.content}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'published_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Published" />,
        cell: ({ row }) => {
            const date = row.getValue('published_at') as string;
            return (
                <div className="text-muted-foreground text-sm">
                    {date ? new Date(date).toLocaleDateString() : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'author_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="From" />,
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue('author_name') || 'System'}</Badge>
        ),
    },
];
