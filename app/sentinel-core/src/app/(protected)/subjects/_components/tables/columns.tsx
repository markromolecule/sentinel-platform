'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MasterSubject } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import { format } from 'date-fns';
import { DataTableColumnHeader } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';

export const columns: ColumnDef<MasterSubject>[] = [
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <div className="pl-4 font-medium">{row.getValue('code')}</div>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    },
    {
        id: 'origin',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
        cell: ({ row }) => {
            const isInherited = row.original.isInherited;
            const isOverridden = row.original.isOverridden;
            const institutionName = row.original.institutionName;

            if (isOverridden) {
                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                            Overridden
                        </Badge>
                        {institutionName && (
                            <span className="text-muted-foreground text-[10px]">
                                {institutionName}
                            </span>
                        )}
                    </div>
                );
            }
            if (isInherited) {
                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="secondary">Inherited</Badge>
                        {institutionName && (
                            <span className="text-muted-foreground text-[10px]">
                                {institutionName}
                            </span>
                        )}
                    </div>
                );
            }
            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline">Local</Badge>
                    {institutionName && (
                        <span className="text-muted-foreground text-[10px]">{institutionName}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'sections',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Allocated Sections" />
        ),
        cell: ({ row }) => {
            const sections = row.original.sections; // Get the raw sections value
            // Check if sections is an array
            const sectionsList = Array.isArray(sections) ? sections : sections ? [sections] : [];

            return (
                <div className="flex flex-wrap gap-1">
                    {sectionsList.map((s, i) => (
                        <Badge key={i} variant="secondary">
                            {s}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => {
            const date = row.getValue('updatedAt') as Date | string;
            return (
                <div className="text-muted-foreground">
                    {format(new Date(date ?? new Date()), 'MMM d, yyyy')}
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const subject = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => subject.id && navigator.clipboard.writeText(subject.id)}
                        >
                            Copy Subject ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
