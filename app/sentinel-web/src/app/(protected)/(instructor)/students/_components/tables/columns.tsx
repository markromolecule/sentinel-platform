'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Student } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import { MoreHorizontal, Mail, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { DataTableColumnHeader } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/displays/status-badge';

export const columns: ColumnDef<Student>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => {
            const student = row.original;
            const initials = `${student.firstName[0]}${student.lastName[0]}`;

            return (
                <div className="flex items-center gap-3 pl-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] text-xs font-bold text-white">
                        {initials}
                    </div>
                    <div>
                        <p className="text-foreground text-sm font-medium">
                            {student.firstName} {student.lastName}
                        </p>
                        {student.email && (
                            <p className="text-muted-foreground text-xs">{student.email}</p>
                        )}
                    </div>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            const student = row.original;
            const searchString =
                `${student.firstName} ${student.lastName} ${student.email} ${student.studentNo}`.toLowerCase();
            return searchString.includes(value.toLowerCase());
        },
    },
    {
        accessorKey: 'studentNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student No." />,
        cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('studentNo')}</div>,
    },
    {
        accessorKey: 'section',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
        cell: ({ row }) => <div className="hidden md:block">{row.getValue('section')}</div>,
        enableHiding: true,
    },
    {
        accessorKey: 'subject',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ row }) => <div className="hidden lg:block">{row.getValue('subject')}</div>,
        enableHiding: true,
    },
    {
        accessorKey: 'term',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Term" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground hidden lg:block">{row.getValue('term')}</div>
        ),
        enableHiding: true,
    },
    {
        accessorKey: 'yearLevel',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year Level" />,
        cell: ({ row }) => <div className="hidden xl:block">{row.getValue('yearLevel')}</div>,
        enableHiding: true,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <StatusBadge status={status} />;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: 'actions',
        cell: () => {
            return (
                <div className="pr-4 text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
