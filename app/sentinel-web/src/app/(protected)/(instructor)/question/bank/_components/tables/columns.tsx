'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { QuestionRecord } from '@sentinel/services';
import { Button, Badge } from '@sentinel/ui';
import { MoreHorizontal, Edit, Trash2, RotateCcw } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { DataTableColumnHeader, Checkbox } from '@sentinel/ui';

export type QuestionTableItem = QuestionRecord;

const QUESTION_DIFFICULTY_LABELS: Record<QuestionTableItem['difficulty'], string> = {
    EASY: 'Easy',
    MODERATE: 'Moderate',
    HARD: 'Hard',
};

const QUESTION_DIFFICULTY_STYLES: Record<QuestionTableItem['difficulty'], string> = {
    EASY: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    MODERATE: 'border-amber-200 bg-amber-50 text-amber-700',
    HARD: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function getQuestionColumns(readOnly = false): ColumnDef<QuestionTableItem>[] {
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
            id: 'prompt',
            accessorFn: (row) => row.prompt ?? row.content.prompt,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Question Text" />,
            cell: ({ row }) => {
                const prompt = row.original.prompt ?? row.original.content.prompt;
                return (
                    <div className="max-w-[400px]" title={prompt}>
                        <div className="truncate font-medium">{prompt}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
            cell: ({ row }) => {
                const type = row.getValue('type') as string;
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
            accessorKey: 'difficulty',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Difficulty" />,
            cell: ({ row }) => {
                const difficulty = row.getValue('difficulty') as QuestionTableItem['difficulty'];
                return (
                    <Badge variant="outline" className={QUESTION_DIFFICULTY_STYLES[difficulty]}>
                        {QUESTION_DIFFICULTY_LABELS[difficulty]}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            id: 'source',
            accessorFn: (row) =>
                row.sourceOrigin === 'AI_PDF'
                    ? `${row.sourceFileName ?? 'PDF'} • Page ${row.sourcePageNumber ?? '-'}`
                    : 'Manual entry',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
            cell: ({ row }) => (
                <div
                    className="text-muted-foreground max-w-[180px] truncate text-xs"
                    title={row.original.sourceFileName ?? undefined}
                >
                    {row.original.sourceOrigin === 'AI_PDF'
                        ? `${row.original.sourceFileName} • Page ${row.original.sourcePageNumber}`
                        : 'Manual entry'}
                </div>
            ),
        },
        {
            accessorKey: 'points',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Points" />,
            cell: ({ row }) => {
                return <div className="font-mono text-sm">{row.getValue('points')} pts</div>;
            },
        },
        {
            accessorKey: 'tags',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
            cell: ({ row }) => {
                const tags = row.original.tags || [];
                return (
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="h-4 px-1 py-0 text-[10px]"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {tags.length === 0 && (
                            <span className="text-muted-foreground text-xs italic">No tags</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row, table }) => {
                if (readOnly) {
                    return null;
                }

                const meta = table.options.meta as
                    | {
                          onEdit?: (question: QuestionTableItem) => void;
                          onDelete?: (question: QuestionTableItem) => void;
                          onRestore?: (question: QuestionTableItem) => void;
                      }
                    | undefined;

                const isRetired = row.original.status === 'RETIRED';

                return (
                    <div className="pr-4 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isRetired ? (
                                    <DropdownMenuItem
                                        className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            meta?.onRestore?.(row.original);
                                        }}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            meta?.onEdit?.(row.original);
                                        }}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        meta?.onDelete?.(row.original);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
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
