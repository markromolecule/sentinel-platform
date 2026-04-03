"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { QuestionRecord } from "@sentinel/services";
import { Button, Badge } from "@sentinel/ui";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import { DataTableColumnHeader, Checkbox } from "@sentinel/ui";

export type QuestionTableItem = QuestionRecord;

export function getQuestionColumns(readOnly = false): ColumnDef<QuestionTableItem>[] {
return [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        id: "prompt",
        accessorFn: (row) => row.prompt ?? row.content.prompt,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Question Text" />
        ),
        cell: ({ row }) => {
            const prompt = row.original.prompt ?? row.original.content.prompt;
            return (
                <div className="max-w-[400px] truncate font-medium pl-4" title={prompt}>
                    {prompt}
                </div>
            );
        },
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <Badge variant="secondary" className="capitalize">
                    {type.toLowerCase().replaceAll('_', ' ')}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "points",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Points" />
        ),
        cell: ({ row }) => {
            return <div className="font-mono text-sm">{row.getValue("points")} pts</div>;
        },
    },
    {
        accessorKey: "tags",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tags" />
        ),
        cell: ({ row }) => {
            const tags = row.original.tags || [];
            return (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {tag}
                        </Badge>
                    ))}
                    {tags.length === 0 && <span className="text-xs text-muted-foreground italic">No tags</span>}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            if (readOnly) {
                return null;
            }

            const meta = table.options.meta as {
                onEdit?: (question: QuestionTableItem) => void;
                onDelete?: (question: QuestionTableItem) => void;
            } | undefined;

            return (
                <div className="text-right pr-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                < MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    meta?.onEdit?.(row.original);
                                }}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:text-red-500"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    meta?.onDelete?.(row.original);
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
}
