'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Notification } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import { format } from 'date-fns';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { Button } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { DataTableColumnHeader, Checkbox } from '@sentinel/ui';
import Link from 'next/link';

const NOTIFICATION_TYPE_STYLES: Record<Notification['type'], string> = {
    exam: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    system: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    alert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const NOTIFICATION_PRIORITY_STYLES: Record<Notification['priority'], string> = {
    low: 'text-gray-500',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400 font-medium',
};

export function getNotificationColumns(): ColumnDef<Notification>[] {
    return [
        {
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
        },
        {
            accessorKey: 'title',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
            cell: ({ row }) => {
                const notification = row.original;

                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{notification.title}</span>
                        <span className="text-muted-foreground max-w-[300px] truncate text-xs">
                            {notification.message}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
            cell: ({ row }) => {
                const type = row.getValue('type') as Notification['type'];

                return (
                    <Badge
                        variant="outline"
                        className={`border-0 capitalize ${NOTIFICATION_TYPE_STYLES[type]}`}
                    >
                        {type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'priority',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
            cell: ({ row }) => {
                const priority = row.getValue('priority') as Notification['priority'];

                return (
                    <span className={`text-sm capitalize ${NOTIFICATION_PRIORITY_STYLES[priority]}`}>
                        {priority}
                    </span>
                );
            },
        },
        {
            accessorKey: 'date',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => {
                return (
                    <span className="text-muted-foreground text-sm">
                        {format(new Date(row.getValue('date') as Date), 'MMM d, yyyy h:mm a')}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const notification = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {notification.link && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={notification.link}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer">Mark as read</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}

export const columns = getNotificationColumns();
