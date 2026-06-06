'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Announcement } from '@sentinel/services';
import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Edit, Trash2, Send } from 'lucide-react';
import { DataTableColumnHeader } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/status-badge';
import { getAnnouncementStatus } from '../_lib/get-announcement-status';
import { useUpdateAnnouncementMutation } from '@sentinel/hooks';

export const columns: ColumnDef<Announcement>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.getValue('title')}</span>
                <span className="text-muted-foreground max-w-[200px] truncate text-xs">
                    {row.original.content}
                </span>
            </div>
        ),
    },
    {
        id: 'status',
        accessorFn: (row) => getAnnouncementStatus(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = getAnnouncementStatus(row.original);
            return <StatusBadge status={status} />;
        },
    },
    {
        accessorKey: 'author_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
        cell: ({ row }) => (
            <span className="text-sm">{row.getValue('author_name') || 'System'}</span>
        ),
    },
    {
        accessorKey: 'published_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date / Time" />,
        cell: ({ row }) => {
            const dateStr = row.getValue('published_at') as string;
            if (!dateStr) {
                return <div className="text-muted-foreground text-sm">N/A</div>;
            }
            const date = new Date(dateStr);
            return (
                <div className="text-muted-foreground text-sm">
                    {date.toLocaleDateString()}{' '}
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row, table }) => {
            const status = getAnnouncementStatus(row.original);
            const updateMutation = useUpdateAnnouncementMutation();
            const meta = table.options.meta as any;

            const handlePublish = () => {
                updateMutation.mutate({
                    id: row.original.id,
                    payload: {
                        published_at: new Date().toISOString(),
                    },
                });
            };

            return (
                <div className="flex justify-end gap-2 pr-4">
                    {status === 'draft' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            title="Publish Announcement"
                            onClick={handlePublish}
                            disabled={updateMutation.isPending}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => meta?.onEdit?.(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        onClick={() => meta?.onDelete?.(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
